'use strict';
/* عيادتي الذكية — خادم المزامنة (Node.js بدون أي اعتماديات خارجية)
   - كل طبيب = "عيادة" مستقلة تماماً (حسابات وممرضات ومرضى وصور وأرشيف)
   - مزامنة فورية عبر SSE
   - صفحة تذكرة عامة للمريض عبر رمز عشوائي غير قابل للتخمين لا تكشف أي مريض آخر */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const PORT = +process.env.PORT || 3000;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const PUBLIC_DIR = path.join(__dirname, 'public');
const REG_CODE = process.env.REGISTRATION_CODE || '';           // اختياري: رمز دعوة للتسجيل
const ALLOW_REG = process.env.ALLOW_REGISTRATION !== 'false';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const SESSION_MS = 30 * 864e5, TICKET_DONE_MS = 24 * 36e5;
const THIS_YEAR = () => new Date().getFullYear();

fs.mkdirSync(path.join(DATA_DIR, 'img'), { recursive: true });
const webpush = require('./push').create({ dataDir: DATA_DIR, subject: process.env.VAPID_SUBJECT || (/^https:/.test(PUBLIC_URL) ? PUBLIC_URL : 'mailto:admin@example.com'), extraHosts: (process.env.PUSH_EXTRA_HOSTS || '').split(',') });

/* ---------- قاعدة البيانات (ملف JSON بكتابة ذرّية) ---------- */
const DB_FILE = path.join(DATA_DIR, 'db.json');
let db = { clinics: {}, sessions: {} };
(function load() {
  for (const f of [DB_FILE, DB_FILE + '.bak']) {
    try { db = JSON.parse(fs.readFileSync(f, 'utf8')); db.clinics = db.clinics || {}; db.sessions = db.sessions || {}; return; } catch (e) { if (e.code !== 'ENOENT') console.error('تعذّر قراءة', f, e.message); }
  }
})();
let saveTimer = null;
function save() { if (saveTimer) return; saveTimer = setTimeout(flush, 250); }
function flush() {
  clearTimeout(saveTimer); saveTimer = null;
  const tmp = DB_FILE + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(db));
    if (Date.now() - (flush.bakAt || 0) > 6e4) { flush.bakAt = Date.now(); try { fs.copyFileSync(DB_FILE, DB_FILE + '.bak'); } catch (e) {} }
    fs.renameSync(tmp, DB_FILE);
  } catch (e) { console.error('فشل حفظ قاعدة البيانات:', e.message); }
}
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { flush(); process.exit(0); });

const idx = { user: new Map(), code: new Map(), ticket: new Map() };
function reindex() {
  idx.user.clear(); idx.code.clear(); idx.ticket.clear();
  for (const c of Object.values(db.clinics)) {
    idx.user.set(c.doctor.username, c.id); idx.code.set(c.code, c.id);
    for (const p of c.patients) idx.ticket.set(p.ticket, c.id);
    for (const p of c.archive) if (p.ticket) idx.ticket.set(p.ticket, c.id);
  }
}
reindex();
db.settings = db.settings && typeof db.settings === 'object' ? db.settings : {};
const now = () => Date.now();
for (const [k, s] of Object.entries(db.sessions)) if (s.exp < now()) delete db.sessions[k];

/* ---------- أدوات ---------- */
const b64u = n => crypto.randomBytes(n).toString('base64url');
const rid = n => crypto.randomBytes(n).toString('hex');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const CODE_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newClinicCode() { for (;;) { let c = ''; const b = crypto.randomBytes(6); for (const x of b) c += CODE_ALPHA[x % CODE_ALPHA.length]; if (!idx.code.has(c)) return c; } }
async function hashPw(pw, salt) { salt = salt || crypto.randomBytes(16).toString('hex'); return { salt, hash: (await scrypt(pw, salt, 64)).toString('hex') }; }
async function checkPw(pw, rec) {
  const h = (await scrypt(String(pw), rec.salt, 64)), a = Buffer.from(rec.hash, 'hex');
  return a.length === h.length && crypto.timingSafeEqual(a, h);
}
const DUMMY = { salt: '00'.repeat(16), hash: '00'.repeat(64) };
const httpErr = (status, code) => Object.assign(new Error(code), { status, code });
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const limits = new Map();
function rate(key, max, ms) {
  const t = now(); let r = limits.get(key);
  if (!r || r.reset < t) { r = { n: 0, reset: t + ms }; limits.set(key, r); }
  if (++r.n > max) throw httpErr(429, 'rate_limited');
}
setInterval(() => { const t = now(); for (const [k, r] of limits) if (r.reset < t) limits.delete(k); for (const [k, s] of Object.entries(db.sessions)) if (s.exp < t) delete db.sessions[k]; for (const [k, v] of streamTickets) if (v.exp < t) streamTickets.delete(k); }, 6e4).unref();

function clientIp(req) {
  if (TRUST_PROXY) { const f = req.headers['x-forwarded-for']; if (f) return f.split(',')[0].trim(); }
  return req.socket.remoteAddress || '?';
}

