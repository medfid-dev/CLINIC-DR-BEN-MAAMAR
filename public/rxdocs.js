'use strict';
/* عيادتي الذكية — المستندات الطبية مع الوصفة: عطلة مرضية، طلب أشعة (راديو)، تحاليل، توجيه، شهادات…
   قوالب جاهزة بثلاث لغات، قابلة للتعديل الكامل من الطبيب وللحفظ كقوالب خاصة به (على الخادم).
   تُطبع بنفس ترويسة الوصفة، وتُحفظ مع المعاينة في الأرشيف عند «إنهاء المعاينة».
   يعتمد على rx.js (RX, rxTpl, rxHeadSnap…) وأدوات app.js (t, L, api, esc, toast, ACT, appConfirm, jget, jset, $). */

Object.assign(L.ar, {
  doc_open: '📄 المستندات', doc_title: '📄 المستندات الطبية', doc_tpls: 'القوالب', doc_new: '＋ مستند جديد فارغ',
  doc_title_ph: 'عنوان المستند', doc_body_ph: 'نص المستند…', doc_fields: 'بيانات المستند', doc_days: 'عدد الأيام', doc_from: 'ابتداءً من', doc_diag: 'التشخيص / سبب الطلب',
  doc_vars: 'أدرج في النص:', doc_save_tpl: '💾 حفظ التعديل في القالب', doc_save_new: '＋ حفظ كقالب جديد', doc_restore: '↩︎ استعادة النص الافتراضي', doc_delete: '🗑️ حذف القالب',
  doc_restore_c: 'استعادة النص الافتراضي لهذا القالب؟ (يُحذف تعديلك عليه)', doc_delete_c: 'حذف هذا القالب نهائياً؟', doc_saved: 'حُفظ القالب', doc_deleted: 'حُذف القالب', doc_restored: 'استُعيد النص الافتراضي',
  doc_add: '＋ إضافة إلى هذه المعاينة', doc_print: 'طباعة 🖨️', doc_added: 'أُضيف المستند وسيُحفظ في الأرشيف عند إنهاء المعاينة', doc_issued: 'مستندات هذه المعاينة', doc_none: 'لا مستندات بعد',
  doc_need: 'اكتب عنوان المستند ونصّه', doc_full: 'الحد الأقصى 10 مستندات للمعاينة', doc_preview: 'معاينة الورقة', doc_rec: 'مستندات طبية ({n})', doc_view: 'عرض', doc_sum_n: '{n} مستند',
  doc_v_patient: 'المريض', doc_v_age: 'العمر', doc_v_date: 'تاريخ اليوم', doc_v_days: 'عدد الأيام', doc_v_from: 'من تاريخ', doc_v_to: 'إلى تاريخ', doc_v_diag: 'التشخيص', doc_v_doctor: 'الطبيب',
  doc_mine: 'قالبي', doc_edited: 'معدَّل', doc_close: 'تم'
});
Object.assign(L.en, {
  doc_open: '📄 Documents', doc_title: '📄 Medical documents', doc_tpls: 'Templates', doc_new: '＋ New blank document',
  doc_title_ph: 'Document title', doc_body_ph: 'Document text…', doc_fields: 'Document data', doc_days: 'Number of days', doc_from: 'Starting', doc_diag: 'Diagnosis / reason',
  doc_vars: 'Insert into text:', doc_save_tpl: '💾 Save changes to template', doc_save_new: '＋ Save as new template', doc_restore: '↩︎ Restore default text', doc_delete: '🗑️ Delete template',
  doc_restore_c: 'Restore the default text of this template? (your edits are removed)', doc_delete_c: 'Delete this template permanently?', doc_saved: 'Template saved', doc_deleted: 'Template deleted', doc_restored: 'Default text restored',
  doc_add: '＋ Add to this consultation', doc_print: 'Print 🖨️', doc_added: 'Document added; it will be archived when the consultation is finished', doc_issued: 'Documents of this consultation', doc_none: 'No documents yet',
  doc_need: 'Enter the document title and text', doc_full: 'Maximum 10 documents per consultation', doc_preview: 'Paper preview', doc_rec: 'Medical documents ({n})', doc_view: 'View', doc_sum_n: '{n} document(s)',
  doc_v_patient: 'Patient', doc_v_age: 'Age', doc_v_date: 'Today', doc_v_days: 'Days', doc_v_from: 'From date', doc_v_to: 'To date', doc_v_diag: 'Diagnosis', doc_v_doctor: 'Doctor',
  doc_mine: 'Mine', doc_edited: 'edited', doc_close: 'Done'
});

