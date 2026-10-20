'use strict';
/* عيادتي الهادئة — خادم المزامنة
   - كل طبيب = "عيادة" مستقلة تماماً (حسابات وممرضات ومرضى وصور وأرشيف)
   - مزامنة فورية عبر SSE
   - صفحة تذكرة عامة للمريض عبر رمز عشوائي غير قابل للتخمين لا تكشف أي مريض آخر
   - التخزين: قاعدة بيانات MongoDB سحابية (MongoDB Atlas المجاني) عبر MONGODB_URI أو DATABASE_URL.
     بدون هذا المتغيّر يعمل الخادم بذاكرة مؤقتة فقط (للتجربة المحلية — تضيع البيانات عند الإيقاف). */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const PORT = +process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const REG_CODE = process.env.REGISTRATION_CODE || '';           // اختياري: رمز دعوة للتسجيل
const ALLOW_REG = process.env.ALLOW_REGISTRATION !== 'false';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const DB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
const DB_NAME = process.env.MONGODB_DB || 'calm_clinic';
const SESSION_MS = 30 * 864e5, TICKET_DONE_MS = 24 * 36e5;
const THIS_YEAR = () => new Date().getFullYear();

/* ---------- طبقة التخزين ----------
   الحالة تبقى في الذاكرة (فالمنطق البرمجي كما هو تماماً) ويُكتب كل تغيير إلى MongoDB خلال ~250ms.
   المجموعات: clinics (الحساب والممرضات ومرضى اليوم) · archive (سجل لكل زيارة منتهية)
              images (الصور، بيانات ثنائية) · sessions (جلسات الدخول، مُجزّأة SHA-256) */
let db = { clinics: {}, sessions: {} };
const mem = { images: new Map() };       // وضع الذاكرة المؤقتة (بدون قاعدة بيانات)
let M = null;                            // { clients, col } عند الاتصال بـ MongoDB
const persisted = { clinics: new Map(), archive: new Map(), sessions: new Map() };
const imgKey = (cid, id) => cid + ':' + id;

