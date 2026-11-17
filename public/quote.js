/* ===== قسم «التسعير»: فاتورة تقدير كلفة العلاج قبل البدء =====
   مخطط أسنان يشبه الأسنان الحقيقية (تاج + جذور)، يُحدَّد السن ثم تُختار علاجاته من قائمة «الحصص والأسعار»،
   فتُحسب الكلفة الإجمالية فوراً (سعر كل سن حسب نوعه إن وُجدت أسعار حسب نوع السن). لا يُحفظ شيء في الأرشيف.
   يعتمد على app.js (t, L, S, $, $$, esc, money, treatList, treatLabel, priceFor, flatOf, defSessions, colOf, TEETH, ymd, ACT, toast, DENT). */
const Q = { set: 'adult', sel: new Map(), flat: new Set(), active: null, disc: 0, name: '' };

Object.assign(L.ar, {
  tab_quote_s: 'التسعير', q_title: '🧾 فاتورة تقدير الكلفة', q_hint: 'اضغط على السن الذي يحتاج علاجاً ثم اختر علاجاته؛ تُحسب الكلفة من قائمة الأسعار.',
  q_name_ph: 'اسم المريض (اختياري)', q_pick: 'السن {n} — اختر علاجاته:', q_pick_none: 'اضغط على سن من المخطط لاختيار علاجه', q_general: 'بنود عامة (تُحسب مرة واحدة)',
  q_col_tr: 'العلاج', q_col_teeth: 'الأسنان', q_col_sub: 'المبلغ', q_total: 'الكلفة الإجمالية', q_disc: 'خصم', q_net: 'الصافي بعد الخصم', q_empty: 'لم تُحدَّد علاجات بعد',
  q_print: '🖨️ طباعة الفاتورة', q_clear: 'مسح الكل', q_noprice: 'السعر غير محدّد في القائمة', q_sess: 'حصص', q_title_print: 'تقدير كلفة العلاج', q_note: 'هذا تقدير مبدئي قابل للتعديل حسب الحالة بعد الفحص.',
  q_perm: 'دائمة', q_prim: 'لبنية', q_teeth_n: 'سن', q_date: 'التاريخ', q_patient: 'المريض'
});
Object.assign(L.en, {
  tab_quote_s: 'Estimate', q_title: '🧾 Treatment cost estimate', q_hint: 'Tap a tooth that needs treatment, then pick its treatments; the cost comes from your price list.',
  q_name_ph: 'Patient name (optional)', q_pick: 'Tooth {n} — choose treatments:', q_pick_none: 'Tap a tooth on the chart to choose its treatment', q_general: 'General items (counted once)',
  q_col_tr: 'Treatment', q_col_teeth: 'Teeth', q_col_sub: 'Amount', q_total: 'Total cost', q_disc: 'Discount', q_net: 'Net after discount', q_empty: 'No treatments selected yet',
  q_print: '🖨️ Print estimate', q_clear: 'Clear all', q_noprice: 'No price set in the list', q_sess: 'sessions', q_title_print: 'Treatment cost estimate', q_note: 'This is a preliminary estimate and may change after examination.',
  q_perm: 'Permanent', q_prim: 'Primary', q_teeth_n: 'teeth', q_date: 'Date', q_patient: 'Patient'
});

