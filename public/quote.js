/* ===== قسم «التسعير»: فاتورة تقدير كلفة العلاج قبل البدء =====
   مخطط أسنان يشبه الأسنان الحقيقية (تاج + جذور)، يُحدَّد السن ثم تُختار علاجاته من قائمة «الحصص والأسعار»،
   فتُحسب الكلفة الإجمالية فوراً (سعر كل سن حسب نوعه إن وُجدت أسعار حسب نوع السن). لا يُحفظ شيء في الأرشيف.
   يعتمد على app.js (t, L, S, $, $$, esc, money, treatList, treatLabel, priceFor, flatOf, defSessions, colOf, TEETH, ymd, ACT, toast, DENT). */
const Q = { set: 'adult', sel: new Map(), flat: new Set(), active: null, disc: 0, dtype: 'amt', inst: false, down: 0, n: 3, gap: 30, name: '' };

Object.assign(L.ar, {
  tab_quote_s: 'التسعير', q_title: '🧾 فاتورة تقدير الكلفة', q_hint: 'اضغط على السن الذي يحتاج علاجاً ثم اختر علاجاته؛ تُحسب الكلفة من قائمة الأسعار.',
  q_name_ph: 'اسم المريض (اختياري)', q_pick: 'السن {n} — اختر علاجاته:', q_pick_none: 'اضغط على سن من المخطط لاختيار علاجه', q_general: 'بنود عامة (تُحسب مرة واحدة)',
  q_col_tr: 'العلاج', q_col_teeth: 'الأسنان', q_col_sub: 'المبلغ', q_total: 'الكلفة الإجمالية', q_disc: 'خصم', q_net: 'الصافي بعد الخصم', q_empty: 'لم تُحدَّد علاجات بعد',
  q_print: '🖨️ طباعة الفاتورة', q_clear: 'مسح الكل', q_noprice: 'السعر غير محدّد في القائمة', q_sess: 'حصص', q_title_print: 'تقدير كلفة العلاج', q_note: 'هذا تقدير مبدئي قابل للتعديل حسب الحالة بعد الفحص.',
  q_pct: '٪', q_amt: 'مبلغ', q_disc_amt: 'قيمة الخصم', q_inst: 'تقسيط الدفع', q_down: 'الدفعة الأولى (اليوم)', q_n: 'عدد الأقساط', q_gap: 'كل (يوم)', q_sched: 'جدول الأقساط', q_first: 'الدفعة الأولى', q_k: 'القسط {k}', q_date: 'التاريخ', q_each: '{n} أقساط', q_jaw_up: 'الفك العلوي', q_jaw_lo: 'الفك السفلي', q_right: 'يمين', q_left: 'يسار', q_remain: 'المتبقي للتقسيط',
  q_perm: 'دائمة', q_prim: 'لبنية', q_teeth_n: 'سن', q_date: 'التاريخ', q_patient: 'المريض'
});
Object.assign(L.en, {
  tab_quote_s: 'Estimate', q_title: '🧾 Treatment cost estimate', q_hint: 'Tap a tooth that needs treatment, then pick its treatments; the cost comes from your price list.',
  q_name_ph: 'Patient name (optional)', q_pick: 'Tooth {n} — choose treatments:', q_pick_none: 'Tap a tooth on the chart to choose its treatment', q_general: 'General items (counted once)',
  q_col_tr: 'Treatment', q_col_teeth: 'Teeth', q_col_sub: 'Amount', q_total: 'Total cost', q_disc: 'Discount', q_net: 'Net after discount', q_empty: 'No treatments selected yet',
  q_print: '🖨️ Print estimate', q_clear: 'Clear all', q_noprice: 'No price set in the list', q_sess: 'sessions', q_title_print: 'Treatment cost estimate', q_note: 'This is a preliminary estimate and may change after examination.',
  q_pct: '%', q_amt: 'Amount', q_disc_amt: 'Discount value', q_inst: 'Pay in installments', q_down: 'Down payment (today)', q_n: 'Number of installments', q_gap: 'Every (days)', q_sched: 'Installment schedule', q_first: 'Down payment', q_k: 'Installment {k}', q_date: 'Date', q_each: '{n} installments', q_jaw_up: 'Upper jaw', q_jaw_lo: 'Lower jaw', q_right: 'Right', q_left: 'Left', q_remain: 'Left to split',
  q_perm: 'Permanent', q_prim: 'Primary', q_teeth_n: 'teeth', q_date: 'Date', q_patient: 'Patient'
});

