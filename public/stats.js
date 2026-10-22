'use strict';
/* عيادتي الذكية — تبويب الإحصائيات المفصّلة (للطبيب فقط).
   يعتمد على أدوات app.js (t, L, S, api, run, esc, money, locale, treatLabel, reasonL, genderL, download ...).
   كل الحسابات تتم في الخادم (GET /api/stats)؛ هنا العرض فقط، بلا مكتبات خارجية. */

Object.assign(L.ar, {
  tab_stats: 'الإحصائيات 📊', st_title: 'الإحصائيات المفصّلة 📊', st_today: 'اليوم', st_7d: '7 أيام', st_30d: '30 يوماً', st_month: 'هذا الشهر', st_year: 'هذه السنة', st_all: 'الكل', st_export: 'تصدير CSV ⬇️',
  st_loading: 'جارٍ حساب الإحصائيات…', st_empty: 'لا توجد زيارات منتهية في هذه الفترة.', st_period: 'الفترة:', st_min: 'د', st_days: 'يوماً', st_visit_s: 'زيارة', st_all_time: 'منذ البداية',
  st_live: 'لمحة اليوم', st_waiting_now: 'ينتظرون الآن', st_in_room: 'في المعاينة', st_reg_today: 'سُجّلوا اليوم', st_fin_today: 'أُنهيت اليوم', st_billed_today: 'المستحق اليوم', st_coll_today: 'المحصَّل اليوم',
  st_visits: 'الزيارات', st_patients: 'مرضى مختلفون', st_billed: 'إجمالي المستحق', st_collected: 'المحصَّل فعلياً', st_outstanding: 'متبقٍّ من هذه الفترة', st_avg_bill: 'متوسط الفاتورة', st_avg_wait: 'متوسط الانتظار', st_avg_dur: 'متوسط المعاينة', st_followups: 'زيارات متابعة', st_images: 'صور مرفوعة', st_rate: 'نسبة التحصيل', st_free: 'بلا رسوم', st_vs_prev: 'مقارنة بالفترة السابقة المماثلة', st_new_badge: 'جديد',
  st_insights: 'أبرز الملاحظات', st_trend_visits: 'الزيارات عبر الزمن', st_trend_money: 'المستحق مقابل المحصَّل', st_lg_billed: 'المستحق', st_lg_coll: 'المحصَّل',
  st_weekday: 'حسب يوم الأسبوع', st_hours: 'ساعات وصول المرضى', st_heat: 'خريطة الازدحام (يوم × ساعة)', st_treat: 'العلاجات', st_gender: 'الجنس', st_ages: 'الفئات العمرية', st_reasons: 'أسباب الزيارة',
  st_teeth: 'خريطة الأسنان (عدد المعاينات لكل سن)', st_teeth_cat: 'نوع السن', st_jaw: 'الفك', st_side: 'الجهة', st_dent: 'الأسنان', st_upper: 'علوي', st_lower: 'سفلي', st_right: 'أيمن', st_left: 'أيسر', st_perm: 'دائمة', st_prim: 'لبنية', st_no_tooth: 'زيارات بلا سن محدد',
  st_timing: 'الانتظار والمعاينة', st_wait_dist: 'توزيع مدة الانتظار (دقيقة)', st_dur_dist: 'توزيع مدة المعاينة (دقيقة)', st_avg: 'المتوسط', st_median: 'الوسيط', st_max: 'الأطول', st_chair: 'إجمالي وقت الكرسي',
  st_pat_sec: 'المرضى', st_new: 'مرضى جدد', st_ret: 'مرضى عائدون', st_avg_visits: 'متوسط زيارات المريض', st_freq: 'تكرار الزيارة', st_top_visits: 'الأكثر زيارة', st_top_billed: 'الأعلى مستحقاً', st_reg: 'من سجّل المرضى', st_doctor: 'الطبيب', st_nurse_old: 'ممرضة (قبل التحديث)',
  st_debt_sec: 'الديون المستحقة (كل الفترات)', st_debt_total: 'إجمالي الديون', st_debtors: 'مرضى عليهم متبقٍّ', st_aging: 'أعمار الديون', st_top_debtors: 'أكبر المدينين', st_since: 'منذ',
  st_overall: 'الإجمالي العام', st_all_visits: 'كل الزيارات', st_all_pats: 'كل المرضى', st_first: 'أول زيارة', st_nurses_n: 'الممرضات', st_treats_n: 'العلاجات المعرّفة',
  st_c_treat: 'العلاج', st_c_visits: 'الزيارات', st_c_share: 'النسبة', st_c_billed: 'المستحق', st_c_paid: 'المدفوع', st_c_debt: 'المتبقي', st_c_avg: 'متوسط السعر', st_c_dur: 'متوسط المدة',
  st_c_pat: 'المريض', st_c_phone: 'الهاتف', st_c_bal: 'المتبقي',
  st_i_top: 'أكثر علاج: {a} ({b}% من الزيارات).', st_i_day: 'أكثر الأيام ازدحاماً: {a} ({b} زيارة).', st_i_hour: 'ذروة الوصول عند الساعة {a}:00 تقريباً.', st_i_rate: 'نسبة التحصيل {a}% من المستحق.', st_i_wait: 'متوسط الانتظار {a} دقيقة — فكّر في تنظيم المواعيد.', st_i_debt: 'عليهم متبقٍّ إجمالي {a} ({b} مريضاً).', st_i_up: 'الزيارات {a}% أعلى من الفترة السابقة.', st_i_dn: 'الزيارات {a}% أقل من الفترة السابقة.', st_i_new: 'مرضى جدد: {a}% من مرضى الفترة.'
});
Object.assign(L.en, {
  tab_stats: 'Statistics 📊', st_title: 'Detailed statistics 📊', st_today: 'Today', st_7d: '7 days', st_30d: '30 days', st_month: 'This month', st_year: 'This year', st_all: 'All', st_export: 'Export CSV ⬇️',
  st_loading: 'Calculating statistics…', st_empty: 'No finished visits in this period.', st_period: 'Period:', st_min: 'min', st_days: 'days', st_visit_s: 'visit', st_all_time: 'Since the beginning',
  st_live: 'Today at a glance', st_waiting_now: 'Waiting now', st_in_room: 'In consultation', st_reg_today: 'Registered today', st_fin_today: 'Finished today', st_billed_today: 'Billed today', st_coll_today: 'Collected today',
  st_visits: 'Visits', st_patients: 'Unique patients', st_billed: 'Total billed', st_collected: 'Actually collected', st_outstanding: 'Outstanding (this period)', st_avg_bill: 'Average bill', st_avg_wait: 'Average wait', st_avg_dur: 'Average consultation', st_followups: 'Follow-up visits', st_images: 'Images uploaded', st_rate: 'Collection rate', st_free: 'No charge', st_vs_prev: 'Compared with the previous equal period', st_new_badge: 'new',
  st_insights: 'Highlights', st_trend_visits: 'Visits over time', st_trend_money: 'Billed vs collected', st_lg_billed: 'Billed', st_lg_coll: 'Collected',
  st_weekday: 'By day of week', st_hours: 'Patient arrival hours', st_heat: 'Busy-ness map (day × hour)', st_treat: 'Treatments', st_gender: 'Gender', st_ages: 'Age groups', st_reasons: 'Reasons for visit',
  st_teeth: 'Teeth map (consultations per tooth)', st_teeth_cat: 'Tooth type', st_jaw: 'Jaw', st_side: 'Side', st_dent: 'Dentition', st_upper: 'Upper', st_lower: 'Lower', st_right: 'Right', st_left: 'Left', st_perm: 'Permanent', st_prim: 'Primary', st_no_tooth: 'Visits with no tooth set',
  st_timing: 'Waiting & consultation', st_wait_dist: 'Wait time distribution (min)', st_dur_dist: 'Consultation length distribution (min)', st_avg: 'Average', st_median: 'Median', st_max: 'Longest', st_chair: 'Total chair time',
  st_pat_sec: 'Patients', st_new: 'New patients', st_ret: 'Returning patients', st_avg_visits: 'Visits per patient', st_freq: 'Visit frequency', st_top_visits: 'Most visits', st_top_billed: 'Highest billed', st_reg: 'Who registered patients', st_doctor: 'Doctor', st_nurse_old: 'Nurse (before update)',
  st_debt_sec: 'Outstanding debts (all time)', st_debt_total: 'Total debt', st_debtors: 'Patients owing', st_aging: 'Debt aging', st_top_debtors: 'Largest debtors', st_since: 'since',
  st_overall: 'Overall totals', st_all_visits: 'All visits', st_all_pats: 'All patients', st_first: 'First visit', st_nurses_n: 'Nurses', st_treats_n: 'Defined treatments',
  st_c_treat: 'Treatment', st_c_visits: 'Visits', st_c_share: 'Share', st_c_billed: 'Billed', st_c_paid: 'Paid', st_c_debt: 'Owed', st_c_avg: 'Avg price', st_c_dur: 'Avg time',
  st_c_pat: 'Patient', st_c_phone: 'Phone', st_c_bal: 'Owed',
  st_i_top: 'Top treatment: {a} ({b}% of visits).', st_i_day: 'Busiest day: {a} ({b} visits).', st_i_hour: 'Arrivals peak around {a}:00.', st_i_rate: 'Collection rate is {a}% of billed.', st_i_wait: 'Average wait is {a} min — consider spacing appointments.', st_i_debt: 'Outstanding total {a} across {b} patients.', st_i_up: 'Visits are {a}% higher than the previous period.', st_i_dn: 'Visits are {a}% lower than the previous period.', st_i_new: 'New patients are {a}% of the period’s patients.'
});