/* ---- رسم السن: تاج + جذور (الأسنان العلوية جذورها للأعلى، والسفلية معكوسة) ---- */
function qShape(n) {
  const d = n % 10, q = Math.floor(n / 10), prim = q >= 5, up = q === 1 || q === 2 || q === 5 || q === 6;
  const kind = d <= 2 ? 'inc' : d === 3 ? 'can' : prim ? 'mol' : d <= 5 ? 'pre' : 'mol';
  let crown, roots, fis = '', sc = 1;
  if (kind === 'inc') { crown = 'M10 37 Q10 34 13 34 H27 Q30 34 30 37 L28 60 Q20 67 12 60 Z'; roots = 'M16 35 Q17 14 20 3 Q23 14 24 35 Z'; }
  else if (kind === 'can') { crown = 'M10 38 Q10 34 14 34 H26 Q30 34 30 38 L24 62 Q20 70 16 62 Z'; roots = 'M15 35 Q16 12 20 1 Q24 12 25 35 Z'; }
  else if (kind === 'pre') {
    crown = 'M8 38 Q8 34 12 34 H28 Q32 34 32 38 L30 56 Q27 64 23 60 Q20 57 17 60 Q13 64 10 56 Z';
    roots = up && d === 4 ? 'M12 35 Q12 16 15 6 Q19 16 19 35 Z M21 35 Q21 16 25 6 Q28 16 28 35 Z' : 'M15 35 Q16 14 20 3 Q24 14 25 35 Z'; fis = 'M14 42 Q20 50 26 42';
  } else {
    crown = 'M4 38 Q4 34 8 34 H32 Q36 34 36 38 L35 56 Q32 66 28 61 Q25 57 20 61 Q15 57 12 61 Q8 66 5 56 Z';
    roots = up ? 'M7 35 Q6 18 9 8 Q14 18 15 35 Z M17 35 Q18 16 20 6 Q22 16 23 35 Z M25 35 Q26 18 31 8 Q34 18 33 35 Z' : 'M7 35 Q6 16 11 5 Q17 16 18 35 Z M22 35 Q23 16 29 5 Q34 16 33 35 Z';
    fis = 'M10 42 Q20 52 30 42 M20 42 V54'; if (d === 8 && !prim) sc = .88;
  }
  return { up, crown, roots, fis, sc };
}
function qToothSVG(n, fill) {
  const s = qShape(n), tr = (s.up ? '' : 'translate(0,72) scale(1,-1) ') + (s.sc !== 1 ? `translate(${20 * (1 - s.sc)},${s.up ? 72 * (1 - s.sc) : 0}) scale(${s.sc})` : '');
  return `<svg viewBox="0 0 40 72" class="qsvg" aria-hidden="true"><g transform="${tr.trim()}"><path class="qroot" d="${s.roots}"/><path class="qcrown" d="${s.crown}"${fill ? ` style="fill:${fill}"` : ''}/>${s.fis ? `<path class="qfis" d="${s.fis}"/>` : ''}</g></svg>`;
}

/* ---- الحساب ---- */
const qFlatTr = tr => flatOf(tr);
function qUnit(tr, n) { const p = priceFor(tr, n ? [String(n)] : []); return p.total === '' ? null : +p.total || 0; }
function qLines() {
  const out = [], all = treatList();
  for (const tr of all) {
    if (qFlatTr(tr)) { if (Q.flat.has(tr)) { const u = qUnit(tr, null); out.push({ tr, teeth: [], sub: u || 0, noPrice: u === null }); } continue; }
    const teeth = [...Q.sel.keys()].filter(n => Q.sel.get(n).has(tr)).sort((a, b) => a - b);
    if (!teeth.length) continue;
    let sub = 0, noPrice = false; const per = teeth.map(n => { const u = qUnit(tr, n); if (u === null) noPrice = true; sub += u || 0; return { n, u }; });
    out.push({ tr, teeth: per, sub: Math.round(sub * 100) / 100, noPrice });
  }
  return out;
}
const qTotal = ls => Math.round(ls.reduce((x, l) => x + l.sub, 0) * 100) / 100;
const qNet = tot => Math.max(0, Math.round((tot - (+Q.disc || 0)) * 100) / 100);

