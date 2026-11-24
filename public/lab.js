/* ===== قسم «المختبر» =====
   - في «العلاجات والأسعار» يُعلَّم كل علاج «يحتاج مختبر» (prices.list[علاج].lab).
   - في المعاينة صندوق «🧪 المختبر»: يعرض العلاجات المختارة التي تحتاج مختبراً، وزر الإرسال ينشئ حالة مختبر تلقائياً
     بكل المعلومات (اسم المريض، العمر، الهاتف، العلاج، الأسنان، التاريخ، الطبيب).
   - تبويب «المختبر»: قائمة الحالات ومراحل كل حالة، وإدارة أسماء المختبرات وقوالب المراحل لكل نوع علاج.
   يعتمد على app.js (t, L, S, $, $$, esc, api, run, toast, ACT, ymd, ymdS, ymdHM, treatList, treatLabel, appDialog, appPrompt, DENT, lineKey, flatOf). */
const Lab = { data: null, filter: 'open', lab: '', q: '', cfg: false, draft: null, pick: '', busy: false, tried: false };

Object.assign(L.ar, {
  tab_lab_s: 'المختبر', lab_needs: 'يحتاج مختبر', lab_title: '🧪 المختبر', lab_box_t: '🧪 المختبر', lab_box_hint: 'علاجات هذه المعاينة التي تحتاج مختبراً. اضغط «إرسال» لتُضاف بكل معلومات المريض إلى قسم المختبر.',
  lab_none_sel: 'لا يوجد في العلاجات المختارة علاج يحتاج مختبراً. علّم العلاج بـ«يحتاج مختبر» من الإعدادات ← العلاجات والأسعار.', lab_send: '🧪 إرسال إلى المختبر', lab_sent: '✓ في المختبر', lab_sent_n: 'أُرسلت {n} حالة إلى المختبر', lab_already: 'هذه الحالة موجودة في المختبر مسبقاً',
  lab_choose: 'المختبر', lab_no_lab: '— بدون تحديد —', lab_new_ph: 'اسم المختبر', lab_ask_name: 'اسم المختبر الذي ستُرسل إليه الحالة:', lab_teeth: 'الأسنان',
  lab_f_open: 'قيد العمل', lab_f_done: 'مكتملة', lab_f_all: 'الكل', lab_all_labs: 'كل المختبرات', lab_search: 'بحث باسم المريض أو العلاج…', lab_empty: 'لا توجد حالات في المختبر هنا.', lab_empty_hint: 'تُضاف الحالات من زر «المختبر» في شاشة المعاينة.',
  lab_manage: '⚙️ المختبرات والمراحل', lab_close_cfg: 'إغلاق الإعدادات', lab_labs_t: 'أسماء المختبرات', lab_add_lab: '＋ إضافة مختبر', lab_phone_ph: 'هاتف (اختياري)', lab_del_lab: 'حذف المختبر',
  lab_stages_t: 'مراحل العلاج حسب نوعه', lab_stages_hint: 'لكل علاج مراحله الخاصة. إن لم تحدّد مراحل لعلاج ما تُستعمل المراحل العامة. التعديل يسري على الحالات المفتوحة مع الإبقاء على ما أُنجز.',
  lab_def_t: 'المراحل العامة (الافتراضية)', lab_add_stage: '＋ مرحلة', lab_stage_ph: 'اسم المرحلة', lab_use_def: 'استعمال المراحل العامة', lab_custom: 'مراحل خاصة', lab_save: '💾 حفظ', lab_saved: 'تم الحفظ', lab_reset_st: 'مسح المراحل الخاصة',
  lab_no_flag: 'لم يُعلَّم أي علاج بـ«يحتاج مختبر» بعد؛ علّمه من الإعدادات ← العلاجات والأسعار لتظهر مراحله هنا.', lab_next: 'المرحلة التالية ▶', lab_back: '◀ تراجع', lab_done: '✓ اكتملت',
  lab_sent_on: 'أُرسلت', lab_due: 'موعد التسليم المتوقع', lab_note_ph: 'ملاحظات للمختبر أو للحالة…', lab_del: 'حذف الحالة', lab_del_q: 'حذف هذه الحالة من المختبر؟', lab_progress: 'المرحلة {a} من {b}', lab_age: '{n} سنة', lab_late: 'متأخرة', lab_stage_done_on: 'أُنجزت',
  e_not_found: 'العنصر غير موجود'
});
Object.assign(L.en, {
  tab_lab_s: 'Lab', lab_needs: 'Needs lab', lab_title: '🧪 Lab', lab_box_t: '🧪 Lab', lab_box_hint: 'Treatments of this visit that need a lab. Press “Send” to add them, with all patient details, to the Lab section.',
  lab_none_sel: 'None of the selected treatments needs a lab. Mark a treatment “Needs lab” in Settings → Treatments & prices.', lab_send: '🧪 Send to lab', lab_sent: '✓ In lab', lab_sent_n: '{n} case(s) sent to the lab', lab_already: 'This case is already in the lab',
  lab_choose: 'Lab', lab_no_lab: '— not set —', lab_new_ph: 'Lab name', lab_ask_name: 'Name of the lab this case is going to:', lab_teeth: 'Teeth',
  lab_f_open: 'In progress', lab_f_done: 'Completed', lab_f_all: 'All', lab_all_labs: 'All labs', lab_search: 'Search patient or treatment…', lab_empty: 'No lab cases here.', lab_empty_hint: 'Cases are added from the “Lab” button in the consultation screen.',
  lab_manage: '⚙️ Labs & stages', lab_close_cfg: 'Close settings', lab_labs_t: 'Lab names', lab_add_lab: '＋ Add lab', lab_phone_ph: 'Phone (optional)', lab_del_lab: 'Delete lab',
  lab_stages_t: 'Stages by treatment type', lab_stages_hint: 'Each treatment can have its own stages. Treatments without their own use the general stages. Changes apply to open cases and keep what is already done.',
  lab_def_t: 'General (default) stages', lab_add_stage: '＋ Stage', lab_stage_ph: 'Stage name', lab_use_def: 'Use general stages', lab_custom: 'Own stages', lab_save: '💾 Save', lab_saved: 'Saved', lab_reset_st: 'Clear own stages',
  lab_no_flag: 'No treatment is marked “Needs lab” yet; mark it in Settings → Treatments & prices so its stages show here.', lab_next: 'Next stage ▶', lab_back: '◀ Undo', lab_done: '✓ Completed',
  lab_sent_on: 'Sent', lab_due: 'Expected delivery', lab_note_ph: 'Notes for the lab or the case…', lab_del: 'Delete case', lab_del_q: 'Delete this case from the lab?', lab_progress: 'Stage {a} of {b}', lab_age: '{n} y', lab_late: 'Overdue', lab_stage_done_on: 'Done',
  e_not_found: 'Item not found'
});