const ST = () => (S.stats = S.stats || { r: '30', data: null, seq: 0, last: 0 });
const stN = (n, o) => Number(n || 0).toLocaleString(locale(), Object.assign({ maximumFractionDigits: 1 }, o));
const stPc = (a, b) => b > 0 ? Math.round(a / b * 1000) / 10 : 0;
const stMin = v => stN(v) + ' ' + t('st_min');
const stDay = k => new Date(k + 'T00:00:00Z').toLocaleDateString(locale(), { day: 'numeric', month: 'short', timeZone: 'UTC' });
const stMon = k => new Date(k + '-01T00:00:00Z').toLocaleDateString(locale(), { month: 'short', year: '2-digit', timeZone: 'UTC' });
const stTs = (ts, tz) => new Date(ts - tz * 6e4).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const stDelta = (c, p, inv) => {
  if (p == null) return ''; if (!p) return c ? `<span class="st-d up">${esc(t('st_new_badge'))}</span>` : '';
  const x = Math.round((c - p) / p * 100); if (!x) return '<span class="st-d">0%</span>';
  const good = inv ? x < 0 : x > 0; return `<span class="st-d ${good ? 'up' : 'dn'}">${x > 0 ? '▲' : '▼'} ${stN(Math.abs(x), { maximumFractionDigits: 0 })}%</span>`;
};
const stRangeLabels = bounds => { const o = []; let pv = 0; bounds.forEach((b, i) => { o.push(i === 0 ? '≤' + b : (pv + 1) + '–' + b); pv = b; }); o.push('>' + pv); return o; };

