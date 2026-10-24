'use strict';
/* شاشة الافتتاح: تظهر مع الشعار وتختفي بعد تحميل الصفحة (حدّ أدنى لإكمال الأنيميشن) */
(function () {
  const s = document.getElementById('splash'); if (!s) return;
  let MIN = 2100; try { if (sessionStorage.getItem('sp')) MIN = 800; sessionStorage.setItem('sp', '1'); } catch (e) {}
  let done = false;
  const hide = () => { if (done) return; done = true; s.classList.add('out'); setTimeout(() => s.remove(), 800); };
  const go = () => setTimeout(hide, Math.max(0, MIN - performance.now()));
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
  setTimeout(hide, 7000);
})();
