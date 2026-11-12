'use strict';
/* إرسال رسائل واتساب عبر WhatsApp Business Cloud API (Meta) — بلا أي مكتبة.
   الإعداد يتم من داخل التطبيق (إعدادات ← الحجز ← ربط واتساب) ويُحفظ لكل عيادة؛
   ويمكن بدلاً من ذلك ضبط متغيّرات البيئة: WA_TOKEN, WA_PHONE_ID, WA_COUNTRY_CODE,
   WA_TEMPLATE_NOTICE, WA_TEMPLATE_TICKET, WA_TEMPLATE_LANG, WA_API_VERSION.
   (WA_API_HOST / WA_API_PLAIN=1 للاختبار فقط.) */
const https = require('https'), http = require('http'), zlib = require('zlib');
const QR = require('./public/qr.js');

/* ---- صورة PNG لرمز QR (رمادي 8 بت) ---- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function chunk(type, data) { const t = Buffer.from(type, 'ascii'), len = Buffer.alloc(4), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); }
function qrPng(text, scale = 8, margin = 4) {
  const q = QR.encode(text), n = q.size + margin * 2, W = n * scale, raw = Buffer.alloc((W + 1) * W, 255);
  for (let y = 0; y < W; y++) {
    raw[y * (W + 1)] = 0;
    const my = Math.floor(y / scale) - margin;
    if (my < 0 || my >= q.size) continue;
    for (let x = 0; x < W; x++) { const mx = Math.floor(x / scale) - margin; if (mx >= 0 && mx < q.size && q.modules[my][mx]) raw[y * (W + 1) + 1 + x] = 0; }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(W, 4); ihdr[8] = 8; ihdr[9] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const ENV = process.env;
const API_VER = ENV.WA_API_VERSION || 'v21.0';
const [API_HOST, API_PORT] = (ENV.WA_API_HOST || 'graph.facebook.com').split(':'), API_LIB = ENV.WA_API_PLAIN === '1' ? http : https;
let logFn = () => {};

/* طلب Graph عام. يعيد { ok, status, json } ولا يرمي أبداً */
function graph(method, path, token, body, opt = {}) {
  return new Promise(resolve => {
    const data = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));
    const headers = { 'Authorization': (opt.oauth ? 'OAuth ' : 'Bearer ') + token, ...(opt.headers || {}) };
    if (data) { headers['Content-Length'] = data.length; if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'; }
    const rq = API_LIB.request({ hostname: API_HOST, ...(API_PORT ? { port: +API_PORT } : {}), path: (opt.raw ? '' : '/' + API_VER) + path, method, timeout: 20000, headers }, r => {
      const ch = []; let n = 0; r.on('data', d => { n += d.length; if (n < 2e5) ch.push(d); });
      r.on('end', () => { let j = null; try { j = JSON.parse(Buffer.concat(ch).toString()); } catch (e) {} const ok = r.statusCode >= 200 && r.statusCode < 300; if (!ok) logFn(`whatsapp: ${method} ${path.split('?')[0]} → HTTP ${r.statusCode} ${JSON.stringify(j && j.error ? j.error.message : '').slice(0, 200)}`); resolve({ ok, status: r.statusCode, json: j }); });
    });
    rq.on('timeout', () => rq.destroy(new Error('timeout'))); rq.on('error', e => { logFn('whatsapp: ' + e.message); resolve({ ok: false, status: 0, json: { error: { message: e.message } } }); });
    rq.end(data || undefined);
  });
}
const errOf = r => (r && r.json && r.json.error && (r.json.error.error_user_msg || r.json.error.message)) || 'HTTP ' + (r ? r.status : 0);