const DOCS = { list: [], cur: null, tpls: null };   // list = مستندات هذه المعاينة؛ cur = المسودّة قيد التحرير؛ tpls = قوالب الطبيب المحفوظة

/* ---------- القوالب الجاهزة. المتغيّرات: {patient} {age} {date} {days} {from} {to} {diag} {doctor} ---------- */
const DOC_DEFAULTS = {
  ar: [
    { base: 'leave', kind: 'leave', title: 'شهادة عطلة مرضية', body: 'أنا الموقّع أدناه {doctor}، أشهد بأنّ السيد(ة): {patient} ({age})\nتستوجب حالته الصحية راحة طبية لمدة {days} أيام، ابتداءً من {from} إلى غاية {to} (شاملاً).\n\nسُلّمت هذه الشهادة للمعني بالأمر ليستعملها فيما يسمح به القانون.' },
    { base: 'leave_ext', kind: 'leave', title: 'تمديد عطلة مرضية', body: 'أنا الموقّع أدناه {doctor}، أشهد بأنّ السيد(ة): {patient} ({age})\nما زالت حالته الصحية تستوجب تمديد الراحة الطبية لمدة {days} أيام إضافية، ابتداءً من {from} إلى غاية {to}.\n\nسُلّمت هذه الشهادة للمعني بالأمر ليستعملها فيما يسمح به القانون.' },
    { base: 'radio', kind: 'radio', title: 'طلب فحص بالأشعة (راديو)', body: 'المريض(ة): {patient} ({age})\n\nالفحص المطلوب:\n☐ أشعة سينية (Radiographie)\n☐ بانورامي الأسنان (Panoramique)\n☐ مقطعي مخروطي CBCT\n☐ سكانير (Scanner)\n☐ رنين مغناطيسي (IRM)\n☐ إيكوغرافيا (Échographie)\n\nالمنطقة المراد تصويرها: ........................................\nالمعلومات السريرية / سبب الطلب: {diag}\n\nيُرجى إجراء الفحص وتسليم الصور والتقرير للمريض.\nالتاريخ: {date}' },
    { base: 'lab', kind: 'lab', title: 'طلب تحاليل مخبرية', body: 'المريض(ة): {patient} ({age})\n\nالتحاليل المطلوبة:\n☐ تعداد الدم FNS\n☐ سكر الدم صائماً\n☐ زمن النزف وزمن التخثر\n☐ CRP / VS\n☐ البولة والكرياتينين\n☐ التحاليل الأخرى: ................................\n\nالمعلومات السريرية: {diag}\nالتاريخ: {date}' },
    { base: 'refer', kind: 'refer', title: 'رسالة توجيه إلى زميل', body: 'إلى الزميل الفاضل: ........................................\n\nتحية طيبة وبعد،\nأوجّه إليكم المريض(ة) {patient} ({age}) من أجل: {diag}\n\nأرجو التكرّم بفحصه وإفادتي بما ترونه مناسباً.\nشكراً لتعاونكم.\nالتاريخ: {date}' },
    { base: 'cert', kind: 'cert', title: 'شهادة طبية', body: 'أشهد أنا الموقّع أدناه {doctor} أنني فحصت بتاريخ {date} السيد(ة): {patient} ({age})، وأنّ حالته الصحية: ........................................\n\nسُلّمت هذه الشهادة بطلب من المعني بالأمر للإدلاء بها عند الحاجة.' },
    { base: 'attend', kind: 'cert', title: 'شهادة حضور', body: 'أشهد أنا الموقّع أدناه {doctor} بأنّ السيد(ة): {patient} ({age}) قد حضر إلى العيادة بتاريخ {date} من أجل الفحص / العلاج.\n\nسُلّمت هذه الشهادة للإدلاء بها عند الحاجة.' }
  ],
  fr: [
    { base: 'leave', kind: 'leave', title: 'Certificat d’arrêt de travail', body: 'Je soussigné(e) {doctor}, certifie que l’état de santé de M./Mme {patient} ({age}) nécessite un arrêt de travail de {days} jour(s), du {from} au {to} inclus.\n\nCertificat remis à l’intéressé(e) pour faire valoir ce que de droit.' },
    { base: 'leave_ext', kind: 'leave', title: 'Prolongation d’arrêt de travail', body: 'Je soussigné(e) {doctor}, certifie que l’état de santé de M./Mme {patient} ({age}) nécessite une prolongation de l’arrêt de travail de {days} jour(s), du {from} au {to} inclus.\n\nCertificat remis à l’intéressé(e) pour faire valoir ce que de droit.' },
    { base: 'radio', kind: 'radio', title: 'Demande d’examen radiologique', body: 'Patient(e) : {patient} ({age})\n\nExamen demandé :\n☐ Radiographie\n☐ Panoramique dentaire\n☐ Cone Beam (CBCT)\n☐ Scanner\n☐ IRM\n☐ Échographie\n\nRégion à explorer : ........................................\nRenseignements cliniques / motif : {diag}\n\nMerci de réaliser l’examen et de remettre clichés et compte rendu au patient.\nDate : {date}' },
    { base: 'lab', kind: 'lab', title: 'Demande d’analyses biologiques', body: 'Patient(e) : {patient} ({age})\n\nAnalyses demandées :\n☐ NFS\n☐ Glycémie à jeun\n☐ TS / TC\n☐ CRP / VS\n☐ Urée et créatinine\n☐ Autres : ................................\n\nRenseignements cliniques : {diag}\nDate : {date}' },
    { base: 'refer', kind: 'refer', title: 'Lettre d’orientation vers un confrère', body: 'Cher confrère, chère consœur : ........................................\n\nJe vous adresse M./Mme {patient} ({age}) pour : {diag}\n\nMerci de bien vouloir l’examiner et de me tenir informé de votre avis.\nConfraternellement.\nDate : {date}' },
    { base: 'cert', kind: 'cert', title: 'Certificat médical', body: 'Je soussigné(e) {doctor}, certifie avoir examiné le {date} M./Mme {patient} ({age}) et que son état de santé : ........................................\n\nCertificat établi à la demande de l’intéressé(e) pour faire valoir ce que de droit.' },
    { base: 'attend', kind: 'cert', title: 'Attestation de présence', body: 'Je soussigné(e) {doctor}, atteste que M./Mme {patient} ({age}) s’est présenté(e) au cabinet le {date} pour consultation / soins.\n\nAttestation remise pour faire valoir ce que de droit.' }
  ],
  en: [
    { base: 'leave', kind: 'leave', title: 'Sick leave certificate', body: 'I, the undersigned {doctor}, certify that the health condition of {patient} ({age}) requires medical rest for {days} day(s), from {from} to {to} inclusive.\n\nThis certificate is issued to the person concerned for whatever legal purpose it may serve.' },
    { base: 'leave_ext', kind: 'leave', title: 'Sick leave extension', body: 'I, the undersigned {doctor}, certify that the health condition of {patient} ({age}) requires an extension of medical rest for {days} more day(s), from {from} to {to} inclusive.\n\nThis certificate is issued to the person concerned for whatever legal purpose it may serve.' },
    { base: 'radio', kind: 'radio', title: 'Imaging request', body: 'Patient: {patient} ({age})\n\nExamination requested:\n☐ X-ray\n☐ Dental panoramic\n☐ Cone Beam CT (CBCT)\n☐ CT scan\n☐ MRI\n☐ Ultrasound\n\nArea to image: ........................................\nClinical information / reason: {diag}\n\nPlease perform the examination and give the images and report to the patient.\nDate: {date}' },
    { base: 'lab', kind: 'lab', title: 'Laboratory tests request', body: 'Patient: {patient} ({age})\n\nTests requested:\n☐ Complete blood count\n☐ Fasting blood glucose\n☐ Bleeding / clotting time\n☐ CRP / ESR\n☐ Urea and creatinine\n☐ Other: ................................\n\nClinical information: {diag}\nDate: {date}' },
    { base: 'refer', kind: 'refer', title: 'Referral letter', body: 'Dear colleague: ........................................\n\nI am referring {patient} ({age}) to you for: {diag}\n\nI would be grateful if you could examine the patient and advise me of your findings.\nThank you for your cooperation.\nDate: {date}' },
    { base: 'cert', kind: 'cert', title: 'Medical certificate', body: 'I, the undersigned {doctor}, certify that I examined {patient} ({age}) on {date} and that the patient’s health condition is: ........................................\n\nThis certificate is issued at the request of the person concerned.' },
    { base: 'attend', kind: 'cert', title: 'Attendance certificate', body: 'I, the undersigned {doctor}, certify that {patient} ({age}) attended the clinic on {date} for examination / treatment.\n\nThis certificate is issued for whatever legal purpose it may serve.' }
  ]
};
const DOC_ICON = { leave: '🛌', radio: '🩻', lab: '🧪', refer: '✉️', cert: '📜', custom: '📄' };
const DOC_VARS = [['patient', 'doc_v_patient'], ['age', 'doc_v_age'], ['date', 'doc_v_date'], ['days', 'doc_v_days'], ['from', 'doc_v_from'], ['to', 'doc_v_to'], ['diag', 'doc_v_diag'], ['doctor', 'doc_v_doctor']];