/* ---------- المرضى ---------- */
function validatePatient(b) {
  if (!b || typeof b !== 'object') return null;
  const name = str(b.name, 80), by = Number(b.birthYear);
  if (!name || !Number.isInteger(by) || by < 1900 || by > THIS_YEAR()) return null;
  const phone = str(b.phone, 25);
  if (phone && !/^[0-9+\-\s()]+$/.test(phone)) return null;
  return { name, birthYear: by, gender: b.gender === 'أنثى' ? 'أنثى' : 'ذكر', reason: str(b.reason, 60) || 'استشارة وطوارئ', tooth: str(b.tooth, 20) || 'غير محدد', phone };
}
/* ترقيم الأسنان FDI: دائمة 11-18 / 21-28 / 31-38 / 41-48، لبنية 51-55 / 61-65 / 71-75 / 81-85 */
const FDI = new Set(); for (const q of [1, 2, 3, 4]) { for (let i = 1; i <= 8; i++) FDI.add(`${q}${i}`); } for (const q of [5, 6, 7, 8]) { for (let i = 1; i <= 5; i++) FDI.add(`${q}${i}`); }
const cleanTeeth = a => [...new Set((Array.isArray(a) ? a : []).map(String).filter(x => FDI.has(x)))];
const TREAT_KEYS = ['قلع', 'علاج عصب', 'استشارة', 'جلسة تركيب', 'تبييض أسنان', 'أخرى'];
const num = (v, max = 1e9) => { if (v === '' || v == null) return null; const n = Math.round(Number(v) * 100) / 100; return Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
const PRICE_CATS = ['base', 'front', 'pre', 'molar', 'wisdom'];   // عام / أمامية (قواطع وأنياب) / ضواحك / أضراس
const treatsOf = c => (c.prices && Array.isArray(c.prices.treatments) && c.prices.treatments.length) ? c.prices.treatments : TREAT_KEYS;
const MAX_SESS = 12, cleanSess = v => { const n = parseInt(v); return Number.isInteger(n) && n >= 1 && n <= MAX_SESS ? n : 0; };   // عدد حصص العلاج: 1–12
const defSess = tr => /عصب|root|endo/i.test(tr) ? 2 : 1;   // افتراض للعلاجات التي لم يُضبط عدد حصصها بعد
/* ألوان السن لكل علاج: on = مفعّل، part = أثناء العلاج (حصص متبقية)، done = عند اكتمال حصصه */
const HEX = /^#[0-9a-f]{6}$/i, NEUTRAL_TR = /استشارة|تبييض|أخرى|consult|whiten|other/i, EXT_TR = /قلع|extract/i;
const defCol = tr => EXT_TR.test(tr) ? { on: true, part: '#d64545', done: '#d64545' } : { on: !NEUTRAL_TR.test(tr), part: '#f2b705', done: '#2e9e6b' };
const cleanCol = (v, tr) => { if (!v || typeof v !== 'object') return null; const d = defCol(tr || ''); return { on: v.on === undefined ? d.on : !!v.on, part: HEX.test(v.part) ? v.part.toLowerCase() : d.part, done: HEX.test(v.done) ? v.done.toLowerCase() : d.done }; };
/* حالة أسنان المريض: آخر حصة مسجّلة لكل (سن، علاج) بترتيب زمني، من بنود الخطط أو من السجلات القديمة */
function toothItems(rs) {
  const out = [];
  for (const r of [...rs].sort((x, y) => (x.finishedAt || 0) - (y.finishedAt || 0))) {
    if (r.lines && r.lines.length) { for (const l of r.lines) if (FDI.has(String(l.tooth))) out.push({ tooth: String(l.tooth), treatment: l.treatment, no: l.no || 1, sessions: l.sessions || 1, at: r.finishedAt }); }
    else for (const n of cleanTeeth(r.teeth)) for (const tr of treatmentsOf(r)) out.push({ tooth: n, treatment: tr, no: 1, sessions: 1, at: r.finishedAt });
  }
  return out.slice(-400);
}
const normList = (l, keys) => { const out = {}; for (const k of keys) { const v = l && Object.prototype.hasOwnProperty.call(l, k) ? l[k] : undefined; const o = {}; if (v && typeof v === 'object') { for (const c of PRICE_CATS) { const n = num(v[c]); if (n != null) o[c] = n; } const sn = cleanSess(v.sessions); if (sn) o.sessions = sn; const cc = cleanCol(v.col, k); if (cc) o.col = cc; } else { const n = num(v); if (n != null) o.base = n; } if (Object.keys(o).length) out[k] = o; } return out; };
const pricesOf = c => { const tr = treatsOf(c), list = normList(c.prices && c.prices.list, tr); for (const k of tr) list[k] = { ...(list[k] || {}), sessions: (list[k] && list[k].sessions) || defSess(k), col: (list[k] && list[k].col) || defCol(k) }; return { currency: (c.prices && c.prices.currency) || '', list, treatments: tr }; };
/* أسماء العلاجات: 1–30 اسماً فريداً (بلا حساسية لحالة الأحرف)، كل اسم حتى 40 حرفاً */
function normTreatments(a) {
  if (!Array.isArray(a)) throw httpErr(400, 'invalid_input');
  const out = [], seen = new Set();
  for (const v of a) { const n = str(v, 60).replace(/\s+/g, ' '); if (!n || n.length > 40 || n === '__proto__') throw httpErr(400, 'invalid_input'); const k = n.toLowerCase(); if (seen.has(k)) throw httpErr(400, 'duplicate'); seen.add(k); out.push(n); }
  if (!out.length || out.length > 30) throw httpErr(400, 'invalid_input');
  return out;
}
/* علاجات الزيارة: قائمة أسماء (حتى 12) + بنود الأسعار الموافقة لها. السجلات القديمة فيها treatment نصّاً واحداً فقط */
function cleanTreats(a) { const out = [], seen = new Set(); for (const v of Array.isArray(a) ? a : []) { const n = str(v, 60).replace(/\s+/g, ' '); if (!n || n.length > 40 || n === '__proto__') continue; const k = n.toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push(n); if (out.length >= 12) break; } return out; }
function cleanItems(a, names) { const m = new Map(); for (const i of Array.isArray(a) ? a : []) { if (i && typeof i.name === 'string') m.set(i.name.trim().replace(/\s+/g, ' '), Math.max(0, num(i.price) || 0)); } return names.map(n => ({ name: n, price: m.has(n) ? m.get(n) : 0 })); }
const treatmentsOf = r => Array.isArray(r.treatments) && r.treatments.length ? r.treatments : [r.treatment || 'استشارة'];
/* حساب المريض: المستحق/المدفوع. سجل قديم بلا مدفوع يُعدّ مسدَّداً */
const patKey = r => String(r.name).trim().toLowerCase() + '|' + r.birthYear;
const dueOf = a => a.price || 0, paidOf = a => a.paid == null ? dueOf(a) : a.paid, remOf = a => Math.max(0, Math.round((dueOf(a) - paidOf(a)) * 100) / 100);
const r2 = v => Math.round(v * 100) / 100;
const ageOf = p => THIS_YEAR() - p.birthYear;
function patientView(p) {
  return { id: p.id, ticket: p.ticket, ticketNo: p.ticketNo, name: p.name, birthYear: p.birthYear, age: ageOf(p), gender: p.gender, reason: p.reason, tooth: p.tooth, phone: p.phone, status: p.status, createdAt: p.createdAt, startedAt: p.startedAt || null, images: (p.images || []).map(i => i.id) };
}
/* الوعاء: رصيد مسبق لكل مريض. wallets[patKey] = { bal, log:[{t, amt, k: dep|use|back|out, vid?}] }
   dep = إيداع (مال داخل) · use = اقتطاع لسداد علاج · back = إرجاع اقتطاع ملغى · out = استرجاع نقدي للمريض */
const WK = new Set(['dep', 'use', 'back', 'out']);
const walletOf = (c, k, mk) => { const w = c.wallets && Object.prototype.hasOwnProperty.call(c.wallets, k) ? c.wallets[k] : null; if (w || !mk) return w; if (!c.wallets) c.wallets = {}; return (c.wallets[k] = { bal: 0, log: [] }); };
const wbal = (c, k) => { const w = walletOf(c, k); return w ? w.bal : 0; };
function wMove(c, k, kind, amt, t, extra) {
  if (!(amt > 0)) return; const w = walletOf(c, k, true);
  w.bal = r2(Math.max(0, w.bal + (kind === 'dep' || kind === 'back' ? amt : -amt))); w.log.push({ t, amt: r2(amt), k: kind, ...(extra || {}) });
  if (w.log.length > 1000) w.log.splice(0, w.log.length - 1000);
}
const walletView = (c, k) => { const w = walletOf(c, k); return { bal: w ? w.bal : 0, log: w ? w.log.slice(-200) : [] }; };
/* ===== خطط العلاج =====
   كل بند علاج (سن + علاج) له خطة: حصة واحدة أو حصتان. السجل الأول للخطة (no:1) يحمل كامل سعرها (total) ودفعاتها كلها
   (مَوسومة pl = رقم الخطة، و vid = الحصة التي دُفعت فيها). حصص المتابعة (no:2) تُسجَّل في سجلاتها كبنود بلا سعر.
   حالة الخطة (المدفوع، المتبقي، عدد الحصص المنجزة) تُشتقّ دائماً من السجلات فلا يمكن أن تتعارض معها */
const PLAN_ID = /^[a-f0-9]{10}$/;
function plansOf(c, k) {
  const m = new Map(), mine = c.archive.filter(r => r.lines && patKey(r) === k);
  for (const r of mine) for (const l of r.lines) if (l.no === 1) m.set(l.plan, { id: l.plan, tooth: l.tooth || '', treatment: l.treatment, total: l.total || 0, sessions: l.sessions || 1, closed: !!l.closed, rec: r, line: l, done: 1, at: r.finishedAt });
  for (const r of mine) for (const l of r.lines) { const p = m.get(l.plan); if (p && l.no > p.done) p.done = l.no; }
  for (const p of m.values()) { p.paid = r2((p.rec.payments || []).reduce((x, y) => x + (y.pl === p.id ? (+y.amt || 0) : 0), 0)); p.remaining = r2(Math.max(0, p.total - p.paid)); p.open = !p.closed && p.done < p.sessions; }
  return m;
}
const planView = p => ({ id: p.id, tooth: p.tooth, treatment: p.treatment, total: p.total, sessions: p.sessions, done: p.done, paid: p.paid, remaining: p.remaining, open: p.open, rec: p.rec.id, at: p.at });
/* يدفع حتى amt من متبقي السجل rec (وإن كان له خطط فعلى خططه بالترتيب، أو خطة واحدة only)؛ يعيد ما دُفع فعلاً */
function payRec(c, k, rec, amt, t, vid, m, only) {
  let left = r2(amt); const used0 = left; if (!(left > 0)) return 0;
  const push = (x, pl) => { rec.paid = r2(paidOf(rec) + x); (rec.payments = rec.payments || []).push({ t, amt: x, vid, ...(m ? { m } : {}), ...(pl ? { pl } : {}) }); left = r2(left - x); };
  const ch = (rec.lines || []).filter(l => l.no === 1 && (!only || l.plan === only));
  if (ch.length) { const pm = plansOf(c, k); for (const l of ch) { if (left <= 0) break; const p = pm.get(l.plan), x = Math.min(p ? p.remaining : 0, left, remOf(rec)); if (x > 0) push(x, l.plan); } }
  else if (!only) { const x = Math.min(remOf(rec), left); if (x > 0) push(x); }
  return r2(used0 - left);
}
/* يوزّع مبلغاً على متبقي السجل first ثم أقدم متبقٍ للمريض نفسه؛ يعيد ما لم يُستهلك */
function allocPay(c, k, first, amt, t, vid, m) {
  const order = [first].concat(c.archive.slice().reverse().filter(o => o !== first && patKey(o) === k));   // الأرشيف الأحدث أولاً ← نعكسه: الأقدم أولاً
  for (const o of order) { if (amt <= 0) break; amt = r2(amt - payRec(c, k, o, amt, t, vid, m)); }
  return amt;
}
/* حذف حصة: ما دفعته في سجلات أخرى (سداد خطة أو دَين) يُلغى ويرجع الوعاء منه إلى الوعاء */
function revertVisit(c, rec, t) {
  for (const o of c.archive) {
    if (o === rec || !o.payments || !o.payments.some(p => p.vid === rec.id)) continue;
    let back = 0, wb = 0; o.payments = o.payments.filter(p => { if (p.vid !== rec.id) return true; back += +p.amt || 0; if (p.m === 'w') wb += +p.amt || 0; return false; });
    o.paid = r2(Math.max(0, paidOf(o) - back)); if (wb > 0) wMove(c, patKey(o), 'back', r2(wb), t, { rid: rec.id });
  }
}
/* بعد تعديل السعر/المدفوع يدوياً: تُعاد مطابقة بنود الخطة والدفعات مع مجموع السجل */
function syncLines(rec, price, replacedPay) {
  const ch = (rec.lines || []).filter(l => l.no === 1); if (!ch.length) return;
  let diff = r2((price || 0) - ch.reduce((x, l) => x + (l.total || 0), 0));
  for (const l of ch) { if (diff === 0) break; if (diff > 0) { l.total = r2((l.total || 0) + diff); diff = 0; } else { const cut = Math.min(l.total || 0, -diff); l.total = r2((l.total || 0) - cut); diff = r2(diff + cut); } }
  if (replacedPay) { let left = paidOf(rec); const t = (rec.payments[0] || {}).t || rec.finishedAt; rec.payments = []; for (const l of ch) { const x = Math.min(left, l.total || 0); if (x > 0) { rec.payments.push({ t, amt: x, vid: rec.id, pl: l.plan }); left = r2(left - x); } } }
}
/* بنود الخطة المستعادة من نسخة احتياطية */
const cleanLinesIn = a => (Array.isArray(a) ? a : []).slice(0, 24).filter(l => l && PLAN_ID.test(String(l.plan)) && typeof l.treatment === 'string' && l.treatment.trim()).map(l => ({ plan: l.plan, no: Math.min(MAX_SESS, Math.max(1, parseInt(l.no) || 1)), sessions: cleanSess(l.sessions) || 1, tooth: FDI.has(String(l.tooth)) ? String(l.tooth) : '', treatment: str(l.treatment, 40).trim(), ...(parseInt(l.no) === 1 || !l.no ? { total: num(l.total) || 0 } : {}), ...(l.closed ? { closed: true } : {}) }));
/* ما دُفع من الوعاء لسجل ما يرجع إليه عند حذف السجل أو استبدال دفعاته */
function unwallet(c, k, rec, t) { const w = (rec.payments || []).reduce((x, p) => x + (p.m === 'w' ? (+p.amt || 0) : 0), 0); wMove(c, k, 'back', r2(w), t, { rid: rec.id }); }
/* رقم الحصة لكل سجل (حسب المريض) وربط الدفعات القديمة بالحصة التي دُفعت فيها */
function visitInfo(c) {
  const g = new Map(), n = new Map(), byT = new Map();
  for (const r of c.archive) { if (!r.finishedAt) continue; const k = patKey(r); let l = g.get(k); if (!l) g.set(k, l = []); l.push(r); }
  for (const l of g.values()) { l.sort((x, y) => x.finishedAt - y.finishedAt); l.forEach((r, i) => { n.set(r.id, { n: i + 1, at: r.finishedAt }); byT.set(patKey(r) + '|' + r.finishedAt, r.id); }); }
  return { n, byT };
}
function paysView(a, x) {
  return paysOf(a).map(p => {
    if (!x) return p;
    const vid = p.vid === undefined ? (x.info.byT.get(patKey(a) + '|' + p.t) || null) : p.vid, v = vid && x.info.n.get(vid);
    return { t: p.t, amt: p.amt, ...(p.m ? { m: p.m } : {}), vid, ...(v ? { vn: v.n, vat: v.at } : {}) };
  });
}
/* بنود الخطة في السجل مع حالة كل خطة الآن (المدفوع/المتبقي) */
function linesView(a, x) {
  if (!a.lines || !a.lines.length) return [];
  const pm = x ? (x.pm || (x.pm = new Map())) : null, plans = x ? (pm.get(patKey(a)) || (pm.set(patKey(a), plansOf(x.c, patKey(a))), pm.get(patKey(a)))) : null;
  return a.lines.map(l => { const p = plans && plans.get(l.plan); return { plan: l.plan, no: l.no, sessions: l.sessions, tooth: l.tooth || '', treatment: l.treatment, ...(l.no === 1 ? { total: l.total || 0 } : {}), ...(p ? { paid: p.paid, remaining: p.remaining, open: p.open, done: p.done } : {}) }; });
}
function archiveView(a, x) {
  const me = x && x.info.n.get(a.id);
  return { id: a.id, name: a.name, birthYear: a.birthYear, age: ageOf(a), gender: a.gender, reason: a.reason, tooth: a.tooth, phone: a.phone, treatment: a.treatment, treatments: treatmentsOf(a), items: a.items || [], price: a.price == null ? null : a.price, paid: paidOf(a), remaining: remOf(a), payments: paysView(a, x), ...(x ? { n: me ? me.n : null, wallet: wbal(x.c, patKey(a)) } : {}), followUp: !!a.followUp, lines: linesView(a, x), teeth: a.teeth || [], notes: a.notes || '', rx: a.rx || [], rxHead: a.rxHead || null, createdAt: a.createdAt, finishedAt: a.finishedAt, waitMin: a.waitMin, durationMin: a.durationMin, images: (a.images || []).map(i => i.id) };
}
function nextTicketNo(c) {
  const d = new Date().toLocaleDateString('en-CA');
  if (!c.counter || c.counter.date !== d) c.counter = { date: d, n: 0 };
  return ++c.counter.n;
}
const rt = {};  // حالة وقتية غير محفوظة لكل عيادة
const RT = c => rt[c.id] || (rt[c.id] = { skip: new Map(), streams: new Set() });
const waiting = c => c.patients.filter(p => p.status === 'waiting');
const inRoom = c => c.patients.find(p => p.status === 'in');

/* جدول تسجيل الممرضة: أيام ووقت يحدّدهما الطبيب (tz = إزاحة توقيت العيادة بالدقائق عن UTC) */
const DEF_SCHED = { enabled: false, days: [0, 1, 2, 3, 4, 5, 6], from: '08:00', to: '17:00', tz: 0 };
const schedOf = c => c.schedule || DEF_SCHED;
function scheduleOpen(c, t) {
  const s = schedOf(c); if (!s.enabled) return true;
  const d = new Date((t == null ? now() : t) + s.tz * 6e4), mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  const [fh, fm] = s.from.split(':').map(Number), [th, tm] = s.to.split(':').map(Number);
  return s.days.includes(d.getUTCDay()) && mins >= fh * 60 + fm && mins < th * 60 + tm;
}
function normSchedule(b) {
  const T = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!b || typeof b !== 'object') throw httpErr(400, 'invalid_input');
  const days = Array.isArray(b.days) ? [...new Set(b.days.map(Number))].filter(x => Number.isInteger(x) && x >= 0 && x <= 6).sort() : [];
  const from = typeof b.from === 'string' ? b.from : '', to = typeof b.to === 'string' ? b.to : '', tz = Number(b.tz);
  if (!T.test(from) || !T.test(to) || from >= to || !Number.isInteger(tz) || tz < -840 || tz > 840) throw httpErr(400, 'invalid_input');
  const enabled = b.enabled === true;
  if (enabled && !days.length) throw httpErr(400, 'invalid_input');
  return { enabled, days, from, to, tz };
}
/* مهام الطبيب للممرضات: تبقى ظاهرة للممرضة (فقاعة) حتى تُنجَز، وتُحذف المنجَزة بعد 24 ساعة */
const TASK_KEEP_MS = 24 * 36e5;
function pruneTasks(c) { if (!c.tasks) return; const t = now(); c.tasks = c.tasks.filter(k => !k.done || t - k.doneAt < TASK_KEEP_MS).slice(0, 100); }
function tasksFor(c, role, nurseId) {
  pruneTasks(c); const nm = id => { const n = c.nurses.find(z => z.id === id); return n ? n.name : ''; };
  return (c.tasks || []).filter(k => role === 'doctor' || (!k.done && (!k.to || k.to === nurseId)))
    .map(k => ({ id: k.id, text: k.text, to: k.to || null, toName: k.to ? nm(k.to) : '', createdAt: k.createdAt, done: !!k.done, doneAt: k.doneAt || null, doneBy: k.doneBy || '' }));
}
function stateFor(c, role, nurseId) {
  const r = RT(c), t = now();
  for (const [k, v] of r.skip) if (v.ts < t - 6e5 || !c.patients.some(p => p.id === k && p.status === 'waiting')) r.skip.delete(k);
  /* المتبقي على المريض (للطبيب فقط؛ الممرضة لا ترى أي مبالغ) */
  let owe = null; if (role === 'doctor' && c.patients.length) { owe = new Map(); for (const o of c.archive) { const d = remOf(o); if (d > 0) owe.set(patKey(o), r2((owe.get(patKey(o)) || 0) + d)); } }
  return { patients: c.patients.map(p => { const v = patientView(p), d = owe && owe.get(patKey(p)); const w = role === 'doctor' ? wbal(c, patKey(p)) : 0; return { ...v, ...(d ? { debt: d } : {}), ...(w > 0 ? { wallet: w } : {}) }; }), skipRequests: [...r.skip.entries()].map(([id, v]) => ({ id, name: v.name, firstName: v.firstName })), serverTime: t, schedule: schedOf(c), tasks: role ? tasksFor(c, role, nurseId) : [] };
}
function ticketView(c, token) {
  const i = c.patients.findIndex(p => p.ticket === token);
  const base = { clinic: c.name, updated: now() };
  if (i >= 0) {
    const p = c.patients[i], firstName = p.name.split(/\s+/)[0];
    if (p.status === 'in') return { ...base, state: 'in', ticketNo: p.ticketNo, firstName };
    const ahead = c.patients.slice(0, i).filter(x => x.status === 'waiting').length;
    const done = c.archive.slice(0, 20).filter(a => a.durationMin > 0);
    const avg = done.length >= 3 ? done.reduce((s, a) => s + a.durationMin, 0) / done.length : 0;
    return { ...base, state: 'waiting', ticketNo: p.ticketNo, firstName, ahead, busy: !!inRoom(c), estMin: avg ? Math.round(avg * ahead) : null };
  }
  const a = c.archive.slice(0, 500).find(x => x.ticket === token);
  if (a) return { ...base, state: now() - a.finishedAt < TICKET_DONE_MS ? 'done' : 'expired', ticketNo: a.ticketNo, firstName: a.name.split(/\s+/)[0] };
  return { ...base, state: 'unknown' };
}

