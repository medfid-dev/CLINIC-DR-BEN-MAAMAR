'use strict';
/* يخزّن هيكل التطبيق فقط. لا تُخزَّن أي بيانات مرضى ولا طلبات /api ولا صفحات التذاكر. */
const CACHE = 'cc-shell-v63';
const SHELL = ['/', '/style.css', '/app.js', '/sounds.js', '/stats.js', '/drugs.js', '/rx.js', '/rxlayout.js', '/numpad.js', '/autobackup.js', '/splash.js', '/icons/logo.png', '/qr.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/t/') || u.pathname.startsWith('/owner') || u.pathname.startsWith('/ticket')) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('/') : Response.error()))));
});

/* ---- إشعارات النظام (Web Push): تصل والتطبيق مغلق أو الشاشة مقفلة ---- */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const seen = list.find(c => c.visibilityState === 'visible');
    if (seen) { list.forEach(c => c.postMessage({ type: 'push', data: d })); return; }   // التطبيق أمام المستخدم: يتولّى الصوت والتنبيه داخلياً
    return self.registration.showNotification(d.title || 'عيادتي الذكية', {
      body: d.body || '', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: d.tag || 'cc', renotify: true, dir: 'auto',
      requireInteraction: !!d.urgent, vibrate: d.urgent ? [400, 150, 400, 150, 400] : [250, 100, 250], timestamp: Date.now(), data: { type: d.type }
    });
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(x => 'focus' in x); if (c) { c.postMessage({ type: 'push-open' }); return c.focus(); }
    return self.clients.openWindow('/');
  }));
});