const docLang = () => rxTpl().lang;
const docIsBuiltinId = id => /^[a-z_]+_(ar|fr|en)$/.test(id || '');
const docUserTpls = () => Array.isArray(DOCS.tpls) ? DOCS.tpls : [];
/* القائمة الفعلية بلغة الورقة: الجاهز (أو نسخة الطبيب المعدّلة منه) ثم قوالب الطبيب الخاصة */
function docTplList() {
  const lang = docLang(), mine = docUserTpls(), out = [];
  for (const d of DOC_DEFAULTS[lang] || DOC_DEFAULTS.ar) {
    const id = d.base + '_' + lang, ov = mine.find(x => x.id === id);
    out.push({ id, kind: d.kind, title: ov ? ov.title : d.title, body: ov ? ov.body : d.body, builtin: true, edited: !!ov, def: d });
  }
  for (const m of mine) if (!docIsBuiltinId(m.id)) out.push({ id: m.id, kind: m.kind || 'custom', title: m.title, body: m.body, builtin: false, edited: false });
  return out;
}
const docTodayISO = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
const docFmt = (iso, loc) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); if (!m) return ''; const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d) ? '' : d.toLocaleDateString(loc, { dateStyle: 'long' }); };
const docAddDays = (iso, n) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); if (!m) return ''; const d = new Date(+m[1], +m[2] - 1, +m[3] + n); const p = k => String(k).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };

