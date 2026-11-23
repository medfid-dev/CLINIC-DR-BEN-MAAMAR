/* ===== قسم «التسعير»: فاتورة تقدير كلفة العلاج قبل البدء =====
   مخطط أسنان يشبه الأسنان الحقيقية (تاج + جذور)، يُحدَّد السن ثم تُختار علاجاته من قائمة «الحصص والأسعار»،
   فتُحسب الكلفة الإجمالية فوراً (سعر كل سن حسب نوعه إن وُجدت أسعار حسب نوع السن). لا يُحفظ شيء في الأرشيف.
   يعتمد على app.js (t, L, S, $, $$, esc, money, treatList, treatLabel, priceFor, flatOf, defSessions, colOf, TEETH, ymd, ACT, toast, DENT). */
const Q = { set: 'adult', sel: new Map(), flat: new Set(), act: new Set(), disc: 0, dtype: 'amt', inst: false, down: 0, n: 3, gap: 30, name: '' };

Object.assign(L.ar, {
  tab_quote_s: 'التسعير', q_title: '🧾 فاتورة تقدير الكلفة', q_hint: 'اضغط على سن أو عدة أسنان معاً ثم اختر العلاج لتطبيقه عليها كلها؛ تُحسب الكلفة من قائمة الأسعار.',
  q_name_ph: 'اسم المريض (اختياري)', q_pick: 'السن {n} — اختر علاجاته:', q_pick_none: 'اضغط على سن من المخطط لاختيار علاجه', q_general: 'بنود عامة (تُحسب مرة واحدة)',
  q_col_tr: 'العلاج', q_col_teeth: 'الأسنان', q_col_sub: 'المبلغ', q_total: 'الكلفة الإجمالية', q_disc: 'خصم', q_net: 'الصافي بعد الخصم', q_empty: 'لم تُحدَّد علاجات بعد',
  q_print: '🖨️ طباعة الفاتورة', q_clear: 'مسح الكل', q_noprice: 'السعر غير محدّد في القائمة', q_sess: 'حصص', q_title_print: 'تقدير كلفة العلاج', q_note: 'هذا تقدير مبدئي قابل للتعديل حسب الحالة بعد الفحص.',
  q_pct: '٪', q_amt: 'مبلغ', q_disc_amt: 'قيمة الخصم', q_inst: 'تقسيط الدفع', q_linst: 'قابل للتقسيط', q_now: 'تُدفع اليوم كاملة (علاجات غير مقسَّطة)', q_noinst: 'كل العلاجات المختارة غير قابلة للتقسيط: تُدفع كاملة اليوم', q_instpart: 'الجزء القابل للتقسيط', q_down: 'الدفعة الأولى (اليوم)', q_n: 'عدد الأقساط', q_gap: 'كل (يوم)', q_sched: 'جدول الأقساط', q_first: 'الدفعة الأولى', q_k: 'القسط {k}', q_date: 'التاريخ', q_each: '{n} أقساط', q_jaw_up: 'الفك العلوي', q_jaw_lo: 'الفك السفلي', q_right: 'يمين', q_left: 'يسار', q_remain: 'المتبقي للتقسيط',
  q_perm: 'دائمة', q_prim: 'لبنية', q_count: 'العدد', q_teeth_total: 'عدد الأسنان المحددة', q_sel_n: 'محدد: {n}', q_sel_up: 'كل العلوي', q_sel_lo: 'كل السفلي', q_sel_all: 'الكل', q_sel_none: 'إلغاء التحديد', q_pick_multi: 'الأسنان المحددة ({n}): {list} — اختر علاجاً لتطبيقه عليها كلها:', q_multi_hint: 'يمكنك تحديد عدة أسنان معاً ثم إضافة علاج واحد لها كلها.', q_teeth_n: 'سن', q_date: 'التاريخ', q_patient: 'المريض'
});
Object.assign(L.en, {
  tab_quote_s: 'Estimate', q_title: '🧾 Treatment cost estimate', q_hint: 'Tap a tooth that needs treatment, then pick its treatments; the cost comes from your price list.',
  q_name_ph: 'Patient name (optional)', q_pick: 'Tooth {n} — choose treatments:', q_pick_none: 'Tap a tooth on the chart to choose its treatment', q_general: 'General items (counted once)',
  q_col_tr: 'Treatment', q_col_teeth: 'Teeth', q_col_sub: 'Amount', q_total: 'Total cost', q_disc: 'Discount', q_net: 'Net after discount', q_empty: 'No treatments selected yet',
  q_print: '🖨️ Print estimate', q_clear: 'Clear all', q_noprice: 'No price set in the list', q_sess: 'sessions', q_title_print: 'Treatment cost estimate', q_note: 'This is a preliminary estimate and may change after examination.',
  q_pct: '%', q_amt: 'Amount', q_disc_amt: 'Discount value', q_inst: 'Pay in installments', q_linst: 'Installable', q_now: 'Paid in full today (non-installment treatments)', q_noinst: 'None of the selected treatments can be split: paid in full today', q_instpart: 'Installable part', q_down: 'Down payment (today)', q_n: 'Number of installments', q_gap: 'Every (days)', q_sched: 'Installment schedule', q_first: 'Down payment', q_k: 'Installment {k}', q_date: 'Date', q_each: '{n} installments', q_jaw_up: 'Upper jaw', q_jaw_lo: 'Lower jaw', q_right: 'Right', q_left: 'Left', q_remain: 'Left to split',
  q_perm: 'Permanent', q_prim: 'Primary', q_count: 'Qty', q_teeth_total: 'Teeth selected', q_sel_n: 'Selected: {n}', q_sel_up: 'All upper', q_sel_lo: 'All lower', q_sel_all: 'All', q_sel_none: 'Clear selection', q_pick_multi: 'Selected teeth ({n}): {list} — pick a treatment to apply to all of them:', q_multi_hint: 'Select several teeth together, then add one treatment to all of them.', q_teeth_n: 'teeth', q_date: 'Date', q_patient: 'Patient'
});