/* ---------- البث الفوري (SSE) ---------- */
const ticketStreams = new Map();   // token -> Set<res>
const streamTickets = new Map();   // تذكرة اتصال لمرة واحدة
function sse(res, event, data) { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); }
/* إشعارات النظام (Web Push): تصل حتى لو كان التطبيق مغلقاً أو الشاشة مقفلة */
const PUSH_TXT = {
  ar: { task: ['📌 مهمة جديدة من الطبيب', n => n.text || ''], task_done: ['✅ تمت المهمة', n => `${n.by || ''}: ${n.text || ''}`], add: ['🔔 مريض جديد في الانتظار', n => `تمت إضافة: ${n.name}`], enter: ['🩺 دخول مريض للمعاينة', n => `تم إدخال المريض: ${n.name}`], skip_request: ['⚠️ تنبيه تخطي الدور!', n => `الممرضة تحاول إدخال ${n.name} وقبله ${n.first || ''} في القائمة. هل تسمح؟`], finish: ['✅ انتهت المعاينة!', n => `انتهى الطبيب من ${n.name}. يمكنك إدخال المريض التالي.`], skip_denied: ['⛔ رفض الطبيب التخطي', n => `رفض الطبيب إدخال ${n.name} قبل دوره.`] },
  en: { task: ['📌 New task from the doctor', n => n.text || ''], task_done: ['✅ Task completed', n => `${n.by || ''}: ${n.text || ''}`], add: ['🔔 New patient waiting', n => `Added: ${n.name}`], enter: ['🩺 Patient entering', n => `Patient sent in: ${n.name}`], skip_request: ['⚠️ Queue skip request!', n => `The nurse wants to send in ${n.name} before ${n.first || ''}. Allow?`], finish: ['✅ Consultation finished!', n => `The doctor finished with ${n.name}. You can send in the next patient.`], skip_denied: ['⛔ Skip declined', n => `The doctor declined to see ${n.name} before their turn.`] }
};
function pushNotify(c, notify) {
  const d = notify.data; if (!d) return;
  for (const [k, s] of Object.entries(db.sessions)) {
    if (s.clinicId !== c.id || !s.push || s.exp < now() || k === notify.exclude || (notify.to && s.role !== notify.to) || (notify.nurseId && s.nurseId !== notify.nurseId)) continue;
    const tx = (PUSH_TXT[s.push.lang] || PUSH_TXT.ar)[d.type]; if (!tx) continue;
    const urgent = d.type === 'skip_request' || d.type === 'add' || d.type === 'task';
    webpush.send(s.push.sub, { title: tx[0], body: tx[1](d), tag: 'cc-' + d.type + (d.pid ? '-' + d.pid : ''), urgent, type: d.type }, { urgency: 'high', ttl: urgent ? 1800 : 900 })
      .then(r => { if (r === 'gone' && db.sessions[k] && db.sessions[k].push && db.sessions[k].push.sub === s.push.sub) { delete db.sessions[k].push; save(); } });
  }
}
function broadcast(c, notify, extraTokens) {
  const r = RT(c), st = stateFor(c);
  if (notify) pushNotify(c, notify);
  for (const s of r.streams) {
    try { sse(s.res, 'state', { ...st, tasks: tasksFor(c, s.role, s.nurseId) }); if (notify && (!notify.to || notify.to === s.role) && (!notify.nurseId || notify.nurseId === s.nurseId)) sse(s.res, 'notify', notify.data); } catch (e) {}
  }
  const toks = new Set(c.patients.map(p => p.ticket).concat(extraTokens || []));
  for (const t of toks) { const set = ticketStreams.get(t); if (set) for (const res of set) try { sse(res, 'ticket', ticketView(c, t)); } catch (e) {} }
  save();
}
setInterval(() => {
  for (const c of Object.values(rt)) for (const s of c.streams) try { s.res.write(': ka\n\n'); } catch (e) {}
  for (const set of ticketStreams.values()) for (const res of set) try { res.write(': ka\n\n'); } catch (e) {}
}, 20000).unref();
function closeStreamsOf(sessionKey) { for (const c of Object.values(rt)) for (const s of [...c.streams]) if (s.sessionKey === sessionKey) { try { s.res.end(); } catch (e) {} c.streams.delete(s); } }

/* ---------- HTTP أساسيات ---------- */
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let n = 0, big = false; const ch = [];
    req.on('data', c => { n += c.length; if (n > limit) big = true; else ch.push(c); });
    req.on('end', () => big ? reject(httpErr(413, 'too_large')) : resolve(Buffer.concat(ch)));
    req.on('error', reject);
  });
}
async function readJSON(req, limit = 100e3) {
  const b = await readBody(req, limit); if (!b.length) return {};
  try { const j = JSON.parse(b.toString('utf8')); return j && typeof j === 'object' ? j : {}; } catch (e) { throw httpErr(400, 'invalid_input'); }
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const SEC = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; media-src blob:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(self), geolocation=(), microphone=()', 'Cross-Origin-Opener-Policy': 'same-origin'
};
function serveFile(req, res, file, extra) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    const etag = `W/"${st.size}-${Math.floor(st.mtimeMs)}"`;
    const h = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ETag: etag, ...extra };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, h); return res.end(); }
    res.writeHead(200, { ...h, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
function serveStatic(req, res, pathname) {
  let p; try { p = decodeURIComponent(pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, p));
  if (file !== PUBLIC_DIR && !file.startsWith(PUBLIC_DIR + path.sep)) { res.writeHead(403); return res.end(); }
  serveFile(req, res, file);
}

/* ---------- المصادقة ---------- */
/* ---------- الوصفات الطبية: سلة الأدوية المفضلة وقاعدة أدوية العيادة المستوردة ---------- */
const RX_MAX_LINES = 25, RX_MAX_BASKET = 100, RX_MAX_DRUGS = 8000;
const cleanRxLine = z => { if (!z || typeof z !== 'object') return null; const name = str(z.name, 120); return name ? { name, form: str(z.form, 160), dose: str(z.dose, 80), freq: str(z.freq, 80), dur: str(z.dur, 80), note: str(z.note, 200) } : null; };
const cleanRx = a => (Array.isArray(a) ? a : []).slice(0, RX_MAX_LINES).map(cleanRxLine).filter(Boolean);
function cleanBasket(a) {
  const seen = new Set(), out = [];
  for (const z of (Array.isArray(a) ? a : []).slice(0, 400)) {
    const l = cleanRxLine(z); if (!l) continue; const k = (l.name + '|' + l.form).toLowerCase(); if (seen.has(k)) continue; seen.add(k);
    out.push({ id: z && typeof z.id === 'string' && /^[a-f0-9]{12}$/.test(z.id) ? z.id : rid(6), ...l }); if (out.length >= RX_MAX_BASKET) break;
  }
  return out;
}
/* قالب الوصفة: ترويسة قابلة للتعديل (اسم العيادة/الطبيب/تخصص/هاتف/عنوان/شعار) ولغة الورقة. null = القيمة الافتراضية */
function cleanTpl(b) {
  b = b && typeof b === 'object' ? b : {}; const o = {};
  for (const [k, n] of [['clinic', 120], ['doctor', 120], ['spec', 120], ['phone', 60], ['address', 160]]) o[k] = b[k] == null ? null : str(b[k], n);
  o.logo = typeof b.logo === 'string' && b.logo.length <= 160000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(b.logo) ? b.logo : '';
  o.lang = ['ar', 'fr', 'en'].includes(b.lang) ? b.lang : 'ar';
  const lay = cleanLay(b.lay); if (lay) o.lay = lay;
  return o;
}
/* تخطيط الوصفة المخصّص (مواضع بالمليمتر وأحجام الخطوط). null = التخطيط الافتراضي */
const RX_BLOCKS = ['logo', 'clinic', 'doctor', 'spec', 'contact', 'date', 'patient', 'age', 'title', 'list', 'sign', 'rule1', 'rule2', 'rule3', 't1', 't2', 't3', 't4', 't5', 't6'];
function cleanLay(l) {
  if (!l || typeof l !== 'object' || !l.blocks || typeof l.blocks !== 'object') return null;
  const n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v * 100) / 100)) : d; };
  const o = { w: n(l.w, 50, 450, 210), h: n(l.h, 50, 450, 297), grid: [0, 1, 2, 5].includes(Number(l.grid)) ? Number(l.grid) : 1, ff: ['', 'serif', 'sans', 'mono'].includes(l.ff) ? l.ff : '', blocks: {} };
  for (const id of RX_BLOCKS) {
    const b = l.blocks[id]; if (!b || typeof b !== 'object') continue;
    const r = { x: n(b.x, -50, 450, 10), y: n(b.y, -50, 450, 10), w: n(b.w, 3, 450, 60), vis: b.vis === false || b.vis === 0 ? 0 : 1 };
    if (b.fs != null) r.fs = n(b.fs, 5, 120, 12);
    if (b.h != null) r.h = n(b.h, 3, 450, 20);
    if (b.th != null) r.th = n(b.th, 0.1, 10, 0.5);
    if (b.lh != null) r.lh = n(b.lh, 1, 3, 1.5);
    if (b.gap != null) r.gap = n(b.gap, 0, 40, 4);
    if (b.b) r.b = 1;
    if (b.i) r.i = 1;
    if (b.ds) r.ds = 1;
    if (b.num === 0 || b.num === false) r.num = 0;
    if (['left', 'center', 'right'].includes(b.al)) r.al = b.al;
    if (typeof b.col === 'string' && /^#[0-9a-fA-F]{6}$/.test(b.col)) r.col = b.col;
    if (typeof b.txt === 'string') r.txt = str(b.txt, 400);
    o.blocks[id] = r;
  }
  return o;
}
/* لقطة ترويسة الوصفة وقت إصدارها: تبقى كما صدرت حتى لو تغيّر القالب لاحقاً (بلا الشعار) */
const cleanHead = h => { if (!h || typeof h !== 'object') return null; const o = {}; for (const [k, n] of [['clinic', 120], ['doctor', 120], ['spec', 120], ['phone', 60], ['address', 160]]) o[k] = str(h[k], n); o.lang = ['ar', 'fr', 'en'].includes(h.lang) ? h.lang : 'ar'; return o; };
const cleanDrug = z => { const r = Array.isArray(z) ? z : typeof z === 'string' ? [z] : (z && typeof z === 'object' ? [z.n || z.name, z.ar, z.b, z.f, z.c] : null); if (!r) return null; const n = str(r[0], 100); return n ? [n, str(r[1], 100), str(r[2], 400), str(r[3], 400), str(r[4], 80)] : null; };
const cleanDrugs = a => (Array.isArray(a) ? a : []).slice(0, RX_MAX_DRUGS).map(cleanDrug).filter(Boolean);

/* ---------- الإحصائيات (طبيب فقط): تُحسب كلها في الخادم من الأرشيف والمرضى الحاليين ---------- */
const isDayStr = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v + 'T00:00:00Z'));
function rangeOf(q) {   // نفس منطق الأرشيف: التواريخ بتوقيت جهاز الطبيب (tz = getTimezoneOffset)
  const tz = Math.max(-840, Math.min(840, +q.get('tz') || 0)), ds = v => Date.parse(v + 'T00:00:00Z') + tz * 6e4;
  const f = str(q.get('from') || '', 10), t = str(q.get('to') || '', 10);
  let d0 = isDayStr(f) ? ds(f) : 0, d1 = isDayStr(t) ? ds(t) + 864e5 : 0;
  if (d0 && d1 && d0 >= d1) { d0 = ds(t); d1 = ds(f) + 864e5; }
  return { tz, d0, d1 };
}
const AGE_BANDS = [[0, 12], [13, 17], [18, 29], [30, 44], [45, 59], [60, 200]];
const WAIT_BOUNDS = [5, 15, 30, 60], DUR_BOUNDS = [10, 20, 30, 45, 60];   // حدود الشرائح بالدقائق (الأخيرة: ما فوق)
const sumOf = (a, f) => r2(a.reduce((x, y) => x + f(y), 0));
const avgOf = a => a.length ? r2(a.reduce((x, y) => x + y, 0) / a.length) : 0;
const medOf = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return r2(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2); };
const paysOf = a => (a.payments && a.payments.length) ? a.payments : (paidOf(a) > 0 ? [{ t: a.finishedAt, amt: paidOf(a) }] : []);
const bump = (m, k, init) => { let o = m.get(k); if (!o) m.set(k, o = init()); return o; };
const bucketOf = (v, bounds) => { for (let i = 0; i < bounds.length; i++) if (v <= bounds[i]) return i; return bounds.length; };
const dist = (vals, bounds) => { const n = Array(bounds.length + 1).fill(0); for (const v of vals) n[bucketOf(v, bounds)]++; return n; };
const toothCatOf = n => { const d = n % 10, qd = Math.floor(n / 10); return d <= 3 ? 'front' : (qd >= 5 ? 'molar' : d <= 5 ? 'pre' : 'molar'); };