async function connectDB() {
  if (!DB_URI) { console.warn('⚠️  لا يوجد MONGODB_URI — الوضع المؤقت: كل البيانات ستضيع عند إيقاف الخادم!'); return; }
  if (!/^mongodb(\+srv)?:\/\//.test(DB_URI)) throw new Error('DATABASE_URL/MONGODB_URI يجب أن يبدأ بـ mongodb:// أو mongodb+srv://');
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(DB_URI, { serverSelectionTimeoutMS: 20000, maxPoolSize: 10 });
  await client.connect();
  const d = client.db(DB_NAME);
  M = { client, clinics: d.collection('clinics'), archive: d.collection('archive'), images: d.collection('images'), sessions: d.collection('sessions') };
  await M.archive.createIndex({ clinicId: 1 }); await M.images.createIndex({ clinicId: 1 });
  const all = {}; // تحميل كل شيء إلى الذاكرة
  for (const c of await M.clinics.find({}).toArray()) {
    const { _id, ...rest } = c; all[_id] = { id: _id, ...rest, archive: [] };
    persisted.clinics.set(_id, JSON.stringify(c)); persisted.archive.set(_id, new Map());
  }
  const arch = await M.archive.find({}).toArray();
  for (const a of arch) { const c = all[a.clinicId]; if (c) { c.archive.push(a.d); persisted.archive.get(c.id).set(a.d.id, a.d); } }
  for (const c of Object.values(all)) c.archive.sort((x, y) => (y.finishedAt || 0) - (x.finishedAt || 0));   // الأحدث أولاً
  db.clinics = all;
  for (const s of await M.sessions.find({}).toArray()) { const { _id, ...rest } = s; db.sessions[_id] = rest; persisted.sessions.set(_id, JSON.stringify(rest)); }
  console.log(`متصل بـ MongoDB — ${Object.keys(all).length} عيادة، ${arch.length} سجل أرشيف`);
}

const clinicDoc = c => ({ _id: c.id, code: c.code, name: c.name, doctor: c.doctor, nurses: c.nurses, patients: c.patients, counter: c.counter, hours: c.hours || null, createdAt: c.createdAt });
let saveTimer = null, flushing = null, dirtyAgain = false;
function save() { if (!M || saveTimer || flushing) { if (flushing) dirtyAgain = true; return; } saveTimer = setTimeout(() => flush().catch(() => {}), 250); }
async function bulk(col, ops) { for (let i = 0; i < ops.length; i += 500) await col.bulkWrite(ops.slice(i, i + 500), { ordered: false }); }
function flush() {
  if (!M) return Promise.resolve();
  clearTimeout(saveTimer); saveTimer = null;
  if (flushing) { dirtyAgain = true; return flushing; }
  flushing = (async () => {
    try {
      do {
        dirtyAgain = false;
        const cOps = [], aOps = [], sOps = [], done = [];
        for (const c of Object.values(db.clinics)) {
          const doc = clinicDoc(c), js = JSON.stringify(doc);
          if (persisted.clinics.get(c.id) !== js) { cOps.push({ replaceOne: { filter: { _id: c.id }, replacement: doc, upsert: true } }); done.push(() => persisted.clinics.set(c.id, js)); }
          let pm = persisted.archive.get(c.id); if (!pm) persisted.archive.set(c.id, pm = new Map());
          const cur = new Map(c.archive.map(r => [r.id, r]));
          for (const [rid_, r] of cur) if (pm.get(rid_) !== r) { aOps.push({ replaceOne: { filter: { _id: imgKey(c.id, rid_) }, replacement: { _id: imgKey(c.id, rid_), clinicId: c.id, d: r }, upsert: true } }); done.push(() => pm.set(rid_, r)); }
          for (const rid_ of pm.keys()) if (!cur.has(rid_)) { aOps.push({ deleteOne: { filter: { _id: imgKey(c.id, rid_) } } }); done.push(() => pm.delete(rid_)); }
        }
        const gone = [...persisted.clinics.keys()].filter(id => !db.clinics[id]);
        for (const id of gone) { cOps.push({ deleteOne: { filter: { _id: id } } }); done.push(() => { persisted.clinics.delete(id); persisted.archive.delete(id); }); }
        for (const [k, s] of Object.entries(db.sessions)) { const js = JSON.stringify(s); if (persisted.sessions.get(k) !== js) { sOps.push({ replaceOne: { filter: { _id: k }, replacement: { _id: k, ...s }, upsert: true } }); done.push(() => persisted.sessions.set(k, js)); } }
        for (const k of persisted.sessions.keys()) if (!db.sessions[k]) { sOps.push({ deleteOne: { filter: { _id: k } } }); done.push(() => persisted.sessions.delete(k)); }
        for (const id of gone) { await M.archive.deleteMany({ clinicId: id }); await M.images.deleteMany({ clinicId: id }); }
        if (cOps.length) await bulk(M.clinics, cOps);
        if (aOps.length) await bulk(M.archive, aOps);
        if (sOps.length) await bulk(M.sessions, sOps);
        done.forEach(f => f());
      } while (dirtyAgain);
    } catch (e) {
      console.error('فشل حفظ قاعدة البيانات (ستُعاد المحاولة):', e.message);
      dirtyAgain = false; setTimeout(save, 5000).unref();
      throw e;
    } finally { flushing = null; }
  })();
  return flushing;
}
let stopping = false;
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, async () => {
  if (stopping) return; stopping = true;
  const t = setTimeout(() => process.exit(1), 8000); t.unref();
  try { await flush(); if (M) await M.client.close(); } catch (e) {}
  process.exit(0);
});

/* الصور: MongoDB (مجموعة images) أو الذاكرة */
const imgStore = {
  async put(cid, id, buf) { if (!M) return void mem.images.set(imgKey(cid, id), buf); await M.images.replaceOne({ _id: imgKey(cid, id) }, { _id: imgKey(cid, id), clinicId: cid, data: buf }, { upsert: true }); },
  async get(cid, id) {
    if (!M) return mem.images.get(imgKey(cid, id)) || null;
    const d = await M.images.findOne({ _id: imgKey(cid, id) }); return d ? toBuf(d.data) : null;
  },
  async del(cid, ids) {
    if (!ids.length) return;
    if (!M) { for (const i of ids) mem.images.delete(imgKey(cid, i)); return; }
    await M.images.deleteMany({ _id: { $in: ids.map(i => imgKey(cid, i)) } });
  },
  async delAll(cid) {
    if (!M) { for (const k of [...mem.images.keys()]) if (k.startsWith(cid + ':')) mem.images.delete(k); return; }
    await M.images.deleteMany({ clinicId: cid });
  }
};
const toBuf = d => Buffer.isBuffer(d) ? d : Buffer.from(d.buffer || d);