/* ---- مخطط القوس (منظر أمامي كابتسامة): الفك العلوي في الأعلى والسفلي أصغر داخله، وكل سن يميل نحو مركز القوس ---- */
function qKind(n) { const d = n % 10, q = Math.floor(n / 10), prim = q >= 5; return d <= 2 ? (d === 1 ? 'inc' : 'lat') : d === 3 ? 'can' : prim ? 'mol' : d <= 5 ? 'pre' : (d === 8 ? 'wis' : 'mol'); }
/* السن العلوي: الجذور للأعلى (y 2..36) والتاج تحتها؛ السفلي يُقلب عمودياً */
const Q_CROWN = { inc: [35, 40], lat: [30, 38], can: [33, 44], pre: [35, 36], mol: [40, 34], wis: [36, 32] };
/* جذر مخروطي ناعم: يتّسع عند العنق ويضيق نحو الذروة مع انحناء خفيف في ثلثه الأخير ينتهي بطرف مستدير؛ يعيد [الجذر، لمعته] */
function qRp(cx, bw, tip, lean, hl) {
  const b = 58, L = b - tip, tw = bw * .2, f = v => v.toFixed(1); lean = lean || 0;
  const path = (bw, tw, tip, lean) => `M${f(cx - bw)} ${b} C${f(cx - bw * .93)} ${f(b - L * .45)} ${f(cx - tw * 1.4 + lean * .55)} ${f(tip + L * .3)} ${f(cx - tw * .7 + lean)} ${f(tip + 4)} Q${f(cx + lean)} ${f(tip - 2)} ${f(cx + tw * .7 + lean)} ${f(tip + 4)} C${f(cx + tw * 1.4 + lean * .55)} ${f(tip + L * .3)} ${f(cx + bw * .93)} ${f(b - L * .45)} ${f(cx + bw)} ${b} Z`;
  return [path(bw, tw, tip, lean), path(bw * .36, tw * .4, tip + 8, lean * .8)];
}
function qRoots(n, up) {
  const k = qKind(n);
  if (k === 'inc') return [qRp(20, 11.5, 3, 2.4)];
  if (k === 'lat') return [qRp(20, 10, 4, -2.4)];
  if (k === 'can') return [qRp(20, 12, 0, 2.6)];
  if (k === 'pre') return [qRp(20, 11, 4, -2)];
  const trunk = 'M5 60 V44 H35 V60 Z';
  return up ? [trunk, qRp(11, 9.6, 12, -3), qRp(29, 9.6, 12, 3)] : [trunk, qRp(11, 9.2, 10, -3), qRp(29, 9.2, 10, 3)];
}
const Q_LOW_W = { inc: .72, lat: .78, can: .84, pre: .88, mol: .93, wis: .9 };   // الأسنان السفلية أضيق من العلوية
function qToothSVG(n, fill) {
  const k = qKind(n), q = Math.floor(n / 10), up = q === 1 || q === 2 || q === 5 || q === 6, [w, h] = Q_CROWN[k], sh = qToothPath(k, w, h), fis = qFis(k, w, h), sc = (n % 10 === 8 && q < 5) ? .9 : 1, fx = up ? 1 : Q_LOW_W[k];
  const crown = `<g transform="translate(20 ${(49 + h / 2).toFixed(1)})"><path d="${sh}" style="fill:${fill || '#ffffff'}"/><path d="${sh}" class="qen" fill="url(#qEnH)"/><path d="${sh}" class="qen" fill="url(#qEnV)"/>${fis ? `<path class="qfis" d="${fis}"/>` : ''}<ellipse class="qhl" cx="${(-w * .2).toFixed(1)}" cy="${(-h * .02).toFixed(1)}" rx="${(w * .06).toFixed(1)}" ry="${(h * .2).toFixed(1)}"/><path class="qcr" d="${sh}"/></g>`;
  const roots = qRoots(n, up).map(r => typeof r === 'string' ? `<path class="qroot" d="${r}"/>` : `<path class="qroot" d="${r[0]}"/><path class="qroot2" d="${r[0]}"/><path class="qroot3" d="${r[1]}"/>`).join('');
  const tf = [up ? '' : 'translate(0 98) scale(1 -1)', fx !== 1 ? `translate(20 0) scale(${fx} 1) translate(-20 0)` : '', sc !== 1 ? `translate(${20 * (1 - sc)} ${up ? 98 * (1 - sc) : 0}) scale(${sc})` : ''].filter(Boolean).join(' ');
  return `<svg viewBox="0 0 40 98" class="qsvg" aria-hidden="true"><g transform="${tf}">${roots}${crown}</g></svg>`;
}
function qToothPath(k, w, h) {
  /* تاج بشكل تشريحي (منظر أمامي): الحافة اللثوية (أعلى) محدّبة وأضيق، والقاطعة (أسفل) أعرض؛ القواطع حافة مستقيمة بزوايا مدوّرة،
     الناب بنتوء مدبّب، الضواحك بنتوءين، الأضراس بثلاثة نتوءات */
  const y = h / 2, c = -y, f = v => (v * w).toFixed(1);
  const side = (sx, cw, iw, ci) => `${sx < 0 ? 'L' : 'L'}`;   // (محفوظة للوضوح)
  if (k === 'can') return `M ${f(-.3)} ${c} Q 0 ${c - 7} ${f(.3)} ${c} Q ${f(.56)} ${-h * .06} ${f(.5)} ${h * .2} L ${f(.1)} ${y - 4} Q 0 ${y + 4} ${f(-.1)} ${y - 4} L ${f(-.5)} ${h * .2} Q ${f(-.56)} ${-h * .06} ${f(-.3)} ${c} Z`;
  if (k === 'pre') return `M ${f(-.32)} ${c} Q 0 ${c - 7} ${f(.32)} ${c} Q ${f(.56)} ${-h * .05} ${f(.5)} ${y - 16} Q ${f(.5)} ${y} ${f(.26)} ${y} Q 0 ${y + 4} ${f(-.26)} ${y} Q ${f(-.5)} ${y} ${f(-.5)} ${y - 16} Q ${f(-.56)} ${-h * .05} ${f(-.32)} ${c} Z`;
  if (k === 'mol' || k === 'wis') return `M ${f(-.36)} ${c} Q 0 ${c - 7} ${f(.36)} ${c} Q ${f(.56)} ${-h * .05} ${f(.5)} ${y - 12} Q ${f(.5)} ${y} ${f(.32)} ${y} Q ${f(.2)} ${y + 1} ${f(.1)} ${y - 5} Q 0 ${y - 9} ${f(-.1)} ${y - 5} Q ${f(-.2)} ${y + 1} ${f(-.32)} ${y} Q ${f(-.5)} ${y} ${f(-.5)} ${y - 12} Q ${f(-.56)} ${-h * .05} ${f(-.36)} ${c} Z`;
  const cw = k === 'inc' ? .36 : .32;   // قاطعة وسطى / جانبية
  return `M ${f(-cw)} ${c} Q 0 ${c - 7} ${f(cw)} ${c} Q ${f(.54)} ${-h * .05} ${f(.5)} ${y - 11} Q ${f(.49)} ${y} ${f(.38)} ${y} H ${f(-.38)} Q ${f(-.49)} ${y} ${f(-.5)} ${y - 11} Q ${f(-.54)} ${-h * .05} ${f(-cw)} ${c} Z`;
}
function qFis(k, w, h) { return k === 'mol' || k === 'wis' ? `M 0 ${-h * .32} Q ${w * .04} ${h * .05} 0 ${h * .3}` : k === 'inc' || k === 'lat' ? `M ${-w * .2} ${-h * .05} Q ${-w * .22} ${h * .2} ${-w * .2} ${h * .38}` : ''; }
/* ---- قابلية التقسيط لكل علاج: افتراضياً القلع وعلاج/قطع العصب والاستشارة تُدفع كاملة، والتركيبات (سيراميك، زيركون…) تُقسَّط؛ ويمكن تغييرها لكل علاج ويُحفظ الاختيار على هذا الجهاز ---- */
const Q_NOINST = /قلع|عصب|استشارة|extract|root|endo|consult/i, Q_INST_KEY = 'qInstOver';
let qInstOver = {}; try { qInstOver = JSON.parse(localStorage.getItem(Q_INST_KEY) || '{}') || {}; } catch (e) { qInstOver = {}; }
const qInstOf = tr => typeof qInstOver[tr] === 'boolean' ? qInstOver[tr] : !Q_NOINST.test(tr);
const r2q = v => Math.round(v * 100) / 100;
/* ---- الحساب ---- */
const qFlatTr = tr => flatOf(tr);
function qUnit(tr, n) { const p = priceFor(tr, n ? [String(n)] : []); return p.total === '' ? null : +p.total || 0; }
function qLines() {
  const out = [], all = treatList();
  for (const tr of all) {
    if (qFlatTr(tr)) { if (Q.flat.has(tr)) { const u = qUnit(tr, null); out.push({ tr, teeth: [], sub: u || 0, noPrice: u === null, inst: qInstOf(tr) }); } continue; }
    const teeth = [...Q.sel.keys()].filter(n => Q.sel.get(n).has(tr)).sort((a, b) => a - b);
    if (!teeth.length) continue;
    let sub = 0, noPrice = false; const per = teeth.map(n => { const u = qUnit(tr, n); if (u === null) noPrice = true; sub += u || 0; return { n, u }; });
    out.push({ tr, teeth: per, sub: Math.round(sub * 100) / 100, noPrice, inst: qInstOf(tr) });
  }
  return out;
}
const qTeethCount = () => [...Q.sel.keys()].filter(n => Q.sel.get(n).size).length;
const qTotal = ls => Math.round(ls.reduce((x, l) => x + l.sub, 0) * 100) / 100;
const qDiscAmt = tot => { const v = Math.max(0, +Q.disc || 0); return Math.round((Q.dtype === 'pct' ? tot * Math.min(100, v) / 100 : Math.min(v, tot)) * 100) / 100; };
const qNet = tot => Math.max(0, Math.round((tot - qDiscAmt(tot)) * 100) / 100);
/* جدول التقسيط: دفعة أولى اليوم ثم أقساط متساوية كل N يوماً (الفارق في القسط الأخير) */
function qSchedule() {
  if (!Q.inst) return null;
  const ls = qLines(), tot = qTotal(ls), net = qNet(tot), instSub = qTotal(ls.filter(l => l.inst)), instNet = tot > 0 ? Math.min(net, r2q(net * instSub / tot)) : 0, now = r2q(net - instNet);   // الخصم يُوزَّع بالتناسب على الجزء المقسَّط وغيره
  const down = Math.min(Math.max(0, +Q.down || 0), instNet), rem = r2q(instNet - down), n = Math.min(60, Math.max(1, Math.round(+Q.n) || 1)), gap = Math.min(365, Math.max(1, Math.round(+Q.gap) || 30));
  const base = Math.floor(rem / n), rows = []; let left = rem;
  if (now > 0) rows.push({ label: t('q_now'), at: Date.now(), amt: now });
  if (instNet <= 0) return { rows, down: 0, rem: 0, n: 0, gap, none: true, instNet };
  if (down > 0) rows.push({ label: t('q_first'), at: Date.now(), amt: down });
  for (let k = 1; k <= n && rem > 0; k++) { const amt = k === n ? r2q(left) : base; left = r2q(left - amt); rows.push({ label: t('q_k', { k }), at: Date.now() + k * gap * 864e5, amt }); }
  return { rows, down, rem, n, gap, instNet };
}
const qSchedHTML = () => { const s = qSchedule(); if (!s) return ''; if (s.none) return `<div class="qmuted qempty">${esc(t('q_noinst'))}</div>`; return `<table class="qtable qsched"><thead><tr><th>${esc(t('q_sched'))}</th><th>${esc(t('q_date'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${s.rows.map(r => `<tr><td>${esc(r.label)}</td><td>${esc(ymd(r.at))}</td><td class="qnum">${esc(money(r.amt) || '0')}</td></tr>`).join('')}</tbody></table>`; };
function qUpdateTotals() { const tot = qTotal(qLines()), net = qNet(tot), d = $('#qDiscAmt'), nt = $('#qNet'), sc = $('#qSched'); if (d) d.textContent = money(qDiscAmt(tot)) || '0'; if (nt) nt.textContent = money(net) || '0'; if (sc) sc.innerHTML = qSchedHTML(); }