/* ---- العرض ---- */
function qChartHTML(ro) {
  const set = TEETH[Q.set], row = (arr, up) => arr.map((n, i) => {
    const trs = Q.sel.get(String(n)), first = trs && treatList().find(x => trs.has(x)), fill = first ? (colOf(first).done || '#2e9e6b') : '',
      c = arr.length, d = Math.abs(i - (c - 1) / 2) / ((c - 1) / 2), ty = Math.round((1 - d * d) * 9) * (up ? 1 : -1);
    const inner = `${up ? `<span class="qn">${n}</span>` : ''}${qToothSVG(n, fill)}${up ? '' : `<span class="qn">${n}</span>`}${trs && trs.size ? `<i class="qb">${trs.size}</i>` : ''}`;
    return ro ? `<span class="qt ro${trs && trs.size ? ' has' : ''}" style="transform:translateY(${ty}px)">${inner}</span>`
      : `<button type="button" class="qt${trs && trs.size ? ' has' : ''}${Q.active === String(n) ? ' act' : ''}" style="transform:translateY(${ty}px)" data-act="qTooth" data-n="${n}" aria-label="${n}">${inner}</button>`;
  }).join('');
  return `<div class="qchart qc${set.up.length}"><div class="qrow">${row(set.up, true)}</div><div class="qmid"></div><div class="qrow">${row(set.lo, false)}</div></div>`;
}
function qPanelHTML() {
  const gen = treatList().filter(qFlatTr), per = treatList().filter(x => !qFlatTr(x)), a = Q.active, cur = a && Q.sel.get(a);
  const chip = (tr, on, act, extra) => { const u = qUnit(tr, extra); return `<button type="button" class="qchip${on ? ' on' : ''}" data-act="${act}" data-tr="${esc(tr)}" aria-pressed="${on}"><b>${esc(treatLabel(tr))}</b><span>${u === null ? '—' : esc(money(u))}</span></button>`; };
  return `<div class="qpick">${a ? `<div class="qpick-h">${esc(t('q_pick', { n: a }))}</div><div class="qchips">${per.map(tr => chip(tr, !!(cur && cur.has(tr)), 'qTr', a)).join('')}</div>` : `<div class="qpick-h qmuted">${esc(t('q_pick_none'))}</div>`}
    ${gen.length ? `<div class="qpick-h qgen">${esc(t('q_general'))}</div><div class="qchips">${gen.map(tr => chip(tr, Q.flat.has(tr), 'qFlat', null)).join('')}</div>` : ''}</div>`;
}
function qInvoiceHTML() {
  const ls = qLines(), tot = qTotal(ls);
  const rows = ls.map(l => `<tr><td><b>${esc(treatLabel(l.tr))}</b>${defSessions(l.tr) > 1 ? ` <small class="qmuted">(${defSessions(l.tr)} ${esc(t('q_sess'))})</small>` : ''}${l.noPrice ? `<div class="qwarn">⚠ ${esc(t('q_noprice'))}</div>` : ''}</td><td>${l.teeth.length ? l.teeth.map(z => `<span class="qtag">${z.n}${z.u != null && l.teeth.some(y => y.u !== z.u) ? ` <small>${esc(money(z.u))}</small>` : ''}</span>`).join('') : '—'}</td><td class="qnum">${esc(money(l.sub) || '0')}</td></tr>`).join('');
  return ls.length ? `<table class="qtable"><thead><tr><th>${esc(t('q_col_tr'))}</th><th>${esc(t('q_col_teeth'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="qtotals"><div class="qtot"><span>${esc(t('q_total'))}</span><b id="qTot">${esc(money(tot) || '0')}</b></div>
      <label class="qdisc"><span>${esc(t('q_disc'))}</span><input type="number" min="0" step="any" inputmode="decimal" id="qDisc" value="${Q.disc || ''}" placeholder="0"></label>
      <div class="qtot qnet"><span>${esc(t('q_net'))}</span><b id="qNet">${esc(money(qNet(tot)) || '0')}</b></div></div>` : `<div class="qmuted qempty">${esc(t('q_empty'))}</div>`;
}
function qRender() {
  const box = $('#quoteArea'); if (!box) return;
  if (!box.dataset.init) {
    box.dataset.init = '1';
    box.innerHTML = `<h4 class="q-title">${esc(t('q_title'))}</h4><div class="hint">${esc(t('q_hint'))}</div>
      <div class="q-top"><input type="text" id="qName" maxlength="80" placeholder="${esc(t('q_name_ph'))}" value="${esc(Q.name)}"><div class="teeth-switch" id="qSwitch"></div></div>
      <div id="qChart"></div><div id="qPanel"></div><div id="qInv"></div>
      <div class="q-actions"><button type="button" class="btn-primary" data-act="qPrint">${esc(t('q_print'))}</button><button type="button" class="btn-action btn-red" data-act="qClear">${esc(t('q_clear'))}</button></div>`;
    box.addEventListener('input', e => {
      if (e.target.id === 'qName') Q.name = e.target.value;
      else if (e.target.id === 'qDisc') { Q.disc = Math.max(0, +e.target.value || 0); const tot = qTotal(qLines()); $('#qNet').textContent = money(qNet(tot)) || '0'; }
    });
  }
  $('#qSwitch').innerHTML = `<button type="button" data-act="qSet" data-v="adult" class="${Q.set === 'adult' ? 'on' : ''}">${esc(t('q_perm'))}</button><button type="button" data-act="qSet" data-v="child" class="${Q.set === 'child' ? 'on' : ''}">${esc(t('q_prim'))}</button>`;
  $('#qChart').innerHTML = qChartHTML(false); $('#qPanel').innerHTML = qPanelHTML(); $('#qInv').innerHTML = qInvoiceHTML();
}
function qPrintHTML() {
  const ls = qLines(), tot = qTotal(ls), disc = +Q.disc || 0, me = S.me || {};
  return `<div class="qp" dir="${settings.lang === 'en' ? 'ltr' : 'rtl'}"><div class="qp-head"><div class="qp-clinic">${esc(me.clinicName || '')}</div>${me.role === 'doctor' && me.name ? `<div>${esc(t('hero_doc', { n: me.name }))}</div>` : ''}</div>
    <h2>${esc(t('q_title_print'))}</h2><div class="qp-meta"><span>${esc(t('q_date'))}: <b>${esc(ymd(Date.now()))}</b></span>${Q.name.trim() ? `<span>${esc(t('q_patient'))}: <b>${esc(Q.name.trim())}</b></span>` : ''}</div>
    ${qChartHTML(true)}
    <table class="qtable"><thead><tr><th>${esc(t('q_col_tr'))}</th><th>${esc(t('q_col_teeth'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${ls.map(l => `<tr><td><b>${esc(treatLabel(l.tr))}</b></td><td>${l.teeth.length ? l.teeth.map(z => z.n).join(' · ') : '—'}</td><td class="qnum">${esc(money(l.sub) || '0')}</td></tr>`).join('')}</tbody></table>
    <div class="qp-tot"><div><span>${esc(t('q_total'))}</span><b>${esc(money(tot) || '0')}</b></div>${disc ? `<div><span>${esc(t('q_disc'))}</span><b>${esc(money(disc))}</b></div><div class="qnet"><span>${esc(t('q_net'))}</span><b>${esc(money(qNet(tot)))}</b></div>` : ''}</div>
    <p class="qp-note">${esc(t('q_note'))}</p></div>`;
}