/* ---------- مكوّنات رسم صغيرة (HTML/CSS/SVG فقط) ---------- */
const kpi = (label, val, sub) => `<div class="st-kpi"><span>${esc(label)}</span><b>${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
const card = (title, body, cls) => `<section class="st-card ${cls || ''}"><h5>${esc(title)}</h5>${body}</section>`;
function hbars(items, fmt) {
  const max = Math.max(1, ...items.map(i => i.v));
  return `<div class="st-hb">${items.map(i => `<div class="st-hbr"><span class="st-hl" title="${esc(i.label)}">${esc(i.label)}</span><span class="st-ht"><i style="width:${i.v ? Math.max(2, i.v / max * 100) : 0}%"></i></span><b>${fmt ? fmt(i) : stN(i.v)}</b></div>`).join('')}</div>`;
}
function cols(vals, labels, step) {
  const max = Math.max(1, ...vals), n = vals.length;
  return `<div class="st-cols" style="--n:${n}">${vals.map((v, i) => `<div class="st-col" title="${esc(labels[i])}: ${stN(v)}"><div class="bar"><i style="height:${v ? Math.max(3, v / max * 100) : 0}%"></i></div><span>${i % (step || 1) === 0 ? esc(labels[i]) : ''}</span></div>`).join('')}</div>`;
}
function lines(series) {
  const n = series.length, max = Math.max(1, ...series.map(s => Math.max(s.billed, s.collected)));
  if (n < 2) { const s = series[0] || { billed: 0, collected: 0 }; return hbars([{ label: t('st_lg_billed'), v: s.billed }, { label: t('st_lg_coll'), v: s.collected }], i => money(i.v)); }
  const pts = k => series.map((s, i) => `${(i / (n - 1) * 100).toFixed(2)},${(37 - s[k] / max * 33).toFixed(2)}`).join(' ');
  return `<div class="st-line"><svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="${esc(t('st_trend_money'))}"><polygon points="0,40 ${pts('billed')} 100,40" class="ar"/><polyline points="${pts('billed')}" class="l1"/><polyline points="${pts('collected')}" class="l2"/></svg>
    <div class="st-axis"><span>${esc(money(max))}</span></div></div>
    <div class="st-leg"><span><i class="l1"></i>${esc(t('st_lg_billed'))}</span><span><i class="l2"></i>${esc(t('st_lg_coll'))}</span></div>`;
}
function heatmap(heat) {
  const max = Math.max(1, ...heat.flat()), days = t('days_full');
  let h = '<div class="st-heat"><div class="hd"></div>' + Array.from({ length: 24 }, (_, i) => `<div class="hd">${i % 3 === 0 ? i : ''}</div>`).join('');
  heat.forEach((row, d) => { h += `<div class="hd dn">${esc(days[d])}</div>` + row.map((v, hr) => `<div class="hc${v ? ' on' : ''}" style="--o:${v ? (.15 + .85 * v / max).toFixed(2) : 0}" title="${esc(days[d])} ${hr}:00 — ${v}"></div>`).join(''); });
  return h + '</div>';
}
const ROWS_PERM = [[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]];
const ROWS_PRIM = [[55, 54, 53, 52, 51, 61, 62, 63, 64, 65], [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]];
function toothMap(per, withPrim) {
  const max = Math.max(1, ...Object.values(per));
  const row = l => `<div class="st-trow" style="--c:${l.length}">${l.map((n, i) => { const v = per[n] || 0, o = v ? .2 + .8 * v / max : 0; return `<div class="st-tooth${i === l.length / 2 ? ' mid' : ''}${v ? ' on' : ''}${o > .55 ? ' hot' : ''}" style="--o:${o.toFixed(2)}" title="${n}: ${v}"><b>${n}</b><i>${v || ''}</i></div>`; }).join('')}</div>`;
  return `<div class="st-teeth">${ROWS_PERM.map(row).join('')}${withPrim ? '<div class="st-tsep"></div>' + ROWS_PRIM.map(row).join('') : ''}</div>`;
}
const splitBar = parts => { const tot = parts.reduce((x, p) => x + p.v, 0) || 1; return `<div class="st-split">${parts.map((p, i) => `<span class="s${i}" style="flex:${p.v};${p.v ? '' : 'display:none'}" title="${esc(p.label)}: ${p.v}">${p.v ? stN(stPc(p.v, tot), { maximumFractionDigits: 0 }) + '%' : ''}</span>`).join('')}</div><div class="st-leg">${parts.map((p, i) => `<span><i class="s${i}"></i>${esc(p.label)} (${stN(p.v)})</span>`).join('')}</div>`; };
const stTable = (head, rows) => `<div class="st-tbl"><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