/* ---- العرض ---- */
function qChartHTML(ro) {
  const set = TEETH[Q.set], defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="qEnH" cx=".42" cy=".5" r=".78"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#6f88b0" stop-opacity=".55"/></radialGradient><linearGradient id="qEnV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9bb84" stop-opacity=".9"/><stop offset=".32" stop-color="#f1e3c4" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#8aa3c6" stop-opacity=".5"/></linearGradient><linearGradient id="qRootV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a4d"/><stop offset=".55" stop-color="#d9b47a"/><stop offset="1" stop-color="#ead3a4"/></linearGradient><linearGradient id="qRootH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4620" stop-opacity=".55"/><stop offset=".32" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#6b4620" stop-opacity=".55"/></linearGradient></defs></svg>';
  const row = (arr, up) => arr.map((n, i) => {
    const trs = Q.sel.get(String(n)), has = trs && trs.size, first = has && treatList().find(x => trs.has(x)), fill = first ? (colOf(first).done || '#2e9e6b') : '',
      c = arr.length, dd = Math.abs(i - (c - 1) / 2) / ((c - 1) / 2), ty = Math.round((1 - dd * dd) * 9) * (up ? 1 : -1);
    const inner = `${up ? `<span class="qn">${n}</span>` : ''}${qToothSVG(n, fill)}${up ? '' : `<span class="qn">${n}</span>`}${has ? `<i class="qb">${trs.size}</i>` : ''}`;
    return ro ? `<span class="qt ro${has ? ' has' : ''}" style="transform:translateY(${ty}px)">${inner}</span>`
      : `<button type="button" class="qt${has ? ' has' : ''}${Q.act.has(String(n)) ? ' act' : ''}" style="transform:translateY(${ty}px)" data-act="qTooth" data-n="${n}" aria-label="${n}">${inner}</button>`;
  }).join('');
  return `<div class="qchart qc${set.up.length}">${defs}<div class="qjaw">${esc(t('q_jaw_up'))}</div><div class="qrow">${row(set.up, true)}</div><div class="qmid"></div><div class="qrow">${row(set.lo, false)}</div><div class="qjaw">${esc(t('q_jaw_lo'))}</div></div>`;
}
const qSelSorted = () => [...Q.act].sort((x, y) => x - y);
function qPanelHTML() {
  const gen = treatList().filter(qFlatTr), per = treatList().filter(x => !qFlatTr(x)), sel = qSelSorted(), N = sel.length;
  const chip = (tr, st, act, extra) => { const u = qUnit(tr, extra); return `<button type="button" class="qchip${st === 2 ? ' on' : st === 1 ? ' part' : ''}" data-act="${act}" data-tr="${esc(tr)}" aria-pressed="${st === 2}"><b>${esc(treatLabel(tr))}</b><span>${u === null ? '—' : esc(money(u))}</span></button>`; };
  const stOf = tr => { const c = sel.filter(n => (Q.sel.get(n) || new Set()).has(tr)).length; return c === 0 ? 0 : c === N ? 2 : 1; };
  const bar = `<div class="qselbar"><span class="qselcnt">${esc(t('q_sel_n', { n: N }))}</span><button type="button" data-act="qSelGrp" data-g="up">${esc(t('q_sel_up'))}</button><button type="button" data-act="qSelGrp" data-g="lo">${esc(t('q_sel_lo'))}</button><button type="button" data-act="qSelGrp" data-g="all">${esc(t('q_sel_all'))}</button>${N ? `<button type="button" data-act="qSelGrp" data-g="none" class="qx">${esc(t('q_sel_none'))}</button>` : ''}</div>`;
  const head = N === 1 ? esc(t('q_pick', { n: sel[0] })) : esc(t('q_pick_multi', { n: N, list: sel.join(' · ') }));
  return `<div class="qpick">${bar}${N ? `<div class="qpick-h">${head}</div><div class="qchips">${per.map(tr => chip(tr, stOf(tr), 'qTr', N === 1 ? sel[0] : sel[0])).join('')}</div>` : `<div class="qpick-h qmuted">${esc(t('q_pick_none'))}</div>`}
    ${gen.length ? `<div class="qpick-h qgen">${esc(t('q_general'))}</div><div class="qchips">${gen.map(tr => chip(tr, Q.flat.has(tr) ? 2 : 0, 'qFlat', null)).join('')}</div>` : ''}</div>`;
}
function qInvoiceHTML() {
  const ls = qLines(), tot = qTotal(ls);
  const rows = ls.map(l => `<tr><td><b>${esc(treatLabel(l.tr))}</b>${defSessions(l.tr) > 1 ? ` <small class="qmuted">(${defSessions(l.tr)} ${esc(t('q_sess'))})</small>` : ''}${l.noPrice ? `<div class="qwarn">⚠ ${esc(t('q_noprice'))}</div>` : ''}</td><td>${l.teeth.length ? l.teeth.map(z => `<span class="qtag">${z.n}${z.u != null && l.teeth.some(y => y.u !== z.u) ? ` <small>${esc(money(z.u))}</small>` : ''}</span>`).join('') : '—'}</td><td class="qnum">${l.teeth.length || ''}</td>${Q.inst ? `<td class="qnum"><input type="checkbox" data-act="qLineInst" data-tr="${esc(l.tr)}" ${l.inst ? 'checked' : ''} aria-label="${esc(t('q_linst'))}"></td>` : ''}<td class="qnum">${esc(money(l.sub) || '0')}</td></tr>`).join('');
  return ls.length ? `<table class="qtable"><thead><tr><th>${esc(t('q_col_tr'))}</th><th>${esc(t('q_col_teeth'))}</th><th class="qnum">${esc(t('q_count'))}</th>${Q.inst ? `<th class="qnum">💳 ${esc(t('q_linst'))}</th>` : ''}<th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="qcount"><span>${esc(t('q_teeth_total'))}</span><b>${qTeethCount()}</b></div>
    <div class="qtotals"><div class="qtot"><span>${esc(t('q_total'))}</span><b id="qTot">${esc(money(tot) || '0')}</b></div>
      <div class="qdisc"><span>${esc(t('q_disc'))}</span><div class="qdisc-in"><input type="number" min="0" step="any" inputmode="decimal" id="qDisc" value="${Q.disc || ''}" placeholder="0"><div class="teeth-switch"><button type="button" data-act="qDType" data-v="amt" class="${Q.dtype === 'amt' ? 'on' : ''}">${esc(t('q_amt'))}</button><button type="button" data-act="qDType" data-v="pct" class="${Q.dtype === 'pct' ? 'on' : ''}">${esc(t('q_pct'))}</button></div></div></div>
      ${Q.disc ? `<div class="qdisc qsub"><span>${esc(t('q_disc_amt'))}</span><b id="qDiscAmt">${esc(money(qDiscAmt(tot)) || '0')}</b></div>` : ''}
      <div class="qtot qnet"><span>${esc(t('q_net'))}</span><b id="qNet">${esc(money(qNet(tot)) || '0')}</b></div>
      <label class="qinst-on"><input type="checkbox" data-act="qInst" ${Q.inst ? 'checked' : ''}><span>💳 ${esc(t('q_inst'))}</span></label>
      ${Q.inst ? `<div class="qinst"><label><span>${esc(t('q_down'))}</span><input type="number" min="0" step="any" inputmode="decimal" id="qDown" value="${Q.down || ''}" placeholder="0"></label><label><span>${esc(t('q_n'))}</span><input type="number" min="1" max="60" step="1" inputmode="numeric" id="qN" value="${Q.n}"></label><label><span>${esc(t('q_gap'))}</span><input type="number" min="1" max="365" step="1" inputmode="numeric" id="qGap" value="${Q.gap}"></label></div><div id="qSched">${qSchedHTML()}</div>` : ''}</div>` : `<div class="qmuted qempty">${esc(t('q_empty'))}</div>`;
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
      else if (e.target.id === 'qDisc') { Q.disc = Math.max(0, +e.target.value || 0); if (!!Q.disc !== !!$('#qDiscAmt')) { qRender(); const i = $('#qDisc'); if (i) { i.focus(); try { const l = i.value.length; i.type = 'text'; i.setSelectionRange(l, l); i.type = 'number'; } catch (e) {} } } else qUpdateTotals(); }
      else if (e.target.id === 'qDown') { Q.down = Math.max(0, +e.target.value || 0); qUpdateTotals(); }
      else if (e.target.id === 'qN') { Q.n = +e.target.value || 1; qUpdateTotals(); }
      else if (e.target.id === 'qGap') { Q.gap = +e.target.value || 30; qUpdateTotals(); }
    });
  }
  $('#qSwitch').innerHTML = `<button type="button" data-act="qSet" data-v="adult" class="${Q.set === 'adult' ? 'on' : ''}">${esc(t('q_perm'))}</button><button type="button" data-act="qSet" data-v="child" class="${Q.set === 'child' ? 'on' : ''}">${esc(t('q_prim'))}</button>`;
  $('#qChart').innerHTML = qChartHTML(false); $('#qPanel').innerHTML = qPanelHTML(); $('#qInv').innerHTML = qInvoiceHTML();
}
function qPrintHTML() {
  const ls = qLines(), tot = qTotal(ls), disc = qDiscAmt(tot), me = S.me || {};
  return `<div class="qp" dir="${settings.lang === 'en' ? 'ltr' : 'rtl'}"><div class="qp-head"><div class="qp-clinic">${esc(me.clinicName || '')}</div>${me.role === 'doctor' && me.name ? `<div>${esc(t('hero_doc', { n: me.name }))}</div>` : ''}</div>
    <h2>${esc(t('q_title_print'))}</h2><div class="qp-meta"><span>${esc(t('q_date'))}: <b>${esc(ymd(Date.now()))}</b></span>${Q.name.trim() ? `<span>${esc(t('q_patient'))}: <b>${esc(Q.name.trim())}</b></span>` : ''}</div>
    ${qChartHTML(true)}
    <table class="qtable"><thead><tr><th>${esc(t('q_col_tr'))}</th><th>${esc(t('q_col_teeth'))}</th><th class="qnum">${esc(t('q_count'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${ls.map(l => `<tr><td><b>${esc(treatLabel(l.tr))}</b></td><td>${l.teeth.length ? l.teeth.map(z => z.n).join(' · ') : '—'}</td><td class="qnum">${l.teeth.length || ''}</td><td class="qnum">${esc(money(l.sub) || '0')}</td></tr>`).join('')}</tbody></table>
    <div class="qcount"><span>${esc(t('q_teeth_total'))}</span><b>${qTeethCount()}</b></div>
    <div class="qp-tot"><div><span>${esc(t('q_total'))}</span><b>${esc(money(tot) || '0')}</b></div>${disc ? `<div><span>${esc(t('q_disc'))}${Q.dtype === 'pct' ? ` (${Q.disc}%)` : ''}</span><b>${esc(money(disc))}</b></div><div class="qnet"><span>${esc(t('q_net'))}</span><b>${esc(money(qNet(tot)))}</b></div>` : ''}</div>${qSchedHTML()}
    <p class="qp-note">${esc(t('q_note'))}</p></div>`;
}

