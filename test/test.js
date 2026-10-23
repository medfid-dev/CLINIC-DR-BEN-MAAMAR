'use strict';
/* اختبار شامل: node test/test.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 4100 + Math.floor(Math.random() * 500), base = `http://127.0.0.1:${port}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
const pushPort = port + 1000, pushes = [];   // خادم دفع وهمي يلتقط الرسائل المشفّرة
const mock = require('http').createServer((req, res) => { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => { pushes.push({ url: req.url, headers: req.headers, body: Buffer.concat(ch) }); res.writeHead(req.url.startsWith('/gone') ? 410 : 201); res.end(); }); }).listen(pushPort, '127.0.0.1');
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dir, PUSH_EXTRA_HOSTS: `127.0.0.1:${pushPort}` }, stdio: 'inherit' });
const crypto = require('crypto');
/* فكّ تشفير RFC 8291 كما يفعل المتصفح، للتحقق من صحة التنسيق */
function decryptPush(body, ecdh, auth) {
  const salt = body.subarray(0, 16), idlen = body[20], asPub = body.subarray(21, 21 + idlen), ct = body.subarray(21 + idlen), uaPub = ecdh.getPublicKey();
  const hk = (ikm, s, info, n) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, n));
  const prk = hk(ecdh.computeSecret(asPub), auth, Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub]), 32);
  const d = crypto.createDecipheriv('aes-128-gcm', hk(prk, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16), hk(prk, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  d.setAuthTag(ct.subarray(ct.length - 16)); const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  return JSON.parse(pt.subarray(0, pt.lastIndexOf(2)).toString('utf8'));
}
const mkSub = path => { const e = crypto.createECDH('prime256v1'); e.generateKeys(); const auth = crypto.randomBytes(16); return { e, auth, sub: { endpoint: `http://127.0.0.1:${pushPort}${path}`, keys: { p256dh: e.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } } }; };
const J = async (m, p, tok, body, raw) => {
  const r = await fetch(base + p, { method: m, headers: { ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(raw ? { 'Content-Type': 'image/jpeg' } : body ? { 'Content-Type': 'application/json' } : {}) }, body: raw || (body ? JSON.stringify(body) : undefined) });
  let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j };
};
let pass = 0; const ok = (c, msg) => { assert.ok(c, msg); pass++; console.log('  ✓', msg); };
async function sse(url, onEvt) { const ac = new AbortController(); const r = await fetch(url, { signal: ac.signal }); const rd = r.body.getReader(), dec = new TextDecoder(); let buf = ''; (async () => { try { for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const blk = buf.slice(0, i); buf = buf.slice(i + 2); const ev = /event: (\w+)/.exec(blk), d = /data: (.*)/.exec(blk); if (ev && d) onEvt(ev[1], JSON.parse(d[1])); } } } catch (e) {} })(); return ac; }
const wait = ms => new Promise(r => setTimeout(r, ms));
const pat = (n, o) => ({ name: n, birthYear: 1990, gender: 'ذكر', reason: 'قلع أسنان', tooth: '16', phone: '0550000000', ...o });

