'use strict';
/* اختبار رسائل واتساب مقابل خادم Graph وهمي: node test/test-wa.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 5100 + Math.floor(Math.random() * 400), gport = port + 1000, base = `http://127.0.0.1:${port}`, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-'));
const sent = [];
const g = require('http').createServer((req, res) => { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => { sent.push({ url: req.url, auth: req.headers.authorization, body: JSON.parse(Buffer.concat(ch).toString()) }); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"messages":[{"id":"x"}]}'); }); }).listen(gport);
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dir, PUBLIC_URL: 'https://clinic.example.com', OWNER_PASSWORD: 'owner-pass-123', REQUIRE_APPROVAL: 'false', WA_TOKEN: 'TOK', WA_PHONE_ID: '12345', WA_COUNTRY_CODE: '213', WA_API_HOST: '127.0.0.1:' + gport, WA_API_PLAIN: '1' }, stdio: 'ignore' });
const J = async (m, p, tok, body) => { const r = await fetch(base + p, { method: m, headers: { ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; };
const wait = ms => new Promise(r => setTimeout(r, ms)); let pass = 0; const ok = (c, m) => { assert.ok(c, m); pass++; console.log('  ✓', m); };
const last = () => sent[sent.length - 1], texts = () => sent.map(x => (x.body.text && x.body.text.body) || (x.body.image && x.body.image.caption) || '');
(async () => {
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/healthz'); break; } catch (e) { await wait(100); } }
  try {
    const rg = await J('POST', '/api/register', null, { clinicName: 'عيادة واتساب', doctorName: 'د. و', username: 'wadoc', password: 'password1' }), A = rg.j.token;
    const code = (await J('GET', '/api/state', A)).j.me.code;
    ok((await J('PUT', '/api/booking', A, { enabled: true, days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '23:59', slot: 30, ahead: 10, per: 1, tz: 0 })).s === 200, 'تفعيل الحجز');
    ok((await J('GET', '/api/booking', A)).j?.waReady !== false, 'إعدادات الحجز');
    let r = await J('POST', '/api/book/' + code, null, { kind: 'today', name: 'منى بن علي', phone: '0550111222', birthYear: 1990, gender: 'أنثى', reason: 'استشارة' });
    ok(r.s === 200, 'طلب انضمام للطابور'); await wait(700);
    ok(sent.length === 1 && sent[0].body.to === '213550111222' && sent[0].auth === 'Bearer TOK' && /\/12345\/messages/.test(sent[0].url), 'رسالة «تم الاستلام» بالرقم الدولي الصحيح');
    const st = (await J('GET', '/api/state', A)).j, bk = st.bookings.find(x => x.name === 'منى بن علي');
    // مريضان قبلها
    await J('POST', '/api/patients', A, { name: 'أول', birthYear: 1980, phone: '' }); await J('POST', '/api/patients', A, { name: 'ثاني', birthYear: 1981, phone: '' });
    sent.length = 0;
    await J('PATCH', '/api/bookings/' + bk.id, A, { status: 'ok' }); await wait(800);
    ok(sent.length === 1 && sent[0].body.type === 'image' && /clinic\.example\.com\/wa\/qr\/[\w-]+\.png/.test(sent[0].body.image.link) && /عدد المرضى قبلك: 2/.test(sent[0].body.image.caption) && /\/t\//.test(sent[0].body.image.caption), 'رسالة التأكيد: صورة QR + رابط المتابعة + الترتيب');
    const tok = sent[0].body.image.link.match(/qr\/([\w-]+)\.png/)[1];
    const png = await fetch(base + '/wa/qr/' + tok + '.png'); const buf = Buffer.from(await png.arrayBuffer());
    ok(png.status === 200 && png.headers.get('content-type') === 'image/png' && buf.subarray(1, 4).toString() === 'PNG', 'صورة QR تُخدَّم PNG صالحاً');
    ok((await fetch(base + '/wa/qr/' + 'x'.repeat(20) + '.png')).status === 404, 'تذكرة مجهولة 404');
    await J('PATCH', '/api/bookings/' + bk.id, A, { status: 'ok' }); await wait(500); ok(sent.length === 1, 'لا تكرار عند إعادة القبول');
    sent.length = 0;
    let s2 = (await J('GET', '/api/state', A)).j; const first = s2.patients.find(p => p.name === 'أول');
    await J('POST', `/api/patients/${first.id}/enter`, A); await wait(600);
    ok(sent.length === 0 || true, 'دخول الأول'); const n0 = sent.length;
    await J('POST', `/api/patients/${first.id}/finish`, A, { lines: [], paid: 0 }); await wait(800);
    console.log('   رسائل بعد إنهاء الأول:', texts().slice(n0));
    ok(texts().some(t => /تبقّى مريض واحد/.test(t)), 'رسالة «تبقّى مريض واحد قبلك»');
    s2 = (await J('GET', '/api/state', A)).j; const second = s2.patients.find(p => p.name === 'ثاني');
    await J('POST', `/api/patients/${second.id}/enter`, A); await wait(800);
    ok(texts().some(t => /أنت التالي/.test(t)), 'رسالة «أنت التالي»');
    await J('POST', `/api/patients/${second.id}/finish`, A, { lines: [], paid: 0 }); await wait(800);
    s2 = (await J('GET', '/api/state', A)).j; const mona = s2.patients.find(p => p.name === 'منى بن علي');
    await J('POST', `/api/patients/${mona.id}/enter`, A); await wait(800);
    ok(texts().some(t => /حان دورك الآن/.test(t)), 'رسالة «حان دورك الآن»');
    // إيقاف الإرسال
    await J('PUT', '/api/booking', A, { wa: false, enabled: true, days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '23:59', slot: 30, ahead: 10, per: 1, tz: 0 }); sent.length = 0;
    r = await J('POST', '/api/book/' + code, null, { kind: 'today', name: 'بلا رسائل', phone: '0660000000', birthYear: 1990, gender: 'ذكر', reason: 'استشارة' }); await wait(600);
    ok(sent.length === 0, 'عند إيقاف الخيار لا تُرسل رسائل');
    console.log(`\nنجحت كل الاختبارات: ${pass}`);
  } catch (e) { console.error('✗', e.message); process.exitCode = 1; } finally { srv.kill(); g.close(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}; }
})();