function statsFor(c, d0, d1, tz) {
  const t0 = now(), loc = t => new Date(t - tz * 6e4);
  const dayKey = t => loc(t).toISOString().slice(0, 10), monKey = t => loc(t).toISOString().slice(0, 7);
  const arch = c.archive.filter(r => r.finishedAt);
  const inR = r => (!d0 || r.finishedAt >= d0) && (!d1 || r.finishedAt < d1);
  const rs = arch.filter(inR);
  /* المحصَّل نقداً: دفعات الحصص (ما عدا المقتطع من الوعاء لأنه حُسب عند إيداعه) + إيداعات الوعاء − المسترجع نقداً */
  const wlogs = Object.values(c.wallets || {}).flatMap(w => w.log || []).filter(e => e.k === 'dep' || e.k === 'out');
  const inT = (t, a0, a1) => (!a0 || t >= a0) && (!a1 || t < a1);
  const cashIn = (a0, a1) => r2(arch.reduce((x, r) => x + paysOf(r).reduce((y, p) => y + (p.m !== 'w' && inT(p.t, a0, a1) ? (+p.amt || 0) : 0), 0), 0) + wlogs.reduce((x, e) => x + (inT(e.t, a0, a1) ? (e.k === 'dep' ? e.amt : -e.amt) : 0), 0));
  const mk = (list, a0, a1) => {
    const priced = list.filter(r => (r.price || 0) > 0);
    return { visits: list.length, patients: new Set(list.map(patKey)).size, billed: sumOf(list, dueOf), collected: cashIn(a0, a1), outstanding: sumOf(list, remOf),
      avgBill: avgOf(priced.map(r => r.price)), avgWait: avgOf(list.map(r => r.waitMin || 0)), avgDuration: avgOf(list.map(r => r.durationMin || 0)),
      followUps: list.filter(r => r.followUp).length, images: list.reduce((x, r) => x + (r.images || []).length, 0), paidVisits: priced.length, freeVisits: list.length - priced.length };
  };
  const summary = mk(rs, d0, d1);
  let prev = null;
  if (d0 && d1) { const len = d1 - d0, p0 = d0 - len; prev = mk(arch.filter(r => r.finishedAt >= p0 && r.finishedAt < d0), p0, d0); }

  /* السلسلة الزمنية: يومية حتى ~3 أشهر ثم شهرية */
  const start = d0 || (arch.length ? Math.min(...arch.map(r => r.finishedAt)) : t0), stop = d1 ? d1 - 1 : t0;
  const gran = (stop - start) / 864e5 > 92 ? 'month' : 'day', keyOf = gran === 'month' ? monKey : dayKey, buckets = new Map();
  if (start <= stop) {
    if (gran === 'day') { for (let d = Date.parse(dayKey(start) + 'T00:00:00Z'), e = Date.parse(dayKey(stop) + 'T00:00:00Z'); d <= e; d += 864e5) buckets.set(new Date(d).toISOString().slice(0, 10), { k: new Date(d).toISOString().slice(0, 10), visits: 0, billed: 0, collected: 0 }); }
    else { let y = +monKey(start).slice(0, 4), mo = +monKey(start).slice(5), ey = +monKey(stop).slice(0, 4), em = +monKey(stop).slice(5); for (; y < ey || (y === ey && mo <= em); mo++) { if (mo > 12) { mo = 1; y++; if (y > ey || (y === ey && mo > em)) break; } const k = `${y}-${String(mo).padStart(2, '0')}`; buckets.set(k, { k, visits: 0, billed: 0, collected: 0 }); } }
  }
  const bk = k => bump(buckets, k, () => ({ k, visits: 0, billed: 0, collected: 0 }));
  for (const r of rs) { const b = bk(keyOf(r.finishedAt)); b.visits++; b.billed = r2(b.billed + dueOf(r)); }
  for (const r of arch) for (const p of paysOf(r)) if (p.m !== 'w' && inT(p.t, d0, d1)) { const b = bk(keyOf(p.t)); b.collected = r2(b.collected + (+p.amt || 0)); }
  for (const e of wlogs) if (inT(e.t, d0, d1)) { const b = bk(keyOf(e.t)); b.collected = r2(b.collected + (e.k === 'dep' ? e.amt : -e.amt)); }
  const series = [...buckets.values()].sort((x, y) => x.k < y.k ? -1 : 1);

  /* الأوقات: خريطة حرارية (يوم × ساعة وصول) وأيام الأسبوع */
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0)), weekday = Array.from({ length: 7 }, () => ({ visits: 0, billed: 0 }));
  for (const r of rs) { const a = loc(r.createdAt || r.finishedAt); heat[a.getUTCDay()][a.getUTCHours()]++; const w = weekday[loc(r.finishedAt).getUTCDay()]; w.visits++; w.billed = r2(w.billed + dueOf(r)); }
  const hours = Array(24).fill(0); for (const row of heat) row.forEach((n, h) => { hours[h] += n; });

  /* العلاجات */
  const tm = new Map();
  for (const r of rs) {
    /* زيارة بعدة علاجات: كل علاج يُحسب زيارة له، ويُوزَّع المستحق/المدفوع/المتبقي بنسبة سعر كل بند (بالتساوي إن لم توجد أسعار) */
    const names = treatmentsOf(r), w = names.map(n => { const it = (r.items || []).find(x => x.name === n); return it ? +it.price || 0 : 0; }), ws = w.reduce((x, y) => x + y, 0);
    names.forEach((n, i) => { const f = ws > 0 ? w[i] / ws : 1 / names.length, o = bump(tm, n, () => ({ name: n, visits: 0, billed: 0, paid: 0, debt: 0, dur: [] })); o.visits++; o.billed = r2(o.billed + dueOf(r) * f); o.paid = r2(o.paid + paidOf(r) * f); o.debt = r2(o.debt + remOf(r) * f); o.dur.push(r.durationMin || 0); });
  }
  const treatments = [...tm.values()].map(o => ({ name: o.name, visits: o.visits, billed: o.billed, paid: o.paid, debt: o.debt, avgPrice: o.visits ? r2(o.billed / o.visits) : 0, avgDuration: avgOf(o.dur) })).sort((x, y) => y.visits - x.visits || y.billed - x.billed);

  /* الديموغرافيا */
  const gender = { 'ذكر': { visits: 0, billed: 0 }, 'أنثى': { visits: 0, billed: 0 } };
  const ages = AGE_BANDS.map(([a, b]) => ({ from: a, to: b, visits: 0, billed: 0 }));
  const reasons = new Map();
  for (const r of rs) {
    const g = gender[r.gender === 'أنثى' ? 'أنثى' : 'ذكر']; g.visits++; g.billed = r2(g.billed + dueOf(r));
    const age = loc(r.finishedAt).getUTCFullYear() - r.birthYear, band = ages.find(z => age >= z.from && age <= z.to) || ages[ages.length - 1]; band.visits++; band.billed = r2(band.billed + dueOf(r));
    bump(reasons, r.reason || 'استشارة وطوارئ', () => ({ name: r.reason || 'استشارة وطوارئ', visits: 0 })).visits++;
  }

  /* الأسنان: لكل سن، ولكل نوع، والفك، والدائمة/اللبنية */
  const perTooth = {}, cats = { front: 0, pre: 0, molar: 0 }, jaw = { upper: 0, lower: 0 }, side = { right: 0, left: 0 }, dentition = { permanent: 0, primary: 0 }; let toothTotal = 0, noTooth = 0;
  for (const r of rs) {
    const list = (r.teeth && r.teeth.length ? r.teeth : String(r.tooth || '').split(/\s+/)).filter(x => FDI.has(x));
    if (!list.length) { noTooth++; continue; }
    for (const s of list) { const n = +s, qd = Math.floor(n / 10); perTooth[s] = (perTooth[s] || 0) + 1; toothTotal++; cats[toothCatOf(n)]++; (qd === 1 || qd === 2 || qd === 5 || qd === 6 ? jaw.upper++ : jaw.lower++); (qd === 1 || qd === 4 || qd === 5 || qd === 8 ? side.right++ : side.left++); (qd <= 4 ? dentition.permanent++ : dentition.primary++); }
  }

  /* الانتظار والمعاينة */
  const waits = rs.map(r => r.waitMin || 0), durs = rs.map(r => r.durationMin || 0);
  const timing = { wait: { avg: avgOf(waits), median: medOf(waits), max: waits.length ? Math.max(...waits) : 0, buckets: dist(waits, WAIT_BOUNDS), bounds: WAIT_BOUNDS }, duration: { avg: avgOf(durs), median: medOf(durs), max: durs.length ? Math.max(...durs) : 0, buckets: dist(durs, DUR_BOUNDS), bounds: DUR_BOUNDS }, totalChairMin: durs.reduce((x, y) => x + y, 0) };

  /* المرضى: جدد/عائدون، تكرار الزيارات، الأكثر زيارة/إنفاقاً */
  const firstEver = new Map(); for (const r of arch) { const k = patKey(r); if (!firstEver.has(k) || r.finishedAt < firstEver.get(k)) firstEver.set(k, r.finishedAt); }
  const pm = new Map();
  for (const r of rs) { const o = bump(pm, patKey(r), () => ({ name: r.name, birthYear: r.birthYear, visits: 0, billed: 0, debt: 0 })); o.visits++; o.billed = r2(o.billed + dueOf(r)); o.debt = r2(o.debt + remOf(r)); }
  let newP = 0; for (const k of pm.keys()) { const f = firstEver.get(k); if ((!d0 || f >= d0) && (!d1 || f < d1)) newP++; }
  const pl = [...pm.values()], freq = [0, 0, 0, 0]; for (const o of pl) freq[Math.min(3, o.visits - 1)]++;
  const patients = { unique: pl.length, new: newP, returning: pl.length - newP, avgVisits: pl.length ? r2(rs.length / pl.length) : 0, freq,
    topVisits: pl.slice().sort((x, y) => y.visits - x.visits || y.billed - x.billed).slice(0, 8), topBilled: pl.slice().sort((x, y) => y.billed - x.billed).filter(z => z.billed > 0).slice(0, 8) };

  /* الأدوية الموصوفة */
  const rxRecs = rs.filter(r => r.rx && r.rx.length), rxm = new Map();
  for (const r of rxRecs) for (const l of r.rx) bump(rxm, l.name.toLowerCase(), () => ({ name: l.name, n: 0 })).n++;
  const rx = { prescriptions: rxRecs.length, lines: rxRecs.reduce((x, r) => x + r.rx.length, 0), top: [...rxm.values()].sort((x, y) => y.n - x.n || (x.name < y.name ? -1 : 1)).slice(0, 12) };

  /* من سجّل المرضى (الطبيب أو الممرضة باسمها) */
  const rg = new Map();
  for (const r of rs) { const role = r.createdBy === 'nurse' ? 'nurse' : 'doctor', name = role === 'nurse' ? (r.createdByName || '') : ''; bump(rg, role + '|' + name, () => ({ role, name, n: 0 })).n++; }
  const registrars = [...rg.values()].sort((x, y) => y.n - x.n);

  /* الديون الكلية (كل الأرشيف، بغضّ النظر عن الفترة) */
  const dm = new Map(), aging = [0, 0, 0, 0]; let debtTotal = 0;
  for (const r of arch) { const rem = remOf(r); if (rem <= 0) continue; debtTotal = r2(debtTotal + rem); const days = (t0 - r.finishedAt) / 864e5; aging[days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3] = r2(aging[days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3] + rem);
    const o = bump(dm, patKey(r), () => ({ name: r.name, birthYear: r.birthYear, phone: r.phone || '', balance: 0, since: r.finishedAt })); o.balance = r2(o.balance + rem); if (r.finishedAt < o.since) o.since = r.finishedAt; if (!o.phone && r.phone) o.phone = r.phone; }
  const debtors = [...dm.values()].sort((x, y) => y.balance - x.balance);
  const debt = { total: debtTotal, count: debtors.length, aging, top: debtors.slice(0, 10) };

  /* لمحة اليوم (بتوقيت الطبيب) والإجمالي العام */
  const ts = Date.parse(dayKey(t0) + 'T00:00:00Z') + tz * 6e4, td = arch.filter(r => r.finishedAt >= ts);
  const today = { waiting: waiting(c).length, inRoom: inRoom(c) ? 1 : 0, registered: c.patients.filter(p => p.createdAt >= ts).length + arch.filter(r => (r.createdAt || r.finishedAt) >= ts).length, finished: td.length, billed: sumOf(td, dueOf), collected: cashIn(ts, 0) };
  const overall = { visits: arch.length, patients: firstEver.size, firstVisit: arch.length ? Math.min(...arch.map(r => r.finishedAt)) : null, nurses: c.nurses.length, treatments: treatsOf(c).length };

  return { range: { d0, d1, tz, gran, from: start, to: stop }, summary, prev, series, hours, heat, weekday, treatments, gender, ages, reasons: [...reasons.values()].sort((x, y) => y.visits - x.visits),
    teeth: { perTooth, cats, jaw, side, dentition, total: toothTotal, none: noTooth }, timing, patients, rx, registrars, debt, today, overall };
}

/* حماية الأرشيف والتعديلات: إن فعّلها الطبيب لا يُسمح بالوصول إلا برمز فتح مؤقّت يُنال بكلمة المرور (يُحفظ في الذاكرة فقط) */
const unlocks = new Map(), UNLOCK_MS = 10 * 60e3;
function needUnlock(req, c) {
  if (!c.protect) return;
  const tok = String(req.headers['x-unlock'] || ''), u = tok && unlocks.get(sha(tok));
  if (!u || u.cid !== c.id || u.exp < now()) throw httpErr(423, 'locked');
  u.exp = now() + UNLOCK_MS;
}
setInterval(() => { for (const [k, u] of unlocks) if (u.exp < now()) unlocks.delete(k); }, 6e4).unref();
function authOf(req, roles) {
  const h = req.headers.authorization || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : '';
  const key = tok ? sha(tok) : '', s = key && db.sessions[key];
  if (!s || s.exp < now()) throw httpErr(401, 'unauthorized');
  const clinic = db.clinics[s.clinicId]; if (!clinic) throw httpErr(401, 'unauthorized');
  if (statusOf(clinic) !== 'active') throw httpErr(403, statusOf(clinic));
  let nurse = null;
  if (s.role === 'nurse') { nurse = clinic.nurses.find(n => n.id === s.nurseId); if (!nurse) { delete db.sessions[key]; throw httpErr(401, 'unauthorized'); } }
  if (roles && !roles.includes(s.role)) throw httpErr(403, 'forbidden');
  return { clinic, role: s.role, nurse, key };
}
async function openSession(role, clinic, nurse) {
  const token = b64u(32);
  db.sessions[sha(token)] = { role, clinicId: clinic.id, nurseId: nurse ? nurse.id : null, exp: now() + SESSION_MS };
  clinic.lastLoginAt = now(); save();
  return { token, role, name: role === 'doctor' ? clinic.doctor.name : nurse.name, clinicName: clinic.name };
}
function meOf(ctx) {
  const c = ctx.clinic;
  return { role: ctx.role, name: ctx.role === 'doctor' ? c.doctor.name : ctx.nurse.name, clinicName: c.name, doctorName: c.doctor.name, prices: ctx.role === 'doctor' ? pricesOf(c) : undefined, code: ctx.role === 'doctor' ? c.code : undefined, publicUrl: PUBLIC_URL || undefined, protect: ctx.role === 'doctor' ? !!c.protect : undefined };
}
function enterRoom(c, p) { p.status = 'in'; p.startedAt = now(); RT(c).skip.delete(p.id); }
function findPatient(c, id) { const p = c.patients.find(x => x.id === id); if (!p) throw httpErr(404, 'not_found'); return p; }
const IMG_ID = /^[a-f0-9]{16}$/, REC_ID = /^[a-f0-9]{12}$/, TOKEN = /^[A-Za-z0-9_-]{20,40}$/;
const imgPath = (c, id) => path.join(DATA_DIR, 'img', c.id, id + '.jpg');
const isJpeg = b => b.length > 4 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
function rmImages(c, rec) { for (const i of rec.images || []) fs.unlink(imgPath(c, i.id), () => {}); }

/* ---------- مالك التطبيق: الموافقة على الحسابات الجديدة ومراقبة كل الحسابات ----------
   كلمة مرور المالك: المتغيّر OWNER_PASSWORD، وإن لم يُضبط تُولَّد عشوائياً عند أول تشغيل وتُطبع في الطرفية
   وتُحفظ في DATA_DIR/OWNER_PASSWORD.txt (احذف الملف بعد حفظها). الصفحة: /owner
   حالة العيادة c.status: 'pending' بانتظار الموافقة · 'suspended' موقوفة · غير موجودة/'active' فعّالة (الحسابات القديمة). */