const labOn = tr => { const e = S.me && S.me.prices && S.me.prices.list && S.me.prices.list[tr]; return !!(e && e.lab); };
const labIsDoc = () => !!(S.me && S.me.role === 'doctor');
const labName = id => { const x = Lab.data && Lab.data.labs.find(z => z.id === id); return x ? x.name : ''; };
const labStagesOf = tr => (Lab.data && Lab.data.stages[tr] && Lab.data.stages[tr].length) ? Lab.data.stages[tr] : (Lab.data ? Lab.data.def : []);
const labCaseKey = (pid, tr, teeth) => pid + '|' + tr + '|' + [...teeth].sort().join(' ');
const labDays = d => Math.floor((Date.now() - d) / 864e5);

async function labLoad(quiet) {
  if (!labIsDoc() || Lab.busy) return; Lab.busy = true; Lab.tried = true;
  try { Lab.data = await api('GET', '/api/lab'); } catch (e) { if (!quiet) toast(errMsg(e), 'danger'); }
  Lab.busy = false; labBadge(); if ($('#labTab.active') && !(quiet && $('#labArea').contains(document.activeElement))) labRender(); if (Lab.data) labUpdate();
}
function labBadge() { const b = $('#labCount'); if (!b || !Lab.data) return; const n = Lab.data.cases.filter(c => !c.doneAt).length; b.textContent = n; b.classList.toggle('zero', !n); }
function labMerge(c) { if (!Lab.data) return; const i = Lab.data.cases.findIndex(z => z.id === c.id); if (i >= 0) Lab.data.cases[i] = c; else Lab.data.cases.unshift(c); labBadge(); }