const idx = { user: new Map(), code: new Map(), ticket: new Map() };
function reindex() {
  idx.user.clear(); idx.code.clear(); idx.ticket.clear();
  for (const c of Object.values(db.clinics)) {
    idx.user.set(c.doctor.username, c.id); idx.code.set(c.code, c.id);
    for (const p of c.patients) idx.ticket.set(p.ticket, c.id);
    for (const p of c.archive) if (p.ticket) idx.ticket.set(p.ticket, c.id);
  }
}
const now = () => Date.now();

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
const ageOf = p => THIS_YEAR() - p.birthYear;

/* ---------- اقتراحات المرضى من الأرشيف (للطبيب والممرضة: حقول الهوية فقط) ---------- */
const normName = v => String(v || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const nameCache = new WeakMap();
const normOf = r => { let n = nameCache.get(r); if (n === undefined) { n = normName(r.name); nameCache.set(r, n); } return n; };
const personKey = r => normOf(r) + '|' + r.birthYear + '|' + r.gender;
function suggestPatients(c, raw) {
  const isPhone = /^[0-9+\-\s()]+$/.test(raw), digits = raw.replace(/\D/g, ''), q = normName(raw);
  if (isPhone ? digits.length < 3 : q.length < 2) return [];
  const toks = q.split(' ').filter(Boolean), active = new Set(c.patients.map(personKey)), seen = new Map();
  for (const r of c.archive) {                       // الأرشيف مرتّب من الأحدث إلى الأقدم
    const hit = isPhone ? (r.phone || '').replace(/\D/g, '').includes(digits) : toks.every(t => normOf(r).includes(t));
    if (!hit) continue;
    const k = personKey(r), e = seen.get(k);
    if (e) { e.visits++; if (!e.phone && r.phone) e.phone = r.phone; continue; }
    seen.set(k, { name: r.name, birthYear: r.birthYear, age: ageOf(r), gender: r.gender, phone: r.phone || '', visits: 1, lastVisit: r.finishedAt || r.createdAt, active: active.has(k), _s: !isPhone && normOf(r).startsWith(q) ? 0 : 1 });
  }
  return [...seen.values()].sort((a, b) => a._s - b._s).slice(0, 6).map(({ _s, ...x }) => x);
}
function patientView(p) {
  return { id: p.id, ticket: p.ticket, ticketNo: p.ticketNo, name: p.name, birthYear: p.birthYear, age: ageOf(p), gender: p.gender, reason: p.reason, tooth: p.tooth, phone: p.phone, status: p.status, createdAt: p.createdAt, startedAt: p.startedAt || null, images: (p.images || []).map(i => i.id) };
}
function archiveView(a) {
  return { id: a.id, name: a.name, birthYear: a.birthYear, age: ageOf(a), gender: a.gender, reason: a.reason, tooth: a.tooth, phone: a.phone, treatment: a.treatment, notes: a.notes || '', createdAt: a.createdAt, finishedAt: a.finishedAt, waitMin: a.waitMin, durationMin: a.durationMin, images: (a.images || []).map(i => i.id) };
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

/* ---------- ساعات استقبال الممرضة (يضبطها الطبيب) ---------- */
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = s => +s.slice(0, 2) * 60 + +s.slice(3);
function validTz(tz) { try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return typeof tz === 'string' && tz.length <= 64; } catch (e) { return false; } }
function hoursOf(c) { const h = c.hours || {}; return { enabled: !!h.enabled, start: HM.test(h.start) ? h.start : '08:00', end: HM.test(h.end) ? h.end : '17:00', tz: validTz(h.tz) ? h.tz : 'UTC' }; }
function secOfDay(tz, t) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(t)), g = k => +p.find(x => x.type === k).value;
  return g('hour') * 3600 + g('minute') * 60 + g('second');
}
function hoursView(c) {
  const h = hoursOf(c); if (!h.enabled) return { ...h, open: true, nextIn: null };
  const t = now(), sec = secOfDay(h.tz, t), s = toMin(h.start) * 60, e = toMin(h.end) * 60;
  const open = s === e ? true : s < e ? sec >= s && sec < e : sec >= s || sec < e;
  const until = b => { const d = (b - sec + 86400) % 86400; return d || 86400; };
  return { ...h, open, nextIn: s === e ? null : Math.min(until(s), until(e)) * 1000 };
}
const nurseMayAdd = c => hoursView(c).open;

