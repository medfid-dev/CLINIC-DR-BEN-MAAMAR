'use strict';
/* مهام «اتصل بالمرضى»: node test/test-calls.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 6100 + Math.floor(Math.random() * 300), base = `http://127.0.0.1:${port}`, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-'));
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dir, OWNER_PASSWORD: 'owner-pass-123', REQUIRE_APPROVAL: 'false' }, stdio: 'ignore' });
const J = async (m, p, tok, body) => { const r = await fetch(base + p, { method: m, headers: { ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; };
const wait = ms => new Promise(r => setTimeout(r, ms)); let pass = 0; const ok = (c, m) => { assert.ok(c, m); pass++; console.log('  ✓', m); };
(async () => {
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/healthz'); break; } catch (e) { await wait(100); } }
  try {
    const A = (await J('POST', '/api/register', null, { clinicName: 'ع', doctorName: 'د', username: 'tcdoc', password: 'password1' })).j.token, code = (await J('GET', '/api/state', A)).j.me.code;
    await J('POST', '/api/nurses', A, { name: 'نورة', phone: '0771', password: 'nurse123' });
    const N = (await J('POST', '/api/login/nurse', null, { code, name: 'نورة', password: 'nurse123' })).j.token;
    let r = await J('POST', '/api/tasks', A, { text: '', calls: [] }); ok(r.s === 400, 'مهمة بلا نص ولا أرقام مرفوضة');
    r = await J('POST', '/api/tasks', A, { text: '', calls: [{ name: 'منى', phone: '0550 11 22 33' }, { name: 'تكرار', phone: '0550112233' }, { name: 'سيّئ', phone: 'abc' }, { name: '', phone: '0661000000' }, { name: 'علي', phone: '+213 661 00 00 00' }] });
    ok(r.s === 201, 'مهمة أرقام بلا نص تُقبل');
    r = await J('GET', '/api/state', N); const k = r.j.tasks[0];
    ok(k.text.includes('اتصل') && k.calls.length === 2 && k.calls[0].name === 'منى' && k.calls[1].phone === '+213 661 00 00 00', 'الممرضة ترى الأسماء والأرقام الصالحة بلا تكرار');
    r = await J('POST', '/api/tasks', A, { text: 'عادي' }); r = await J('GET', '/api/state', N); ok(!('calls' in r.j.tasks.find(x => x.text === 'عادي')), 'المهمة العادية بلا حقل أرقام');
    console.log(`\nنجحت كل الاختبارات: ${pass}`);
  } catch (e) { console.error('✗', e.message); process.exitCode = 1; } finally { srv.kill(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();