/* ---------- التحميل ---------- */
let stTimer;
function loadStats(quiet) {
  clearTimeout(stTimer); const st = ST();
  if (!st.init) { st.init = true; return ACT.statsRange({ dataset: { r: st.r } }); }   // أول فتح: طبّق النطاق الافتراضي (30 يوماً)
  stTimer = setTimeout(async () => {
    const seq = ++st.seq, q = new URLSearchParams({ from: $('#sFrom').value, to: $('#sTo').value, tz: new Date().getTimezoneOffset() });
    if (!quiet && !st.data) $('#statsBody').innerHTML = `<div class="st-note">${esc(t('st_loading'))}</div>`;
    const d = await run(() => api('GET', '/api/stats?' + q)); if (!d || seq !== st.seq) return;
    st.data = d; st.last = Date.now(); renderStats();
  }, quiet ? 0 : 200);
  $$('#statsTab [data-act=statsRange]').forEach(b => b.classList.toggle('st-on', b.dataset.r === st.r));
}

/* ---------- العرض ---------- */
function renderStats() {
  const box = $('#statsBody'), st = S.stats; if (!box || !st || !st.data) return;
  const d = st.data, s = d.summary, pv = d.prev, tz = d.range.tz, days = t('days_full'), out = [];
  const range = d.range.d0 ? `${stTs(d.range.d0, tz)} → ${stTs(d.range.d1 ? d.range.d1 - 1 : Date.now(), tz)}` : (d.overall.firstVisit ? `${t('st_all_time')} (${stTs(d.overall.firstVisit, tz)})` : t('st_all_time'));
  out.push(`<div class="st-period">${esc(t('st_period'))} <b>${esc(range)}</b>${pv ? ` · <small>${esc(t('st_vs_prev'))}</small>` : ''}</div>`);

  /* لمحة اليوم + الإجمالي */
  const td = d.today;
  out.push(card(t('st_live'), `<div class="st-kpis sm">${kpi(t('st_waiting_now'), stN(td.waiting))}${kpi(t('st_in_room'), stN(td.inRoom))}${kpi(t('st_reg_today'), stN(td.registered))}${kpi(t('st_fin_today'), stN(td.finished))}${kpi(t('st_billed_today'), esc(money(td.billed) || '0'))}${kpi(t('st_coll_today'), esc(money(td.collected) || '0'))}</div>`));

  if (!s.visits) { out.push(`<div class="st-note">${esc(t('st_empty'))}</div>`); }
  else {
    const rate = stPc(s.collected, s.billed);
    out.push(`<div class="st-kpis">
      ${kpi(t('st_visits'), stN(s.visits), pv ? stDelta(s.visits, pv.visits) : '')}
      ${kpi(t('st_patients'), stN(s.patients), pv ? stDelta(s.patients, pv.patients) : '')}
      ${kpi(t('st_billed'), esc(money(s.billed) || '0'), pv ? stDelta(s.billed, pv.billed) : '')}
      ${kpi(t('st_collected'), esc(money(s.collected) || '0'), pv ? stDelta(s.collected, pv.collected) : '')}
      ${kpi(t('st_rate'), stN(rate) + '%')}
      ${kpi(t('st_outstanding'), esc(money(s.outstanding) || '0'))}
      ${kpi(t('st_avg_bill'), esc(money(s.avgBill) || '0'), pv ? stDelta(s.avgBill, pv.avgBill) : '')}
      ${kpi(t('st_avg_wait'), esc(stMin(s.avgWait)), pv ? stDelta(s.avgWait, pv.avgWait, true) : '')}
      ${kpi(t('st_avg_dur'), esc(stMin(s.avgDuration)))}
      ${kpi(t('st_followups'), stN(s.followUps))}
      ${kpi(t('st_free'), stN(s.freeVisits))}
      ${kpi(t('st_images'), stN(s.images))}
    </div>`);

    /* ملاحظات تلقائية */
    const ins = [], tr0 = d.treatments[0], wd = d.weekday.map(x => x.visits), wmax = Math.max(...wd), hmax = Math.max(...d.hours);
    if (tr0) ins.push(t('st_i_top', { a: treatLabel(tr0.name), b: stN(stPc(tr0.visits, s.visits)) }));
    if (wmax > 0 && s.visits >= 5) ins.push(t('st_i_day', { a: days[wd.indexOf(wmax)], b: stN(wmax) }));
    if (hmax > 0 && s.visits >= 5) ins.push(t('st_i_hour', { a: d.hours.indexOf(hmax) }));
    if (s.billed > 0) ins.push(t('st_i_rate', { a: stN(rate) }));
    if (s.avgWait >= 30) ins.push(t('st_i_wait', { a: stN(s.avgWait) }));
    if (d.debt.total > 0) ins.push(t('st_i_debt', { a: money(d.debt.total), b: stN(d.debt.count) }));
    if (pv && pv.visits) { const x = Math.round((s.visits - pv.visits) / pv.visits * 100); if (x > 0) ins.push(t('st_i_up', { a: stN(x) })); else if (x < 0) ins.push(t('st_i_dn', { a: stN(-x) })); }
    if (d.patients.unique) ins.push(t('st_i_new', { a: stN(stPc(d.patients.new, d.patients.unique)) }));
    if (ins.length) out.push(card(t('st_insights'), `<ul class="st-ins">${ins.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`));

    /* الاتجاه الزمني */
    const ser = d.series, lab = ser.map(x => d.range.gran === 'month' ? stMon(x.k) : stDay(x.k)), step = Math.max(1, Math.ceil(ser.length / 7));
    out.push(card(t('st_trend_visits'), cols(ser.map(x => x.visits), lab, step)));
    out.push(card(t('st_trend_money'), lines(ser) + (ser.length > 1 ? `<div class="st-xl"><span>${esc(lab[0])}</span><span>${esc(lab[lab.length - 1])}</span></div>` : '')));

    /* الأوقات */
    out.push(card(t('st_weekday'), cols(d.weekday.map(x => x.visits), days.map(x => String(x).slice(0, 3)), 1)));
    out.push(card(t('st_hours'), cols(d.hours, d.hours.map(h => String(h)), 3)));
    out.push(card(t('st_heat'), heatmap(d.heat)));

    /* العلاجات */
    out.push(card(t('st_treat'), stTable([t('st_c_treat'), t('st_c_visits'), t('st_c_share'), t('st_c_billed'), t('st_c_paid'), t('st_c_debt'), t('st_c_avg'), t('st_c_dur')],
      d.treatments.map(x => [`<b>${esc(treatLabel(x.name))}</b>`, stN(x.visits), stN(stPc(x.visits, s.visits)) + '%', esc(money(x.billed) || '0'), esc(money(x.paid) || '0'), x.debt ? `<span class="st-neg">${esc(money(x.debt))}</span>` : '—', esc(money(x.avgPrice) || '0'), esc(stMin(x.avgDuration))])) +
      hbars(d.treatments.map(x => ({ label: treatLabel(x.name), v: x.billed })), i => esc(money(i.v) || '0')), 'wide'));

    /* الديموغرافيا */
    out.push(card(t('st_gender'), splitBar([{ label: genderL('ذكر'), v: d.gender['ذكر'].visits }, { label: genderL('أنثى'), v: d.gender['أنثى'].visits }])));
    out.push(card(t('st_ages'), hbars(d.ages.map(a => ({ label: a.to >= 200 ? a.from + '+' : a.from + '–' + a.to, v: a.visits })))));
    out.push(card(t('st_reasons'), hbars(d.reasons.map(r => ({ label: reasonL(r.name), v: r.visits })))));

    /* الأسنان */
    const tt = d.teeth;
    if (tt.total) {
      out.push(card(t('st_teeth'), toothMap(tt.perTooth, tt.dentition.primary > 0) +
        `<div class="st-grid3"><div><h6>${esc(t('st_teeth_cat'))}</h6>${splitBar([{ label: t('price_cat_front'), v: tt.cats.front }, { label: t('price_cat_pre'), v: tt.cats.pre }, { label: t('price_cat_molar'), v: tt.cats.molar }])}</div>
         <div><h6>${esc(t('st_jaw'))}</h6>${splitBar([{ label: t('st_upper'), v: tt.jaw.upper }, { label: t('st_lower'), v: tt.jaw.lower }])}</div>
         <div><h6>${esc(t('st_side'))}</h6>${splitBar([{ label: t('st_right'), v: tt.side.right }, { label: t('st_left'), v: tt.side.left }])}</div></div>
         <div class="st-grid3"><div><h6>${esc(t('st_dent'))}</h6>${splitBar([{ label: t('st_perm'), v: tt.dentition.permanent }, { label: t('st_prim'), v: tt.dentition.primary }])}</div></div>
         ${tt.none ? `<small class="st-mut">${esc(t('st_no_tooth'))}: ${stN(tt.none)}</small>` : ''}`, 'wide'));
    }

    /* الانتظار والمعاينة */
    const tm = d.timing;
    const tmBlock = (title, x) => `<div><h6>${esc(title)}</h6><div class="st-mini">${[[t('st_avg'), x.avg], [t('st_median'), x.median], [t('st_max'), x.max]].map(([l, v]) => `<span>${esc(l)}<b>${esc(stMin(v))}</b></span>`).join('')}</div>${cols(x.buckets, stRangeLabels(x.bounds), 1)}</div>`;
    out.push(card(t('st_timing'), `<div class="st-grid2">${tmBlock(t('st_wait_dist'), tm.wait)}${tmBlock(t('st_dur_dist'), tm.duration)}</div><small class="st-mut">${esc(t('st_chair'))}: <b>${esc(stN(tm.totalChairMin / 60) + ' ' + (settings.lang === 'en' ? 'h' : 'ساعة'))}</b></small>`, 'wide'));

    /* المرضى */
    const pt = d.patients;
    out.push(card(t('st_pat_sec'), `<div class="st-kpis sm">${kpi(t('st_new'), stN(pt.new), stN(stPc(pt.new, pt.unique)) + '%')}${kpi(t('st_ret'), stN(pt.returning), stN(stPc(pt.returning, pt.unique)) + '%')}${kpi(t('st_avg_visits'), stN(pt.avgVisits))}</div>
      <h6>${esc(t('st_freq'))}</h6>${hbars(pt.freq.map((v, i) => ({ label: (i === 3 ? '4+' : i + 1) + ' ' + t('st_visit_s'), v })))}
      <div class="st-grid2"><div><h6>${esc(t('st_top_visits'))}</h6>${hbars(pt.topVisits.map(p => ({ label: p.name, v: p.visits })))}</div>
      <div><h6>${esc(t('st_top_billed'))}</h6>${hbars(pt.topBilled.map(p => ({ label: p.name, v: p.billed })), i => esc(money(i.v)))}</div></div>`, 'wide'));

    /* من سجّل */
    out.push(card(t('st_reg'), hbars(d.registrars.map(r => ({ label: r.role === 'doctor' ? t('st_doctor') : (r.name || t('st_nurse_old')), v: r.n })))));
  }

  /* الديون: كل الفترات */
  const db = d.debt;
  out.push(card(t('st_debt_sec'), db.total ? `<div class="st-kpis sm">${kpi(t('st_debt_total'), `<span class="st-neg">${esc(money(db.total))}</span>`)}${kpi(t('st_debtors'), stN(db.count))}</div>
    <h6>${esc(t('st_aging'))}</h6>${hbars(['0–30', '31–60', '61–90', '90+'].map((l, i) => ({ label: l + ' ' + t('st_days'), v: db.aging[i] })), i => esc(money(i.v) || '0'))}
    <h6>${esc(t('st_top_debtors'))}</h6>${stTable([t('st_c_pat'), t('st_c_phone'), t('st_c_bal'), t('st_since')], db.top.map(x => [`<b>${esc(x.name)}</b> <small>${x.birthYear}</small>`, esc(x.phone || '—'), `<span class="st-neg">${esc(money(x.balance))}</span>`, esc(new Date(x.since).toLocaleDateString(locale()))]))}` : `<div class="st-note">✅ ${esc(t('st_debt_total'))}: 0</div>`, 'wide'));

  const ov = d.overall;
  out.push(card(t('st_overall'), `<div class="st-kpis sm">${kpi(t('st_all_visits'), stN(ov.visits))}${kpi(t('st_all_pats'), stN(ov.patients))}${kpi(t('st_first'), ov.firstVisit ? esc(stTs(ov.firstVisit, tz)) : '—')}${kpi(t('st_nurses_n'), stN(ov.nurses))}${kpi(t('st_treats_n'), stN(ov.treatments))}</div>`));
  box.innerHTML = out.join('');
}