/* طابور تسلسلي مشترك: رسالة كل ~0.4 ثانية، ولا يتجاوز 300 رسالة معلّقة */
const q = []; let busy = false;
async function pump() {
  if (busy) return; busy = true;
  while (q.length) { const job = q.shift(); try { await job(); } catch (e) { logFn('whatsapp: ' + e.message); } await new Promise(r => setTimeout(r, 400)); }
  busy = false;
}
function enqueue(fn) { if (q.length >= 300) return; q.push(fn); pump(); }
const flat = s => String(s).replace(/[\r\n\t]+/g, ' — ').replace(/ {2,}/g, ' ').trim();

/* نصوص القوالب (يُنشئها التطبيق تلقائياً في حساب الطبيب) */
const TPL = {
  notice: { name: 'clinic_notice_ar', body: 'مرحباً {{1}} 👋 {{2}} — شكراً لثقتكم بنا.', ex: [['منى', 'تم تأكيد موعدك غداً الساعة 10:00']] },
  ticket: { name: 'clinic_ticket_ar', body: 'مرحباً {{1}} 👋 {{2}} — شكراً لثقتكم بنا.', ex: [['منى', 'تم تأكيد تسجيلك، رقم تذكرتك 5، وعدد المرضى قبلك 2. تابع دورك من الرابط: https://example.com/t/abc']] },
};