/* استبدال المتغيّرات بقيمها (للمعاينة وللطباعة/الحفظ) */
function docResolve(text, F) {
  const T = rxTpl(), L2 = T.L, pat = RX.pat || {}, age = pat.birthYear ? (new Date().getFullYear() - pat.birthYear) + ' ' + L2.years : '';
  const days = Math.max(1, Math.min(365, parseInt(F.days) || 1)), from = F.from || docTodayISO();
  const V = { patient: pat.name || '..........', age, date: new Date().toLocaleDateString(L2.loc, { dateStyle: 'long' }), days: String(days), from: docFmt(from, L2.loc), to: docFmt(docAddDays(from, days - 1), L2.loc), diag: (F.diag || '').trim() || '........................', doctor: String(T.doctor || '').trim() || rxDocName() || '..........' };
  return String(text).replace(/\{(patient|age|date|days|from|to|diag|doctor)\}/g, (_, k) => V[k]).replace(/\s*[（(]\s*[）)]/g, '');
}

/* ---------- الورقة (للمعاينة والطباعة والأرشيف) ---------- */
function docPaperHTML(d, pat, ts, head, zw) {
  const T = rxTpl(head);
  if (T.lay && typeof rxlRender === 'function') return rxlRender(T.lay, T, [], pat, ts, { zoom: true, zw, doc: d });   // نفس تخطيط الوصفة المحفوظ (ترويسة، مواضع، خطوط، توقيع)
  const L2 = T.L, yr = new Date(ts).getFullYear(), age = pat && pat.birthYear ? yr - pat.birthYear : null, contact = [T.phone ? `${L2.phone}: ${T.phone}` : '', T.address].filter(Boolean).join(' · ');
  return `<div class="rxp rxp-docpage" dir="${L2.dir}"><div class="rxp-head">${T.logo ? `<img class="rxp-logo" src="${esc(T.logo)}" alt="">` : ''}<div class="rxp-hc"><div class="rxp-clinic">${esc(T.clinic)}</div>${T.doctor ? `<div>${esc(T.doctor)}</div>` : ''}${T.spec ? `<div class="rxp-spec">${esc(T.spec)}</div>` : ''}${contact ? `<div class="rxp-contact">${esc(contact)}</div>` : ''}</div><div class="rxp-date">${esc(L2.date)}: ${esc(new Date(ts).toLocaleDateString(L2.loc, { dateStyle: 'long' }))}</div></div>
    <div class="rxp-pat"><span>${esc(L2.patient)}: <b>${esc(pat && pat.name || '')}</b></span>${age != null ? `<span>${esc(L2.age)}: <b>${age} ${esc(L2.years)}</b></span>` : ''}</div>
    <div class="rxp-doctitle">${esc(d.title)}</div><div class="rxp-docbody">${esc(d.body)}</div>
    <div class="rxp-sign">${esc(L2.sign)}</div></div>`;
}
function docPrint(d, pat, ts, head) {
  if (!d || !d.body) return toast(t('doc_need'), 'info');
  if (rxTpl(head).lay && typeof rxPrintDoc === 'function') return rxPrintDoc([], pat, ts, head, null, d);   // الطباعة بنفس تخطيط الوصفة
  let box = $('#rxPrint'); if (!box) { box = document.createElement('div'); box.id = 'rxPrint'; document.body.appendChild(box); }
  box.innerHTML = docPaperHTML(d, pat, ts, head);
  document.body.classList.add('print-rx');
  const done = () => { document.body.classList.remove('print-rx'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
}

/* ---------- مستندات هذه المعاينة: مسودّة محلية تُرسل مع «إنهاء المعاينة» ---------- */
const docsSave = () => { jset('cc_docs_draft', { pid: RX.pid, list: DOCS.list }); docsSummary(); };
function docsList() { return DOCS.list.map(d => ({ kind: d.kind, title: d.title, body: d.body })); }
function docsSummary() {
  const e = $('#docSum'); if (!e) return;
  e.innerHTML = DOCS.list.length ? DOCS.list.map(d => `<span>${DOC_ICON[d.kind] || '📄'} ${esc(d.title)}</span>`).join('') : '';
}
function docsReset(a) {
  DOCS.list = []; DOCS.cur = null;
  if (a) { const d = jget('cc_docs_draft', null); if (d && d.pid === a.id && Array.isArray(d.list)) DOCS.list = d.list.filter(z => z && z.title && z.body).slice(0, 10); }
}
function docsDone() { DOCS.list = []; DOCS.cur = null; try { localStorage.removeItem('cc_docs_draft'); } catch (e) {} docsSummary(); const m = $('#docModal'); if (m) m.remove(); }
/* نربط دورة حياة الوصفة: نفس لحظات التهيئة والتركيب والإنهاء */
(() => {
  const r0 = window.rxReset, d0 = window.rxDone, m0 = window.rxMount, l0 = window.rxLoad;
  if (r0) window.rxReset = function (a) { r0.apply(this, arguments); docsReset(a); };
  if (d0) window.rxDone = function () { d0.apply(this, arguments); docsDone(); };
  if (m0) window.rxMount = function () { m0.apply(this, arguments); docsSummary(); };
  if (l0) window.rxLoad = function () { return Promise.resolve(l0.apply(this, arguments)).then(() => { if (RX.docTpls !== undefined) DOCS.tpls = RX.docTpls; }); };
})();

function docOpenBtn() { return `<div class="rx-sum" id="docSum"></div>`; }

/* ---------- نافذة المستندات ---------- */
function docSelect(tp) {
  const F = (DOCS.cur && DOCS.cur.F) || { days: 3, from: docTodayISO(), diag: '' };
  DOCS.cur = tp ? { id: tp.id, kind: tp.kind, title: tp.title, body: tp.body, builtin: !!tp.builtin, edited: !!tp.edited, def: tp.def || null, F }
                : { id: '', kind: 'custom', title: '', body: '', builtin: false, edited: false, def: null, F };
}
function docPaneHTML() {
  const L2 = rxTpl().L;
  return `<div class="doc-cols"><section class="doc-col doc-left">
      <div class="rx-sub">${esc(t('doc_tpls'))}</div><div id="docTpls" class="doc-tpls"></div>
      <div id="docEdit"></div>
    </section><section class="doc-col doc-right">
      <div class="rx-sub">${esc(t('doc_preview'))}</div><div class="rxv-paper doc-prevbox" id="docPrev" dir="${L2.dir}"></div>
      <div class="rx-sub" style="margin-top:12px">${esc(t('doc_issued'))}</div><div id="docIssued" class="doc-issued"></div>
    </section></div>
    <div class="rx-actions"><button type="button" class="btn-action btn-green" data-act="docAdd">${esc(t('doc_add'))}</button><button type="button" class="btn-action" data-act="docPrintCur">${esc(t('doc_print'))}</button><button type="button" class="btn-action btn-green" data-act="closeModal" style="margin-inline-start:auto">${esc(t('rx_close'))}</button></div>`;
}
function docRenderTpls() {
  const b = $('#docTpls'); if (!b) return; const cur = DOCS.cur && DOCS.cur.id;
  b.innerHTML = docTplList().map(x => `<button type="button" class="doc-tpl${x.id === cur ? ' on' : ''}" data-act="docPick" data-id="${esc(x.id)}">${DOC_ICON[x.kind] || '📄'} ${esc(x.title)}${x.edited ? ` <em>${esc(t('doc_edited'))}</em>` : ''}${!x.builtin ? ` <em>${esc(t('doc_mine'))}</em>` : ''}</button>`).join('') + `<button type="button" class="doc-tpl doc-tpl-new" data-act="docBlank">${esc(t('doc_new'))}</button>`;
}
function docRenderEdit() {
  const e = $('#docEdit'); if (!e) return; const c = DOCS.cur;
  if (!c) { e.innerHTML = `<div class="hint">${esc(t('doc_none'))}</div>`; return; }
  const has = k => c.body.indexOf('{' + k + '}') >= 0, dir = rxTpl().L.dir;
  const fields = [];
  if (has('days') || has('from') || has('to')) fields.push(`<label class="doc-f">${esc(t('doc_days'))}<input type="number" min="1" max="365" data-df="days" value="${esc(c.F.days)}"></label><label class="doc-f">${esc(t('doc_from'))}<input type="date" data-df="from" value="${esc(c.F.from)}"></label>`);
  if (has('diag')) fields.push(`<label class="doc-f doc-f-wide">${esc(t('doc_diag'))}<input type="text" maxlength="200" data-df="diag" value="${esc(c.F.diag)}"></label>`);
  const isUser = c.id && !c.builtin;
  e.innerHTML = `<input type="text" class="doc-ti" id="docTitle" maxlength="80" placeholder="${esc(t('doc_title_ph'))}" value="${esc(c.title)}" dir="${dir}">
    <textarea id="docBody" class="doc-ta" rows="11" maxlength="3000" placeholder="${esc(t('doc_body_ph'))}" dir="${dir}">${esc(c.body)}</textarea>
    <div class="doc-vars"><span class="hint">${esc(t('doc_vars'))}</span>${DOC_VARS.map(([k, lk]) => `<button type="button" class="doc-var" data-act="docVar" data-v="${k}">${esc(t(lk))}</button>`).join('')}</div>
    ${fields.length ? `<div class="doc-fields" id="docFields"><b>${esc(t('doc_fields'))}</b>${fields.join('')}</div>` : '<div id="docFields"></div>'}
    <div class="doc-tplbtns"><button type="button" class="btn-action" data-act="docTplSave">${esc(c.id ? t('doc_save_tpl') : t('doc_save_new'))}</button>${c.id ? `<button type="button" class="btn-action" data-act="docTplNew">${esc(t('doc_save_new'))}</button>` : ''}${c.builtin && c.edited ? `<button type="button" class="btn-action" data-act="docTplRestore">${esc(t('doc_restore'))}</button>` : ''}${isUser ? `<button type="button" class="btn-action btn-red" data-act="docTplDel">${esc(t('doc_delete'))}</button>` : ''}</div>`;
}
function docRenderPrev() {
  const p = $('#docPrev'), c = DOCS.cur; if (!p) return; const T = rxTpl(); p.dir = T.L.dir;
  p.innerHTML = c ? docPaperHTML({ title: c.title, body: docResolve(c.body, c.F) }, RX.pat || {}, Date.now(), undefined, Math.max(200, p.clientWidth - 30)) : '';
}
function docRenderIssued() {
  const b = $('#docIssued'); if (!b) return;
  b.innerHTML = DOCS.list.length ? DOCS.list.map((d, i) => `<div class="doc-iss"><span>${DOC_ICON[d.kind] || '📄'} <b>${esc(d.title)}</b></span><span class="rx-rec-b"><button type="button" class="btn-action" data-act="docIssPrint" data-i="${i}">${esc(t('rx_reprint'))}</button><button type="button" class="btn-action btn-red" data-act="docIssDel" data-i="${i}">✕</button></span></div>`).join('') : `<div class="hint">${esc(t('doc_none'))}</div>`;
}
function docRenderAll() { docRenderTpls(); docRenderEdit(); docRenderPrev(); docRenderIssued(); }
function docShowTab(tab) {
  const m = $('#rxModal'); if (!m) return; const doc = tab === 'doc';
  m.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const pr = $('#rxPaneRx'), pd = $('#rxPaneDoc'); if (pr) pr.hidden = doc; if (pd) pd.hidden = !doc;
  if (doc) { if (!DOCS.cur) docSelect(docTplList()[0]); docRenderAll(); }
}
function docOpenModal() {   // زر واحد: نافذة الوصفة نفسها، وهذا يفتحها على تبويب المستندات
  if (!$('#rxModal')) rxOpenModal();
  docShowTab('doc');
  if (window.rxLoad) rxLoad().then(() => { if (RX.docTpls !== undefined) DOCS.tpls = RX.docTpls; const pd = $('#rxPaneDoc'); if (pd && !pd.hidden) docRenderTpls(); });
}
function docOnLang() { const pd = $('#rxPaneDoc'); if (!pd || pd.hidden) return; const cur = DOCS.cur, base = cur && (cur.id || '').replace(/_(ar|fr|en)$/, ''); docSelect(docTplList().find(x => x.id.replace(/_(ar|fr|en)$/, '') === base) || docTplList()[0]); docRenderAll(); }
async function docPutTpls(items, msg) {
  try { const r = await api('PUT', '/api/rx/docs', { items }); DOCS.tpls = RX.docTpls = r; if (msg) toast(msg, 'success'); return true; }
  catch (e) { toast((e && e.message) || 'error', 'error'); return false; }
}
const docNewId = () => 'u' + Math.random().toString(36).slice(2, 8);

Object.assign(ACT, {
  docOpen() { docOpenModal(); },
  rxTab(el) { if (el.dataset.tab === 'doc') docOpenModal(); else docShowTab('rx'); },
  docPick(el) { const tp = docTplList().find(x => x.id === el.dataset.id); if (!tp) return; docSelect(tp); docRenderAll(); },
  docBlank() { docSelect(null); docRenderAll(); const t0 = $('#docTitle'); if (t0) t0.focus(); },
  docVar(el) {
    const ta = $('#docBody'); if (!ta) return; const v = '{' + el.dataset.v + '}', s = ta.selectionStart == null ? ta.value.length : ta.selectionStart, e = ta.selectionEnd == null ? s : ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + v + ta.value.slice(e); ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length;
    DOCS.cur.body = ta.value; docRenderPrev(); docRenderFieldsOnly();
  },
  async docTplSave() {
    const c = DOCS.cur; if (!c || !c.title.trim() || !c.body.trim()) return toast(t('doc_need'), 'error');
    const id = c.id || docNewId(), mine = docUserTpls().filter(x => x.id !== id), item = { id, kind: c.kind || 'custom', title: c.title.trim(), body: c.body };
    if (mine.length >= 59) return toast(t('rx_basket_full'), 'error');
    if (await docPutTpls(mine.concat([item]), t('doc_saved'))) { c.id = id; c.edited = c.builtin; docRenderAll(); }
  },
  async docTplNew() {
    const c = DOCS.cur; if (!c || !c.title.trim() || !c.body.trim()) return toast(t('doc_need'), 'error');
    const id = docNewId(), mine = docUserTpls();
    if (mine.length >= 59) return toast(t('rx_basket_full'), 'error');
    if (await docPutTpls(mine.concat([{ id, kind: c.kind || 'custom', title: c.title.trim(), body: c.body }]), t('doc_saved'))) { c.id = id; c.builtin = false; c.edited = false; docRenderAll(); }
  },
  async docTplRestore() {
    const c = DOCS.cur; if (!c || !c.builtin || !await appConfirm(t('doc_restore_c'))) return;
    if (await docPutTpls(docUserTpls().filter(x => x.id !== c.id), t('doc_restored'))) { const tp = docTplList().find(x => x.id === c.id); docSelect(tp); docRenderAll(); }
  },
  async docTplDel() {
    const c = DOCS.cur; if (!c || !c.id || c.builtin || !await appConfirm(t('doc_delete_c'))) return;
    if (await docPutTpls(docUserTpls().filter(x => x.id !== c.id), t('doc_deleted'))) { docSelect(docTplList()[0]); docRenderAll(); }
  },
  docAdd() {
    const c = DOCS.cur; if (!c || !c.title.trim() || !c.body.trim()) return toast(t('doc_need'), 'error');
    if (DOCS.list.length >= 10) return toast(t('doc_full'), 'error');
    DOCS.list.push({ kind: c.kind || 'custom', title: c.title.trim().slice(0, 80), body: docResolve(c.body, c.F).slice(0, 3000) }); docsSave(); docRenderIssued(); toast(t('doc_added'), 'success');
  },
  docPrintCur() { const c = DOCS.cur; if (!c) return; const a = RX.pat; docPrint({ title: c.title, body: docResolve(c.body, c.F) }, a ? { name: a.name, birthYear: a.birthYear } : { name: '' }, Date.now()); },
  docIssPrint(el) { const d = DOCS.list[+el.dataset.i], a = RX.pat; if (d) docPrint(d, a ? { name: a.name, birthYear: a.birthYear } : { name: '' }, Date.now()); },
  docIssDel(el) { DOCS.list.splice(+el.dataset.i, 1); docsSave(); docRenderIssued(); },
  docPrintRec(el) { const g = RX.reg[el.dataset.id], d = g && g.rec.docs && g.rec.docs[+el.dataset.i]; if (d) docPrint(d, { name: g.pat.name, birthYear: g.pat.birthYear }, g.rec.finishedAt, g.rec.rxHead); }
});
function docRenderFieldsOnly() {   // إعادة بناء حقول الأيام/التاريخ/التشخيص فقط (بعد تغيّر المتغيّرات في النص) دون المساس بحقل النص
  const f = $('#docFields'), c = DOCS.cur; if (!f || !c) return; const has = k => c.body.indexOf('{' + k + '}') >= 0, parts = [];
  if (has('days') || has('from') || has('to')) parts.push(`<label class="doc-f">${esc(t('doc_days'))}<input type="number" min="1" max="365" data-df="days" value="${esc(c.F.days)}"></label><label class="doc-f">${esc(t('doc_from'))}<input type="date" data-df="from" value="${esc(c.F.from)}"></label>`);
  if (has('diag')) parts.push(`<label class="doc-f doc-f-wide">${esc(t('doc_diag'))}<input type="text" maxlength="200" data-df="diag" value="${esc(c.F.diag)}"></label>`);
  f.className = parts.length ? 'doc-fields' : ''; f.innerHTML = parts.length ? `<b>${esc(t('doc_fields'))}</b>${parts.join('')}` : '';
}
document.addEventListener('input', e => {
  const el = e.target, c = DOCS.cur; if (!el || !c) return;
  if (el.id === 'docTitle') { c.title = el.value; docRenderPrev(); }
  else if (el.id === 'docBody') { c.body = el.value; docRenderPrev(); docRenderFieldsOnly(); }
  else if (el.dataset && el.dataset.df) { c.F[el.dataset.df] = el.value; docRenderPrev(); }
});
/* ---------- عرض مستندات المعاينات المحفوظة في الأرشيف وسجل المريض ---------- */
(() => {
  const rec0 = window.rxRecHTML;
  window.rxRecHTML = function (rec, pat) {
    const base = rec0 ? rec0.apply(this, arguments) : '';
    if (!rec || !rec.docs || !rec.docs.length) return base;
    RX.reg[rec.id] = { rec, pat };
    return base + `<div class="rx-rec doc-rec"><div class="rx-rec-h"><b>${esc(t('doc_rec', { n: rec.docs.length }))}</b></div>${rec.docs.map((d, i) => `<div class="doc-iss"><span>${DOC_ICON[d.kind] || '📄'} ${esc(d.title)}</span><span class="rx-rec-b"><button type="button" class="btn-action" data-act="docPrintRec" data-id="${esc(rec.id)}" data-i="${i}">${esc(t('rx_reprint'))}</button></span></div>`).join('')}</div>`;
  };
})();
