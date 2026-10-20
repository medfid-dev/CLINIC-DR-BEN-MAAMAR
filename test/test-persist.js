'use strict';
/* اختبار الاستمرارية: يتأكد أن البيانات تنجو من إعادة تشغيل الخادم (بمحاكي MongoDB) — node test/test-persist.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 4700 + Math.floor(Math.random() * 200), base = `http://127.0.0.1:${port}`, file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fm-')), 'fake.json');
const wait = ms => new Promise(r => setTimeout(r, ms));
const start = () => spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, MONGODB_URI: 'mongodb://fake', FAKE_MONGO_FILE: file, NODE_PATH: path.join(__dirname, 'fake', 'node_modules') }, stdio: 'inherit' });
const J = async (m, p, tok, body, raw) => { const r = await fetch(base + p, { method: m, headers: { ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(raw ? { 'Content-Type': 'image/jpeg' } : body ? { 'Content-Type': 'application/json' } : {}) }, body: raw || (body ? JSON.stringify(body) : undefined) }); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; };
const up = async () => { for (let i = 0; i < 60; i++) { try { await fetch(base + '/healthz'); return; } catch (e) { await wait(100); } } throw new Error('server did not start'); };
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ✓', m); };
const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(100, 7)]);
const pat = { name: 'مريض دائم', birthYear: 1985, gender: 'ذكر', reason: 'حشو', tooth: '21', phone: '0551234567' };
(async () => {
  let srv = start(); await up();
  try {
    let r = await J('POST', '/api/register', null, { clinicName: 'عيادة', doctorName: 'د. و', username: 'doc', password: 'password1' }); const T = r.j.token;
    const code = (await J('GET', '/api/state', T)).j.me.code;
    await J('POST', '/api/nurses', T, { name: 'نور', password: 'nurse123' });
    const p1 = (await J('POST', '/api/patients', T, pat)).j, p2 = (await J('POST', '/api/patients', T, { ...pat, name: 'مريض ثان' })).j;
    await J('POST', `/api/patients/${p1.id}/enter`, T);
    const img = (await J('POST', `/api/patients/${p1.id}/images`, T, null, jpeg)).j.id;
    await J('POST', `/api/patients/${p1.id}/finish`, T, { treatment: 'حشو', notes: 'ملاحظة' });
    await wait(600); srv.kill('SIGTERM'); await wait(500);
    console.log('إعادة تشغيل الخادم'); srv = start(); await up();
    r = await J('GET', '/api/state', T); ok(r.s === 200 && r.j.patients.length === 1 && r.j.patients[0].name === 'مريض ثان', 'الجلسة والمريض المنتظر بقيا بعد إعادة التشغيل');
    r = await J('GET', '/api/archive', T); ok(r.j.total === 1 && r.j.items[0].notes === 'ملاحظة' && r.j.items[0].images[0] === img, 'الأرشيف بقي');
    const g = await fetch(`${base}/api/records/${p1.id}/images/${img}`, { headers: { Authorization: 'Bearer ' + T } }); ok(g.status === 200 && Buffer.from(await g.arrayBuffer()).equals(jpeg), 'الصورة بقيت وتطابق الأصل');
    r = await J('POST', '/api/login/nurse', null, { code, name: 'نور', password: 'nurse123' }); ok(r.s === 200, 'دخول الممرضة بعد إعادة التشغيل');
    r = await J('GET', `/api/ticket/${p2.ticket}`); ok(r.j.state === 'waiting', 'تذكرة المريض ما زالت تعمل');
    r = await J('POST', '/api/patients', T, { ...pat, name: 'ثالث' }); ok(r.j.ticketNo === 3, 'عدّاد التذاكر مستمر');
    const bk = await (await fetch(base + '/api/backup', { headers: { Authorization: 'Bearer ' + T } })).json(); ok(Object.keys(bk.images).length === 1, 'النسخة الاحتياطية تتضمن الصور');
    r = await J('DELETE', `/api/archive/${(await J('GET', '/api/archive', T)).j.items[0].id}`, T); ok(r.s === 200, 'حذف سجل أرشيف'); await wait(600);
    const db = JSON.parse(fs.readFileSync(file, 'utf8')); ok(Object.keys(db.archive).length === 0 && Object.keys(db.images).length === 0, 'الحذف انعكس في قاعدة البيانات (سجل + صورة)');
    r = await J('POST', '/api/clinic/wipe', T, { password: 'password1', account: true }); await wait(600);
    const db2 = JSON.parse(fs.readFileSync(file, 'utf8')); ok(Object.keys(db2.clinics).length === 0 && Object.keys(db2.sessions).length === 0 && Object.keys(db2.images).length === 0, 'حذف الحساب يمسح كل شيء من القاعدة');
    console.log(`\nنجحت اختبارات الاستمرارية: ${n}`);
  } catch (e) { console.error('✗ فشل:', e.message); process.exitCode = 1; }
  srv.kill();
})();