/* ---------- تصدير CSV (آمن من حقن الصيغ في Excel) ---------- */
function statsCsv() {
  const d = S.stats && S.stats.data; if (!d) return '';
  const cell = v => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const rows = [], add = (...r) => rows.push(r.map(cell).join(',')), sec = n => { rows.push(''); add('## ' + n); };
  const s = d.summary; add(t('st_title')); add(t('st_period'), d.range.d0 ? stTs(d.range.d0, d.range.tz) + ' → ' + stTs(d.range.d1 ? d.range.d1 - 1 : Date.now(), d.range.tz) : t('st_all_time'));
  sec(t('st_visits')); [['st_visits', s.visits], ['st_patients', s.patients], ['st_billed', s.billed], ['st_collected', s.collected], ['st_outstanding', s.outstanding], ['st_avg_bill', s.avgBill], ['st_avg_wait', s.avgWait], ['st_avg_dur', s.avgDuration], ['st_followups', s.followUps], ['st_free', s.freeVisits], ['st_images', s.images]].forEach(([k, v]) => add(t(k), v));
  sec(t('st_trend_visits')); add('date', t('st_visits'), t('st_billed'), t('st_collected')); d.series.forEach(x => add(x.k, x.visits, x.billed, x.collected));
  sec(t('st_treat')); add(t('st_c_treat'), t('st_c_visits'), t('st_c_billed'), t('st_c_paid'), t('st_c_debt'), t('st_c_avg'), t('st_c_dur')); d.treatments.forEach(x => add(treatLabel(x.name), x.visits, x.billed, x.paid, x.debt, x.avgPrice, x.avgDuration));
  sec(t('st_weekday')); t('days_full').forEach((n, i) => add(n, d.weekday[i].visits, d.weekday[i].billed));
  sec(t('st_hours')); d.hours.forEach((v, h) => add(h + ':00', v));
  sec(t('st_ages')); d.ages.forEach(a => add(a.to >= 200 ? a.from + '+' : a.from + '-' + a.to, a.visits, a.billed));
  sec(t('st_gender')); ['ذكر', 'أنثى'].forEach(g => add(genderL(g), d.gender[g].visits, d.gender[g].billed));
  sec(t('st_reasons')); d.reasons.forEach(r => add(reasonL(r.name), r.visits));
  sec(t('st_teeth')); Object.keys(d.teeth.perTooth).sort().forEach(k => add(k, d.teeth.perTooth[k]));
  sec(t('st_top_debtors')); add(t('st_c_pat'), t('st_c_phone'), t('st_c_bal')); d.debt.top.forEach(x => add(x.name, x.phone, x.balance));
  return '\ufeff' + rows.join('\r\n');
}

