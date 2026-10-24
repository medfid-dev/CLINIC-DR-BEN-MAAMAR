'use strict';
/* لوحة أرقام بارزة: تظهر تلقائياً عند التركيز على أي حقل رقمي
   (type=number / type=tel / inputmode=numeric|decimal|tel) سواء كان في الصفحة أو في حوار، حتى لو وُلِّد لاحقاً.
   المفاتيح: 0-9 ، «00» ، «000» ، فاصلة عشرية (للحقول التي تقبل الكسور) ، «+» (للهاتف) ، حذف (ضغط مطوّل يكرّر) ، مسح ، تم.
   تمنع لوحة مفاتيح الجهاز عبر inputmode="none" وتعيد القيمة الأصلية عند الإغلاق. الكتابة بلوحة المفاتيح الفعلية تبقى تعمل.
   لإعفاء حقل: أضف data-nonumpad إليه أو إلى أي عنصر يحتويه. */
(function () {
  if (window.__numpad) return; window.__numpad = true;
  const D = document, root = D.documentElement;

  /* ---------- النصوص (ar / en) ---------- */
  try {
    if (typeof L === 'object' && L) {
      if (L.ar) Object.assign(L.ar, { np_done: 'تم', np_clear: 'مسح', np_back: 'حذف', np_aria: 'لوحة أرقام' });
      if (L.en) Object.assign(L.en, { np_done: 'Done', np_clear: 'Clear', np_back: 'Delete', np_aria: 'Number pad' });
    }
  } catch (e) {}
  const tx = (k, fb) => { try { const s = t(k); return s && s !== k ? s : fb; } catch (e) { return fb; } };

  /* ---------- أهلية الحقل ---------- */
  const SEL = 'input[type=number],input[type=tel],input[inputmode=numeric],input[inputmode=decimal],input[inputmode=tel]';
  const ok = i => !!i && i.tagName === 'INPUT' && !i.disabled && !i.readOnly && !(i.closest && i.closest('[data-nonumpad]')) && (i.matches(SEL) || i.hasAttribute('data-np-im'));
  const imOf = i => (i.hasAttribute('data-np-im') ? i.getAttribute('data-np-im') : (i.getAttribute('inputmode') || ''));
  const hook = i => { if (!i.hasAttribute('data-np-im')) i.setAttribute('data-np-im', i.getAttribute('inputmode') || ''); i.setAttribute('inputmode', 'none'); };
  const unhook = i => {
    if (!i.hasAttribute('data-np-im')) return;
    const v = i.getAttribute('data-np-im');
    if (v) i.setAttribute('inputmode', v); else i.removeAttribute('inputmode');
    i.removeAttribute('data-np-im');
  };
  const setVal = (i, v) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); if (d && d.set) d.set.call(i, v); else i.value = v; };

  /* ---------- الحالة ---------- */
  let el = null, cfg = null, buf = '', dirty = false, busy = false, rep = 0, watch = 0, pad = null, lbl = null, val = null, xk = null;

  function config(i) {
    const im = imOf(i), type = i.type, step = i.getAttribute('step');
    const tel = type === 'tel' || im === 'tel';
    const num = !tel;
    const decimal = num && (im === 'decimal' || (type === 'number' && !!step && (step === 'any' || !/^\d+$/.test(step))));
    return {
      tel, decimal, strip: type === 'number',                 // strip: منع الأصفار البادئة (05 → 5)
      group: decimal,                                         // فصل الآلاف في العرض للمبالغ فقط (لا للسنوات)
      ml: i.maxLength > 0 ? i.maxLength : (tel ? 30 : 12),
      max: parseFloat(i.max)
    };
  }

  function labelOf(i) {
    let s = '';
    if (i.id) { try { const l = D.querySelector('label[for="' + CSS.escape(i.id) + '"]'); if (l) s = l.textContent; } catch (e) {} }
    if (!s) {
      const l = i.closest('label');
      if (l) { const c = l.cloneNode(true); c.querySelectorAll('input,select,textarea,button').forEach(x => x.remove()); s = c.textContent; }
    }
    if (!s) { const g = i.closest('.form-group,.money-row'); const l = g && g.querySelector('label'); if (l) s = l.textContent; }
    if (!s) s = i.getAttribute('aria-label') || i.getAttribute('placeholder') || '';
    return s.replace(/[:：]\s*$/, '').replace(/\s+/g, ' ').trim();
  }

  const fmt = s => {
    if (!cfg || !cfg.group) return s;
    const p = s.split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (p.length > 1 ? '.' + p[1] : '');
  };

  /* ---------- بناء اللوحة ---------- */
  function build() {
    if (pad) return;
    const K = (k, cls, txt, aria) => `<button type="button" class="np-k ${cls || ''}" data-k="${k}"${aria ? ` aria-label="${aria}"` : ''}>${txt}</button>`;
    pad = D.createElement('div');
    pad.id = 'numpad'; pad.setAttribute('role', 'group');
    pad.innerHTML =
      `<div class="np-head"><span class="np-lbl"></span><output class="np-val" dir="ltr" aria-live="polite"></output></div>` +
      `<div class="np-grid" dir="ltr">` +
      K('7', '', '7') + K('8', '', '8') + K('9', '', '9') + K('back', 'fn', '⌫', '') +
      K('4', '', '4') + K('5', '', '5') + K('6', '', '6') + K('clear', 'fn', '') +
      K('1', '', '1') + K('2', '', '2') + K('3', '', '3') + K('x', 'fn np-x', '') +
      K('0', '', '0') + K('00', 'z', '00') + K('000', 'z', '000') + K('done', 'ok', '') +
      `</div>`;
    D.body.appendChild(pad);
    lbl = pad.querySelector('.np-lbl'); val = pad.querySelector('.np-val'); xk = pad.querySelector('.np-x');

    /* الضغط يُنفَّذ عند pointerdown لاستجابة فورية، ومنع التقاط التركيز يُبقي الحقل نشطاً */
    pad.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const b = e.target.closest('.np-k'); if (!b || b.disabled) return;
      hit(b);
      if (b.dataset.k === 'back') startRep();
    });
    pad.addEventListener('mousedown', e => e.preventDefault());
    pad.addEventListener('click', e => { const b = e.target.closest('.np-k'); if (b && !b.disabled && e.detail === 0) hit(b); });   // تفعيل بلوحة المفاتيح (Enter/Space)
    ['pointerup', 'pointercancel'].forEach(n => D.addEventListener(n, stopRep, true));
    D.addEventListener('visibilitychange', stopRep);
  }

  function labels() {
    pad.setAttribute('aria-label', tx('np_aria', 'لوحة أرقام'));
    const set = (k, txt, aria) => { const b = pad.querySelector('[data-k="' + k + '"]'); b.textContent = txt; if (aria) b.setAttribute('aria-label', aria); };
    set('clear', tx('np_clear', 'مسح'));
    set('done', tx('np_done', 'تم') + ' ✓');
    pad.querySelector('[data-k="back"]').setAttribute('aria-label', tx('np_back', 'حذف'));
  }

  /* ---------- إدخال المفاتيح ---------- */
  function addChar(c) {
    let s = buf;
    if (c === '.') { if (!cfg.decimal || s.includes('.')) return true; s = s === '' ? '0.' : s + '.'; }
    else if (c === '+') { if (!cfg.tel || s !== '') return true; s = '+'; }
    else { if (cfg.strip && s === '0') s = ''; s += c; }
    if (s.length > cfg.ml) return false;
    if (cfg.strip && !isNaN(cfg.max) && parseFloat(s) > cfg.max) return false;
    buf = s; return true;
  }

  function press(k) {
    if (!el) return;
    if (k === 'done') return finish();
    if (k === 'back') buf = buf.slice(0, -1);
    else if (k === 'clear') buf = '';
    else if (k === 'x') { if (cfg.decimal) addChar('.'); else if (cfg.tel) addChar('+'); }
    else { for (const c of k) { if (!addChar(c)) { shake(); break; } } }   // «00»/«000»: يُضاف ما يتسع له الحد
    apply();
  }

  function apply() {
    const v = (el.type === 'number' && buf.endsWith('.')) ? buf.slice(0, -1) : buf;   // الحقل الرقمي لا يقبل «5.» فنعرضها في اللوحة فقط
    if (el.value !== v) {
      busy = true; setVal(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); busy = false; dirty = true;
    }
    render();
  }

  function render() {
    if (!el) return;
    lbl.textContent = labelOf(el);
    const empty = buf === '';
    val.textContent = empty ? (el.getAttribute('placeholder') || '0') : fmt(buf);
    val.classList.toggle('np-ph', empty);
    const sym = cfg.decimal ? '.' : (cfg.tel ? '+' : '');
    xk.textContent = sym; xk.disabled = !sym; xk.classList.toggle('np-off', !sym);
  }

  function hit(b) {
    b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 110);
    try { if (navigator.vibrate) navigator.vibrate(7); } catch (e) {}
    press(b.dataset.k);
  }
  function shake() { val.classList.add('np-no'); setTimeout(() => val.classList.remove('np-no'), 280); }
  function startRep() { stopRep(); rep = setTimeout(function tick() { press('back'); rep = setTimeout(tick, 65); }, 420); }
  function stopRep() { clearTimeout(rep); rep = 0; }

  /* ---------- فتح / إغلاق ---------- */
  const setH = () => { if (pad) root.style.setProperty('--np-h', pad.offsetHeight + 'px'); };

  function reveal() {
    if (!el || !pad) return;
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    const limit = innerHeight - pad.offsetHeight - 14;
    let n = el.parentElement, guard = 0;
    while (n && n !== D.body && guard++ < 14) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) {
        const over = el.getBoundingClientRect().bottom - limit;
        if (over > 0) n.scrollTop += over + 6;
      }
      n = n.parentElement;
    }
  }

  function open(i) {
    if (el && el !== i) release();
    build();
    el = i; hook(i); cfg = config(i); buf = i.value || ''; dirty = false;
    labels(); render();
    D.body.classList.add('np-open'); pad.classList.add('on');
    setH(); setTimeout(reveal, 30); setTimeout(reveal, 280);
    clearInterval(watch);
    watch = setInterval(() => { if (!el || !el.isConnected || !el.getClientRects().length) close(); }, 500);   // الحقل اختفى (إغلاق حوار/إعادة رسم)
  }

  function release() {
    if (!el) return;
    const i = el; el = null; unhook(i);
    if (dirty) i.dispatchEvent(new Event('change', { bubbles: true }));
    dirty = false;
  }

  function close() {
    release(); stopRep(); clearInterval(watch); watch = 0;
    if (pad) pad.classList.remove('on');
    D.body.classList.remove('np-open'); root.style.removeProperty('--np-h');
  }

  function finish() { const i = el; close(); if (i && i.isConnected) i.blur(); }

  /* ---------- ربط الأحداث (تفويض عام) ---------- */
  // قبل أن يمنح المتصفح التركيز نضبط inputmode كي لا تظهر لوحة الجهاز أصلاً
  D.addEventListener('pointerdown', e => { const i = e.target; if (ok(i)) hook(i); }, true);
  D.addEventListener('focusin', e => { const i = e.target; if (ok(i) && i !== el) open(i); }, true);
  D.addEventListener('focusout', e => {
    if (e.target !== el) return;
    setTimeout(() => {
      const a = D.activeElement;
      if (a && (ok(a) || (pad && pad.contains(a)))) return;   // انتقل إلى حقل رقمي آخر (يتولّاه focusin) أو إلى اللوحة
      close();
    }, 0);
  }, true);
  // حقل ما زال مركّزاً بعد إغلاق اللوحة بـ Esc: النقر عليه يعيد فتحها
  D.addEventListener('click', e => { const i = e.target; if (!el && ok(i) && D.activeElement === i) open(i); }, true);
  // الكتابة بلوحة المفاتيح الفعلية: نُزامن ما في اللوحة
  D.addEventListener('input', e => { if (busy || !el || e.target !== el) return; buf = el.value; dirty = true; render(); }, true);
  D.addEventListener('keydown', e => { if (e.key === 'Escape' && el) close(); }, true);
  addEventListener('resize', () => { if (el) { setH(); reveal(); } });
  addEventListener('orientationchange', () => setTimeout(() => { if (el) { setH(); reveal(); } }, 250));
  // تغيّر اللغة يُحدّث نصوص اللوحة وهي مفتوحة
  new MutationObserver(() => { if (el && pad) { labels(); render(); } }).observe(root, { attributes: true, attributeFilter: ['lang', 'dir'] });
})();