const OWNER_ENV = process.env.OWNER_PASSWORD || '';
let ownerRec = null;
(async function initOwner() {
  try {
    if (OWNER_ENV) { ownerRec = await hashPw(OWNER_ENV); if (db.owner) { delete db.owner; save(); } return; }
    if (db.owner && db.owner.hash) { ownerRec = db.owner; return; }
    const pw = b64u(12); db.owner = await hashPw(pw); ownerRec = db.owner; flush();
    try { fs.writeFileSync(path.join(DATA_DIR, 'OWNER_PASSWORD.txt'), pw + '\n', { mode: 0o600 }); } catch (e) {}
    console.log('\n==== كلمة مرور مالك التطبيق (صفحة /owner) ====\n' + pw + '\nحُفظت أيضاً في ' + path.join(DATA_DIR, 'OWNER_PASSWORD.txt') + ' — احفظها ثم احذف الملف. لتغييرها لاحقاً اضبط المتغيّر OWNER_PASSWORD.\n');
  } catch (e) { console.error('تعذّر تهيئة حساب المالك:', e.message); }
})();
const ownerSess = new Map();
setInterval(() => { const t = now(); for (const [k, v] of ownerSess) if (v.exp < t) ownerSess.delete(k); }, 6e4).unref();
function ownerAuth(req) {
  const h = req.headers.authorization || '', tok = h.startsWith('Bearer ') ? h.slice(7) : '', k = tok ? sha(tok) : '', e = k && ownerSess.get(k);
  if (!e || e.exp < now()) throw httpErr(401, 'unauthorized'); return k;
}
const approvalOn = () => db.settings.requireApproval === undefined ? process.env.REQUIRE_APPROVAL !== 'false' : !!db.settings.requireApproval;
const statusOf = c => c.status === 'pending' || c.status === 'suspended' ? c.status : 'active';
function ownerView(c) {
  const t = now(); let devices = 0; for (const s of Object.values(db.sessions)) if (s.clinicId === c.id && s.exp > t) devices++;
  return { id: c.id, name: c.name, doctor: c.doctor.name, username: c.doctor.username, code: c.code, status: statusOf(c), createdAt: c.createdAt || null, approvedAt: c.approvedAt || null, lastLoginAt: c.lastLoginAt || null,
    nurses: c.nurses.length, patients: c.patients.length, visits: c.archive.length, devices };
}
function killSessions(c) {
  for (const [k, s] of Object.entries(db.sessions)) if (s.clinicId === c.id) { delete db.sessions[k]; closeStreamsOf(k); }
  for (const [k, u] of unlocks) if (u.cid === c.id) unlocks.delete(k);
}
function dropClinic(c) {
  for (const pt of c.patients.concat(c.archive)) if (pt.ticket) idx.ticket.delete(pt.ticket);
  killSessions(c); fs.rm(path.join(DATA_DIR, 'img', c.id), { recursive: true, force: true }, () => {});
  idx.user.delete(c.doctor.username); idx.code.delete(c.code); delete db.clinics[c.id]; delete rt[c.id]; save();
}