(async () => {
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/healthz'); break; } catch (e) { await wait(100); } }
  try {
    console.log('التسجيل والدخول');
    let r = await J('POST', '/api/register', null, { clinicName: 'عيادة أ', doctorName: 'د. أحمد', username: 'ahmed', password: 'password1' });
    ok(r.s === 201 && r.j.token, 'تسجيل طبيب أ'); const A = r.j.token;
    r = await J('POST', '/api/register', null, { clinicName: 'عيادة ب', doctorName: 'د. سارة', username: 'sara', password: 'password2' });
    ok(r.s === 201, 'تسجيل طبيب ب'); const B = r.j.token;
    r = await J('POST', '/api/register', null, { clinicName: 'x', doctorName: 'y', username: 'AHMED', password: 'password3' }); ok(r.s === 409, 'منع تكرار اسم المستخدم');
    r = await J('POST', '/api/register', null, { clinicName: 'x', doctorName: 'y', username: 'zed', password: '123' }); ok(r.s === 400, 'رفض كلمة مرور قصيرة');
    r = await J('POST', '/api/login/doctor', null, { username: 'ahmed', password: 'wrong' }); ok(r.s === 401, 'رفض كلمة مرور خاطئة');
    r = await J('POST', '/api/login/doctor', null, { username: 'ahmed', password: 'password1' }); ok(r.s === 200, 'دخول الطبيب');
    const meA = (await J('GET', '/api/state', A)).j.me, meB = (await J('GET', '/api/state', B)).j.me;
    ok(meA.code && meB.code && meA.code !== meB.code, 'لكل عيادة رمز مختلف');
    r = await J('POST', '/api/nurses', A, { name: 'فاطمة', phone: '0661', password: 'nurse123' }); ok(r.s === 201, 'إضافة ممرضة');
    r = await J('POST', '/api/login/nurse', null, { code: meB.code, name: 'فاطمة', password: 'nurse123' }); ok(r.s === 401, 'ممرضة أ لا تدخل عيادة ب');
    r = await J('POST', '/api/login/nurse', null, { code: meA.code.toLowerCase(), name: 'فاطمة', password: 'nurse123' }); ok(r.s === 200, 'دخول الممرضة برمز العيادة'); const N = r.j.token;
    r = await J('GET', '/api/nurses', N); ok(r.s === 403, 'الممرضة لا ترى قائمة الممرضات');
    r = await J('GET', '/api/archive', N); ok(r.s === 403, 'الممرضة لا ترى الأرشيف');

    console.log('العزل بين الأطباء');
    const p1 = (await J('POST', '/api/patients', N, pat('مريض1'))).j, p2 = (await J('POST', '/api/patients', N, pat('مريض2'))).j, p3 = (await J('POST', '/api/patients', N, pat('مريض3'))).j;
    ok(p1.ticketNo === 1 && p3.ticketNo === 3, 'ترقيم التذاكر');
    const stB = (await J('GET', '/api/state', B)).j; ok(stB.patients.length === 0, 'الطبيب ب لا يرى مرضى أ');
    r = await J('PUT', `/api/patients/${p1.id}`, B, pat('اختراق')); ok(r.s === 404, 'ب لا يعدّل مريض أ');
    r = await J('DELETE', `/api/patients/${p1.id}`, B); ok(r.s === 404, 'ب لا يحذف مريض أ');
    r = await J('POST', `/api/patients/${p1.id}/enter`, B); ok(r.s === 404, 'ب لا يُدخل مريض أ');
    r = await J('GET', '/api/state'); ok(r.s === 401, 'بدون رمز: 401');
    r = await J('GET', '/api/state', 'bogus'); ok(r.s === 401, 'رمز مزيّف: 401');

    console.log('الطابور وتخطي الدور');
    const events = [], ac = await sse(await (async () => { const t = (await J('POST', '/api/stream-ticket', A)).j.ticket; return `${base}/api/stream?ticket=${t}`; })(), (e, d) => events.push([e, d]));
    const nEv = [], acN = await sse(`${base}/api/stream?ticket=${(await J('POST', '/api/stream-ticket', N)).j.ticket}`, (e, d) => nEv.push([e, d]));
    await wait(200); ok(events.some(e => e[0] === 'state' && e[1].patients.length === 3), 'بث الحالة الأولية للطبيب');
    r = await J('GET', `/api/stream?ticket=${(await J('POST', '/api/stream-ticket', A)).j.ticket}x`); ok(r.s === 401, 'تذكرة بث خاطئة مرفوضة');
    r = await J('POST', `/api/patients/${p2.id}/enter`, N); ok(r.s === 202 && r.j.skipRequested, 'ممرضة تطلب تخطي الدور');
    await wait(150); ok(events.some(e => e[0] === 'state' && e[1].skipRequests.length === 1), 'الطبيب يتلقى طلب التخطي فوراً');
    r = await J('POST', `/api/patients/${p2.id}/skip`, N, { allow: true }); ok(r.s === 403, 'الممرضة لا تسمح لنفسها');
    r = await J('POST', `/api/patients/${p2.id}/skip`, A, { allow: false }); await wait(150);
    ok(nEv.some(e => e[0] === 'notify' && e[1].type === 'skip_denied'), 'إشعار الرفض يصل للممرضة');
    r = await J('POST', `/api/patients/${p1.id}/enter`, N); ok(r.s === 200 && r.j.status === 'in', 'دخول الأول بلا تخطي');
    r = await J('POST', `/api/patients/${p2.id}/enter`, N); ok(r.s === 409, 'لا دخول مزدوج');
    const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(100, 1)]);
    r = await J('POST', `/api/patients/${p1.id}/images`, N, null, jpeg); ok(r.s === 403, 'الممرضة لا ترفع صوراً');
    r = await J('POST', `/api/patients/${p1.id}/images`, A, null, Buffer.from('not an image')); ok(r.s === 400, 'رفض ملف ليس JPEG');
    r = await J('POST', `/api/patients/${p1.id}/images`, A, null, jpeg); ok(r.s === 201, 'رفع صورة'); const imgId = r.j.id;
    let g = await fetch(`${base}/api/records/${p1.id}/images/${imgId}`, { headers: { Authorization: 'Bearer ' + A } }); ok(g.status === 200, 'تنزيل الصورة للطبيب صاحبها');
    g = await fetch(`${base}/api/records/${p1.id}/images/${imgId}`, { headers: { Authorization: 'Bearer ' + B } }); ok(g.status === 404, 'الطبيب ب لا يصل لصورة أ');
    g = await fetch(`${base}/api/records/${p1.id}/images/${imgId}`, { headers: { Authorization: 'Bearer ' + N } }); ok(g.status === 403, 'الممرضة لا تصل للصور');

    console.log('تذكرة المريض (الخصوصية)');
    const t2 = (await J('GET', '/api/state', A)).j.patients.find(x => x.id === p2.id).ticket;
    r = await J('GET', `/api/ticket/${t2}`); ok(r.s === 200 && r.j.state === 'waiting' && r.j.ahead === 0 && r.j.busy === true, 'تذكرة 2: لا أحد أمامه والطبيب مشغول');
    const t3 = p3.ticket; r = await J('GET', `/api/ticket/${t3}`); ok(r.j.ahead === 1, 'تذكرة 3: واحد أمامه');
    const dump = JSON.stringify({ ...r.j, updated: 0 }); ok(!dump.includes('مريض1') && !dump.includes('مريض2') && !dump.includes('0550000000') && !dump.includes('1990') && !dump.includes('16'), 'التذكرة لا تكشف اسم/هاتف/سن أي مريض آخر');
    ok(Object.keys(r.j).sort().join() === 'ahead,busy,clinic,estMin,firstName,state,ticketNo,updated', 'حقول التذكرة محصورة');
    r = await J('GET', '/api/ticket/AAAAAAAAAAAAAAAAAAAAAAAA'); ok(r.s === 404, 'رمز تذكرة مجهول 404');
    r = await J('GET', '/api/ticket/../state'); ok(r.s === 401 || r.s === 404, 'لا ثغرة مسار في التذكرة');
    const tEv = []; const acT = await sse(`${base}/api/ticket/${t3}/stream`, (e, d) => tEv.push(d)); await wait(150);
    r = await J('POST', `/api/patients/${p1.id}/finish`, N, { treatment: 'قلع' }); ok(r.s === 403, 'الممرضة لا تنهي المعاينة');
    r = await J('POST', `/api/patients/${p1.id}/finish`, A, { treatment: 'قلع', notes: 'ملاحظة', teeth: ['16', '55', '99', 'x', '16'], price: '2000' }); ok(r.s === 200 && JSON.stringify(r.j.teeth) === '["16","55"]' && r.j.tooth === '16 55' && r.j.price === 2000, 'إنهاء المعاينة مع أسنان (FDI بالغ ولبني، تُرفض غير الصالحة)');
    await wait(200); ok(tEv.length >= 2 && tEv[tEv.length - 1].state === 'waiting' && tEv[tEv.length - 1].ahead === 1, 'تذكرة 3 تتلقى تحديثاً فورياً عبر البث');
    ok(nEv.some(e => e[1].type === 'finish'), 'الممرضة تُبلَّغ بانتهاء المعاينة');
    r = await J('GET', `/api/ticket/${p1.ticket}`); ok(r.j.state === 'done', 'تذكرة المنتهي: done');
    r = await J('POST', `/api/patients/${p2.id}/enter`, N); ok(r.s === 200, 'الثاني يدخل بعد الإنهاء');
    r = await J('GET', `/api/ticket/${t2}`); ok(r.j.state === 'in', 'تذكرة 2: دورك الآن');
    r = await J('GET', '/api/archive?name=مريض1', A); ok(r.j.total === 1 && r.j.items[0].images.length === 1, 'البحث في الأرشيف');
    { const iso = d => d.toLocaleDateString('en-CA'), tz = new Date().getTimezoneOffset(), n = new Date(), y = new Date(n.getTime() - 864e5), f = new Date(n.getTime() + 864e5), q = (a, b) => `/api/archive?from=${a}&to=${b}&tz=${tz}`;
      r = await J('GET', q(iso(n), iso(n)), A); ok(r.j.total === 1, 'فلتر اليوم يشمل سجل اليوم');
      r = await J('GET', q(iso(y), iso(y)), A); ok(r.j.total === 0, 'فلتر أمس لا يشمل سجل اليوم');
      r = await J('GET', q(iso(y), iso(f)), A); ok(r.j.total === 1, 'نطاق من أمس إلى غد يشمل السجل');
      r = await J('GET', q(iso(f), iso(y)), A); ok(r.j.total === 1, 'نطاق معكوس يُصحَّح تلقائياً');
      r = await J('GET', `/api/archive?from=${iso(f)}&tz=${tz}`, A); ok(r.j.total === 0, 'من الغد فصاعداً لا يشمل السجل');
      r = await J('GET', `/api/archive?to=${iso(y)}&tz=${tz}`, A); ok(r.j.total === 0, 'حتى أمس لا يشمل سجل اليوم');
      r = await J('GET', '/api/archive?from=bad&to=zzz', A); ok(r.s === 200 && r.j.total === 1, 'تاريخ غير صالح يُتجاهل'); }
    r = await J('GET', '/api/archive?name=مريض1', B); ok(r.j.total === 0, 'أرشيف ب فارغ');
    r = await J('GET', '/api/suggest?q=' + encodeURIComponent('مريض1'), A); ok(r.s === 200 && r.j.length >= 1 && r.j[0].birthYear === 1990 && r.j[0].phone === '0550000000', 'اقتراح مريض سابق مع الميلاد والهاتف');
    r = await J('GET', '/api/suggest?q=' + encodeURIComponent('مريض1'), B); ok(r.s === 200 && r.j.length === 0, 'الاقتراحات معزولة بين العيادات');
    r = await J('GET', '/api/suggest?q=' + encodeURIComponent('م'), A); ok(r.s === 200 && r.j.length === 0, 'حرف واحد لا يُقترح');
    r = await J('GET', '/api/suggest?q=abc'); ok(r.s === 401, 'الاقتراحات تتطلب دخولاً');
    r = await J('GET', '/api/suggest?q=' + encodeURIComponent('يض1'), A); ok(r.s === 200 && r.j.length === 0, 'الاقتراحات تطابق من بداية الاسم فقط');
    r = await J('PUT', '/api/prices', N, { currency: 'دج', list: { 'قلع': 1000 } }); ok(r.s === 403, 'الممرضة لا تعدّل الأسعار');
    r = await J('PUT', '/api/prices', A, { currency: 'دج', list: { 'قلع': '1500.505', 'غير معروف': 5, 'عصب': -1, 'أخرى': 'abc' } }); ok(r.s === 200 && r.j.currency === 'دج' && r.j.list['قلع'].base === 1500.51 && Object.keys(r.j.list).length === 1, 'حفظ الأسعار مع تنقية القيم غير الصالحة');
    r = await J('GET', '/api/state', A); ok(r.j.me.prices.list['قلع'].base === 1500.51, 'الطبيب يرى قائمة الأسعار');
    r = await J('GET', '/api/state', N); ok(r.j.me.prices === undefined, 'الممرضة لا ترى الأسعار');
    ac.abort(); acN.abort(); acT.abort();

    console.log('النسخ الاحتياطي والاستعادة والحذف');
    const bk = await (await fetch(base + '/api/backup', { headers: { Authorization: 'Bearer ' + A } })).json(); ok(bk.archive.length === 1 && Object.keys(bk.images).length === 1, 'تصدير نسخة احتياطية');
    r = await J('POST', '/api/restore', B, bk); ok(r.s === 200, 'استعادة في عيادة ب');
    const stB2 = (await J('GET', '/api/state', B)).j; ok(stB2.patients.every(x => x.ticket !== t3), 'رموز التذاكر لا تتكرر بين العيادات');
    r = await J('POST', '/api/clinic/wipe', A, { password: 'bad' }); ok(r.s === 401, 'المسح يتطلب كلمة المرور');
    const nid = (await J('GET', '/api/nurses', A)).j[0].id; r = await J('DELETE', '/api/nurses/' + nid, A); ok(r.s === 200, 'حذف الممرضة');
    r = await J('GET', '/api/state', N); ok(r.s === 401, 'جلسة الممرضة المحذوفة تُلغى');
    r = await J('POST', '/api/clinic/wipe', A, { password: 'password1', account: true }); ok(r.s === 200, 'حذف حساب الطبيب أ');
    r = await J('GET', `/api/ticket/${t3}`); ok(r.s === 404, 'تذاكر العيادة المحذوفة تصبح غير صالحة');
    r = await J('GET', '/api/state', B); ok(r.s === 200, 'عيادة ب لم تتأثر');

    console.log('أوقات وأيام تسجيل الممرضة');
    r = await J('POST', '/api/nurses', B, { name: 'نورة', phone: '0771', password: 'nurse456' }); ok(r.s === 201, 'إضافة ممرضة لعيادة ب');
    r = await J('POST', '/api/login/nurse', null, { code: meB.code, name: 'نورة', password: 'nurse456' }); const NB = r.j.token;
    r = await J('GET', '/api/state', NB); ok(r.j.schedule && r.j.schedule.enabled === false, 'التقييد متوقف افتراضياً');
    r = await J('POST', '/api/patients', NB, pat('م-مفتوح')); ok(r.s === 201, 'التسجيل مسموح عند إيقاف التقييد');
    { const d = new Date(), today = d.getUTCDay(), mins = d.getUTCHours() * 60 + d.getUTCMinutes();
      const sch = o => ({ enabled: true, days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '23:59', tz: 0, ...o });
      r = await J('PUT', '/api/schedule', NB, sch()); ok(r.s === 403, 'الممرضة لا تغيّر الجدول');
      r = await J('PUT', '/api/schedule', B, sch({ from: '10:00', to: '09:00' })); ok(r.s === 400, 'رفض وقت نهاية قبل البداية');
      r = await J('PUT', '/api/schedule', B, sch({ days: [] })); ok(r.s === 400, 'رفض تفعيل بلا أيام');
      r = await J('PUT', '/api/schedule', B, sch({ from: '25:00' })); ok(r.s === 400, 'رفض وقت غير صالح');
      r = await J('PUT', '/api/schedule', B, sch({ days: [0, 1, 2, 3, 4, 5, 6].filter(x => x !== today) })); ok(r.s === 200, 'الطبيب يحفظ جدولاً بدون اليوم');
      r = await J('POST', '/api/patients', NB, pat('م-يوم مغلق')); ok(r.s === 403, 'الممرضة ممنوعة في يوم غير مسموح');
      r = await J('POST', '/api/patients', B, pat('م-الطبيب')); ok(r.s === 201, 'الطبيب يسجّل دائماً رغم التقييد');
      r = await J('GET', '/api/state', NB); ok(r.j.schedule.enabled === true && !r.j.schedule.days.includes(today), 'الممرضة ترى الجدول في الحالة');
      r = await J('PUT', '/api/schedule', B, sch({ days: [today], ...(mins >= 720 ? { from: '00:00', to: '06:00' } : { from: '18:00', to: '23:00' }) })); ok(r.s === 200, 'جدول اليوم لكن خارج الساعات');
      r = await J('POST', '/api/patients', NB, pat('م-خارج الوقت')); ok(r.s === 403, 'الممرضة ممنوعة خارج الساعات');
      r = await J('PUT', '/api/schedule', B, sch({ days: [today], from: '00:00', to: '23:59', tz: 0 })); ok(r.s === 200, 'جدول اليوم طوال اليوم');
      if (mins < 23 * 60 + 59) { r = await J('POST', '/api/patients', NB, pat('م-داخل الوقت')); ok(r.s === 201, 'الممرضة تسجّل داخل الأيام والساعات'); }
      r = await J('PUT', '/api/schedule', B, sch({ enabled: false })); ok(r.s === 200, 'إيقاف التقييد'); r = await J('POST', '/api/patients', NB, pat('م-بعد الإيقاف')); ok(r.s === 201, 'التسجيل يعود مفتوحاً'); }

    console.log('الحساب المالي والدفع على دفعات');
    r = await J('PUT', '/api/prices', B, { currency: 'دج', list: { 'علاج عصب': { base: 3000, front: 2500, pre: 3500, molar: 5000, bad: 9 } } }); ok(r.s === 200 && r.j.list['علاج عصب'].molar === 5000 && r.j.list['علاج عصب'].bad === undefined, 'أسعار حسب نوع السن');
    { const st = (await J('GET', '/api/state', B)).j; const inRoom = st.patients.find(z => z.status === 'in'); if (inRoom) await J('POST', `/api/patients/${inRoom.id}/finish`, B, { treatment: 'x' });
      const mk = async () => { const q = await J('POST', '/api/patients', B, pat('مريض مالي', { birthYear: 1985 })); const e = await J('POST', `/api/patients/${q.j.id}/enter`, B); return q.j.id; };
      let id = await mk();
      r = await J('POST', `/api/patients/${id}/finish`, B, { treatment: 'علاج عصب', teeth: ['16'], price: 5000, paid: 2000 }); ok(r.s === 200 && r.j.paid === 2000 && r.j.remaining === 3000, 'زيارة أولى: مستحق 5000 ومدفوع 2000');
      r = await J('GET', '/api/account?name=' + encodeURIComponent('مريض مالي') + '&year=1985', B); ok(r.j.balance === 3000 && r.j.due === 5000 && r.j.paid === 2000 && r.j.records.length === 1, 'حساب المريض: المتبقي 3000');
      r = await J('GET', '/api/account?name=x&year=1985', N); ok(r.s === 401 || r.s === 403, 'الحساب للطبيب فقط');
      id = await mk();
      r = await J('POST', `/api/patients/${id}/finish`, B, { treatment: 'علاج عصب', teeth: ['16'], price: 0, paid: 1000, followUp: true }); ok(r.s === 200 && r.j.paid === 0 && r.j.followUp === true, 'حصة متابعة بلا سعر جديد');
      r = await J('GET', '/api/account?name=' + encodeURIComponent('مريض مالي') + '&year=1985', B); ok(r.j.balance === 2000 && r.j.paid === 3000, 'الدفعة الثانية تسدّد الأقدم: المتبقي 2000');
      const rec = r.j.records.find(z => z.remaining > 0); r = await J('POST', `/api/archive/${rec.id}/payment`, B, { amount: 5000 }); ok(r.s === 200 && r.j.remaining === 0 && r.j.paid === 5000 && r.j.payments.length === 3, 'دفعة مباشرة تُقصّ عند المتبقي');
      r = await J('POST', `/api/archive/${rec.id}/payment`, B, { amount: 10 }); ok(r.s === 409, 'لا دفعة على سجل مسدَّد');
      r = await J('GET', '/api/archive?name=' + encodeURIComponent('مريض مالي'), B); ok(r.j.sum === 5000 && r.j.paidSum === 5000 && r.j.debt === 0, 'إجماليات الأرشيف: مستحق/محصَّل/متبقٍ'); }

    console.log('إدارة العلاجات والأسعار');
    { const D = (await J('POST', '/api/register', null, { clinicName: 'عيادة علاج', doctorName: 'د. ع', username: 'treatdoc', password: 'password7' })).j.token;
      r = await J('GET', '/api/state', D); ok(r.j.me.prices.treatments.length === 6 && r.j.me.prices.treatments[0] === 'قلع', 'القائمة الافتراضية 6 علاجات');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: ['قلع', 'تنظيف الجير', 'حشوة تجميلية'], list: { 'قلع': 1000, 'تنظيف الجير': { base: 2500 }, 'حشوة تجميلية': { front: 4000, molar: 6000 }, 'محذوف': 5 } });
      ok(r.s === 200 && r.j.treatments.join('|') === 'قلع|تنظيف الجير|حشوة تجميلية' && r.j.list['تنظيف الجير'].base === 2500 && r.j.list['حشوة تجميلية'].molar === 6000 && !r.j.list['محذوف'], 'إضافة علاجات مخصّصة وحذف الباقي مع أسعارها');
      r = await J('GET', '/api/state', D); ok(r.j.me.prices.treatments.length === 3 && r.j.me.prices.list['قلع'].base === 1000, 'التعديل يُحفظ ويُرجَع في الحالة');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: ['قلع', ' قلع '], list: {} }); ok(r.s === 400, 'رفض اسم مكرر');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: ['A', 'a'], list: {} }); ok(r.s === 400, 'رفض مكرر بلا حساسية للحالة');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: [], list: {} }); ok(r.s === 400, 'يجب بقاء علاج واحد على الأقل');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: ['x'.repeat(41)], list: {} }); ok(r.s === 400, 'رفض اسم أطول من 40');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: ['__proto__'], list: {} }); ok(r.s === 400, 'رفض اسم خطِر');
      r = await J('PUT', '/api/prices', D, { currency: 'دج', treatments: Array.from({ length: 31 }, (_, i) => 'علاج' + i), list: {} }); ok(r.s === 400, 'حدّ 30 علاجاً');
      r = await J('PUT', '/api/prices', D, { currency: '$', list: { 'قلع': 1200 } }); ok(r.s === 200 && r.j.treatments.length === 3 && r.j.list['قلع'].base === 1200, 'طلب بلا قائمة علاجات يُبقي القائمة الحالية');
      const tp = (await J('POST', '/api/patients', D, pat('مريض علاج'))).j; await J('POST', `/api/patients/${tp.id}/enter`, D);
      r = await J('POST', `/api/patients/${tp.id}/finish`, D, { treatment: 'حشوة تجميلية', price: 4000 }); ok(r.s === 200 && r.j.treatment === 'حشوة تجميلية', 'إنهاء المعاينة بعلاج مخصّص');
      r = await J('GET', '/api/archive?treatment=' + encodeURIComponent('حشوة'), D); ok(r.j.items.length === 1, 'فلترة الأرشيف بالعلاج المخصّص'); }

    console.log('إشعارات النظام (Web Push)');
    { /* عيادة جديدة نظيفة لهذا القسم */
      const A = (await J('POST', '/api/register', null, { clinicName: 'عيادة الدفع', doctorName: 'د. دفع', username: 'pushdoc', password: 'password9' })).j.token;
      const pc = (await J('GET', '/api/state', A)).j.me.code; await J('POST', '/api/nurses', A, { name: 'ممرضة', phone: '1', password: 'nurse999' });
      const N = (await J('POST', '/api/login/nurse', null, { code: pc, name: 'ممرضة', password: 'nurse999' })).j.token;
      const pk = (await J('GET', '/api/push/key', A)).j.key; ok(Buffer.from(pk, 'base64url').length === 65, 'مفتاح VAPID العام (65 بايت)');
      r = await J('GET', '/api/push/key'); ok(r.s === 401, 'المفتاح يتطلب تسجيل دخول');
      r = await J('POST', '/api/push/subscribe', A, { subscription: { endpoint: 'https://evil.example.com/x', keys: { p256dh: mkSub('/x').sub.keys.p256dh, auth: mkSub('/x').sub.keys.auth } } }); ok(r.s === 400, 'رفض نقطة نهاية خارج خدمات الدفع المعروفة');
      r = await J('POST', '/api/push/subscribe', A, { subscription: { endpoint: 'http://127.0.0.1:9/x', keys: mkSub('/x').sub.keys } }); ok(r.s === 400, 'رفض عنوان داخلي (SSRF)');
      r = await J('POST', '/api/push/subscribe', A, { subscription: { endpoint: mkSub('/x').sub.endpoint, keys: { p256dh: 'AAAA', auth: 'AAAA' } } }); ok(r.s === 400, 'رفض مفاتيح غير صالحة');
      const D = mkSub('/doctor'), NU = mkSub('/nurse');
      r = await J('POST', '/api/push/subscribe', A, { subscription: D.sub, lang: 'ar' }); ok(r.s === 200, 'اشتراك الطبيب');
      r = await J('POST', '/api/push/subscribe', N, { subscription: NU.sub, lang: 'en' }); ok(r.s === 200, 'اشتراك الممرضة');
      const got = async (p, n = 1) => { for (let i = 0; i < 40; i++) { const f = pushes.filter(z => z.url === p); if (f.length >= n) return f; await wait(50); } return []; };
      pushes.length = 0;
      const np = (await J('POST', '/api/patients', N, pat('مريض الدفع'))).j;
      let g = await got('/doctor'); ok(g.length === 1, 'الطبيب يستلم دفعاً عند تسجيل مريض');
      const m1 = decryptPush(g[0].body, D.e, D.auth); ok(m1.title.includes('مريض جديد') && m1.body.includes('مريض الدفع') && m1.urgent === true, 'الحمولة تُفكّ وتحوي اسم المريض (تشفير صحيح)');
      ok(g[0].headers.urgency === 'high' && g[0].headers['content-encoding'] === 'aes128gcm' && +g[0].headers.ttl > 0, 'أولوية عالية + aes128gcm + TTL');
      { const [, t64] = /t=([^,]+)/.exec(g[0].headers.authorization), [h, b2, sg] = t64.split('.'), pub = Buffer.from(pk, 'base64url');
        const key = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') }, format: 'jwk' });
        ok(crypto.verify('sha256', Buffer.from(h + '.' + b2), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(sg, 'base64url')) && JSON.parse(Buffer.from(b2, 'base64url')).aud === `http://127.0.0.1:${pushPort}`, 'توقيع VAPID (ES256) صحيح'); }
      await wait(200); ok(pushes.filter(z => z.url === '/nurse').length === 0, 'من قام بالفعل لا يستلم إشعاراً عن فعلته');
      r = await J('POST', `/api/patients/${np.id}/enter`, N); ok(r.s === 200, 'الممرضة تُدخل المريض');
      g = await got('/doctor', 2); ok(g.length === 2 && decryptPush(g[1].body, D.e, D.auth).type === 'enter', 'الطبيب يستلم دفعاً عند الدخول');
      r = await J('POST', `/api/patients/${np.id}/finish`, A, { treatment: 'استشارة', price: 0 }); ok(r.s === 200, 'الطبيب ينهي المعاينة');
      g = await got('/nurse'); ok(g.length === 1, 'الممرضة تستلم دفعاً عند انتهاء المعاينة'); const m2 = decryptPush(g[0].body, NU.e, NU.auth); ok(m2.title.includes('finished') && m2.body.includes('مريض الدفع'), 'نص الإشعار بلغة الممرضة (إنجليزي)');
      await wait(200); ok(pushes.filter(z => z.url === '/doctor').length === 2, 'الطبيب لا يستلم إشعار إنهائه');
      /* تخطي الدور */
      const q1 = (await J('POST', '/api/patients', N, pat('أول'))).j, q2 = (await J('POST', '/api/patients', N, pat('ثاني'))).j; await got('/doctor', 3);
      r = await J('POST', `/api/patients/${q2.id}/enter`, N); ok(r.s === 202, 'طلب تخطي'); let m3 = null;   // الرسائل قد تصل بترتيب مختلف: نبحث عن طلب التخطي بدل افتراض أنه الأخير
      for (let i = 0; i < 40 && !m3; i++) { g = await got('/doctor', 5); m3 = g.map(x => decryptPush(x.body, D.e, D.auth)).find(x => x.type === 'skip_request') || null; if (!m3) await wait(50); } ok(m3.type === 'skip_request' && m3.urgent && m3.body.includes('أول') && m3.body.includes('ثاني'), 'طلب التخطي يصل دفعاً عاجلاً بالاسمين');
      /* عزل العيادات */
      const before = pushes.length; await J('POST', '/api/patients', B, pat('عيادة ب')); await wait(300); ok(pushes.length === before, 'عيادة أخرى لا تُرسل ولا تستقبل إشعارات عيادة أ');
      /* حذف الاشتراك عند الخروج وعند 410 */
      r = await J('DELETE', '/api/push/subscribe', N); ok(r.s === 200, 'حذف اشتراك الممرضة'); const nb = pushes.length;
      await J('POST', `/api/patients/${q2.id}/skip`, A, { allow: false }); await wait(300); ok(pushes.length === nb, 'لا دفع بعد إلغاء الاشتراك');
      const GN = mkSub('/gone'); await J('POST', '/api/push/subscribe', N, { subscription: GN.sub }); await J('POST', `/api/patients/${q2.id}/skip`, A, { allow: false }); await got('/gone'); await wait(200);
      const gl = pushes.length; await J('POST', `/api/patients/${q2.id}/skip`, A, { allow: false }); await wait(300); ok(pushes.length === gl, 'اشتراك منتهٍ (410) يُحذف تلقائياً'); }

    console.log('الإحصائيات');
    { const SD = (await J('POST', '/api/register', null, { clinicName: 'عيادة إحصاء', doctorName: 'د. نور', username: 'stats1', password: 'password9' })).j.token;
      const SN = (await J('POST', '/api/nurses', SD, { name: 'ليلى', phone: '', password: 'nurse123' }), (await J('POST', '/api/login/nurse', null, { code: (await J('GET', '/api/state', SD)).j.me.code, name: 'ليلى', password: 'nurse123' })).j.token);
      let r = await J('GET', '/api/stats?tz=0', SD); ok(r.s === 200 && r.j.summary.visits === 0 && r.j.series.length >= 1, 'إحصائيات عيادة فارغة بلا أخطاء');
      const visit = async (tok, who, treat, teeth, price, paid, extra) => { const p0 = (await J('POST', '/api/patients', tok, pat(who, extra))).j; await J('POST', `/api/patients/${p0.id}/enter`, SD); return (await J('POST', `/api/patients/${p0.id}/finish`, SD, { treatment: treat, teeth, price, paid, followUp: false, notes: '' })); };
      await visit(SD, 'سمير', 'قلع', ['16', '17'], 5000, 5000);
      await visit(SN, 'منى', 'علاج عصب', ['36'], 8000, 3000, { gender: 'أنثى', birthYear: 2015 });
      await visit(SD, 'سمير', 'استشارة', [], 1000, 0, { tooth: 'غير محدد' });
      await visit(SN, 'كريم', 'قلع', ['55'], 4000, 4000, { birthYear: 2018 });
      r = await J('GET', '/api/stats?tz=0', SD); const d = r.j;
      ok(r.s === 200 && d.summary.visits === 4 && d.summary.patients === 3, 'عدد الزيارات 4 والمرضى المختلفون 3');
      ok(d.summary.billed === 18000 && d.summary.collected === 12000 && d.summary.outstanding === 6000, 'المستحق 18000 / المحصَّل 12000 / المتبقي 6000');
      ok(d.treatments.find(x => x.name === 'قلع').visits === 2 && d.treatments[0].name === 'قلع', 'توزيع العلاجات مرتّب بالأكثر');
      ok(d.gender['أنثى'].visits === 1 && d.gender['ذكر'].visits === 3, 'توزيع الجنس');
      ok(d.teeth.perTooth['16'] === 1 && d.teeth.total === 4 && d.teeth.dentition.primary === 1 && d.teeth.jaw.upper === 3 && d.teeth.jaw.lower === 1 && d.teeth.none === 1, 'خريطة الأسنان: دائمة/لبنية/فك/زيارات بلا سن');
      ok(d.debt.total === 6000 && d.debt.count === 2 && d.debt.top[0].name === 'منى', 'الديون: الإجمالي وأكبر مدين');
      ok(d.patients.new === 3 && d.patients.returning === 0 && d.patients.freq[1] === 1, 'مرضى جدد وتكرار الزيارة');
      ok(d.registrars.find(x => x.role === 'nurse' && x.name === 'ليلى').n === 2 && d.registrars.find(x => x.role === 'doctor').n === 2, 'من سجّل المرضى (ممرضة باسمها / طبيب)');
      ok(d.hours.reduce((x, y) => x + y, 0) === 4 && d.heat.flat().reduce((x, y) => x + y, 0) === 4 && d.today.finished === 4, 'الساعات والخريطة الحرارية ولمحة اليوم');
      ok(d.series.reduce((x, y) => x + y.visits, 0) === 4 && d.series.reduce((x, y) => x + y.collected, 0) === 12000, 'السلسلة الزمنية تطابق المجاميع');
      const day = new Date().toISOString().slice(0, 10);
      r = await J('GET', `/api/stats?from=${day}&to=${day}&tz=0`, SD); ok(r.j.summary.visits === 4 && r.j.prev && r.j.prev.visits === 0, 'نطاق اليوم + فترة سابقة للمقارنة');
      r = await J('GET', '/api/stats?from=2001-01-01&to=2001-01-31&tz=0', SD); ok(r.j.summary.visits === 0 && r.j.series.length === 31 && r.j.debt.total === 6000, 'نطاق فارغ: أيام بلا زيارات، والديون كلية');
      r = await J('GET', '/api/stats?from=2020-01-01&tz=0', SD); ok(r.j.range.gran === 'month' && r.j.series.length > 60, 'نطاق طويل يُجمَّع شهرياً');
      const pay = (await J('GET', '/api/archive?limit=50', SD)).j.items.find(x => x.name === 'منى'); await J('POST', `/api/archive/${pay.id}/payment`, SD, { amount: 5000 });
      r = await J('GET', '/api/stats?tz=0', SD); ok(r.j.summary.collected === 17000 && r.j.debt.total === 1000 && r.j.debt.count === 1, 'دفعة لاحقة تُحتسب في المحصَّل وتُنقص الديون');
      r = await J('GET', '/api/stats', SN); ok(r.s === 403, 'الممرضة لا تصل للإحصائيات');
      r = await J('GET', '/api/stats'); ok(r.s === 401, 'بلا دخول: مرفوض');
      const SD2 = (await J('POST', '/api/register', null, { clinicName: 'عيادة أخرى', doctorName: 'د. هدى', username: 'stats2', password: 'password9' })).j.token;
      { const q = (await J('POST', '/api/patients', SD2, pat('وحيد'))).j; await J('POST', `/api/patients/${q.id}/enter`, SD2); await J('POST', `/api/patients/${q.id}/finish`, SD2, { treatment: 'قلع', teeth: ['11'], price: 700, paid: 0 }); }
      r = await J('GET', '/api/stats?tz=0', SD2); ok(r.s === 200 && r.j.summary.visits === 1 && r.j.debt.total === 700 && r.j.patients.unique === 1, 'عزل: عيادة أخرى ترى أرقامها فقط');
      r = await J('GET', '/api/stats?tz=0', SD); ok(r.j.summary.visits === 4 && r.j.debt.total === 1000, 'عزل: إحصائيات العيادة الأولى لم تتأثر');
      r = await J('GET', '/api/stats?from=zzz&to=%00&tz=abc', SD); ok(r.s === 200, 'مدخلات تواريخ فاسدة لا تُسقط الخادم'); }

    console.log('الوصفات الطبية');
    { const RD = (await J('POST', '/api/register', null, { clinicName: 'عيادة وصفات', doctorName: 'د. وصفة', username: 'rxdoc1', password: 'password9' })).j.token;
      const RD2 = (await J('POST', '/api/register', null, { clinicName: 'عيادة وصفات 2', doctorName: 'د. ثانٍ', username: 'rxdoc2', password: 'password9' })).j.token;
      const RN = (await J('POST', '/api/nurses', RD, { name: 'سلمى', phone: '', password: 'nurse123' }), (await J('POST', '/api/login/nurse', null, { code: (await J('GET', '/api/state', RD)).j.me.code, name: 'سلمى', password: 'nurse123' })).j.token);
      let r = await J('GET', '/api/rx', RD); ok(r.s === 200 && Array.isArray(r.j.basket) && r.j.basket.length === 0 && r.j.drugs.length === 0, 'سلة وقاعدة أدوية فارغتان في البداية');
      r = await J('GET', '/api/rx', RN); ok(r.s === 403, 'الممرضة لا ترى السلة'); r = await J('PUT', '/api/rx/basket', RN, { items: [{ name: 'x' }] }); ok(r.s === 403, 'الممرضة لا تعدّل السلة');
      r = await J('GET', '/api/rx'); ok(r.s === 401, 'بلا دخول: مرفوض');
      r = await J('PUT', '/api/rx/basket', RD, { items: [{ name: ' Amoxicilline ', form: 'gél 500 mg', dose: '1 gél', freq: '3 fois/j', dur: '7 j' }, { name: 'amoxicilline', form: 'GÉL 500 MG' }, { name: 'Paracétamol', form: 'cp 1 g' }, { name: '' }, 5, null, { form: 'بلا اسم' }, { name: 'A'.repeat(500), form: 'f'.repeat(500), note: 'n'.repeat(500) }] });
      ok(r.s === 200 && r.j.length === 3, 'السلة: تُحذف المكررة والفارغة وغير الصالحة');
      ok(r.j[0].name === 'Amoxicilline' && r.j[0].dose === '1 gél' && /^[a-f0-9]{12}$/.test(r.j[0].id), 'السلة: تقليم الاسم + حفظ الجرعة الافتراضية + معرّف مولّد');
      ok(r.j[2].name.length === 120 && r.j[2].form.length === 160 && r.j[2].note.length === 200, 'السلة: حدود أطوال الحقول');
      const many = Array.from({ length: 150 }, (_, i) => ({ name: 'دواء' + i })); r = await J('PUT', '/api/rx/basket', RD, { items: many }); ok(r.s === 200 && r.j.length === 100, 'السلة: حدّ 100 دواء');
      r = await J('PUT', '/api/rx/basket', RD, { items: [{ name: 'Ibuprofène', form: 'cp 400 mg', dose: '1 cp', freq: '3 fois/j', dur: '3 j' }] }); const keepId = r.j[0].id;
      r = await J('PUT', '/api/rx/basket', RD, { items: [{ id: keepId, name: 'Ibuprofène', form: 'cp 400 mg', dose: '1 cp', freq: '2 fois/j', dur: '5 j' }] }); ok(r.j[0].id === keepId && r.j[0].freq === '2 fois/j', 'السلة: تحديث دواء موجود يُبقي معرّفه');
      r = await J('GET', '/api/rx', RD2); ok(r.j.basket.length === 0, 'عزل: سلة عيادة أخرى فارغة');
      r = await J('GET', '/api/rx', RD); ok(r.j.template === null, 'قالب الوصفة: افتراضي في البداية');
      r = await J('PUT', '/api/rx/template', RN, { clinic: 'x' }); ok(r.s === 403, 'الممرضة لا تعدّل قالب الوصفة');
      r = await J('PUT', '/api/rx/template', RD, { clinic: ' عيادة الأمل ', doctor: null, spec: 'جراحة الأسنان', phone: '0550 00 00 00', address: 'x'.repeat(400), logo: 'data:image/png;base64,iVBORw0KGgo=', lang: 'fr' });
      ok(r.s === 200 && r.j.clinic === 'عيادة الأمل' && r.j.doctor === null && r.j.phone === '0550 00 00 00' && r.j.address.length === 160 && r.j.lang === 'fr' && r.j.logo.startsWith('data:image/png'), 'قالب الوصفة: حفظ وتقليم');
      r = await J('PUT', '/api/rx/template', RD, { logo: 'data:text/html;base64,PHNjcmlwdD4=', lang: 'zz', clinic: 5 }); ok(r.j.logo === '' && r.j.lang === 'ar', 'قالب الوصفة: يرفض شعاراً غير صورة ولغة غير معروفة');
      r = await J('PUT', '/api/rx/template', RD, { clinic: 'عيادة الأمل', lang: 'en' }); r = await J('GET', '/api/rx', RD2); ok(r.j.template === null, 'عزل: قالب عيادة أخرى لم يتأثر');
      r = await J('PUT', '/api/rx/drugs', RD, { drugs: [['Foo', 'فو', 'Foobar, Foox', 'cp 10 mg; sirop', 'تجريبي'], { n: 'Bar', b: 'Barx', f: 'gél 5 mg' }, 'Baz', { name: '' }, 7, ['']] });
      ok(r.s === 200 && r.j.count === 3, 'استيراد أدوية: يُقبل الصالح فقط (3)');
      r = await J('GET', '/api/rx', RD); ok(r.j.drugs.length === 3 && r.j.drugs[0].length === 5 && r.j.drugs[1][0] === 'Bar' && r.j.drugs[1][2] === 'Barx' && r.j.drugs[2][0] === 'Baz', 'قاعدة الأدوية المستوردة تُحفظ بصيغة موحّدة');
      r = await J('GET', '/api/rx', RD2); ok(r.j.drugs.length === 0, 'عزل: قاعدة العيادة الأخرى لم تتأثر');
      r = await J('PUT', '/api/rx/drugs', RD, { drugs: Array.from({ length: 4500 }, (_, i) => ['D' + i, '', '', '', '']) }); ok(r.s === 200 && r.j.count === 4000, 'استيراد أدوية: حدّ 4000');
      r = await J('DELETE', '/api/rx/drugs', RD); ok(r.s === 200 && r.j.count === 0 && (await J('GET', '/api/rx', RD)).j.drugs.length === 0, 'حذف الأدوية المستوردة');

      const finishRx = async (name, rx, extra) => { const p0 = (await J('POST', '/api/patients', RD, pat(name, extra))).j; await J('POST', `/api/patients/${p0.id}/enter`, RD); return await J('POST', `/api/patients/${p0.id}/finish`, RD, { treatment: 'قلع', teeth: ['16'], price: 1000, paid: 1000, notes: '', rx }); };
      r = await finishRx('مريض وصفة', [{ name: ' Amoxicilline ', form: 'gél 500 mg', dose: '1 gél', freq: '3 fois/j', dur: '7 j', note: 'بعد الأكل' }, { name: 'Ibuprofène', form: 'cp 400 mg', dose: '1', freq: 'عند اللزوم', dur: '3 j' }, { name: '' }, 'x', null, { name: '<img src=x onerror=1>', form: '', dose: '', freq: '', dur: '', note: '' }]);
      ok(r.s === 200 && r.j.rx.length === 3 && r.j.rx[0].name === 'Amoxicilline' && r.j.rx[0].note === 'بعد الأكل', 'إنهاء المعاينة يحفظ الوصفة وينقّيها (3 أسطر صالحة)');
      const rxId = r.j.id; r = await J('GET', '/api/archive?limit=50', RD); const rec = r.j.items.find(x => x.id === rxId); ok(rec && rec.rx.length === 3 && rec.rx[1].freq === 'عند اللزوم', 'الأرشيف يعرض الوصفة المحفوظة');
      r = await J('GET', '/api/history?name=' + encodeURIComponent('مريض وصفة') + '&year=1990', RD); ok(r.s === 200 && r.j.records[0].rx.length === 3, 'سجل المريض يعرض الوصفة');
      r = await finishRx('بلا وصفة', undefined); ok(r.s === 200 && Array.isArray(r.j.rx) && r.j.rx.length === 0, 'زيارة بلا وصفة: مصفوفة فارغة');
      r = await finishRx('وصفة طويلة', Array.from({ length: 40 }, (_, i) => ({ name: 'دواء' + i }))); ok(r.j.rx.length === 25, 'وصفة: حدّ 25 سطراً');
      r = await J('GET', '/api/stats?tz=0', RD); ok(r.j.rx.prescriptions === 2 && r.j.rx.top[0].n >= 1 && r.j.rx.lines === 28, 'الإحصائيات: عدد الوصفات وأسطر الأدوية وأكثر الأدوية وصفاً');
      r = await J('GET', '/api/stats?tz=0', RD2); ok(r.j.rx.prescriptions === 0 && r.j.rx.top.length === 0, 'عزل: إحصائيات الأدوية لعيادة أخرى فارغة');
      /* نسخ احتياطي واستعادة */
      await J('PUT', '/api/rx/drugs', RD, { drugs: [['Foo', '', 'Foobar', 'cp 10 mg', '']] });
      const bk = await J('GET', '/api/backup', RD); ok(bk.s === 200 && Array.isArray(bk.j.rxBasket) && bk.j.rxBasket.length === 1 && bk.j.rxDrugs.length === 1, 'النسخة الاحتياطية تشمل السلة وقاعدة الأدوية');
      await J('PUT', '/api/rx/basket', RD, { items: [] }); await J('DELETE', '/api/rx/drugs', RD);
      r = await J('POST', '/api/restore', RD, bk.j); ok(r.s === 200, 'استعادة النسخة');
      r = await J('GET', '/api/rx', RD); ok(r.j.basket.length === 1 && r.j.basket[0].name === 'Ibuprofène' && r.j.drugs.length === 1, 'الاستعادة تعيد السلة وقاعدة الأدوية');
      r = await J('GET', '/api/archive?limit=50', RD); ok(r.j.items.find(x => x.name === 'مريض وصفة').rx.length === 3, 'الاستعادة تحفظ وصفات الأرشيف');
      const old = { ...bk.j }; delete old.rxBasket; delete old.rxDrugs; await J('POST', '/api/restore', RD, old); r = await J('GET', '/api/rx', RD); ok(r.j.basket.length === 1, 'استعادة نسخة قديمة (بلا سلة) لا تمسح السلة الحالية'); }

    console.log('الملفات الثابتة والأمان');
    for (const f of ['/', '/app.js', '/qr.js', '/style.css', '/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/t/abc123abc123abc123abc123']) { const x = await fetch(base + f); ok(x.status === 200, 'GET ' + f); }
    let x = await fetch(base + '/..%2fserver.js'); ok(x.status !== 200, 'منع تجاوز المسار');
    x = await fetch(base + '/%2e%2e/server.js'); ok(x.status !== 200, 'منع تجاوز المسار 2');
    x = await fetch(base + '/data/db.json'); ok(x.status === 404, 'قاعدة البيانات غير مكشوفة');
    ok((await fetch(base + '/')).headers.get('content-security-policy').includes("script-src 'self'"), 'سياسة CSP');
    console.log(`\nنجحت كل الاختبارات: ${pass}`);
  } catch (e) { console.error('\n✗ فشل:', e.message); process.exitCode = 1; }
  srv.on('exit', () => fs.rmSync(dir, { recursive: true, force: true })); srv.kill(); mock.close();
})();