/* ---- مخطط القوس (منظر أمامي كابتسامة): الفك العلوي في الأعلى والسفلي أصغر داخله، وكل سن يميل نحو مركز القوس ---- */
function qKind(n) { const d = n % 10, q = Math.floor(n / 10), prim = q >= 5; return d <= 2 ? (d === 1 ? 'inc' : 'lat') : d === 3 ? 'can' : prim ? 'mol' : d <= 5 ? 'pre' : (d === 8 ? 'wis' : 'mol'); }
/* السن العلوي: الجذور للأعلى (y 2..36) والتاج تحتها؛ السفلي يُقلب عمودياً */
const Q_CROWN = { inc: [35, 40], lat: [30, 38], can: [33, 44], pre: [35, 36], mol: [40, 34], wis: [36, 32] };
/* ---- شكل السن (منظر أمامي): تاج انسيابي بتدرّج عاجي وحافة لثوية وردية ولمعة ناعمة، وجذور مخروطية بأطراف مستديرة ---- */
const f1 = v => (+v).toFixed(1);
/* جذر واحد: قاعدته تحت التاج (y=b) ويضيق بنعومة حتى طرف مستدير؛ lean = ميل الجذر */
function qRp(cx, bw, tip, lean) {
  const b = 58, L = b - tip, tw = bw * .26;
  return `M${f1(cx - bw)} ${b} C${f1(cx - bw * .92)} ${f1(b - L * .42)} ${f1(cx - bw * .55 + lean * .5)} ${f1(tip + L * .3)} ${f1(cx - tw + lean)} ${f1(tip + 2.5)} Q${f1(cx + lean)} ${f1(tip - 1.6)} ${f1(cx + tw + lean)} ${f1(tip + 2.5)} C${f1(cx + bw * .55 + lean * .5)} ${f1(tip + L * .3)} ${f1(cx + bw * .92)} ${f1(b - L * .42)} ${f1(cx + bw)} ${b} Z`;
}
function qRoots(n, up) {
  const k = qKind(n);
  if (k === 'inc') return [qRp(20, 10.5, 4, 1.6)];
  if (k === 'lat') return [qRp(20, 9, 6, -1.8)];
  if (k === 'can') return [qRp(20, 10.5, 1, 1.8)];
  if (k === 'pre') return [qRp(20, 10, 6, -1.5)];
  return up ? [qRp(10, 6.6, 12, -3.4), qRp(20, 6.2, 7, 0), qRp(30, 6.6, 12, 3.4)] : [qRp(12, 8.4, 10, -3), qRp(28, 8.4, 10, 3)];
}
const Q_LOW_W = { inc: .72, lat: .78, can: .84, pre: .88, mol: .93, wis: .9 };   // الأسنان السفلية أضيق من العلوية
/* حافة الطحن: n فصّة (شرفة) من اليمين لليسار بينها أخاديد بعمق dp؛ تبدأ عند (.5w, y-9) وتنتهي عند (-.5w, y-9) */
function qOcc(w, y, n, dp) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x0 = w * (.5 - i / n), x1 = w * (.5 - (i + 1) / n), xm = (x0 + x1) / 2, cw = w / n, tip = y + 1.8;
    const c1 = i === 0 ? y + .2 : y - dp + 3.5, c2 = i === n - 1 ? y + .2 : y - dp + 3.5, ny = i === n - 1 ? y - 9 : y - dp;
    out += ` C ${f1(x0)} ${f1(c1)} ${f1(xm + cw * .3)} ${f1(tip)} ${f1(xm)} ${f1(tip)} C ${f1(xm - cw * .3)} ${f1(tip)} ${f1(x1)} ${f1(c2)} ${f1(x1)} ${f1(ny)}`;
  }
  return out;
}
/* تاج السن: الأعلى = الحافة اللثوية (قوس صغير)، الأسفل = حافة القطع/الطحن */
function qToothPath(k, w, h) {
  const y = h / 2, c = -y, f = v => (v * w).toFixed(1), g = v => (v * h).toFixed(1);
  const top = `M ${f(-.3)} ${c} Q 0 ${c - 4.5} ${f(.3)} ${c}`;
  if (k === 'can') return `${top} C ${f(.5)} ${c + h * .14} ${f(.57)} ${g(-.02)} ${f(.5)} ${g(.14)} Q ${f(.42)} ${g(.34)} ${f(.15)} ${y - 1.5} Q 0 ${y + 2} ${f(-.15)} ${y - 1.5} Q ${f(-.42)} ${g(.34)} ${f(-.5)} ${g(.14)} C ${f(-.57)} ${g(-.02)} ${f(-.5)} ${c + h * .14} ${f(-.3)} ${c} Z`;
  if (k === 'pre' || k === 'mol' || k === 'wis') {   // ضاحك: فصّة واحدة — طاحن: فصّتان
    const hw = k === 'pre' ? .3 : .34, n = k === 'pre' ? 1 : 2, dp = 7;
    return `M ${f(-hw)} ${c} Q 0 ${c - 4.5} ${f(hw)} ${c} C ${f(.52)} ${c + h * .12} ${f(.57)} ${g(0)} ${f(.5)} ${y - 9}${qOcc(w, y, n, dp)} C ${f(-.57)} ${g(0)} ${f(-.52)} ${c + h * .12} ${f(-hw)} ${c} Z`;
  }
  const cw = k === 'inc' ? .34 : .3;   // قاطعة وسطى / جانبية
  return `M ${f(-cw)} ${c} Q 0 ${c - 4.5} ${f(cw)} ${c} C ${f(.5)} ${c + h * .14} ${f(.55)} ${g(.06)} ${f(.5)} ${y - 7} Q ${f(.49)} ${y} ${f(.37)} ${y} Q 0 ${y + 2} ${f(-.37)} ${y} Q ${f(-.49)} ${y} ${f(-.5)} ${y - 7} C ${f(-.55)} ${g(.06)} ${f(-.5)} ${c + h * .14} ${f(-cw)} ${c} Z`;
}
/* أخاديد خفيفة بين الشرفات (للضواحك والأضراس) */
function qFis(k, w, h) {
  const y = h / 2, gv = x => `M ${f1(x)} ${f1(y - 7)} Q ${f1(x * 1.05)} ${f1(h * .08)} ${f1(x)} ${f1(-h * .02)}`;
  return k === 'mol' || k === 'wis' ? gv(0) : '';
}
function qToothSVG(n, fill) {
  const k = qKind(n), q = Math.floor(n / 10), up = q === 1 || q === 2 || q === 5 || q === 6, [w, h] = Q_CROWN[k], sh = qToothPath(k, w, h), fis = qFis(k, w, h), sc = (n % 10 === 8 && q < 5) ? .9 : 1, fx = up ? 1 : Q_LOW_W[k], y = h / 2;
  const roots = qRoots(n, up).map(r => `<path d="${r}" style="fill:url(#qRt);stroke:rgba(150,115,60,.55);stroke-width:.8;stroke-linejoin:round"/>`).join('');
  const crown = `<g transform="translate(20 ${(49 + y).toFixed(1)})">
    <path d="${sh}" style="fill:${fill || 'url(#qCr)'};stroke:none"/>
    <path d="${sh}" style="fill:url(#qSh);stroke:none"/>
    ${fis ? `<path d="${fis}" style="fill:none;stroke:rgba(120,95,60,.28);stroke-width:.9;stroke-linecap:round"/>` : ''}
    <path d="M ${f1(-w * .3)} ${f1(-y + 5)} Q ${f1(-w * .38)} ${f1(h * .02)} ${f1(-w * .3)} ${f1(y - 8)}" style="fill:none;stroke:rgba(255,255,255,.75);stroke-width:2.2;stroke-linecap:round"/>
    <path d="${sh}" style="fill:none;stroke:rgba(88,101,122,.7);stroke-width:1;stroke-linejoin:round"/>
    <path d="M ${f1(-w * .34)} ${f1(-y + .4)} Q 0 ${f1(-y - 4.1)} ${f1(w * .34)} ${f1(-y + .4)}" style="fill:none;stroke:#e48b95;stroke-width:2.4;stroke-linecap:round;opacity:.8"/></g>`;
  const tf = [up ? '' : 'translate(0 98) scale(1 -1)', fx !== 1 ? `translate(20 0) scale(${fx} 1) translate(-20 0)` : '', sc !== 1 ? `translate(${20 * (1 - sc)} ${up ? 98 * (1 - sc) : 0}) scale(${sc})` : ''].filter(Boolean).join(' ');
  return `<svg viewBox="0 0 40 98" class="qsvg" aria-hidden="true"><g transform="${tf}">${roots}${crown}</g></svg>`;
}
const Q_DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="qCr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0e3c6"/><stop offset=".3" stop-color="#fbf6ea"/><stop offset=".75" stop-color="#ffffff"/><stop offset="1" stop-color="#e9f0f9"/></linearGradient><radialGradient id="qSh" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7f93b4" stop-opacity=".33"/></radialGradient><linearGradient id="qRt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4b37d"/><stop offset=".6" stop-color="#e6cf9f"/><stop offset="1" stop-color="#f2e3be"/></linearGradient></defs></svg>';
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
const qDiscAmt = tot => { const v = Math.max(0, +Q.disc || 0); return Math.round((Q.dtype === 'pct' ? tot * Math.min(100, v) / 100 : Math.min(v, tot)) * 100) / 100; };
const qNet = tot => Math.max(0, Math.round((tot - qDiscAmt(tot)) * 100) / 100);
/* جدول التقسيط: دفعة أولى اليوم ثم أقساط متساوية كل N يوماً (الفارق في القسط الأخير) */
function qSchedule(net) {
  if (!Q.inst) return null;
  const down = Math.min(Math.max(0, +Q.down || 0), net), rem = Math.round((net - down) * 100) / 100, n = Math.min(60, Math.max(1, Math.round(+Q.n) || 1)), gap = Math.min(365, Math.max(1, Math.round(+Q.gap) || 30));
  const base = Math.floor(rem / n), rows = []; let left = rem;
  if (down > 0) rows.push({ label: t('q_first'), at: Date.now(), amt: down });
  for (let k = 1; k <= n; k++) { const amt = k === n ? Math.round(left * 100) / 100 : base; left = Math.round((left - amt) * 100) / 100; rows.push({ label: t('q_k', { k }), at: Date.now() + k * gap * 864e5, amt }); }
  return { rows, down, rem, n, gap };
}
const qSchedHTML = net => { const s = qSchedule(net); if (!s) return ''; return `<table class="qtable qsched"><thead><tr><th>${esc(t('q_sched'))}</th><th>${esc(t('q_date'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${s.rows.map(r => `<tr><td>${esc(r.label)}</td><td>${esc(ymd(r.at))}</td><td class="qnum">${esc(money(r.amt) || '0')}</td></tr>`).join('')}</tbody></table>`; };
function qUpdateTotals() { const tot = qTotal(qLines()), net = qNet(tot), d = $('#qDiscAmt'), nt = $('#qNet'), sc = $('#qSched'); if (d) d.textContent = money(qDiscAmt(tot)) || '0'; if (nt) nt.textContent = money(net) || '0'; if (sc) sc.innerHTML = qSchedHTML(net); }