/* ---------- المسارات ---------- */
async function api(req, res, url) {
  const m = req.method, p = url.pathname; let x;
  const ip = clientIp(req);

  if (m === 'GET' && p === '/api/config') return send(res, 200, { registration: !ALLOW_REG ? 'closed' : REG_CODE ? 'code' : 'open', approval: approvalOn(), hasClinics: Object.keys(db.clinics).length > 0 });

  if (m === 'POST' && p === '/api/register') {
    if (!ALLOW_REG) throw httpErr(403, 'reg_closed');
    rate('reg:' + ip, +process.env.REG_RATE_MAX || 10, 36e5);
    const b = await readJSON(req);
    if (REG_CODE && b.registrationCode !== REG_CODE) throw httpErr(403, 'bad_code');
    const clinicName = str(b.clinicName, 80), doctorName = str(b.doctorName, 80), username = str(b.username, 40).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
    if (!clinicName || !doctorName || !/^[a-z0-9._@-]{3,40}$/.test(username) || pw.length < 8 || pw.length > 200) throw httpErr(400, 'invalid_input');
    if (idx.user.has(username)) throw httpErr(409, 'exists');
    const needOk = approvalOn();
    if (needOk && Object.values(db.clinics).filter(z => z.status === 'pending').length >= 100) throw httpErr(429, 'too_many_pending');
    const id = rid(8), c = { id, code: newClinicCode(), name: clinicName, doctor: { name: doctorName, username, ...(await hashPw(pw)) }, nurses: [], patients: [], archive: [], counter: null, createdAt: now(), ...(needOk ? { status: 'pending' } : {}) };
    if (idx.user.has(username)) throw httpErr(409, 'exists');
    db.clinics[id] = c; idx.user.set(username, id); idx.code.set(c.code, id);
    if (needOk) { save(); return send(res, 202, { pending: true }); }   // لا جلسة: يلزم إذن المالك أولاً
    return send(res, 201, await openSession('doctor', c, null));
  }
  if (m === 'POST' && p === '/api/login/doctor') {
    const b = await readJSON(req), u = str(b.username, 40).toLowerCase();
    rate('login:' + ip, 30, 6e5); rate('loginu:' + u, 10, 6e5);
    const c = db.clinics[idx.user.get(u)], ok = await checkPw(b.password || '', c ? c.doctor : DUMMY);
    if (!c || !ok) throw httpErr(401, 'bad_credentials');
    if (statusOf(c) !== 'active') throw httpErr(403, statusOf(c));
    return send(res, 200, await openSession('doctor', c, null));
  }
  if (m === 'POST' && p === '/api/login/nurse') {
    const b = await readJSON(req), code = str(b.code, 12).toUpperCase(), name = str(b.name, 80).toLowerCase();
    rate('login:' + ip, 30, 6e5); rate('loginc:' + code, 20, 6e5);
    const c = db.clinics[idx.code.get(code)], n = c && c.nurses.find(z => z.name.toLowerCase() === name), ok = await checkPw(b.password || '', n || DUMMY);
    if (!c || !n || !ok) throw httpErr(401, 'bad_credentials');
    if (statusOf(c) !== 'active') throw httpErr(403, statusOf(c));
    return send(res, 200, await openSession('nurse', c, n));
  }

  /* ---- لوحة مالك التطبيق ---- */
  if (m === 'POST' && p === '/api/owner/login') {
    rate('own:' + ip, 10, 6e5); rate('ownall', 60, 6e5);
    const b = await readJSON(req), ok = await checkPw(b.password || '', ownerRec || DUMMY);
    if (!ownerRec || !ok) throw httpErr(401, 'bad_credentials');
    const tok = b64u(32); ownerSess.set(sha(tok), { exp: now() + 8 * 36e5 }); return send(res, 200, { token: tok });
  }
  if (p.startsWith('/api/owner/')) {
    const ok = ownerAuth(req);
    if (m === 'POST' && p === '/api/owner/logout') { ownerSess.delete(ok); return send(res, 200, { ok: true }); }
    if (m === 'GET' && p === '/api/owner/clinics') return send(res, 200, { approval: approvalOn(), serverTime: now(), clinics: Object.values(db.clinics).map(ownerView).sort((a, b) => (a.status === 'pending') !== (b.status === 'pending') ? (a.status === 'pending' ? -1 : 1) : (b.createdAt || 0) - (a.createdAt || 0)) });
    if (m === 'POST' && p === '/api/owner/settings') { const b = await readJSON(req); db.settings.requireApproval = !!b.requireApproval; save(); return send(res, 200, { approval: approvalOn() }); }
    const mo = p.match(/^\/api\/owner\/clinics\/([a-f0-9]{16})(?:\/(approve|suspend|activate))?$/), oc = mo && db.clinics[mo[1]];
    if (!oc) throw httpErr(404, 'not_found');
    if (m === 'POST' && mo[2] === 'approve') { if (statusOf(oc) !== 'pending') throw httpErr(409, 'bad_state'); delete oc.status; oc.approvedAt = now(); save(); return send(res, 200, ownerView(oc)); }
    if (m === 'POST' && mo[2] === 'suspend') { if (statusOf(oc) !== 'active') throw httpErr(409, 'bad_state'); oc.status = 'suspended'; killSessions(oc); save(); return send(res, 200, ownerView(oc)); }
    if (m === 'POST' && mo[2] === 'activate') { if (statusOf(oc) !== 'suspended') throw httpErr(409, 'bad_state'); delete oc.status; save(); return send(res, 200, ownerView(oc)); }
    if (m === 'DELETE' && !mo[2]) { dropClinic(oc); return send(res, 200, { ok: true }); }
    throw httpErr(405, 'forbidden');
  }

  /* ---- صفحة التذكرة العامة (المريض) ---- */
  let mt = p.match(/^\/api\/ticket\/([A-Za-z0-9_-]+)(\/stream)?$/);
  if (m === 'GET' && mt) {
    rate('tk:' + ip, 120, 6e4);
    const token = mt[1], c = TOKEN.test(token) && db.clinics[idx.ticket.get(token)];
    if (!c) throw httpErr(404, 'not_found');
    if (!mt[2]) return send(res, 200, ticketView(c, token));
    let set = ticketStreams.get(token); if (!set) ticketStreams.set(token, set = new Set());
    if (set.size >= 5) throw httpErr(429, 'rate_limited');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 3000\n\n'); sse(res, 'ticket', ticketView(c, token)); set.add(res);
    req.on('close', () => { set.delete(res); if (!set.size) ticketStreams.delete(token); });
    return;
  }

  /* ---- ما بعد هذا يتطلب تسجيل دخول ---- */
  if (m === 'POST' && p === '/api/logout') { const a = authOf(req); delete db.sessions[a.key]; closeStreamsOf(a.key); save(); return send(res, 200, { ok: true }); }
  if (m === 'GET' && p === '/api/state') { const a = authOf(req); return send(res, 200, { me: meOf(a), ...stateFor(a.clinic, a.role, a.nurse && a.nurse.id) }); }
  /* اشتراك الجهاز في إشعارات النظام (Web Push) — مرتبط بجلسة الدخول، ويُحذف عند الخروج */
  if (m === 'GET' && p === '/api/push/key') { authOf(req); return send(res, 200, { key: webpush.publicKey }); }
  if (m === 'POST' && p === '/api/push/subscribe') {
    const a = authOf(req); rate('push:' + a.key, 30, 36e5);
    const b = await readJSON(req, 10e3), sub = webpush.validSub(b.subscription);
    if (!sub) throw httpErr(400, 'invalid_input');
    for (const s of Object.values(db.sessions)) if (s.push && s.push.sub.endpoint === sub.endpoint) delete s.push;   // الجهاز نفسه لا يستلم مرتين
    db.sessions[a.key].push = { sub, lang: b.lang === 'en' ? 'en' : 'ar' }; save();
    return send(res, 200, { ok: true });
  }
  if (m === 'DELETE' && p === '/api/push/subscribe') { const a = authOf(req); delete db.sessions[a.key].push; save(); return send(res, 200, { ok: true }); }
  if (m === 'POST' && p === '/api/stream-ticket') {
    const a = authOf(req), t = b64u(18); streamTickets.set(t, { key: a.key, exp: now() + 3e4 });
    return send(res, 200, { ticket: t });
  }
  if (m === 'GET' && p === '/api/stream') {
    const st = streamTickets.get(url.searchParams.get('ticket') || ''); streamTickets.delete(url.searchParams.get('ticket') || '');
    const s = st && st.exp > now() && db.sessions[st.key];
    if (!s) throw httpErr(401, 'unauthorized');
    const c = db.clinics[s.clinicId]; if (!c || statusOf(c) !== 'active') throw httpErr(401, 'unauthorized');
    const r = RT(c); if (r.streams.size >= 40) throw httpErr(429, 'rate_limited');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 3000\n\n');
    const sub = { res, role: s.role, nurseId: s.nurseId || null, sessionKey: st.key }; r.streams.add(sub); sse(res, 'state', stateFor(c, s.role, s.nurseId));
    req.on('close', () => r.streams.delete(sub));
    return;
  }

  /* مرضى اليوم */
  if (m === 'POST' && p === '/api/patients') {
    const a = authOf(req), c = a.clinic, v = validatePatient(await readJSON(req));
    if (!v) throw httpErr(400, 'invalid_input');
    if (a.role === 'nurse' && !scheduleOpen(c)) throw httpErr(403, 'registration_closed');
    if (c.patients.length >= 500) throw httpErr(429, 'limit');
    const pt = { id: rid(6), ticket: b64u(18), ticketNo: nextTicketNo(c), ...v, images: [], status: 'waiting', createdAt: now(), startedAt: null, createdBy: a.role, createdByName: a.nurse ? a.nurse.name : '' };
    c.patients.push(pt); idx.ticket.set(pt.ticket, c.id);
    broadcast(c, { to: 'doctor', exclude: a.key, data: { type: 'add', name: pt.name } });
    return send(res, 201, patientView(pt));
  }
  mt = p.match(/^\/api\/patients\/([a-f0-9]{12})(?:\/(enter|skip|finish|images))?(?:\/([a-f0-9]{16}))?$/);
  if (mt) {
    const [, pid, act, imgId] = mt;
    if (!act && m === 'PUT') {
      const a = authOf(req), c = a.clinic, pt = findPatient(c, pid), v = validatePatient(await readJSON(req));
      if (!v) throw httpErr(400, 'invalid_input'); if (pt.status === 'in' ? a.role !== 'doctor' : pt.status !== 'waiting') throw httpErr(409, 'not_waiting');   // الطبيب يعدّل بيانات من في المعاينة أيضاً
      Object.assign(pt, v); broadcast(c); return send(res, 200, patientView(pt));
    }
    if (!act && m === 'DELETE') {
      const a = authOf(req), c = a.clinic, pt = findPatient(c, pid);
      if (pt.status !== 'waiting') throw httpErr(409, 'not_waiting');
      c.patients = c.patients.filter(z => z !== pt); rmImages(c, pt); RT(c).skip.delete(pid);
      broadcast(c, null, [pt.ticket]); idx.ticket.delete(pt.ticket); return send(res, 200, { ok: true });
    }
    if (act === 'enter' && m === 'POST') {
      const a = authOf(req), c = a.clinic, pt = findPatient(c, pid);
      if (pt.status !== 'waiting') throw httpErr(409, 'not_waiting');
      if (inRoom(c)) throw httpErr(409, 'busy');
      const first = waiting(c)[0];
      if (a.role === 'nurse' && first !== pt) {
        RT(c).skip.set(pid, { ts: now(), name: pt.name, firstName: first.name });
        broadcast(c, { to: 'doctor', exclude: a.key, data: { type: 'skip_request', name: pt.name, first: first.name, pid } });
        return send(res, 202, { skipRequested: true });
      }
      enterRoom(c, pt); broadcast(c, { to: 'doctor', exclude: a.key, data: { type: 'enter', name: pt.name } }); return send(res, 200, patientView(pt));
    }
    if (act === 'skip' && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid), b = await readJSON(req);
      if (b.allow) {
        if (pt.status !== 'waiting') throw httpErr(409, 'not_waiting'); if (inRoom(c)) throw httpErr(409, 'busy');
        enterRoom(c, pt); broadcast(c, { to: 'doctor', exclude: a.key, data: { type: 'enter', name: pt.name } });
      } else { RT(c).skip.delete(pid); broadcast(c, { to: 'nurse', exclude: a.key, data: { type: 'skip_denied', name: pt.name } }); }
      return send(res, 200, { ok: true });
    }
    if (act === 'finish' && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid), b = await readJSON(req);
      if (pt.status !== 'in') throw httpErr(409, 'not_waiting');
      const t = now(), tl = cleanTreats(b.treatments), treatment = tl.length ? str(tl.join(' + '), 200) : (str(b.treatment, 200) || 'استشارة');
      const teeth = cleanTeeth(b.teeth), price = num(b.price), entry = { ...pt, price, followUp: !!b.followUp, ...(teeth.length ? { teeth, tooth: teeth.join(' ') } : {}), status: 'done', treatment, ...(tl.length ? { treatments: tl, items: cleanItems(b.items, tl) } : {}), notes: str(b.notes, 2000), ...(cleanRx(b.rx).length ? { rx: cleanRx(b.rx), rxHead: cleanHead(b.rxHead) } : {}), finishedAt: t, waitMin: Math.max(0, Math.round(((pt.startedAt || t) - pt.createdAt) / 6e4)), durationMin: Math.max(1, Math.round((t - (pt.startedAt || t)) / 6e4)) };
      if (Array.isArray(b.lines)) {
        /* خطة العلاج: بنود اليوم (جديدة أو متابعة لخطة جارية) + سداد متبقٍّ سابق + اقتطاع اختياري من الوعاء */
        const k = patKey(pt), pm = plansOf(c, k), seenPl = new Set(), tg = [], lines = [];
        for (const z of b.lines.slice(0, 24)) {
          if (!z || typeof z !== 'object') throw httpErr(400, 'invalid_input');
          const pay = Math.max(0, num(z.pay) || 0);
          if (z.plan !== undefined && z.plan !== null && z.plan !== '') {
            const p = typeof z.plan === 'string' && PLAN_ID.test(z.plan) ? pm.get(z.plan) : null; if (!p) throw httpErr(404, 'not_found'); if (!p.open) throw httpErr(409, 'plan_closed'); if (seenPl.has(p.id)) throw httpErr(400, 'invalid_input'); seenPl.add(p.id);
            lines.push({ plan: p.id, no: p.done + 1, sessions: p.sessions, tooth: p.tooth, treatment: p.treatment }); tg.push({ rec: p.rec, plan: p.id, cap: p.remaining, pay });
          } else {
            const treatment = str(z.treatment, 40).trim().replace(/\s+/g, ' '), tooth = z.tooth ? String(z.tooth) : ''; if (!treatment || (tooth && !FDI.has(tooth))) throw httpErr(400, 'invalid_input');
            const total = num(z.total) || 0, sessions = cleanSess(z.sessions) || 1, id = rid(5);
            lines.push({ plan: id, no: 1, sessions, tooth, treatment, total }); tg.push({ rec: entry, plan: id, cap: total, pay });
          }
        }
        for (const z of (Array.isArray(b.debts) ? b.debts : []).slice(0, 40)) {
          if (!z || typeof z !== 'object') throw httpErr(400, 'invalid_input'); const pay = Math.max(0, num(z.pay) || 0); if (!pay) continue;
          if (z.plan) { const p = typeof z.plan === 'string' ? pm.get(z.plan) : null; if (!p) throw httpErr(404, 'not_found'); tg.push({ rec: p.rec, plan: p.id, cap: p.remaining, pay }); }
          else { const o = typeof z.rec === 'string' ? c.archive.find(y => y.id === z.rec && patKey(y) === k) : null; if (!o) throw httpErr(404, 'not_found'); tg.push({ rec: o, plan: null, cap: remOf(o), pay }); }
        }
        const price = r2(lines.reduce((x, l) => x + (l.no === 1 ? l.total : 0), 0)), treats = [...new Set(lines.map(l => l.treatment))], tts = [...new Set(lines.map(l => l.tooth).filter(Boolean))];
        Object.assign(entry, { price, paid: 0, payments: [], lines, followUp: !lines.some(l => l.no === 1), treatment: treats.length ? str(treats.join(' + '), 200) : 'استشارة', ...(treats.length ? { treatments: treats, items: treats.map(n => ({ name: n, price: r2(lines.reduce((x, l) => x + (l.no === 1 && l.treatment === n ? l.total : 0), 0)) })) } : {}) });
        delete entry.teeth; delete entry.tooth; if (tts.length) { entry.teeth = tts; entry.tooth = tts.join(' '); } else entry.tooth = pt.tooth;
        c.patients = c.patients.filter(z => z !== pt); c.archive.unshift(entry);
        /* المبلغ الفعلي لكل هدف لا يتجاوز متبقيه (أكثر من ذلك لا يُقبل)؛ الوعاء يُغطّي منها بالترتيب والباقي نقداً */
        for (const g of tg) { if (g.rec === entry) g.cap = Math.min(g.cap, entry.price); g.amt = Math.min(g.pay, g.cap); }
        const tot = r2(tg.reduce((x, g) => x + g.amt, 0)); let wl = Math.max(0, Math.min(num(b.wallet) || 0, wbal(c, k), tot)), used = 0;
        for (const g of tg) { if (!(g.amt > 0)) continue; const wp = Math.min(g.amt, wl); wl = r2(wl - wp); if (wp > 0) used = r2(used + payRec(c, k, g.rec, wp, t, entry.id, 'w', g.plan)); const cp = r2(g.amt - wp); if (cp > 0) payRec(c, k, g.rec, cp, t, entry.id, null, g.plan); }
        if (used > 0) wMove(c, k, 'use', used, t, { vid: entry.id });
        broadcast(c, { to: 'nurse', exclude: a.key, data: { type: 'finish', name: pt.name } }, [pt.ticket]);
        return send(res, 200, archiveView(entry, { c, info: visitInfo(c) }));
      }
      /* الدفع: (1) الاقتطاع من وعاء المريض إن طُلب (2) المدفوع نقداً. كلاهما يغطي سعر هذه الحصة أولاً ثم أقدم متبقٍ سابق؛
         وأي فائض نقدي يُودَع في وعاء المريض. كل دفعة تحمل رقم الحصة التي دُفعت فيها (vid) و m:'w' إن كانت من الوعاء */
      { const k = patKey(pt); entry.paid = 0; entry.payments = [];
        const need = r2((price || 0) + c.archive.reduce((x, o) => x + (patKey(o) === k ? remOf(o) : 0), 0));
        const w = Math.max(0, Math.min(num(b.wallet) || 0, wbal(c, k), need));
        const cash = Math.max(0, b.paid === undefined ? Math.max(0, (price || 0) - w) : (num(b.paid) || 0));
        if (w > 0) { const left = allocPay(c, k, entry, w, t, entry.id, 'w'); wMove(c, k, 'use', r2(w - left), t, { vid: entry.id }); }
        const extra = allocPay(c, k, entry, cash, t, entry.id); if (extra > 0) wMove(c, k, 'dep', extra, t, { vid: entry.id }); }
      c.patients = c.patients.filter(z => z !== pt); c.archive.unshift(entry);
      broadcast(c, { to: 'nurse', exclude: a.key, data: { type: 'finish', name: pt.name } }, [pt.ticket]);
      return send(res, 200, archiveView(entry, { c, info: visitInfo(c) }));
    }
    if (act === 'images' && !imgId && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid);
      if ((pt.images || []).length >= 12) throw httpErr(429, 'limit');
      const buf = await readBody(req, 4e6); if (!isJpeg(buf)) throw httpErr(400, 'invalid_input');
      const id = rid(8); fs.mkdirSync(path.join(DATA_DIR, 'img', c.id), { recursive: true });
      await fs.promises.writeFile(imgPath(c, id), buf); (pt.images = pt.images || []).push({ id });
      broadcast(c); return send(res, 201, { id });
    }
    if (act === 'images' && imgId && m === 'DELETE') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid);
      const i = (pt.images || []).findIndex(z => z.id === imgId); if (i < 0) throw httpErr(404, 'not_found');
      pt.images.splice(i, 1); fs.unlink(imgPath(c, imgId), () => {}); broadcast(c); return send(res, 200, { ok: true });
    }
  }
  mt = p.match(/^\/api\/records\/([a-f0-9]{12})\/images\/([a-f0-9]{16})$/);
  if (m === 'GET' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic;
    const rec = c.patients.find(z => z.id === mt[1]) || c.archive.find(z => z.id === mt[1]);
    if (!rec || !(rec.images || []).some(z => z.id === mt[2])) throw httpErr(404, 'not_found');
    if (c.archive.includes(rec)) needUnlock(req, c);
    return serveFile(req, res, imgPath(c, mt[2]), { 'Cache-Control': 'private, max-age=3600', 'Content-Type': 'image/jpeg' });
  }
  if (m === 'PUT' && mt) {   // استبدال الصورة بعد التدوير (طبيب فقط)
    const a = authOf(req, ['doctor']), c = a.clinic;
    const rec = c.patients.find(z => z.id === mt[1]) || c.archive.find(z => z.id === mt[1]);
    if (!rec || !(rec.images || []).some(z => z.id === mt[2])) throw httpErr(404, 'not_found');
    if (c.archive.includes(rec)) needUnlock(req, c);
    const buf = await readBody(req, 4e6); if (!isJpeg(buf)) throw httpErr(400, 'invalid_input');
    const f = imgPath(c, mt[2]); await fs.promises.writeFile(f + '.tmp', buf); await fs.promises.rename(f + '.tmp', f);
    return send(res, 200, { ok: true });
  }

  /* قائمة الأسعار (طبيب فقط) */
  if (p === '/api/prices' && m === 'PUT') {
    const a = authOf(req, ['doctor']), b = await readJSON(req);
    const treatments = b.treatments === undefined ? treatsOf(a.clinic) : normTreatments(b.treatments);
    a.clinic.prices = { currency: str(b.currency, 10), list: normList(b.list, treatments), treatments }; save(); return send(res, 200, pricesOf(a.clinic));
  }

  /* سجل المريض الكامل: كل زياراته من الأولى إلى الأخيرة + زيارته الحالية إن وُجدت (طبيب فقط) */
  if (m === 'GET' && p === '/api/history') {
    const a = authOf(req, ['doctor']); needUnlock(req, a.clinic); const q = url.searchParams, year = parseInt(q.get('year'));
    if (!Number.isInteger(year)) throw httpErr(400, 'invalid_input');
    const k = patKey({ name: str(q.get('name') || '', 80), birthYear: year });
    const X = { c: a.clinic, info: visitInfo(a.clinic) };
    const rs = a.clinic.archive.filter(r => patKey(r) === k).sort((x, y) => (x.finishedAt || 0) - (y.finishedAt || 0)).slice(-300);
    const cur = a.clinic.patients.find(z => patKey(z) === k);
    const first = rs[0] || cur, last = rs[rs.length - 1];
    return send(res, 200, {
      name: first ? first.name : '', birthYear: year, gender: first ? first.gender : '', phone: (cur && cur.phone) || (last && last.phone) || (first && first.phone) || '',
      firstVisit: first ? (first.createdAt || first.finishedAt) : null, lastVisit: last ? last.finishedAt : null,
      visits: rs.length, due: r2(rs.reduce((x, r) => x + dueOf(r), 0)), paid: r2(rs.reduce((x, r) => x + paidOf(r), 0)), balance: r2(rs.reduce((x, r) => x + remOf(r), 0)),
      wallet: walletView(a.clinic, k), current: cur ? patientView(cur) : null, records: rs.map(r => archiveView(r, X))
    });
  }
  /* حساب مريض: المستحق والمدفوع والمتبقي (طبيب فقط) */
  if (m === 'GET' && p === '/api/account') {
    const a = authOf(req, ['doctor']), q = url.searchParams, k = patKey({ name: str(q.get('name') || '', 80), birthYear: parseInt(q.get('year')) });
    const rs = a.clinic.archive.filter(r => patKey(r) === k);
    const pm = plansOf(a.clinic, k), pl = [...pm.values()].sort((x, y) => y.at - x.at);
    return send(res, 200, { plans: pl.filter(p => p.open).map(planView), debts: pl.filter(p => !p.open && p.remaining > 0).map(planView).map(p => ({ ...p, plan: p.id })).concat(rs.filter(r => !(r.lines && r.lines.some(l => l.no === 1)) && remOf(r) > 0).map(r => ({ rec: r.id, treatment: r.treatment, tooth: r.tooth || '', total: dueOf(r), paid: paidOf(r), remaining: remOf(r), at: r.finishedAt }))), teeth: toothItems(rs), wallet: wbal(a.clinic, k), due: r2(rs.reduce((x, r) => x + dueOf(r), 0)), paid: r2(rs.reduce((x, r) => x + paidOf(r), 0)), balance: r2(rs.reduce((x, r) => x + remOf(r), 0)), records: rs.slice(0, 5).map(r => ({ id: r.id, treatment: r.treatment, treatments: treatmentsOf(r), teeth: r.teeth || [], tooth: r.tooth, finishedAt: r.finishedAt, price: r.price, paid: paidOf(r), remaining: remOf(r) })) });
  }
  /* تسجيل دفعة على سجل في الأرشيف (طبيب فقط) */
  mt = p.match(/^\/api\/archive\/([a-f0-9]{12})\/payment$/);
  if (m === 'POST' && mt) {
    const a = authOf(req, ['doctor']); needUnlock(req, a.clinic); const rec = a.clinic.archive.find(z => z.id === mt[1]); if (!rec) throw httpErr(404, 'not_found');
    const b = await readJSON(req), amt = num(b.amount), c = a.clinic, k = patKey(rec); if (!amt || amt <= 0) throw httpErr(400, 'invalid_input');
    const fromW = !!b.wallet, t = now();
    if (!fromW) {
      /* نقداً: يسدّد هذا السجل أولاً ثم أقدم دَين آخر للمريض، وما زاد يُودَع في وعاء المريض */
      const left = allocPay(c, k, rec, amt, t, null); if (left >= amt) throw httpErr(409, 'nothing_due');
      if (left > 0) wMove(c, k, 'dep', left, t, { rid: rec.id });
    } else {
      const x = Math.min(amt, remOf(rec), wbal(c, k)); if (x <= 0) throw httpErr(409, remOf(rec) > 0 ? 'wallet_empty' : 'nothing_due');
      rec.paid = r2(paidOf(rec) + x); (rec.payments = rec.payments || []).push({ t, amt: x, vid: null, m: 'w' }); wMove(c, k, 'use', x, t, { rid: rec.id });
    }
    save(); return send(res, 200, archiveView(rec, { c, info: visitInfo(c) }));
  }
  /* تغيير عدد حصص خطة جارية أثناء العلاج (طبيب فقط): delta=+1 تضيف حصة، -1 تحذف حصة لم تُجرَ بعد */
  mt = p.match(/^\/api\/plans\/([a-f0-9]{10})\/sessions$/);
  if (m === 'POST' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req); let first = null, done = 1, n = 0;
    for (const r of c.archive) for (const l of r.lines || []) if (l.plan === mt[1]) { if (l.no === 1) { first = l; n = l.sessions || 1; } done = Math.max(done, l.no || 1); }
    if (!first) throw httpErr(404, 'not_found');
    const d = +b.delta === -1 ? -1 : 1, next = Math.min(MAX_SESS, Math.max(done, n + d)); if (next === n && d > 0 && n >= MAX_SESS) throw httpErr(409, 'max_sessions');
    for (const r of c.archive) for (const l of r.lines || []) if (l.plan === mt[1]) l.sessions = next;
    save(); return send(res, 200, { ok: true, sessions: next });
  }
  /* إغلاق خطة علاج قبل اكتمال حصصها (المريض لن يعود مثلاً): يبقى متبقّيها ديناً قابلاً للسداد (طبيب فقط) */
  mt = p.match(/^\/api\/plans\/([a-f0-9]{10})\/close$/);
  if (m === 'POST' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic; let hit = null;
    for (const r of c.archive) for (const l of r.lines || []) if (l.no === 1 && l.plan === mt[1]) hit = l;
    if (!hit) throw httpErr(404, 'not_found'); hit.closed = true; save(); return send(res, 200, { ok: true });
  }
  /* وعاء المريض: إيداع مسبق أو استرجاع نقدي (طبيب فقط) */
  if (m === 'POST' && p === '/api/wallet') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req), amt = num(b.amount), name = str(b.name, 80).trim(), year = parseInt(b.year);
    if (!name || !Number.isInteger(year) || !amt || amt <= 0) throw httpErr(400, 'invalid_input');
    const k = patKey({ name, birthYear: year }), out = b.op === 'out';
    if (out) { needUnlock(req, c); if (amt > wbal(c, k)) throw httpErr(409, 'wallet_short'); }
    wMove(c, k, out ? 'out' : 'dep', amt, now(), {}); save(); return send(res, 200, walletView(c, k));
  }

  /* اقتراحات أسماء المرضى السابقين عند التسجيل (طبيب وممرضة): الاسم والميلاد والجنس والهاتف فقط */
  if (m === 'GET' && p === '/api/suggest') {
    const a = authOf(req), q = str(url.searchParams.get('q') || '', 80).trim().toLowerCase();
    if (q.length < 2) return send(res, 200, []);
    const seen = new Map();
    for (const r of a.clinic.patients.concat(a.clinic.archive)) {
      if (!r.name.trim().toLowerCase().startsWith(q)) continue;
      const k = r.name.trim().toLowerCase() + '|' + r.birthYear, e = seen.get(k);
      if (!e) seen.set(k, { name: r.name, birthYear: r.birthYear, gender: r.gender, phone: r.phone || '' });
      else if (!e.phone && r.phone) e.phone = r.phone;
      if (seen.size >= 50) break;
    }
    const out = [...seen.values()].slice(0, 8);
    return send(res, 200, out);
  }

  /* الوصفات: السلة وقاعدة الأدوية المستوردة (طبيب فقط) */
  if (p === '/api/rx' && m === 'GET') { const a = authOf(req, ['doctor']); return send(res, 200, { basket: a.clinic.rxBasket || [], drugs: a.clinic.rxDrugs || [], template: a.clinic.rxTpl || null }); }
  if (p === '/api/rx/template' && m === 'PUT') { const a = authOf(req, ['doctor']); rate('rxt:' + a.key, 60, 6e4); const b = await readJSON(req, 400e3); a.clinic.rxTpl = cleanTpl(b); save(); return send(res, 200, a.clinic.rxTpl); }
  if (p === '/api/rx/basket' && m === 'PUT') {
    const a = authOf(req, ['doctor']); rate('rx:' + a.key, 120, 6e4); const b = await readJSON(req, 400e3);
    a.clinic.rxBasket = cleanBasket(b.items); save(); return send(res, 200, a.clinic.rxBasket);
  }
  if (p === '/api/rx/drugs' && m === 'PUT') {
    const a = authOf(req, ['doctor']); rate('rxd:' + a.key, 10, 6e4); const b = await readJSON(req, 6e6);
    a.clinic.rxDrugs = cleanDrugs(b.drugs); save(); return send(res, 200, { count: a.clinic.rxDrugs.length });
  }
  if (p === '/api/rx/drugs' && m === 'DELETE') { const a = authOf(req, ['doctor']); a.clinic.rxDrugs = []; save(); return send(res, 200, { count: 0 }); }

  /* الإحصائيات المفصّلة (طبيب فقط) */
  if (m === 'GET' && p === '/api/stats') {
    const a = authOf(req, ['doctor']); rate('stats:' + a.key, 60, 6e4);
    const { tz, d0, d1 } = rangeOf(url.searchParams);
    return send(res, 200, statsFor(a.clinic, d0, d1, tz));
  }

  /* الأرشيف (طبيب فقط) */
  if (m === 'GET' && p === '/api/archive') {
    const a = authOf(req, ['doctor']); needUnlock(req, a.clinic); const q = url.searchParams, name = str(q.get('name') || '', 80).toLowerCase(), year = str(q.get('year') || '', 4), gender = str(q.get('gender') || '', 4), tooth = str(q.get('tooth') || '', 20).toLowerCase(), tr = str(q.get('treatment') || '', 40), dFrom = str(q.get('from') || '', 10), dTo = str(q.get('to') || '', 10);
    const tz = Math.max(-840, Math.min(840, +q.get('tz') || 0)), isDay = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v + 'T00:00:00Z'));
    const dayStart = v => Date.parse(v + 'T00:00:00Z') + tz * 6e4;  // بداية اليوم بتوقيت جهاز الطبيب
    let d0 = isDay(dFrom) ? dayStart(dFrom) : 0, d1 = isDay(dTo) ? dayStart(dTo) + 864e5 : 0;
    if (d0 && d1 && d0 >= d1) { const x = isDay(dTo) ? dayStart(dTo) : 0; d0 = x; d1 = dayStart(dFrom) + 864e5; }  // عُكس الترتيب
    const off = Math.max(0, +q.get('offset') || 0), lim = Math.min(100, Math.max(1, +q.get('limit') || 30));
    const X = { c: a.clinic, info: visitInfo(a.clinic) }, owe = new Map(); for (const o of a.clinic.archive) { const d = remOf(o); if (d > 0) owe.set(patKey(o), r2((owe.get(patKey(o)) || 0) + d)); }  /* دين المريض الكلي (كل زياراته) */
    const money = str(q.get('money') || '', 10);   // debtors: سجلات عليها متبقٍّ · creditors: مرضى لديهم رصيد في الوعاء (آخر سجل لكل مريض)
    let all = a.clinic.archive.filter(r => (!name || r.name.toLowerCase().includes(name)) && (!year || String(r.birthYear).includes(year)) && (!gender || r.gender === gender) && (!tooth || String(r.tooth).toLowerCase().includes(tooth)) && (!tr || (r.treatment || '').includes(tr)) && (!d0 || r.finishedAt >= d0) && (!d1 || r.finishedAt < d1));
    let walSum = 0;
    if (money === 'debtors') all = all.filter(r => remOf(r) > 0);
    else if (money === 'creditors') { const seen = new Set(); all = all.filter(r => { const k = patKey(r); if (seen.has(k) || !(wbal(a.clinic, k) > 0)) return false; seen.add(k); walSum = r2(walSum + wbal(a.clinic, k)); return true; }); }
    return send(res, 200, { total: all.length, ...(money === 'creditors' ? { walSum } : {}), sum: r2(all.reduce((x, r) => x + dueOf(r), 0)), paidSum: r2(all.reduce((x, r) => x + paidOf(r), 0)), debt: r2(all.reduce((x, r) => x + remOf(r), 0)), items: all.slice(off, off + lim).map(r => ({ ...archiveView(r, X), patDebt: owe.get(patKey(r)) || 0 })) });
  }
  /* أرشيف الوصفات (طبيب فقط): كل سجل منتهٍ له وصفة، الأحدث أولاً */
  mt = p.match(/^\/api\/archive\/([a-f0-9]{12})$/);
  if (m === 'PUT' && mt) {   // تصحيح سجل محفوظ في الأرشيف (طبيب فقط)
    const a = authOf(req, ['doctor']); needUnlock(req, a.clinic); const rec = a.clinic.archive.find(z => z.id === mt[1]); if (!rec) throw httpErr(404, 'not_found');
    const b = await readJSON(req), v = validatePatient(b); if (!v) throw httpErr(400, 'invalid_input');
    const price = b.price === null || b.price === '' || b.price === undefined ? null : num(b.price), paid = num(b.paid);
    if ((price != null && price < 0) || (paid != null && paid < 0)) throw httpErr(400, 'invalid_input');
    const tl = cleanTreats(b.treatments), oldPaid = paidOf(rec), oldKey = patKey(rec);
    Object.assign(rec, v, { notes: str(b.notes, 2000), followUp: !!b.followUp, price });
    if (tl.length) { rec.treatments = tl; rec.treatment = str(tl.join(' + '), 200); rec.items = cleanItems(rec.items, tl); }
    const np = r2(Math.min(paid == null ? oldPaid : paid, price || 0));
    if (np !== oldPaid || rec.paid == null) { rec.paid = np; if (np !== oldPaid) { unwallet(a.clinic, oldKey, rec, now()); rec.payments = np > 0 ? [{ t: (paysOf(rec)[0] || {}).t || rec.finishedAt, amt: np, vid: rec.id }] : []; } }
    syncLines(rec, price, np !== oldPaid);
    save(); return send(res, 200, archiveView(rec));
  }
  if (m === 'DELETE' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic; needUnlock(req, c); const i = c.archive.findIndex(z => z.id === mt[1]);
    if (i < 0) throw httpErr(404, 'not_found');
    const [rec] = c.archive.splice(i, 1); unwallet(c, patKey(rec), rec, now()); revertVisit(c, rec, now()); rmImages(c, rec); idx.ticket.delete(rec.ticket); save(); return send(res, 200, { ok: true });
  }

  /* الممرضات (طبيب فقط) */
  /* مهام الطبيب للممرضة */
  if (p === '/api/tasks' && m === 'POST') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req), text = str(b.text, 300); let to = null;
    if (!text) throw httpErr(400, 'invalid_input');
    if (b.to && b.to !== 'all') { const n = c.nurses.find(z => z.id === b.to); if (!n) throw httpErr(404, 'not_found'); to = n.id; }
    c.tasks = c.tasks || []; pruneTasks(c); if (c.tasks.filter(k => !k.done).length >= 30) throw httpErr(429, 'limit');
    const k = { id: rid(6), text, to, createdAt: now(), done: false }; c.tasks.unshift(k);
    broadcast(c, { to: 'nurse', ...(to ? { nurseId: to } : {}), data: { type: 'task', text, pid: k.id } });
    return send(res, 201, { ok: true, id: k.id });
  }
  { const tm = p.match(/^\/api\/tasks\/([a-f0-9]{12})(\/done)?$/);
    if (tm && m === 'POST' && tm[2]) {
      const a = authOf(req), c = a.clinic, k = (c.tasks || []).find(z => z.id === tm[1]);
      if (!k || (a.role === 'nurse' && k.to && k.to !== a.nurse.id)) throw httpErr(404, 'not_found');
      if (!k.done) { k.done = true; k.doneAt = now(); k.doneBy = a.role === 'doctor' ? c.doctor.name : a.nurse.name; broadcast(c, a.role === 'nurse' ? { to: 'doctor', data: { type: 'task_done', text: k.text, by: k.doneBy, pid: k.id } } : null); }
      return send(res, 200, { ok: true });
    }
    if (tm && m === 'DELETE' && !tm[2]) {
      const a = authOf(req, ['doctor']), c = a.clinic, i = (c.tasks || []).findIndex(z => z.id === tm[1]); if (i < 0) throw httpErr(404, 'not_found');
      c.tasks.splice(i, 1); broadcast(c, null); return send(res, 200, { ok: true });
    } }
  if (p === '/api/nurses' && m === 'GET') { const a = authOf(req, ['doctor']); return send(res, 200, a.clinic.nurses.map(n => ({ id: n.id, name: n.name, phone: n.phone }))); }
  if (p === '/api/nurses' && m === 'POST') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req), name = str(b.name, 60), phone = str(b.phone, 25), pw = typeof b.password === 'string' ? b.password : '';
    if (!name || pw.length < 6 || pw.length > 200) throw httpErr(400, 'invalid_input');
    if (c.nurses.some(n => n.name.toLowerCase() === name.toLowerCase())) throw httpErr(409, 'exists');
    if (c.nurses.length >= 30) throw httpErr(429, 'limit');
    c.nurses.push({ id: rid(6), name, phone, ...(await hashPw(pw)), createdAt: now() }); save(); return send(res, 201, { ok: true });
  }
  mt = p.match(/^\/api\/nurses\/([a-f0-9]{12})$/);
  if (mt && m === 'PUT') {
    const a = authOf(req, ['doctor']), c = a.clinic, n = c.nurses.find(z => z.id === mt[1]); if (!n) throw httpErr(404, 'not_found');
    const b = await readJSON(req), name = str(b.name, 60), phone = str(b.phone, 25);
    if (!name || (b.password && (typeof b.password !== 'string' || b.password.length < 6))) throw httpErr(400, 'invalid_input');
    if (c.nurses.some(z => z !== n && z.name.toLowerCase() === name.toLowerCase())) throw httpErr(409, 'exists');
    n.name = name; n.phone = phone;
    if (b.password) { Object.assign(n, await hashPw(b.password)); for (const [k, s] of Object.entries(db.sessions)) if (s.nurseId === n.id) { delete db.sessions[k]; closeStreamsOf(k); } }
    save(); return send(res, 200, { ok: true });
  }
  if (mt && m === 'DELETE') {
    const a = authOf(req, ['doctor']), c = a.clinic, i = c.nurses.findIndex(z => z.id === mt[1]); if (i < 0) throw httpErr(404, 'not_found');
    const [n] = c.nurses.splice(i, 1); if (c.tasks) c.tasks = c.tasks.filter(k => k.to !== n.id); for (const [k, s] of Object.entries(db.sessions)) if (s.nurseId === n.id) { delete db.sessions[k]; closeStreamsOf(k); }
    save(); return send(res, 200, { ok: true });
  }

  /* إعدادات الحساب (طبيب فقط) */
  if (m === 'PUT' && p === '/api/schedule') {
    const a = authOf(req, ['doctor']); a.clinic.schedule = normSchedule(await readJSON(req)); save(); broadcast(a.clinic); return send(res, 200, a.clinic.schedule);
  }
  if (m === 'PUT' && p === '/api/clinic') {
    const a = authOf(req, ['doctor']), b = await readJSON(req), name = str(b.clinicName, 80), dn = str(b.doctorName, 80);
    if (!name || !dn) throw httpErr(400, 'invalid_input'); a.clinic.name = name; a.clinic.doctor.name = dn; broadcast(a.clinic); return send(res, 200, meOf(a));
  }
  if (m === 'POST' && p === '/api/account/password') {
    const a = authOf(req, ['doctor']), b = await readJSON(req); rate('pw:' + a.clinic.id, 10, 6e5);
    if (!(await checkPw(b.oldPassword || '', a.clinic.doctor))) throw httpErr(401, 'bad_credentials');
    if (typeof b.newPassword !== 'string' || b.newPassword.length < 8 || b.newPassword.length > 200) throw httpErr(400, 'invalid_input');
    Object.assign(a.clinic.doctor, await hashPw(b.newPassword));
    for (const [k, s] of Object.entries(db.sessions)) if (s.clinicId === a.clinic.id && k !== a.key) { delete db.sessions[k]; closeStreamsOf(k); }
    save(); return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/clinic/unlock') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req); rate('pw:' + c.id, 10, 6e5);
    if (!(await checkPw(b.password || '', c.doctor))) throw httpErr(401, 'bad_credentials');
    const token = crypto.randomBytes(24).toString('hex'); unlocks.set(sha(token), { cid: c.id, exp: now() + UNLOCK_MS });
    return send(res, 200, { token });
  }
  if (m === 'POST' && p === '/api/clinic/protect') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req); rate('pw:' + c.id, 10, 6e5);
    if (!(await checkPw(b.password || '', c.doctor))) throw httpErr(401, 'bad_credentials');
    c.protect = !!b.on; for (const [k, u] of unlocks) if (u.cid === c.id) unlocks.delete(k);
    save(); return send(res, 200, { protect: c.protect });
  }
  if (m === 'POST' && p === '/api/clinic/wipe') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req); rate('pw:' + c.id, 10, 6e5);
    if (!(await checkPw(b.password || '', c.doctor))) throw httpErr(401, 'bad_credentials');
    for (const pt of c.patients.concat(c.archive)) idx.ticket.delete(pt.ticket);
    const toks = c.patients.map(z => z.ticket);
    c.patients = []; c.archive = []; c.wallets = {}; fs.rm(path.join(DATA_DIR, 'img', c.id), { recursive: true, force: true }, () => {});
    if (b.account) {
      for (const [k, s] of Object.entries(db.sessions)) if (s.clinicId === c.id) { delete db.sessions[k]; closeStreamsOf(k); }
      idx.user.delete(c.doctor.username); idx.code.delete(c.code); delete db.clinics[c.id]; delete rt[c.id]; save();
    } else broadcast(c, null, toks);
    return send(res, 200, { ok: true });
  }

  /* نسخ احتياطي واستعادة (طبيب فقط) */
  if (m === 'GET' && p === '/api/backup') {
    const a = authOf(req, ['doctor']), c = a.clinic, images = {}; needUnlock(req, c);
    for (const r of c.patients.concat(c.archive)) for (const i of r.images || []) { try { images[i.id] = fs.readFileSync(imgPath(c, i.id)).toString('base64'); } catch (e) {} }
    const body = JSON.stringify({ app: 'calm-clinic', version: 3, exportedAt: now(), clinicName: c.name, schedule: c.schedule || null, nurses: c.nurses.map(n => ({ name: n.name, phone: n.phone, salt: n.salt, hash: n.hash, createdAt: n.createdAt })), protect: !!c.protect, counter: c.counter || null, patients: c.patients, archive: c.archive, wallets: c.wallets || {}, rxBasket: c.rxBasket || [], rxDrugs: c.rxDrugs || [], prices: c.prices || null, rxTpl: c.rxTpl || null, images });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="clinic_backup_${new Date().toISOString().slice(0, 10)}.json"`, 'Cache-Control': 'no-store' });
    return res.end(body);
  }
  if (m === 'POST' && p === '/api/restore') {
    const a = authOf(req, ['doctor']), c = a.clinic; needUnlock(req, c); const b = await readJSON(req, 150e6);
    if (b.app !== 'calm-clinic' || !Array.isArray(b.patients) || !Array.isArray(b.archive)) throw httpErr(400, 'invalid_input');
    const used = new Set(), imgs = b.images && typeof b.images === 'object' ? b.images : {};
    const clean = (r, done) => {
      const v = validatePatient(r); if (!v) return null;
      let ticket = typeof r.ticket === 'string' && TOKEN.test(r.ticket) ? r.ticket : b64u(18);
      if ((idx.ticket.has(ticket) && idx.ticket.get(ticket) !== c.id) || used.has(ticket)) ticket = b64u(18);
      used.add(ticket);
      const out = { id: REC_ID.test(r.id) ? r.id : rid(6), ticket, ticketNo: Math.max(1, parseInt(r.ticketNo) || 1), ...v, status: done ? 'done' : (r.status === 'in' ? 'in' : 'waiting'), createdAt: +r.createdAt || now(), startedAt: +r.startedAt || null, images: [] };
      for (const i of Array.isArray(r.images) ? r.images : []) { if (i && IMG_ID.test(i.id) && typeof imgs[i.id] === 'string') { const buf = Buffer.from(imgs[i.id], 'base64'); if (isJpeg(buf)) { out.images.push({ id: i.id }); out._w = (out._w || []).concat([[i.id, buf]]); } } }
      if (done) { out.price = num(r.price); out.paid = r.paid == null ? null : num(r.paid); out.followUp = !!r.followUp; out.payments = (Array.isArray(r.payments) ? r.payments : []).slice(0, 50).map(z => ({ t: +z.t || now(), amt: num(z && z.amt) || 0, ...(z && z.vid === null ? { vid: null } : (z && REC_ID.test(String(z.vid)) ? { vid: z.vid } : {})), ...(z && z.m === 'w' ? { m: 'w' } : {}), ...(z && PLAN_ID.test(String(z.pl)) ? { pl: z.pl } : {}) })); out.lines = cleanLinesIn(r.lines); if (!out.lines.length) delete out.lines; }
      if (done) { const tt = cleanTeeth(r.teeth); if (tt.length) { out.teeth = tt; out.tooth = tt.join(' '); } }
      if (done) { const rx = cleanRx(r.rx); if (rx.length) { out.rx = rx; out.rxHead = cleanHead(r.rxHead); } }
      if (done) { const tl = cleanTreats(r.treatments); if (tl.length) { out.treatments = tl; out.items = cleanItems(r.items, tl); } }
      if (done) Object.assign(out, { treatment: str(r.treatment, 200) || 'استشارة', notes: str(r.notes, 2000), finishedAt: +r.finishedAt || now(), waitMin: +r.waitMin || 0, durationMin: +r.durationMin || 0 });
      return out;
    };
    const P = b.patients.slice(0, 500).map(r => clean(r, false)).filter(Boolean), A = b.archive.slice(0, 50000).map(r => clean(r, true)).filter(Boolean);
    if (P.filter(z => z.status === 'in').length > 1) P.forEach((z, i) => { if (z.status === 'in' && i) z.status = 'waiting'; });
    for (const pt of c.patients.concat(c.archive)) idx.ticket.delete(pt.ticket);
    fs.rmSync(path.join(DATA_DIR, 'img', c.id), { recursive: true, force: true }); fs.mkdirSync(path.join(DATA_DIR, 'img', c.id), { recursive: true });
    for (const r of P.concat(A)) { for (const [id, buf] of r._w || []) fs.writeFileSync(imgPath(c, id), buf); delete r._w; idx.ticket.set(r.ticket, c.id); }
    if (Array.isArray(b.rxBasket)) c.rxBasket = cleanBasket(b.rxBasket); if (Array.isArray(b.rxDrugs)) c.rxDrugs = cleanDrugs(b.rxDrugs);
    /* قائمة الأسعار وقالب/تخطيط الوصفة (تُستعاد إن وُجدت في النسخة) */
    if (b.prices && typeof b.prices === 'object') { const tr = Array.isArray(b.prices.treatments) ? normTreatments(b.prices.treatments) : treatsOf(c); c.prices = { currency: str(b.prices.currency, 10), list: normList(b.prices.list, tr), treatments: tr }; }
    if (b.rxTpl && typeof b.rxTpl === 'object') c.rxTpl = cleanTpl(b.rxTpl);
    /* أوقات تسجيل الممرضة، حسابات الممرضات (تُضاف المفقودة بالاسم فقط ولا يُستبدل الموجود)، حماية الأرشيف، وعدّاد التذاكر */
    if (b.schedule && typeof b.schedule === 'object') c.schedule = normSchedule(b.schedule);
    if (Array.isArray(b.nurses)) for (const n of b.nurses.slice(0, 30)) { const name = n && str(n.name, 60); if (!name || typeof n.salt !== 'string' || !/^[a-f0-9]{32}$/.test(n.salt) || typeof n.hash !== 'string' || !/^[a-f0-9]{128}$/.test(n.hash) || c.nurses.length >= 30 || c.nurses.some(z => z.name.toLowerCase() === name.toLowerCase())) continue; c.nurses.push({ id: rid(6), name, phone: str(n.phone, 25), salt: n.salt, hash: n.hash, createdAt: +n.createdAt || now() }); }
    if (typeof b.protect === 'boolean') c.protect = b.protect;
    if (b.counter && typeof b.counter === 'object' && typeof b.counter.date === 'string' && b.counter.date.length <= 12) c.counter = { date: b.counter.date, n: Math.max(0, parseInt(b.counter.n) || 0) };
    const W = {}; if (b.wallets && typeof b.wallets === 'object') for (const [k, w] of Object.entries(b.wallets).slice(0, 50000)) {
      if (typeof k !== 'string' || k.length > 120 || !w || typeof w !== 'object') continue;
      W[k] = { bal: Math.max(0, num(w.bal) || 0), log: (Array.isArray(w.log) ? w.log : []).slice(-1000).filter(e => e && WK.has(e.k)).map(e => ({ t: +e.t || now(), amt: Math.max(0, num(e.amt) || 0), k: e.k, ...(REC_ID.test(String(e.vid)) ? { vid: e.vid } : {}) })) };
    }
    c.wallets = W;
    c.patients = P; c.archive = A; RT(c).skip.clear(); broadcast(c); return send(res, 200, { patients: P.length, archive: A.length });
  }
  throw httpErr(404, 'not_found');
}

/* ---------- الخادم ---------- */
const server = http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SEC)) res.setHeader(k, v);
  let url; try { url = new URL(req.url, 'http://x'); } catch (e) { res.writeHead(400); return res.end(); }
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    if (/^\/t\/[A-Za-z0-9_-]+$/.test(url.pathname)) return serveFile(req, res, path.join(PUBLIC_DIR, 'ticket.html'), { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    if (url.pathname === '/owner' || url.pathname === '/owner/') return serveFile(req, res, path.join(PUBLIC_DIR, 'owner.html'), { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    if (url.pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
    return serveStatic(req, res, url.pathname);
  } catch (e) {
    if (res.headersSent) return res.end();
    if (e.status) return send(res, e.status, { error: e.code });
    console.error(e); send(res, 500, { error: 'server_error' });
  }
});
server.headersTimeout = 20000; server.requestTimeout = 0; server.keepAliveTimeout = 65000;
/* لقطة يومية لقاعدة البيانات (دون الصور) في DATA_DIR/backups — آخر 14 يوماً. تفيد حين يكون DATA_DIR على قرص دائم. */
function dailySnapshot() {
  try {
    const dir = path.join(DATA_DIR, 'backups'); fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, 'db-' + new Date().toISOString().slice(0, 10) + '.json');
    if (!fs.existsSync(f) && fs.existsSync(DB_FILE)) { flush(); fs.copyFileSync(DB_FILE, f); }
    fs.readdirSync(dir).filter(n => /^db-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().reverse().slice(14).forEach(n => fs.rmSync(path.join(dir, n), { force: true }));
  } catch (e) { console.error('تعذّرت اللقطة اليومية:', e.message); }
}
setTimeout(dailySnapshot, 20000); setInterval(dailySnapshot, 6 * 36e5).unref();
server.listen(PORT, () => console.log(`عيادتي الذكية تعمل على المنفذ ${PORT} — البيانات في: ${DATA_DIR}`));
