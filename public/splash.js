'use strict';
/* شاشة الافتتاح: تظهر مع الشعار وتختفي بعد تحميل الصفحة (حدّ أدنى لإكمال الأنيميشن) */
(function () {
  const s = document.getElementById('splash'); if (!s) return;
  try { const v = document.createElement('div'); v.textContent = 'v61'; v.style.cssText = 'position:fixed;bottom:10px;inset-inline:0;text-align:center;font:12px sans-serif;color:#999;z-index:1'; s.appendChild(v); } catch (e) {}
  let MIN = 2100; try { if (sessionStorage.getItem('sp')) MIN = 800; sessionStorage.setItem('sp', '1'); } catch (e) {}
  let done = false;
  const hide = () => { if (done) return; done = true; s.classList.add('out'); setTimeout(() => s.remove(), 800); };
  const go = () => setTimeout(hide, Math.max(0, MIN - performance.now()));
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
  setTimeout(hide, 7000);
})();