/* ---- العرض ---- */
function qChartHTML(ro) {
  const set = TEETH[Q.set], defs = Q_DEFS;
  const row = (arr, up) => arr.map((n, i) => {
    const trs = Q.sel.get(String(n)), has = trs && trs.size, first = has && treatList().find(x => trs.has(x)), fill = first ? (colOf(first).done || '#2e9e6b') : '',
      c = arr.length, dd = Math.abs(i - (c - 1) / 2) / ((c - 1) / 2), ty = Math.round((1 - dd * dd) * 9) * (up ? 1 : -1);
    const inner = `${up ? `<span class="qn">${n}</span>` : ''}${qToothSVG(n, fill)}${up ? '' : `<span class="qn">${n}</span>`}${has ? `<i class="qb">${trs.size}</i>` : ''}`;
    return ro ? `<span class="qt ro${has ? ' has' : ''}" style="transform:translateY(${ty}px)">${inner}</span>`
      : `<button type="button" class="qt${has ? ' has' : ''}${Q.active === String(n) ? ' act' : ''}" style="transform:translateY(${ty}px)" data-act="qTooth" data-n="${n}" aria-label="${n}">${inner}</button>`;
  }).join('');
  return `<div class="qchart qc${set.up.length}">${defs}<div class="qjaw">${esc(t('q_jaw_up'))}</div><div class="qrow">${row(set.up, true)}</div><div class="qmid"></div><div class="qrow">${row(set.lo, false)}</div><div class="qjaw">${esc(t('q_jaw_lo'))}</div></div>`;
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
      <div class="qdisc"><span>${esc(t('q_disc'))}</span><div class="qdisc-in"><input type="number" min="0" step="any" inputmode="decimal" id="qDisc" value="${Q.disc || ''}" placeholder="0"><div class="teeth-switch"><button type="button" data-act="qDType" data-v="amt" class="${Q.dtype === 'amt' ? 'on' : ''}">${esc(t('q_amt'))}</button><button type="button" data-act="qDType" data-v="pct" class="${Q.dtype === 'pct' ? 'on' : ''}">${esc(t('q_pct'))}</button></div></div></div>
      ${Q.disc ? `<div class="qdisc qsub"><span>${esc(t('q_disc_amt'))}</span><b id="qDiscAmt">${esc(money(qDiscAmt(tot)) || '0')}</b></div>` : ''}
      <div class="qtot qnet"><span>${esc(t('q_net'))}</span><b id="qNet">${esc(money(qNet(tot)) || '0')}</b></div>
      <label class="qinst-on"><input type="checkbox" data-act="qInst" ${Q.inst ? 'checked' : ''}><span>💳 ${esc(t('q_inst'))}</span></label>
      ${Q.inst ? `<div class="qinst"><label><span>${esc(t('q_down'))}</span><input type="number" min="0" step="any" inputmode="decimal" id="qDown" value="${Q.down || ''}" placeholder="0"></label><label><span>${esc(t('q_n'))}</span><input type="number" min="1" max="60" step="1" inputmode="numeric" id="qN" value="${Q.n}"></label><label><span>${esc(t('q_gap'))}</span><input type="number" min="1" max="365" step="1" inputmode="numeric" id="qGap" value="${Q.gap}"></label></div><div id="qSched">${qSchedHTML(qNet(tot))}</div>` : ''}</div>` : `<div class="qmuted qempty">${esc(t('q_empty'))}</div>`;
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
    <table class="qtable"><thead><tr><th>${esc(t('q_col_tr'))}</th><th>${esc(t('q_col_teeth'))}</th><th class="qnum">${esc(t('q_col_sub'))}</th></tr></thead><tbody>${ls.map(l => `<tr><td><b>${esc(treatLabel(l.tr))}</b></td><td>${l.teeth.length ? l.teeth.map(z => z.n).join(' · ') : '—'}</td><td class="qnum">${esc(money(l.sub) || '0')}</td></tr>`).join('')}</tbody></table>
    <div class="qp-tot"><div><span>${esc(t('q_total'))}</span><b>${esc(money(tot) || '0')}</b></div>${disc ? `<div><span>${esc(t('q_disc'))}${Q.dtype === 'pct' ? ` (${Q.disc}%)` : ''}</span><b>${esc(money(disc))}</b></div><div class="qnet"><span>${esc(t('q_net'))}</span><b>${esc(money(qNet(tot)))}</b></div>` : ''}</div>${qSchedHTML(qNet(tot))}
    <p class="qp-note">${esc(t('q_note'))}</p></div>`;
}