function stateFor(c) {
  const r = RT(c), t = now();
  for (const [k, v] of r.skip) if (v.ts < t - 6e5 || !c.patients.some(p => p.id === k && p.status === 'waiting')) r.skip.delete(k);
  return { hours: hoursView(c), patients: c.patients.map(patientView), skipRequests: [...r.skip.entries()].map(([id, v]) => ({ id, name: v.name, firstName: v.firstName })), serverTime: t };
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
function broadcast(c, notify, extraTokens) {
  const r = RT(c), st = stateFor(c);
  for (const s of r.streams) {
    try { sse(s.res, 'state', st); if (notify && (!notify.to || notify.to === s.role)) sse(s.res, 'notify', notify.data); } catch (e) {}
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
function authOf(req, roles) {
  const h = req.headers.authorization || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : '';
  const key = tok ? sha(tok) : '', s = key && db.sessions[key];
  if (!s || s.exp < now()) throw httpErr(401, 'unauthorized');
  const clinic = db.clinics[s.clinicId]; if (!clinic) throw httpErr(401, 'unauthorized');
  let nurse = null;
  if (s.role === 'nurse') { nurse = clinic.nurses.find(n => n.id === s.nurseId); if (!nurse) { delete db.sessions[key]; throw httpErr(401, 'unauthorized'); } }
  if (roles && !roles.includes(s.role)) throw httpErr(403, 'forbidden');
  return { clinic, role: s.role, nurse, key };
}
async function openSession(role, clinic, nurse) {
  const token = b64u(32);
  db.sessions[sha(token)] = { role, clinicId: clinic.id, nurseId: nurse ? nurse.id : null, exp: now() + SESSION_MS };
  save();
  return { token, role, name: role === 'doctor' ? clinic.doctor.name : nurse.name, clinicName: clinic.name };
}
function meOf(ctx) {
  const c = ctx.clinic;
  return { role: ctx.role, name: ctx.role === 'doctor' ? c.doctor.name : ctx.nurse.name, clinicName: c.name, code: ctx.role === 'doctor' ? c.code : undefined, publicUrl: PUBLIC_URL || undefined };
}
function enterRoom(c, p) { p.status = 'in'; p.startedAt = now(); RT(c).skip.delete(p.id); }
function findPatient(c, id) { const p = c.patients.find(x => x.id === id); if (!p) throw httpErr(404, 'not_found'); return p; }
const IMG_ID = /^[a-f0-9]{16}$/, REC_ID = /^[a-f0-9]{12}$/, TOKEN = /^[A-Za-z0-9_-]{20,40}$/;
const isJpeg = b => b.length > 4 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
function rmImages(c, rec) { imgStore.del(c.id, (rec.images || []).map(i => i.id)).catch(e => console.error('تعذّر حذف الصور:', e.message)); }

/* ---------- المسارات ---------- */
async function api(req, res, url) {
  const m = req.method, p = url.pathname; let x;
  const ip = clientIp(req);

  if (m === 'GET' && p === '/api/config') return send(res, 200, { registration: !ALLOW_REG ? 'closed' : REG_CODE ? 'code' : 'open', hasClinics: Object.keys(db.clinics).length > 0 });

  if (m === 'POST' && p === '/api/register') {
    if (!ALLOW_REG) throw httpErr(403, 'reg_closed');
    rate('reg:' + ip, 10, 36e5);
    const b = await readJSON(req);
    if (REG_CODE && b.registrationCode !== REG_CODE) throw httpErr(403, 'bad_code');
    const clinicName = str(b.clinicName, 80), doctorName = str(b.doctorName, 80), username = str(b.username, 40).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
    if (!clinicName || !doctorName || !/^[a-z0-9._@-]{3,40}$/.test(username) || pw.length < 8 || pw.length > 200) throw httpErr(400, 'invalid_input');
    if (idx.user.has(username)) throw httpErr(409, 'exists');
    const id = rid(8), c = { id, code: newClinicCode(), name: clinicName, doctor: { name: doctorName, username, ...(await hashPw(pw)) }, nurses: [], patients: [], archive: [], counter: null, createdAt: now() };
    db.clinics[id] = c; idx.user.set(username, id); idx.code.set(c.code, id);
    return send(res, 201, await openSession('doctor', c, null));
  }
  if (m === 'POST' && p === '/api/login/doctor') {
    const b = await readJSON(req), u = str(b.username, 40).toLowerCase();
    rate('login:' + ip, 30, 6e5); rate('loginu:' + u, 10, 6e5);
    const c = db.clinics[idx.user.get(u)], ok = await checkPw(b.password || '', c ? c.doctor : DUMMY);
    if (!c || !ok) throw httpErr(401, 'bad_credentials');
    return send(res, 200, await openSession('doctor', c, null));
  }
  if (m === 'POST' && p === '/api/login/nurse') {
    const b = await readJSON(req), code = str(b.code, 12).toUpperCase(), name = str(b.name, 80).toLowerCase();
    rate('login:' + ip, 30, 6e5); rate('loginc:' + code, 20, 6e5);
    const c = db.clinics[idx.code.get(code)], n = c && c.nurses.find(z => z.name.toLowerCase() === name), ok = await checkPw(b.password || '', n || DUMMY);
    if (!c || !n || !ok) throw httpErr(401, 'bad_credentials');
    return send(res, 200, await openSession('nurse', c, n));
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
  if (m === 'GET' && p === '/api/state') { const a = authOf(req); return send(res, 200, { me: meOf(a), ...stateFor(a.clinic) }); }
  if (m === 'POST' && p === '/api/stream-ticket') {
    const a = authOf(req), t = b64u(18); streamTickets.set(t, { key: a.key, exp: now() + 3e4 });
    return send(res, 200, { ticket: t });
  }
  if (m === 'GET' && p === '/api/stream') {
    const st = streamTickets.get(url.searchParams.get('ticket') || ''); streamTickets.delete(url.searchParams.get('ticket') || '');
    const s = st && st.exp > now() && db.sessions[st.key];
    if (!s) throw httpErr(401, 'unauthorized');
    const c = db.clinics[s.clinicId]; if (!c) throw httpErr(401, 'unauthorized');
    const r = RT(c); if (r.streams.size >= 40) throw httpErr(429, 'rate_limited');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 3000\n\n');
    const sub = { res, role: s.role, sessionKey: st.key }; r.streams.add(sub); sse(res, 'state', stateFor(c));
    req.on('close', () => r.streams.delete(sub));
    return;
  }

  /* اقتراحات الأرشيف أثناء إدخال مريض */
  if (m === 'GET' && p === '/api/patients/suggest') {
    const a = authOf(req); rate('sg:' + a.key, 240, 6e4);
    return send(res, 200, { items: suggestPatients(a.clinic, str(url.searchParams.get('q') || '', 80)) });
  }
  /* مرضى اليوم */
  if (m === 'POST' && p === '/api/patients') {
    const a = authOf(req), c = a.clinic, v = validatePatient(await readJSON(req));
    if (!v) throw httpErr(400, 'invalid_input');
    if (a.role === 'nurse' && !nurseMayAdd(c)) throw httpErr(403, 'closed');
    if (c.patients.length >= 500) throw httpErr(429, 'limit');
    const pt = { id: rid(6), ticket: b64u(18), ticketNo: nextTicketNo(c), ...v, images: [], status: 'waiting', createdAt: now(), startedAt: null, createdBy: a.role };
    c.patients.push(pt); idx.ticket.set(pt.ticket, c.id);
    broadcast(c, { to: 'doctor', data: { type: 'add', name: pt.name } });
    return send(res, 201, patientView(pt));
  }
  mt = p.match(/^\/api\/patients\/([a-f0-9]{12})(?:\/(enter|skip|finish|images))?(?:\/([a-f0-9]{16}))?$/);
  if (mt) {
    const [, pid, act, imgId] = mt;
    if (!act && m === 'PUT') {
      const a = authOf(req), c = a.clinic, pt = findPatient(c, pid), v = validatePatient(await readJSON(req));
      if (!v) throw httpErr(400, 'invalid_input'); if (pt.status !== 'waiting') throw httpErr(409, 'not_waiting');
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
        broadcast(c, { to: 'doctor', data: { type: 'skip_request', name: pt.name } });
        return send(res, 202, { skipRequested: true });
      }
      enterRoom(c, pt); broadcast(c, { to: 'doctor', data: { type: 'enter', name: pt.name } }); return send(res, 200, patientView(pt));
    }
    if (act === 'skip' && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid), b = await readJSON(req);
      if (b.allow) {
        if (pt.status !== 'waiting') throw httpErr(409, 'not_waiting'); if (inRoom(c)) throw httpErr(409, 'busy');
        enterRoom(c, pt); broadcast(c, { to: 'doctor', data: { type: 'enter', name: pt.name } });
      } else { RT(c).skip.delete(pid); broadcast(c, { to: 'nurse', data: { type: 'skip_denied', name: pt.name } }); }
      return send(res, 200, { ok: true });
    }
    if (act === 'finish' && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid), b = await readJSON(req);
      if (pt.status !== 'in') throw httpErr(409, 'not_waiting');
      const t = now(), treatment = str(b.treatment, 200) || 'استشارة';
      const entry = { ...pt, status: 'done', treatment, notes: str(b.notes, 2000), finishedAt: t, waitMin: Math.max(0, Math.round(((pt.startedAt || t) - pt.createdAt) / 6e4)), durationMin: Math.max(1, Math.round((t - (pt.startedAt || t)) / 6e4)) };
      c.patients = c.patients.filter(z => z !== pt); c.archive.unshift(entry);
      broadcast(c, { to: 'nurse', data: { type: 'finish', name: pt.name } }, [pt.ticket]);
      return send(res, 200, archiveView(entry));
    }
    if (act === 'images' && !imgId && m === 'POST') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid);
      if ((pt.images || []).length >= 12) throw httpErr(429, 'limit');
      const buf = await readBody(req, 4e6); if (!isJpeg(buf)) throw httpErr(400, 'invalid_input');
      const id = rid(8); await imgStore.put(c.id, id, buf); (pt.images = pt.images || []).push({ id });
      broadcast(c); return send(res, 201, { id });
    }
    if (act === 'images' && imgId && m === 'DELETE') {
      const a = authOf(req, ['doctor']), c = a.clinic, pt = findPatient(c, pid);
      const i = (pt.images || []).findIndex(z => z.id === imgId); if (i < 0) throw httpErr(404, 'not_found');
      pt.images.splice(i, 1); imgStore.del(c.id, [imgId]).catch(e => console.error('تعذّر حذف الصورة:', e.message)); broadcast(c); return send(res, 200, { ok: true });
    }
  }
  mt = p.match(/^\/api\/records\/([a-f0-9]{12})\/images\/([a-f0-9]{16})$/);
  if (m === 'GET' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic;
    const rec = c.patients.find(z => z.id === mt[1]) || c.archive.find(z => z.id === mt[1]);
    if (!rec || !(rec.images || []).some(z => z.id === mt[2])) throw httpErr(404, 'not_found');
    const buf = await imgStore.get(c.id, mt[2]); if (!buf) throw httpErr(404, 'not_found');
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': buf.length, 'Cache-Control': 'private, max-age=3600' });
    return req.method === 'HEAD' ? res.end() : res.end(buf);
  }

  /* الأرشيف (طبيب فقط) */
  if (m === 'GET' && p === '/api/archive') {
    const a = authOf(req, ['doctor']), q = url.searchParams, name = str(q.get('name') || '', 80).toLowerCase(), year = str(q.get('year') || '', 4), gender = str(q.get('gender') || '', 4), tooth = str(q.get('tooth') || '', 20).toLowerCase(), tr = str(q.get('treatment') || '', 40);
    const from = Math.max(0, +q.get('from') || 0), to = Math.max(0, +q.get('to') || 0), off = Math.max(0, +q.get('offset') || 0), lim = Math.min(100, Math.max(1, +q.get('limit') || 30));
    const all = a.clinic.archive.filter(r => (!from || r.finishedAt >= from) && (!to || r.finishedAt < to) && (!name || r.name.toLowerCase().includes(name)) && (!year || String(r.birthYear).includes(year)) && (!gender || r.gender === gender) && (!tooth || String(r.tooth).toLowerCase().includes(tooth)) && (!tr || (r.treatment || '').includes(tr)));
    return send(res, 200, { total: all.length, items: all.slice(off, off + lim).map(archiveView) });
  }
  mt = p.match(/^\/api\/archive\/([a-f0-9]{12})$/);
  if (m === 'DELETE' && mt) {
    const a = authOf(req, ['doctor']), c = a.clinic, i = c.archive.findIndex(z => z.id === mt[1]);
    if (i < 0) throw httpErr(404, 'not_found');
    const [rec] = c.archive.splice(i, 1); rmImages(c, rec); idx.ticket.delete(rec.ticket); save(); return send(res, 200, { ok: true });
  }

  /* الممرضات (طبيب فقط) */
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
    const [n] = c.nurses.splice(i, 1); for (const [k, s] of Object.entries(db.sessions)) if (s.nurseId === n.id) { delete db.sessions[k]; closeStreamsOf(k); }
    save(); return send(res, 200, { ok: true });
  }

  /* إعدادات الحساب (طبيب فقط) */
  if (m === 'PUT' && p === '/api/clinic') {
    const a = authOf(req, ['doctor']), b = await readJSON(req), name = str(b.clinicName, 80), dn = str(b.doctorName, 80);
    if (!name || !dn) throw httpErr(400, 'invalid_input'); a.clinic.name = name; a.clinic.doctor.name = dn; broadcast(a.clinic); return send(res, 200, meOf(a));
  }
  if (m === 'PUT' && p === '/api/clinic/hours') {
    const a = authOf(req, ['doctor']), b = await readJSON(req);
    if (typeof b.start !== 'string' || typeof b.end !== 'string' || !HM.test(b.start) || !HM.test(b.end) || !validTz(b.tz)) throw httpErr(400, 'invalid_input');
    a.clinic.hours = { enabled: !!b.enabled, start: b.start, end: b.end, tz: b.tz };
    broadcast(a.clinic); return send(res, 200, hoursView(a.clinic));
  }
  if (m === 'POST' && p === '/api/account/password') {
    const a = authOf(req, ['doctor']), b = await readJSON(req); rate('pw:' + a.clinic.id, 10, 6e5);
    if (!(await checkPw(b.oldPassword || '', a.clinic.doctor))) throw httpErr(401, 'bad_credentials');
    if (typeof b.newPassword !== 'string' || b.newPassword.length < 8 || b.newPassword.length > 200) throw httpErr(400, 'invalid_input');
    Object.assign(a.clinic.doctor, await hashPw(b.newPassword));
    for (const [k, s] of Object.entries(db.sessions)) if (s.clinicId === a.clinic.id && k !== a.key) { delete db.sessions[k]; closeStreamsOf(k); }
    save(); return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/clinic/wipe') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req); rate('pw:' + c.id, 10, 6e5);
    if (!(await checkPw(b.password || '', c.doctor))) throw httpErr(401, 'bad_credentials');
    for (const pt of c.patients.concat(c.archive)) idx.ticket.delete(pt.ticket);
    const toks = c.patients.map(z => z.ticket);
    c.patients = []; c.archive = []; await imgStore.delAll(c.id);
    if (b.account) {
      for (const [k, s] of Object.entries(db.sessions)) if (s.clinicId === c.id) { delete db.sessions[k]; closeStreamsOf(k); }
      idx.user.delete(c.doctor.username); idx.code.delete(c.code); delete db.clinics[c.id]; delete rt[c.id]; save();
    } else broadcast(c, null, toks);
    return send(res, 200, { ok: true });
  }

  /* نسخ احتياطي واستعادة (طبيب فقط) */
  if (m === 'GET' && p === '/api/backup') {
    const a = authOf(req, ['doctor']), c = a.clinic, images = {};
    for (const r of c.patients.concat(c.archive)) for (const i of r.images || []) { try { const bf = await imgStore.get(c.id, i.id); if (bf) images[i.id] = bf.toString('base64'); } catch (e) {} }
    const body = JSON.stringify({ app: 'calm-clinic', version: 2, exportedAt: now(), clinicName: c.name, patients: c.patients, archive: c.archive, images });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="clinic_backup_${new Date().toISOString().slice(0, 10)}.json"`, 'Cache-Control': 'no-store' });
    return res.end(body);
  }
  if (m === 'POST' && p === '/api/restore') {
    const a = authOf(req, ['doctor']), c = a.clinic, b = await readJSON(req, 150e6);
    if (b.app !== 'calm-clinic' || !Array.isArray(b.patients) || !Array.isArray(b.archive)) throw httpErr(400, 'invalid_input');
    const used = new Set(), imgs = b.images && typeof b.images === 'object' ? b.images : {};
    const clean = (r, done) => {
      const v = validatePatient(r); if (!v) return null;
      let ticket = typeof r.ticket === 'string' && TOKEN.test(r.ticket) ? r.ticket : b64u(18);
      if ((idx.ticket.has(ticket) && idx.ticket.get(ticket) !== c.id) || used.has(ticket)) ticket = b64u(18);
      used.add(ticket);
      const out = { id: REC_ID.test(r.id) ? r.id : rid(6), ticket, ticketNo: Math.max(1, parseInt(r.ticketNo) || 1), ...v, status: done ? 'done' : (r.status === 'in' ? 'in' : 'waiting'), createdAt: +r.createdAt || now(), startedAt: +r.startedAt || null, images: [] };
      for (const i of Array.isArray(r.images) ? r.images : []) { if (i && IMG_ID.test(i.id) && typeof imgs[i.id] === 'string') { const buf = Buffer.from(imgs[i.id], 'base64'); if (isJpeg(buf)) { out.images.push({ id: i.id }); out._w = (out._w || []).concat([[i.id, buf]]); } } }
      if (done) Object.assign(out, { treatment: str(r.treatment, 200) || 'استشارة', notes: str(r.notes, 2000), finishedAt: +r.finishedAt || now(), waitMin: +r.waitMin || 0, durationMin: +r.durationMin || 0 });
      return out;
    };
    const P = b.patients.slice(0, 500).map(r => clean(r, false)).filter(Boolean), A = b.archive.slice(0, 50000).map(r => clean(r, true)).filter(Boolean);
    if (P.filter(z => z.status === 'in').length > 1) P.forEach((z, i) => { if (z.status === 'in' && i) z.status = 'waiting'; });
    for (const pt of c.patients.concat(c.archive)) idx.ticket.delete(pt.ticket);
    await imgStore.delAll(c.id);
    for (const r of P.concat(A)) { for (const [id, buf] of r._w || []) await imgStore.put(c.id, id, buf); delete r._w; idx.ticket.set(r.ticket, c.id); }
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
    if (url.pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
    return serveStatic(req, res, url.pathname);
  } catch (e) {
    if (res.headersSent) return res.end();
    if (e.status) return send(res, e.status, { error: e.code });
    console.error(e); send(res, 500, { error: 'server_error' });
  }
});
server.headersTimeout = 20000; server.requestTimeout = 0; server.keepAliveTimeout = 65000;
connectDB().then(() => {
  reindex();
  for (const [k, s] of Object.entries(db.sessions)) if (s.exp < now()) delete db.sessions[k];
  server.listen(PORT, () => console.log(`عيادتي الهادئة تعمل على المنفذ ${PORT} — التخزين: ${M ? 'MongoDB' : 'ذاكرة مؤقتة (غير دائم)'}`));
}).catch(e => { console.error('تعذّر الاتصال بقاعدة البيانات:', e.message); process.exit(1); });
