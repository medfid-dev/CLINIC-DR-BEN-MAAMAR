'use strict';
/* Web Push (RFC 8030 + VAPID RFC 8292 + تشفير aes128gcm RFC 8291) — بدون أي اعتماديات خارجية.
   يوصل التنبيه إلى الجهاز عبر خدمة الإشعارات في النظام (FCM / Apple / Mozilla) حتى لو كان التطبيق مغلقاً أو الشاشة مقفلة. */
const crypto = require('crypto'), fs = require('fs'), path = require('path');

const b64u = b => Buffer.from(b).toString('base64url');
const fromB64u = s => Buffer.from(String(s), 'base64url');

/* خدمات الدفع المعروفة فقط (حماية من استخدام الخادم لطلبات إلى عناوين داخلية — SSRF) */
const PUSH_HOSTS = [/(^|\.)googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/, /(^|\.)push\.microsoft\.com$/];

function create({ dataDir, subject, extraHosts }) {
  const keyFile = path.join(dataDir, 'vapid.json');
  let jwk;
  try { jwk = JSON.parse(fs.readFileSync(keyFile, 'utf8')); } catch (e) { jwk = null; }
  if (!jwk || !jwk.d) {
    const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    jwk = privateKey.export({ format: 'jwk' });
    fs.writeFileSync(keyFile, JSON.stringify(jwk), { mode: 0o600 });
  }
  const privKey = crypto.createPrivateKey({ key: jwk, format: 'jwk' });
  const publicKey = b64u(Buffer.concat([Buffer.from([4]), fromB64u(jwk.x), fromB64u(jwk.y)]));   // 65 بايت غير مضغوط
  const extra = new Set((extraHosts || []).map(s => s.trim()).filter(Boolean));

  function endpointOk(u) {
    let x; try { x = new URL(u); } catch (e) { return false; }
    if (u.length > 1000) return false;
    if (extra.has(x.host)) return x.protocol === 'https:' || x.protocol === 'http:';
    return x.protocol === 'https:' && !x.port && PUSH_HOSTS.some(r => r.test(x.hostname));
  }
  function validSub(s) {
    if (!s || typeof s !== 'object' || typeof s.endpoint !== 'string' || !endpointOk(s.endpoint) || !s.keys) return null;
    const p = fromB64u(s.keys.p256dh || ''), a = fromB64u(s.keys.auth || '');
    if (p.length !== 65 || p[0] !== 4 || a.length !== 16) return null;
    try { const t = crypto.createECDH('prime256v1'); t.generateKeys(); t.computeSecret(p); } catch (e) { return null; }   // نقطة صالحة على المنحنى
    return { endpoint: s.endpoint, keys: { p256dh: b64u(p), auth: b64u(a) } };
  }

  function vapidHeader(endpoint) {
    const aud = new URL(endpoint).origin;
    const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' })), body = b64u(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }));
    const sig = crypto.sign('sha256', Buffer.from(head + '.' + body), { key: privKey, dsaEncoding: 'ieee-p1363' });
    return `vapid t=${head}.${body}.${b64u(sig)}, k=${publicKey}`;
  }

  function encrypt(sub, payload) {
    const uaPub = fromB64u(sub.keys.p256dh), auth = fromB64u(sub.keys.auth);
    const ecdh = crypto.createECDH('prime256v1'); ecdh.generateKeys();
    const asPub = ecdh.getPublicKey(), secret = ecdh.computeSecret(uaPub), salt = crypto.randomBytes(16);
    const hk = (ikm, s, info, n) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, n));
    const prk = hk(secret, auth, Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub]), 32);
    const cek = hk(prk, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hk(prk, salt, Buffer.from('Content-Encoding: nonce\0'), 12);
    const c = crypto.createCipheriv('aes-128-gcm', cek, nonce);
    const ct = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()]);
    const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
    return Buffer.concat([salt, rs, Buffer.from([asPub.length]), asPub, ct]);
  }

  /* يُرجع 'gone' إن انتهى الاشتراك (يُحذف)، 'ok'، أو 'error' */
  async function send(sub, data, opts = {}) {
    try {
      const r = await fetch(sub.endpoint, {
        method: 'POST', body: encrypt(sub, JSON.stringify(data)), signal: AbortSignal.timeout(10000), redirect: 'error',
        headers: { Authorization: vapidHeader(sub.endpoint), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: String(opts.ttl || 3600), Urgency: opts.urgency || 'high', ...(opts.topic ? { Topic: opts.topic } : {}) }
      });
      if (r.status === 404 || r.status === 410) return 'gone';
      return r.ok ? 'ok' : 'error';
    } catch (e) { return 'error'; }
  }
  return { publicKey, validSub, send, encrypt };
}
module.exports = { create };