Object.assign(ACT, {
  qTooth(el) { const n = el.dataset.n; if (Q.act.has(n)) Q.act.delete(n); else Q.act.add(n); qRender(); },
  qSelGrp(el) { const g = el.dataset.g, set = TEETH[Q.set]; Q.act.clear(); if (g === 'up' || g === 'all') set.up.forEach(n => Q.act.add(String(n))); if (g === 'lo' || g === 'all') set.lo.forEach(n => Q.act.add(String(n))); qRender(); },
  qTr(el) {
    const sel = qSelSorted(); if (!sel.length) return; const tr = el.dataset.tr, all = sel.every(n => (Q.sel.get(n) || new Set()).has(tr));
    for (const n of sel) { const s = Q.sel.get(n) || new Set(); if (all) s.delete(tr); else s.add(tr); if (s.size) Q.sel.set(n, s); else Q.sel.delete(n); }
    qRender();
  },
  qFlat(el) { const tr = el.dataset.tr; if (Q.flat.has(tr)) Q.flat.delete(tr); else Q.flat.add(tr); qRender(); },
  qDType(el) { Q.dtype = el.dataset.v; qRender(); },
  qLineInst(el) { qInstOver[el.dataset.tr] = !!el.checked; try { localStorage.setItem(Q_INST_KEY, JSON.stringify(qInstOver)); } catch (e) {} qRender(); },
  qInst(el) { Q.inst = !!el.checked; qRender(); },
  qSet(el) { if (Q.set === el.dataset.v) return; Q.set = el.dataset.v; Q.act.clear(); Q.sel.clear(); qRender(); },
  qClear() { Q.sel.clear(); Q.flat.clear(); Q.act.clear(); Q.disc = 0; Q.down = 0; Q.inst = false; qRender(); },
  qPrint() {
    if (!qLines().length) return toast(t('q_empty'), 'info');
    let box = $('#quotePrint'); if (!box) { box = document.createElement('div'); box.id = 'quotePrint'; document.body.appendChild(box); }
    box.innerHTML = qPrintHTML(); document.body.classList.add('print-quote');
    const done = () => { document.body.classList.remove('print-quote'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
  }
});