Object.assign(ACT, {
  qTooth(el) { const n = el.dataset.n; Q.active = Q.active === n ? null : n; if (Q.active && !Q.sel.has(n)) Q.sel.set(n, new Set()); qRender(); },
  qTr(el) { const n = Q.active; if (!n) return; const s = Q.sel.get(n) || new Set(); if (s.has(el.dataset.tr)) s.delete(el.dataset.tr); else s.add(el.dataset.tr); if (s.size) Q.sel.set(n, s); else Q.sel.delete(n); qRender(); },
  qFlat(el) { const tr = el.dataset.tr; if (Q.flat.has(tr)) Q.flat.delete(tr); else Q.flat.add(tr); qRender(); },
  qDType(el) { Q.dtype = el.dataset.v; qRender(); },
  qInst(el) { Q.inst = !!el.checked; qRender(); },
  qSet(el) { if (Q.set === el.dataset.v) return; Q.set = el.dataset.v; Q.active = null; Q.sel.clear(); qRender(); },
  qClear() { Q.sel.clear(); Q.flat.clear(); Q.active = null; Q.disc = 0; Q.down = 0; Q.inst = false; qRender(); },
  qPrint() {
    if (!qLines().length) return toast(t('q_empty'), 'info');
    let box = $('#quotePrint'); if (!box) { box = document.createElement('div'); box.id = 'quotePrint'; document.body.appendChild(box); }
    box.innerHTML = qPrintHTML(); document.body.classList.add('print-quote');
    const done = () => { document.body.classList.remove('print-quote'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
  }
});