Object.assign(ACT, {
  qTooth(el) { const n = el.dataset.n; Q.active = Q.active === n ? null : n; if (Q.active && !Q.sel.has(n)) Q.sel.set(n, new Set()); qRender(); },
  qTr(el) { const n = Q.active; if (!n) return; const s = Q.sel.get(n) || new Set(); if (s.has(el.dataset.tr)) s.delete(el.dataset.tr); else s.add(el.dataset.tr); if (s.size) Q.sel.set(n, s); else Q.sel.delete(n); qRender(); },
  qFlat(el) { const tr = el.dataset.tr; if (Q.flat.has(tr)) Q.flat.delete(tr); else Q.flat.add(tr); qRender(); },
  qSet(el) { if (Q.set === el.dataset.v) return; Q.set = el.dataset.v; Q.active = null; Q.sel.clear(); qRender(); },
  qClear() { Q.sel.clear(); Q.flat.clear(); Q.active = null; Q.disc = 0; qRender(); },
  qPrint() {
    if (!qLines().length) return toast(t('q_empty'), 'info');
    let box = $('#quotePrint'); if (!box) { box = document.createElement('div'); box.id = 'quotePrint'; document.body.appendChild(box); }
    box.innerHTML = qPrintHTML(); document.body.classList.add('print-quote');
    const done = () => { document.body.classList.remove('print-quote'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
  }
});
