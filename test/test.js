'use strict';
/* اختبار شامل: node test/test.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 4100 + Math.floor(Math.random() * 500), base = `http://127.0.0.1:${port}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dir }, stdio: 'inherit' });
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
    const dump = JSON.stringify(r.j); ok(!dump.includes('مريض1') && !dump.includes('مريض2') && !dump.includes('0550000000') && !dump.includes('1990') && !dump.includes('16'), 'التذكرة لا تكشف اسم/هاتف/سن أي مريض آخر');
    ok(Object.keys(r.j).sort().join() === 'ahead,busy,clinic,estMin,firstName,state,ticketNo,updated', 'حقول التذكرة محصورة');
    r = await J('GET', '/api/ticket/AAAAAAAAAAAAAAAAAAAAAAAA'); ok(r.s === 404, 'رمز تذكرة مجهول 404');
    r = await J('GET', '/api/ticket/../state'); ok(r.s === 401 || r.s === 404, 'لا ثغرة مسار في التذكرة');
    const tEv = []; const acT = await sse(`${base}/api/ticket/${t3}/stream`, (e, d) => tEv.push(d)); await wait(150);
    r = await J('POST', `/api/patients/${p1.id}/finish`, N, { treatment: 'قلع' }); ok(r.s === 403, 'الممرضة لا تنهي المعاينة');
    r = await J('POST', `/api/patients/${p1.id}/finish`, A, { treatment: 'قلع', notes: 'ملاحظة' }); ok(r.s === 200, 'إنهاء المعاينة');
    await wait(200); ok(tEv.length >= 2 && tEv[tEv.length - 1].state === 'waiting' && tEv[tEv.length - 1].ahead === 1, 'تذكرة 3 تتلقى تحديثاً فورياً عبر البث');
    ok(nEv.some(e => e[1].type === 'finish'), 'الممرضة تُبلَّغ بانتهاء المعاينة');
    r = await J('GET', `/api/ticket/${p1.ticket}`); ok(r.j.state === 'done', 'تذكرة المنتهي: done');
    r = await J('POST', `/api/patients/${p2.id}/enter`, N); ok(r.s === 200, 'الثاني يدخل بعد الإنهاء');
    r = await J('GET', `/api/ticket/${t2}`); ok(r.j.state === 'in', 'تذكرة 2: دورك الآن');
    r = await J('GET', '/api/archive?name=مريض1', A); ok(r.j.total === 1 && r.j.items[0].images.length === 1, 'البحث في الأرشيف');
    r = await J('GET', '/api/archive?name=مريض1', B); ok(r.j.total === 0, 'أرشيف ب فارغ');
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

    console.log('الملفات الثابتة والأمان');
    for (const f of ['/', '/app.js', '/qr.js', '/style.css', '/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/t/abc123abc123abc123abc123']) { const x = await fetch(base + f); ok(x.status === 200, 'GET ' + f); }
    let x = await fetch(base + '/..%2fserver.js'); ok(x.status !== 200, 'منع تجاوز المسار');
    x = await fetch(base + '/%2e%2e/server.js'); ok(x.status !== 200, 'منع تجاوز المسار 2');
    x = await fetch(base + '/data/db.json'); ok(x.status === 404, 'قاعدة البيانات غير مكشوفة');
    ok((await fetch(base + '/')).headers.get('content-security-policy').includes("script-src 'self'"), 'سياسة CSP');
    console.log(`\nنجحت كل الاختبارات: ${pass}`);
  } catch (e) { console.error('\n✗ فشل:', e.message); process.exitCode = 1; }
  srv.on('exit', () => fs.rmSync(dir, { recursive: true, force: true })); srv.kill();
})();