/* cfg: { token, phoneId, wabaId, number, cc, tplNotice, tplTicket, tplImage, lang } مدموجاً مع البيئة */
function make(c0) {
  const cfg = { token: ENV.WA_TOKEN || '', phoneId: (ENV.WA_PHONE_ID || '').replace(/\D/g, ''), cc: (ENV.WA_COUNTRY_CODE || '213'), tplNotice: ENV.WA_TEMPLATE_NOTICE || '', tplTicket: ENV.WA_TEMPLATE_TICKET || '', tplImage: true, lang: ENV.WA_TEMPLATE_LANG || 'ar', ...Object.fromEntries(Object.entries(c0 || {}).filter(([, v]) => v !== undefined && v !== '' && v !== null)) };
  const cc = String(cfg.cc).replace(/\D/g, '') || '213', enabled = !!(cfg.token && cfg.phoneId);
  function num(raw) {
    let s = String(raw || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim(); const plus = s.startsWith('+');
    s = s.replace(/\D/g, ''); if (!s) return '';
    if (plus) return s.length >= 8 && s.length <= 15 ? s : '';
    if (s.startsWith('00')) s = s.slice(2); else if (s.startsWith('0')) s = cc + s.slice(1); else if (s.length <= 10) s = cc + s;
    return s.length >= 8 && s.length <= 15 ? s : '';
  }
  const send = body => graph('POST', `/${cfg.phoneId}/messages`, cfg.token, { messaging_product: 'whatsapp', ...body });
  const textParams = (name, text) => [{ type: 'text', text: flat(name || '-') }, { type: 'text', text: flat(text) }];
  function sendText(to, name, text) {
    if (!enabled) return; const n = num(to); if (!n) return;
    enqueue(() => send(cfg.tplNotice ? { to: n, type: 'template', template: { name: cfg.tplNotice, language: { code: cfg.lang }, components: [{ type: 'body', parameters: textParams(name, text) }] } } : { to: n, type: 'text', text: { body: text, preview_url: true } }));
  }
  function sendTicket(to, name, text, imageUrl) {
    if (!enabled) return; const n = num(to); if (!n) return;
    if (cfg.tplTicket) {
      const comps = []; if (cfg.tplImage !== false && imageUrl) comps.push({ type: 'header', parameters: [{ type: 'image', image: { link: imageUrl } }] });
      comps.push({ type: 'body', parameters: textParams(name, text) });
      enqueue(() => send({ to: n, type: 'template', template: { name: cfg.tplTicket, language: { code: cfg.lang }, components: comps } }));
    } else enqueue(() => send(imageUrl ? { to: n, type: 'image', image: { link: imageUrl, caption: text } } : { to: n, type: 'text', text: { body: text, preview_url: true } }));
  }

  /* ---- الربط من داخل التطبيق ---- */
  /* يبحث عن رقم العيادة بين أرقام حساب واتساب للأعمال ويعيد معرّفه */
  async function resolvePhone(number) {
    const r = await graph('GET', `/${cfg.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating&limit=50`, cfg.token);
    if (!r.ok) return { error: errOf(r) };
    const list = (r.json && r.json.data) || [], want = num(number), digits = x => String(x || '').replace(/\D/g, '');
    if (!list.length) return { error: 'no_numbers' };
    const hit = want ? list.find(p => digits(p.display_phone_number) === want) || list.find(p => want.endsWith(digits(p.display_phone_number).slice(-9))) : (list.length === 1 ? list[0] : null);
    if (!hit) return { error: 'number_not_found', numbers: list.map(p => p.display_phone_number) };
    return { phoneId: hit.id, display: hit.display_phone_number, name: hit.verified_name || '' };
  }
  /* رفع صورة مثال لرأس القالب (Resumable Upload) → handle */
  async function uploadHeaderExample() {
    const dbg = await graph('GET', `/debug_token?input_token=${encodeURIComponent(cfg.token)}`, cfg.token);
    const appId = dbg.ok && dbg.json && dbg.json.data && dbg.json.data.app_id; if (!appId) return '';
    const png = qrPng('https://example.com/t/example'), s = await graph('POST', `/${appId}/uploads?file_length=${png.length}&file_type=image%2Fpng`, cfg.token);
    if (!s.ok || !s.json || !s.json.id) return '';
    const u = await graph('POST', '/' + s.json.id, cfg.token, png, { oauth: true, headers: { 'file_offset': '0', 'Content-Type': 'application/octet-stream' } });
    return u.ok && u.json && u.json.h || '';
  }
  async function createTemplate(t, header) {
    const comps = []; if (header) comps.push({ type: 'HEADER', format: 'IMAGE', example: { header_handle: [header] } });
    comps.push({ type: 'BODY', text: t.body, example: { body_text: t.ex } });
    const r = await graph('POST', `/${cfg.wabaId}/message_templates`, cfg.token, { name: t.name, language: cfg.lang, category: 'UTILITY', components: comps });
    /* موجود مسبقاً (تكرار الاسم) = نجاح */
    const dup = r.json && r.json.error && (r.json.error.error_subcode === 2388024 || /already exists/i.test(r.json.error.message || ''));
    return { ok: r.ok || dup, error: r.ok || dup ? '' : errOf(r) };
  }
  /* ينشئ القالبين؛ للتذكرة يجرّب رأس صورة QR وإلا يكتفي بنص فيه الرابط */
  async function ensureTemplates() {
    const out = { notice: await createTemplate(TPL.notice), ticket: null, image: false };
    const h = await uploadHeaderExample();
    if (h) { out.ticket = await createTemplate(TPL.ticket, h); out.image = out.ticket.ok; }
    if (!out.ticket || !out.ticket.ok) out.ticket = await createTemplate({ ...TPL.ticket, name: 'clinic_ticket_link_ar' }, '');
    out.ticketName = out.image ? TPL.ticket.name : 'clinic_ticket_link_ar'; out.noticeName = TPL.notice.name;
    return out;
  }
  async function templateStatus(names) {
    const r = await graph('GET', `/${cfg.wabaId}/message_templates?fields=name,status,language&limit=100`, cfg.token);
    if (!r.ok) return { error: errOf(r) };
    const m = {}; for (const t of (r.json && r.json.data) || []) if (names.includes(t.name) && t.language === cfg.lang) m[t.name] = t.status;
    return { status: m };
  }
  async function ping() { const r = await graph('GET', `/${cfg.phoneId}?fields=display_phone_number,verified_name`, cfg.token); return r.ok ? { ok: true, display: r.json.display_phone_number, name: r.json.verified_name } : { ok: false, error: errOf(r) }; }

  return { enabled, num, sendText, sendTicket, resolvePhone, ensureTemplates, templateStatus, ping, cfg };
}
module.exports = { make, qrPng, TPL, setLogger: f => { logFn = f; }, graph };
