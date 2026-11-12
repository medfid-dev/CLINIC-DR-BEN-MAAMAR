'use strict';
/* ربط واتساب من داخل التطبيق مقابل Graph وهمي: node test/test-wa-setup.js */
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const port = 5600 + Math.floor(Math.random() * 300), gport = port + 1000, base = `http://127.0.0.1:${port}`, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'was-'));
const log = [];
const g = require('http').createServer((req, res) => { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => {
  const raw = Buffer.concat(ch), u = req.url.split('?')[0]; let body = null; try { body = JSON.parse(raw.toString()); } catch (e) {} log.push({ m: req.method, u, auth: req.headers.authorization, body, len: raw.length });
  const out = j => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(j)); };
  if (req.headers.authorization !== 'Bearer GOODTOKEN_1234567890abcdef' && !/^OAuth/.test(req.headers.authorization || '')) { res.writeHead(401); return res.end('{"error":{"message":"bad token"}}'); }
  if (u === '/v21.0/999111/phone_numbers') return out({ data: [{ id: '555', display_phone_number: '+213 550 11 22 33', verified_name: 'عيادة' }, { id: '556', display_phone_number: '+213 661 00 00 00' }] });
  if (u === '/v21.0/debug_token') return out({ data: { app_id: '777' } });
  if (u === '/v21.0/777/uploads') return out({ id: 'upload:abc' });
  if (u === '/v21.0/upload:abc') return out({ h: 'HANDLE1' });
  if (u === '/v21.0/999111/message_templates' && req.method === 'POST') return out({ id: '1', status: 'PENDING' });
  if (u === '/v21.0/999111/message_templates') return out({ data: [{ name: 'clinic_notice_ar', status: 'APPROVED', language: 'ar' }, { name: 'clinic_ticket_ar', status: 'PENDING', language: 'ar' }] });
  if (u === '/v21.0/555') return out({ display_phone_number: '+213 550 11 22 33', verified_name: 'عيادة' });
  if (u === '/v21.0/555/messages') return out({ messages: [{ id: 'm' }] });
  res.writeHead(404); res.end('{"error":{"message":"nope"}}'); }); }).listen(gport);
const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dir, PUBLIC_URL: 'https://clinic.example.com', OWNER_PASSWORD: 'owner-pass-123', REQUIRE_APPROVAL: 'false', WA_API_HOST: '127.0.0.1:' + gport, WA_API_PLAIN: '1' }, stdio: 'ignore' });
const J = async (m, p, tok, body) => { const r = await fetch(base + p, { method: m, headers: { ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; };
const wait = ms => new Promise(r => setTimeout(r, ms)); let pass = 0; const ok = (c, m) => { assert.ok(c, m); pass++; console.log('  ✓', m); };
(async () => {
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/healthz'); break; } catch (e) { await wait(100); } }
  try {
    const A = (await J('POST', '/api/register', null, { clinicName: 'عيادة', doctorName: 'د', username: 'wasdoc', password: 'password1' })).j.token;
    let r = await J('GET', '/api/wa', A); ok(r.s === 200 && r.j.connected === false && r.j.hasToken === false, 'غير مرتبط في البداية');
    r = await J('PUT', '/api/wa', A, { number: '0550112233', wabaId: '999111', token: 'short' }); ok(r.s === 400, 'رفض رمز قصير');
    r = await J('PUT', '/api/wa', A, { number: '0550112233', wabaId: '999111', token: 'BADTOKEN_1234567890abcdefgh' }); ok(r.j.ok === false, 'رمز خاطئ يفشل الربط');
    r = await J('PUT', '/api/wa', A, { number: '0770000000', wabaId: '999111', token: 'GOODTOKEN_1234567890abcdef' }); ok(r.j.ok === false && r.j.error === 'number_not_found' && /550 11 22 33/.test(r.j.detail), 'رقم غير موجود يعرض الأرقام المتاحة');
    r = await J('PUT', '/api/wa', A, { number: '0550 11 22 33', wabaId: '999111', token: 'GOODTOKEN_1234567890abcdef' });
    ok(r.j.ok && r.j.connected && r.j.hasToken && r.j.number === '+213 550 11 22 33' && !JSON.stringify(r.j).includes('GOODTOKEN'), 'الربط يجد معرّف الرقم تلقائياً ولا يُرجع الرمز');
    r = await J('GET', '/api/wa', A); ok(!JSON.stringify(r.j).includes('GOODTOKEN') && r.j.connected, 'GET لا يكشف الرمز');
    log.length = 0; r = await J('POST', '/api/wa/templates', A);
    const posts = log.filter(x => x.m === 'POST' && x.u.endsWith('/message_templates'));
    ok(r.j.ok && posts.length === 2 && posts[0].body.name === 'clinic_notice_ar' && posts[1].body.name === 'clinic_ticket_ar' && posts[1].body.components[0].format === 'IMAGE' && posts[1].body.components[0].example.header_handle[0] === 'HANDLE1', 'إنشاء قالبين (إشعار + تذكرة برأس صورة)');
    ok(r.j.tplNotice === 'clinic_notice_ar' && r.j.tplTicket === 'clinic_ticket_ar' && r.j.tplImage === true, 'حُفظت أسماء القوالب');
    r = await J('GET', '/api/wa/status', A); ok(r.j.tplStatus.clinic_notice_ar === 'APPROVED' && r.j.tplStatus.clinic_ticket_ar === 'PENDING', 'حالة القوالب من Meta');
    log.length = 0; r = await J('POST', '/api/wa/test', A, { to: '0661000000' }); await wait(700);
    const msg = log.find(x => x.u === '/v21.0/555/messages');
    ok(r.j.ok && msg && msg.body.to === '213661000000' && msg.body.type === 'template' && msg.body.template.name === 'clinic_notice_ar', 'رسالة التجربة تُرسل بالقالب من الرقم المربوط');
    // حجز → رسالة بالقالب
    const code = (await J('GET', '/api/state', A)).j.me.code;
    await J('PUT', '/api/booking', A, { enabled: true, days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '23:59', slot: 30, ahead: 10, per: 1, tz: 0 }); log.length = 0;
    await J('POST', '/api/book/' + code, null, { kind: 'today', name: 'سمير', phone: '0555123456', birthYear: 1990, gender: 'ذكر', reason: 'استشارة' }); await wait(700);
    ok(log.some(x => x.u === '/v21.0/555/messages' && x.body.to === '213555123456'), 'الحجز يرسل عبر الإعداد المحفوظ (بلا متغيّرات بيئة)');
    // لا تتسرّب إلى النسخة الاحتياطية
    const bk = await fetch(base + '/api/backup', { headers: { Authorization: 'Bearer ' + A } }).then(x => x.text()).catch(() => ''); ok(!bk.includes('GOODTOKEN'), 'الرمز غير موجود في النسخة الاحتياطية');
    r = await J('DELETE', '/api/wa', A); ok(r.j.connected === false && !r.j.hasToken, 'فصل الربط');
    console.log(`\nنجحت كل الاختبارات: ${pass}`);
  } catch (e) { console.error('✗', e.message); process.exitCode = 1; } finally { srv.kill(); g.close(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();