/* ---------- المعاينة: صندوق «المختبر» ---------- */
/* العلاجات المختارة التي تحتاج مختبراً مع أسنانها (العلاج «الواحد» لعدة أسنان يأخذ كل الأسنان؛ وإلا الأسنان غير المُزالة من سطره) */
function labItems() {
  const out = []; if (!S.treatments) return out;
  for (const tr of S.treatments) {
    if (!labOn(tr)) continue;
    let teeth = DENT() ? [...(S.teeth || [])].sort() : [];
    if (DENT() && !flatOf(tr)) teeth = teeth.filter(th => !S.removed.has(lineKey(th, tr)));
    out.push({ treatment: tr, teeth });
  }
  return out;
}
function labBoxHTML() {
  const a = S.patients.find(p => p.status === 'in'), items = a ? labItems() : [], labs = Lab.data ? Lab.data.labs : [];
  if (!Lab.data && !Lab.tried) labLoad(true);
  if (!items.length) return `<div id="labBox" class="lab-box"><div class="lab-box-h"><strong>${esc(t('lab_box_t'))}</strong></div><div class="hint">${esc(t('lab_none_sel'))}</div></div>`;
  const known = new Set((Lab.data ? Lab.data.cases : []).map(c => labCaseKey(c.patientId, c.treatment, c.teeth || []))), todo = items.filter(i => !known.has(labCaseKey(a.id, i.treatment, i.teeth)));
  const sel = labs.length ? `<label class="lab-sel"><span>${esc(t('lab_choose'))}</span><select id="labPickSel" data-lab="pick"><option value="">${esc(t('lab_no_lab'))}</option>${labs.map(l => `<option value="${l.id}"${Lab.pick === l.id ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label>` : '';
  return `<div id="labBox" class="lab-box"><div class="lab-box-h"><strong>${esc(t('lab_box_t'))}</strong></div><div class="hint">${esc(t('lab_box_hint'))}</div>
    <div class="lab-items">${items.map(i => { const sent = known.has(labCaseKey(a.id, i.treatment, i.teeth)); return `<div class="lab-item${sent ? ' sent' : ''}"><b>${esc(treatLabel(i.treatment))}</b>${i.teeth.length ? `<span class="lab-th">${esc(t('lab_teeth'))}: ${esc(i.teeth.join(' '))}</span>` : ''}${sent ? `<span class="lab-ok">${esc(t('lab_sent'))}</span>` : ''}</div>`; }).join('')}</div>
    <div class="lab-send-row">${sel}${todo.length ? `<button type="button" class="btn-primary" data-act="labSend">${esc(t('lab_send'))}${todo.length > 1 ? ' (' + todo.length + ')' : ''}</button>` : ''}</div></div>`;
}
function labUpdate() { const b = $('#labBox'); if (b && window.labBoxHTML) b.outerHTML = labBoxHTML(); }

async function labSend() {
  const a = S.patients.find(p => p.status === 'in'); if (!a) return;
  const items = labItems(); if (!items.length) return;
  if (!Lab.data) await labLoad();
  if (!Lab.data) return;
  let labId = ($('#labPickSel') || {}).value || Lab.pick || '';
  if (!Lab.data.labs.length) {   // لا يوجد مختبر بعد: نسأل عن اسمه ونحفظه ثم نتابع
    const nm = await appPrompt(t('lab_ask_name'), ''); if (nm === null || nm === false) return;
    if (nm.trim()) { const r = await run(() => api('PUT', '/api/lab/config', { labs: [{ name: nm.trim() }], stages: Lab.data.stages, def: Lab.data.def })); if (!r) return; Lab.data = r; labId = r.labs[0].id; }
  }
  Lab.pick = labId;
  const r = await run(() => api('POST', '/api/lab/cases', { patientId: a.id, labId, items }));
  if (!r) return;
  r.cases.forEach(labMerge); const n = r.cases.filter(c => c.created).length;
  toast(n ? t('lab_sent_n', { n }) : t('lab_already'), n ? 'success' : 'info'); labUpdate(); if ($('#labTab.active')) labRender();
}

/* ---------- التبويب ---------- */
const labInfoLine = c => [c.birthYear ? t('lab_age', { n: new Date().getFullYear() - c.birthYear }) : '', c.phone ? `<span dir="ltr">${esc(c.phone)}</span>` : ''].filter(Boolean).join(' · ');
function labCardHTML(c) {
  const st = c.stages || [], dn = st.filter(s => s.at).length, cur = st.findIndex(s => !s.at), done = !!c.doneAt, late = !done && c.due && c.due < localDay();
  const labs = Lab.data.labs;
  return `<div class="lab-card${done ? ' done' : ''}" data-id="${c.id}">
    <div class="lab-ch"><div><b class="lab-pn">${esc(c.name)}</b><div class="lab-sub">${labInfoLine(c)}</div></div>
      <div class="lab-tr"><span class="lab-trn">${esc(treatLabel(c.treatment))}</span>${c.teeth && c.teeth.length ? `<span class="lab-th">${esc(t('lab_teeth'))}: ${esc(c.teeth.join(' '))}</span>` : ''}</div></div>
    <div class="lab-meta"><label class="lab-sel"><span>${esc(t('lab_choose'))}</span><select data-lab="caseLab" data-id="${c.id}"><option value="">${esc(t('lab_no_lab'))}</option>${labs.map(l => `<option value="${l.id}"${c.labId === l.id ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label>
      <span class="lab-d">${esc(t('lab_sent_on'))}: <b dir="ltr">${esc(ymdHM(c.createdAt))}</b></span>
      <label class="lab-sel"><span>${esc(t('lab_due'))}</span><span class="ymd-pick live"><span class="ymd-show" dir="ltr">YYYY/MM/DD</span><input type="date" data-lab="due" data-id="${c.id}" value="${esc(c.due || '')}"></span></label>${late ? `<span class="lab-late">⏰ ${esc(t('lab_late'))}</span>` : ''}</div>
    <div class="lab-steps" role="list">${st.map((s, i) => `<button type="button" role="listitem" class="lab-step${s.at ? ' on' : ''}${i === cur ? ' cur' : ''}" data-act="labTog" data-id="${c.id}" data-i="${i}" title="${s.at ? esc(t('lab_stage_done_on') + ' ' + ymdHM(s.at)) : ''}"><i>${s.at ? '✓' : i + 1}</i><span>${esc(s.n)}</span>${s.at ? `<small dir="ltr">${esc(ymdS(new Date(s.at).toISOString().slice(0, 10)))}</small>` : ''}</button>`).join('')}</div>
    <div class="lab-act">${done ? `<span class="lab-fin">${esc(t('lab_done'))}</span>` : `<span class="lab-prog">${esc(t('lab_progress', { a: Math.min(dn + 1, st.length), b: st.length }))}</span><button type="button" class="btn-action btn-green" data-act="labNext" data-id="${c.id}">${esc(t('lab_next'))}</button>`}
      ${dn ? `<button type="button" class="btn-action" data-act="labBack" data-id="${c.id}">${esc(t('lab_back'))}</button>` : ''}<button type="button" class="btn-action btn-red" data-act="labDel" data-id="${c.id}">${esc(t('lab_del'))}</button></div>
    <textarea class="lab-note" maxlength="500" data-lab="note" data-id="${c.id}" placeholder="${esc(t('lab_note_ph'))}">${esc(c.note || '')}</textarea></div>`;
}
function labCfgHTML() {
  const d = Lab.draft, flagged = treatList().filter(labOn);
  const stRow = (arr, key) => `<div class="lab-stlist" data-key="${esc(key)}">${arr.map((n, i) => `<div class="lab-strow"><span class="lab-sn">${i + 1}</span><input type="text" maxlength="40" value="${esc(n)}" data-lab="stIn" data-key="${esc(key)}" data-i="${i}" placeholder="${esc(t('lab_stage_ph'))}"><button type="button" class="btn-action" data-act="labStMove" data-key="${esc(key)}" data-i="${i}" data-d="-1">▲</button><button type="button" class="btn-action" data-act="labStMove" data-key="${esc(key)}" data-i="${i}" data-d="1">▼</button><button type="button" class="btn-action btn-red" data-act="labStDel" data-key="${esc(key)}" data-i="${i}">✕</button></div>`).join('')}<button type="button" class="btn-action" data-act="labStAdd" data-key="${esc(key)}">${esc(t('lab_add_stage'))}</button></div>`;
  return `<div class="lab-cfg"><div class="lab-cfg-h"><strong>${esc(t('lab_manage'))}</strong></div>
    <div class="lab-sec"><div class="sec-t">${esc(t('lab_labs_t'))}</div>${d.labs.map((l, i) => `<div class="lab-labrow"><input type="text" maxlength="80" value="${esc(l.name)}" data-lab="labName" data-i="${i}" placeholder="${esc(t('lab_new_ph'))}"><input type="tel" dir="ltr" maxlength="25" value="${esc(l.phone || '')}" data-lab="labPhone" data-i="${i}" placeholder="${esc(t('lab_phone_ph'))}"><button type="button" class="btn-action btn-red" data-act="labDelLab" data-i="${i}" title="${esc(t('lab_del_lab'))}">✕</button></div>`).join('')}<button type="button" class="btn-action" data-act="labAddLab">${esc(t('lab_add_lab'))}</button></div>
    <div class="lab-sec"><div class="sec-t">${esc(t('lab_stages_t'))}</div><div class="hint">${esc(t('lab_stages_hint'))}</div>
      <div class="lab-trbox"><b>${esc(t('lab_def_t'))}</b>${stRow(d.def, '*')}</div>
      ${flagged.length ? flagged.map(tr => { const own = d.stages[tr]; return `<div class="lab-trbox"><div class="lab-trh"><b>${esc(treatLabel(tr))}</b><label class="lab-own"><input type="checkbox" data-lab="own" data-key="${esc(tr)}" ${own ? 'checked' : ''}> ${esc(t('lab_custom'))}</label></div>${own ? stRow(own, tr) : `<div class="hint">${esc(t('lab_use_def'))}</div>`}</div>`; }).join('') : `<div class="hint">${esc(t('lab_no_flag'))}</div>`}</div>
    <div class="lab-cfg-f"><button type="button" class="btn-primary" data-act="labSave">${esc(t('lab_save'))}</button><button type="button" class="btn-action" data-act="labCfg">${esc(t('lab_close_cfg'))}</button></div></div>`;
}
function labRender(reload) {
  const area = $('#labArea'); if (!area) return;
  if (!labIsDoc()) { area.innerHTML = ''; return; }
  if (!Lab.data) { area.innerHTML = '<div class="hint" style="padding:30px;text-align:center">…</div>'; labLoad(); return; }
  if (reload) labLoad(true);
  const q = Lab.q.trim().toLowerCase(), all = Lab.data.cases;
  const list = all.filter(c => (Lab.filter === 'all' || (Lab.filter === 'done' ? !!c.doneAt : !c.doneAt)) && (!Lab.lab || c.labId === Lab.lab) && (!q || (c.name + ' ' + c.treatment + ' ' + (c.teeth || []).join(' ')).toLowerCase().includes(q)));
  const nOpen = all.filter(c => !c.doneAt).length, nDone = all.length - nOpen, chip = (k, lbl, n) => `<button type="button" class="chip${Lab.filter === k ? ' on' : ''}" data-act="labFilter" data-v="${k}">${esc(t(lbl))} <b>${n}</b></button>`;
  const keep = document.activeElement && document.activeElement.id === 'labSearch';
  area.innerHTML = `<div class="lab-wrap"><div class="lab-top"><h2 class="lab-h">${esc(t('lab_title'))}</h2><button type="button" class="btn-action btn-yellow" data-act="labCfg">${esc(Lab.cfg ? t('lab_close_cfg') : t('lab_manage'))}</button></div>
    ${Lab.cfg ? labCfgHTML() : ''}
    <div class="lab-filters">${chip('open', 'lab_f_open', nOpen)}${chip('done', 'lab_f_done', nDone)}${chip('all', 'lab_f_all', all.length)}
      <select data-lab="fLab" aria-label="${esc(t('lab_choose'))}"><option value="">${esc(t('lab_all_labs'))}</option>${Lab.data.labs.map(l => `<option value="${l.id}"${Lab.lab === l.id ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
      <input type="search" id="labSearch" data-lab="q" value="${esc(Lab.q)}" placeholder="${esc(t('lab_search'))}"></div>
    ${list.length ? `<div class="lab-list">${list.map(labCardHTML).join('')}</div>` : `<div class="lab-empty">${esc(t('lab_empty'))}<div class="hint">${esc(t('lab_empty_hint'))}</div></div>`}</div>`;
  if (typeof syncYmd === 'function') syncYmd();
  if (keep) { const i = $('#labSearch'); if (i) { i.focus(); try { const n = i.value.length; i.setSelectionRange(n, n); } catch (e) {} } }
}
function labDraftInit() { const d = Lab.data; Lab.draft = { labs: d.labs.map(x => ({ ...x })), stages: Object.fromEntries(Object.entries(d.stages).map(([k, v]) => [k, v.slice()])), def: d.def.slice() }; }
const labArr = key => key === '*' ? Lab.draft.def : Lab.draft.stages[key];

async function labPatch(id, body) { const r = await run(() => api('PUT', `/api/lab/cases/${id}`, body)); if (r) { labMerge(r.case); labRender(); labUpdate(); } return r; }

Object.assign(ACT, {
  labSend: () => labSend(),
  labFilter: el => { Lab.filter = el.dataset.v; labRender(); },
  labTog: el => { labPatch(el.dataset.id, { toggle: +el.dataset.i }); },
  labNext: el => { labPatch(el.dataset.id, { next: true }); },
  labBack: el => { labPatch(el.dataset.id, { back: true }); },
  labDel: async el => { if (await appConfirm(t('lab_del_q'))) { const r = await run(() => api('DELETE', `/api/lab/cases/${el.dataset.id}`)); if (r) { Lab.data.cases = Lab.data.cases.filter(c => c.id !== el.dataset.id); labBadge(); labRender(); labUpdate(); } } },
  labCfg: () => { Lab.cfg = !Lab.cfg; if (Lab.cfg) labDraftInit(); labRender(); },
  labAddLab: () => { Lab.draft.labs.push({ name: '', phone: '' }); labRender(); const i = $$('[data-lab=labName]').pop(); if (i) i.focus(); },
  labDelLab: el => { Lab.draft.labs.splice(+el.dataset.i, 1); labRender(); },
  labStAdd: el => { const a = labArr(el.dataset.key); a.push(''); labRender(); const l = $$(`[data-lab=stIn][data-key="${CSS.escape(el.dataset.key)}"]`).pop(); if (l) l.focus(); },
  labStDel: el => { labArr(el.dataset.key).splice(+el.dataset.i, 1); labRender(); },
  labStMove: el => { const a = labArr(el.dataset.key), i = +el.dataset.i, j = i + +el.dataset.d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; labRender(); },
  labSave: async () => {
    const d = Lab.draft, clean = a => a.map(x => x.trim()).filter(Boolean), stages = {};
    for (const [k, v] of Object.entries(d.stages)) { const c = clean(v); if (c.length) stages[k] = c; }
    const r = await run(() => api('PUT', '/api/lab/config', { labs: d.labs.filter(l => l.name.trim()), stages, def: clean(d.def) }));
    if (r) { Lab.data = r; labDraftInit(); toast(t('lab_saved'), 'success'); labBadge(); labRender(); labUpdate(); }
  }
});

/* حقول التبويب: تغيير المختبر/الموعد/الملاحظة لكل حالة، وحقول لوحة الإعدادات (مسودة محلية تُحفظ بزر «حفظ») */
document.addEventListener('change', e => {
  const el = e.target, k = el.dataset && el.dataset.lab; if (!k) return;
  if (k === 'pick') Lab.pick = el.value;
  else if (k === 'caseLab') labPatch(el.dataset.id, { labId: el.value });
  else if (k === 'due') labPatch(el.dataset.id, { due: el.value });
  else if (k === 'fLab') { Lab.lab = el.value; labRender(); }
  else if (k === 'own') { if (el.checked) Lab.draft.stages[el.dataset.key] = Lab.draft.def.slice(); else delete Lab.draft.stages[el.dataset.key]; labRender(); }
});
document.addEventListener('input', e => {
  const el = e.target, k = el.dataset && el.dataset.lab; if (!k) return;
  if (k === 'q') { Lab.q = el.value; labRender(); }
  else if (k === 'labName') Lab.draft.labs[+el.dataset.i].name = el.value;
  else if (k === 'labPhone') Lab.draft.labs[+el.dataset.i].phone = el.value;
  else if (k === 'stIn') labArr(el.dataset.key)[+el.dataset.i] = el.value;
});
document.addEventListener('focusout', e => { const el = e.target; if (el && el.dataset && el.dataset.lab === 'note') { const c = Lab.data && Lab.data.cases.find(z => z.id === el.dataset.id); if (c && (c.note || '') !== el.value) run(() => api('PUT', `/api/lab/cases/${el.dataset.id}`, { note: el.value })).then(r => { if (r) labMerge(r.case); }); } });

/* تحميل أولي لشارة عدد الحالات المفتوحة، ثم تحديث دوري هادئ */
setInterval(() => { if (labIsDoc() && !document.hidden && (!Lab.data || $('#labTab.active'))) labLoad(true); }, 20000);
setTimeout(function first() { if (labIsDoc()) labLoad(true); else setTimeout(first, 2000); }, 1500);