/* ---------- الربط بالواجهة ---------- */
ACT.statsRange = el => {
  const st = ST(), r = el.dataset.r, iso = x => x.toLocaleDateString('en-CA'), now = new Date(); let a = '', b = iso(now);
  if (r === 'today') a = b; else if (r === '7' || r === '30') { const x = new Date(now); x.setDate(x.getDate() - (+r - 1)); a = iso(x); }
  else if (r === 'month') a = iso(new Date(now.getFullYear(), now.getMonth(), 1)); else if (r === 'year') a = iso(new Date(now.getFullYear(), 0, 1)); else { a = ''; b = ''; }
  $('#sFrom').value = a; $('#sTo').value = b; st.r = r; st.data = null; loadStats();
};
ACT.statsExport = () => { const csv = statsCsv(); if (!csv) return; download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'clinic_stats_' + new Date().toISOString().slice(0, 10) + '.csv'); };
document.addEventListener('change', e => { const el = e.target; if (el && el.dataset && el.dataset.input === 'stats') { const st = ST(); st.r = 'custom'; st.data = null; loadStats(); } });

/* تحديث حيّ هادئ: عند وصول تغيير من الخادم والتبويب مفتوح (بحدّ أقصى مرة كل 5 ثوانٍ) */
{
  const base = renderAll;
  renderAll = function () { const r = base.apply(this, arguments); const st = S.stats; if (st && st.data && $('#statsTab.active') && Date.now() - st.last > 5000) { st.last = Date.now(); loadStats(true); } return r; };
}
