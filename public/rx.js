'use strict';
/* عيادتي الذكية — الوصفة الطبية: بحث في قاعدة الأدوية + سلة المفضلة + أسطر الوصفة + طباعة + استيراد قوائم.
   يعتمد على drugs.js (DRUGS) وأدوات app.js (t, L, S, api, run, esc, toast, locale, jget, jset, ACT, $ ...). */

Object.assign(L.ar, {
  rx_title: '💊 الوصفة الطبية', rx_search_ph: 'ابحث عن دواء: اسم علمي أو تجاري أو بالعربية…', rx_hint: 'اكتب حرفين على الأقل. اضغط على الشكل/المقدار لإضافته للوصفة، أو على ⭐ لحفظه في سلتك.',
  rx_basket: '⭐ سلتي: أدويتي وجرعاتي المعتادة', rx_basket_empty: 'السلة فارغة. ابحث عن دواء واضغط ⭐ لحفظه هنا فيسهل اختياره لاحقاً بنقرة واحدة.', rx_basket_nomatch: 'لا شيء في السلة يطابق بحثك.', rx_basket_full: 'السلة ممتلئة (الحد 100 دواء)',
  rx_list: 'أدوية هذه الوصفة', rx_empty: 'لا أدوية في الوصفة بعد.', rx_no_results: 'لا نتيجة في القاعدة — يمكنك إضافة الاسم كدواء مخصّص:', rx_custom: '＋ إضافة «{q}» كدواء مخصّص', rx_add: 'إضافة',
  rx_dose: 'الجرعة', rx_freq: 'التكرار', rx_dur: 'المدة', rx_note: 'ملاحظة (اختياري)', rx_print: 'طباعة الوصفة 🖨️', rx_clear: 'مسح الوصفة', rx_clear_c: 'مسح كل أدوية هذه الوصفة؟',
  rx_added: 'أُضيف إلى الوصفة', rx_dup: 'هذا الدواء موجود في الوصفة مسبقاً', rx_fav_saved: 'حُفظ في السلة ⭐', rx_fav_removed: 'أُزيل من السلة', rx_del_basket: 'إزالة هذا الدواء من السلة؟', rx_to_basket: 'حفظ في السلة', rx_in_basket: 'في السلة', rx_up: 'أعلى', rx_down: 'أسفل', rx_del: 'حذف من الوصفة',
  rx_db: '{a} دواء مدمج + {b} مستورد', rx_rec: '💊 الوصفة ({n})', rx_reprint: 'طباعة', rx_open: 'فتح الوصفة', rxs_open: '＋ إضافة دواء إلى السلة', rxs_close: 'إغلاق البحث', rxs_hint: 'اضغط على الشكل/المقدار لإضافته إلى سلتك، أو «＋ وصفة» لوضعه في الوصفة مباشرة.', rxs_rx: '＋ وصفة', rxs_to_rx: 'إضافة إلى الوصفة مباشرة', rxs_to_basket: 'إضافة إلى السلة', rxs_cust: 'إضافة «{q}» إلى السلة', rxs_dup: 'موجود في السلة', rxl_new: '＋ سطر جديد', rxl_grip: 'اسحب لتغيير الترتيب', rxl_name: 'اسم الدواء أو نص حر', rxl_form: 'الشكل / المقدار', rxt_lang: 'لغة الوصفة', rxt_reset: 'استعادة الترويسة الافتراضية', rxt_reset_c: 'استعادة بيانات الترويسة الافتراضية (الاسم، الهاتف، الشعار…)؟', rxt_clinic: 'اسم العيادة', rxt_doctor: 'اسم الطبيب', rxt_spec: 'التخصص (اختياري)', rxt_phone: 'الهاتف', rxt_addr: 'العنوان (اختياري)', rxt_logo: 'شعار', rxt_logo_rm: 'حذف الشعار', rxt_logo_bad: 'تعذّر قراءة الصورة', rxt_saved: 'حُفظت الترويسة', rxb_new: '＋ دواء جديد', rxb_quick_ph: 'اكتب اسم دواء لإضافته إلى سلتي…', rxb_add: 'إضافة', rxb_edit: 'تعديل', rxb_save: 'حفظ في السلة', rxb_cancel: 'إلغاء', rxb_name: 'اسم الدواء', rxb_form: 'الشكل / المقدار', rxb_hint: 'أضف أدويتك المعتادة بنفسك. نقرة على الاسم تضيفه للوصفة (بجرعته إن حفظتها بزر ✎).', rxb_need: 'اكتب اسم الدواء', rx_sum_empty: 'لم تُضف أدوية بعد', rx_close: 'تم', rx_add_title: 'إضافة أدوية', rx_for: 'المريض',
  rxp_title: 'وصفة طبية', rxp_patient: 'المريض', rxp_age: 'العمر', rxp_date: 'التاريخ', rxp_sign: 'التوقيع والختم', rxp_years: 'سنة',
  set_drugs: 'قاعدة الأدوية 💊', drugs_import: 'استيراد قائمة 📥', drugs_clear: 'حذف المستورد 🗑️', drugs_info: 'المدمجة: {a} دواء · المستوردة: {b} دواء', drugs_hint: 'يمكنك توسيع البحث باستيراد قائمة أدوية بصيغة CSV أو JSON أو TXT (مثل مدوّنة الأدوية الوطنية بعد حفظها بصيغة CSV). الأعمدة المعروفة: DCI / Nom de marque / Forme / Dosage / Classe. ما يُستورد يضاف لقاعدة بحثك فقط ولا يغيّر وصفات سابقة.',
  drugs_done: 'تم استيراد {n} دواء', drugs_bad: 'تعذّرت قراءة الملف أو لا يحوي أسماء أدوية', drugs_confirm: 'سيُضاف {n} دواء إلى قاعدة بحثك. متابعة؟', drugs_trunc: 'الحد الأقصى {n} دواء؛ تم تجاهل الباقي', drugs_clear_c: 'حذف كل الأدوية المستوردة؟ (القاعدة المدمجة والسلة لا تتأثران)', drugs_cleared: 'حُذفت الأدوية المستوردة',
  st_rx: 'الأدوية الموصوفة', st_rx_n: 'وصفات', st_rx_lines: 'أسطر أدوية', st_rx_avg: 'متوسط الأدوية للوصفة', st_rx_top: 'الأكثر وصفاً'
});
Object.assign(L.en, {
  rx_title: '💊 Prescription', rx_search_ph: 'Search drugs: generic, brand or Arabic name…', rx_hint: 'Type at least 2 letters. Tap a form/strength to add it to the prescription, or ⭐ to save it in your basket.',
  rx_basket: '⭐ My basket: usual drugs & doses', rx_basket_empty: 'Basket is empty. Search a drug and tap ⭐ to keep it here for one-tap picking later.', rx_basket_nomatch: 'Nothing in your basket matches.', rx_basket_full: 'Basket is full (100 drugs max)',
  rx_list: 'Drugs in this prescription', rx_empty: 'No drugs in the prescription yet.', rx_no_results: 'No match in the database — you can add the name as a custom drug:', rx_custom: '＋ Add “{q}” as a custom drug', rx_add: 'Add',
  rx_dose: 'Dose', rx_freq: 'Frequency', rx_dur: 'Duration', rx_note: 'Note (optional)', rx_print: 'Print prescription 🖨️', rx_clear: 'Clear prescription', rx_clear_c: 'Remove all drugs from this prescription?',
  rx_added: 'Added to the prescription', rx_dup: 'Already in the prescription', rx_fav_saved: 'Saved to basket ⭐', rx_fav_removed: 'Removed from basket', rx_del_basket: 'Remove this drug from the basket?', rx_to_basket: 'Save to basket', rx_in_basket: 'In basket', rx_up: 'Up', rx_down: 'Down', rx_del: 'Remove from prescription',
  rx_db: '{a} built-in + {b} imported drugs', rx_rec: '💊 Prescription ({n})', rx_reprint: 'Print', rx_open: 'Open prescription', rxs_open: '＋ Add a drug to basket', rxs_close: 'Close search', rxs_hint: 'Tap a form/strength to add it to your basket, or “＋ Rx” to put it straight on the prescription.', rxs_rx: '＋ Rx', rxs_to_rx: 'Add straight to the prescription', rxs_to_basket: 'Add to basket', rxs_cust: 'Add “{q}” to basket', rxs_dup: 'Already in basket', rxl_new: '＋ New line', rxl_grip: 'Drag to reorder', rxl_name: 'Drug name or free text', rxl_form: 'Form / strength', rxt_lang: 'Prescription language', rxt_reset: 'Restore default header', rxt_reset_c: 'Restore the default header (name, phone, logo…)?', rxt_clinic: 'Clinic name', rxt_doctor: 'Doctor name', rxt_spec: 'Specialty (optional)', rxt_phone: 'Phone', rxt_addr: 'Address (optional)', rxt_logo: 'Logo', rxt_logo_rm: 'Remove logo', rxt_logo_bad: 'Could not read the image', rxt_saved: 'Header saved', rxb_new: '＋ New drug', rxb_quick_ph: 'Type a drug name to add to my basket…', rxb_add: 'Add', rxb_edit: 'Edit', rxb_save: 'Save to basket', rxb_cancel: 'Cancel', rxb_name: 'Drug name', rxb_form: 'Form / strength', rxb_hint: 'Add your usual drugs yourself. Tap a name to put it on the prescription (with its dose if saved via ✎).', rxb_need: 'Enter the drug name', rx_sum_empty: 'No drugs added yet', rx_close: 'Done', rx_add_title: 'Add drugs', rx_for: 'Patient',
  rxp_title: 'Prescription', rxp_patient: 'Patient', rxp_age: 'Age', rxp_date: 'Date', rxp_sign: 'Signature & stamp', rxp_years: 'y/o',
  set_drugs: 'Drug database 💊', drugs_import: 'Import a list 📥', drugs_clear: 'Delete imported 🗑️', drugs_info: 'Built-in: {a} drugs · Imported: {b} drugs', drugs_hint: 'Extend the search by importing a drug list as CSV, JSON or TXT (e.g. the national drug nomenclature saved as CSV). Known columns: DCI / Brand name / Form / Strength / Class. Imported drugs only enrich your search; past prescriptions are untouched.',
  drugs_done: '{n} drugs imported', drugs_bad: 'Could not read the file or it has no drug names', drugs_confirm: '{n} drugs will be added to your search database. Continue?', drugs_trunc: 'Maximum is {n} drugs; the rest was ignored', drugs_clear_c: 'Delete all imported drugs? (built-in database and basket are not affected)', drugs_cleared: 'Imported drugs deleted',
  st_rx: 'Prescribed drugs', st_rx_n: 'Prescriptions', st_rx_lines: 'Drug lines', st_rx_avg: 'Drugs per prescription', st_rx_top: 'Most prescribed'
});

const RX = { basket: [], extra: [], loaded: false, at: 0, loading: null, lines: [], q: '', res: [], idx: null, idxN: -1, pid: '', pat: null, reg: {}, editB: null, bd: {}, tpl: null, tplT: 0 };
const RX_LISTS = {
  ar: { dose: ['قرص واحد', 'قرصان', 'كبسولة واحدة', 'كيس واحد', 'ملعقة صغيرة (5 مل)', 'ملعقة كبيرة (15 مل)', 'حقنة واحدة', 'تطبيق موضعي', 'بخّتان', 'غسول 15 مل'], freq: ['مرة في اليوم', 'مرتان في اليوم', '3 مرات في اليوم', '4 مرات في اليوم', 'كل 8 ساعات', 'كل 12 ساعة', 'عند اللزوم (الألم)', 'قبل النوم', 'صباحاً', 'بعد الأكل', 'قبل الأكل'], dur: ['يوم واحد', '3 أيام', '5 أيام', '7 أيام', '10 أيام', '14 يوماً', 'شهر', 'حتى زوال الأعراض'] },
  en: { dose: ['1 tablet', '2 tablets', '1 capsule', '1 sachet', '1 teaspoon (5 ml)', '1 tablespoon (15 ml)', '1 injection', 'Apply locally', '2 puffs', 'Rinse 15 ml'], freq: ['Once daily', 'Twice daily', '3 times daily', '4 times daily', 'Every 8 hours', 'Every 12 hours', 'As needed (pain)', 'At bedtime', 'In the morning', 'After meals', 'Before meals'], dur: ['1 day', '3 days', '5 days', '7 days', '10 days', '14 days', '1 month', 'Until symptoms resolve'] },
  fr: { dose: ['1 comprimé', '2 comprimés', '1 gélule', '1 sachet', '1 cuillère à café (5 ml)', '1 cuillère à soupe (15 ml)', '1 injection', 'Application locale', '2 pulvérisations', 'Bain de bouche 15 ml'], freq: ['1 fois par jour', '2 fois par jour', '3 fois par jour', '4 fois par jour', 'Toutes les 8 heures', 'Toutes les 12 heures', 'Si besoin (douleur)', 'Au coucher', 'Le matin', 'Après les repas', 'Avant les repas'], dur: ['1 jour', '3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '1 mois', "Jusqu'à disparition des symptômes"] }
};
/* ترجمة الجرعات الجاهزة (القوائم متوازية بالترتيب): النص المكتوب يدوياً يبقى كما هو */
const rxTr = (v, kind, lang) => {
  const x = String(v || '').trim().toLowerCase(); if (!x) return v || '';
  for (const k in RX_LISTS) { const i = RX_LISTS[k][kind].findIndex(y => y.toLowerCase() === x); if (i >= 0) return RX_LISTS[lang][kind][i]; }
  return v;
};
const rxTrLine = (l, lang) => ({ ...l, dose: rxTr(l.dose, 'dose', lang), freq: rxTr(l.freq, 'freq', lang), dur: rxTr(l.dur, 'dur', lang) });
function rxFillLists() {
  const L = RX_LISTS[rxTpl().lang] || RX_LISTS.ar, set = (id, a) => { const d = $('#' + id); if (d) d.innerHTML = a.map(x => `<option value="${esc(x)}">`).join(''); };
  set('rxDoses', L.dose); set('rxFreqs', L.freq); set('rxDurs', L.dur);
}

/* تطبيع النصوص للبحث: حروف صغيرة، بلا تشكيل لاتيني ولا عربي، توحيد الألف والياء والتاء المربوطة */
const rxN = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^a-z0-9\u0600-\u06ff\s]/g, ' ').replace(/\s+/g, ' ').trim();
const rxForms = r => (r[3] ? String(r[3]).split(';').map(x => x.trim()).filter(Boolean) : []);
const rxKey = l => (l.name + '|' + (l.form || '')).toLowerCase();
const rxPoso = l => [l.dose, l.freq, l.dur].filter(Boolean).join(' · ');
const rxCleanLine = z => z && typeof z === 'object' && typeof z.name === 'string' && z.name.trim() ? { name: z.name.slice(0, 120), form: String(z.form || '').slice(0, 160), dose: String(z.dose || '').slice(0, 80), freq: String(z.freq || '').slice(0, 80), dur: String(z.dur || '').slice(0, 80), note: String(z.note || '').slice(0, 200) } : null;

function rxIndex() {
  if (RX.idx && RX.idxN === RX.extra.length) return RX.idx;
  RX.idxN = RX.extra.length;
  return (RX.idx = (RX.extra.length ? rxMerge(DRUGS, RX.extra) : DRUGS).map(r => ({ r, n: rxN(r[0]), a: rxN(r[1]), b: rxN(r[2]), all: rxN(r.join(' ')) })));   // نفس الدواء (مدمج + مستورد) يظهر بطاقة واحدة تجمع أشكاله وأسماءه التجارية
}
function rxSearch(q) {
  const nq = rxN(q); if (nq.length < 2) return [];
  const words = nq.split(' '), w0 = words[0], out = [];
  for (const e of rxIndex()) {
    if (!words.every(w => e.all.includes(w))) continue;
    const nw = e.n.split(' '), bw = e.b.split(' ');
    const score = (e.n.startsWith(nq) || e.a.startsWith(nq)) ? 0 : (nw.some(w => w.startsWith(w0)) || e.a.split(' ').some(w => w.startsWith(w0))) ? 1 : bw.some(w => w.startsWith(w0)) ? 2 : e.n.includes(w0) ? 3 : 4;
    out.push([score, e.n.length, e.r]);
  }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1]).slice(0, 30).map(x => x[2]);
}

/* ---------- التحميل (السلة + الأدوية المستوردة) ---------- */
function rxLoad(force) {
  if (RX.loading) return RX.loading;
  if (!force && RX.loaded && Date.now() - RX.at < 60e3) return Promise.resolve();
  RX.loading = (async () => {
    try { const r = await api('GET', '/api/rx'); RX.basket = Array.isArray(r.basket) ? r.basket : []; RX.extra = (Array.isArray(r.drugs) ? r.drugs : []).filter(Array.isArray); if (!RX.tplT) RX.tpl = r.template || null; RX.idx = null; RX.loaded = true; RX.at = Date.now(); rxRefresh(); }
    catch (e) { /* صامت: تبقى القاعدة المدمجة تعمل */ }
    RX.loading = null;
  })();
  return RX.loading;
}
function rxRefresh() { rxRenderPaperTop(); rxSummary(); rxRenderBasket(); rxRenderResults(); rxRenderList(); const d = $('#rxDb'); if (d) d.textContent = t('rx_db', { a: DRUGS.length, b: RX.extra.length }); }

/* ---------- المسودّة: تُحفظ محلياً كي لا تضيع الوصفة عند تحديث الصفحة ---------- */
const rxSave = () => { jset('cc_rx_draft', { pid: RX.pid, lines: RX.lines }); rxSummary(); };
function rxReset(a) {
  RX.q = ''; RX.pid = a ? a.id : ''; RX.pat = a || null; RX.lines = [];
  if (a) { const d = jget('cc_rx_draft', null); if (d && d.pid === a.id && Array.isArray(d.lines)) RX.lines = d.lines.map(rxCleanLine).filter(Boolean).slice(0, 25); }
}
const rxLines = () => RX.lines.map(rxCleanLine).filter(Boolean);
function rxDone() { RX.lines = []; rxCloseModal(); rxSummary(); try { localStorage.removeItem('cc_rx_draft'); } catch (e) {} }

/* ---------- القالب والعرض ---------- */

/* ---------- ترويسة الوصفة ولغتها (تُحفظ على الخادم لكل عيادة) ---------- */
const RXP_L = {
  ar: { dir: 'rtl', loc: 'ar-u-nu-latn', date: 'التاريخ', patient: 'المريض', age: 'العمر', years: 'سنة', title: 'وصفة طبية', sign: 'التوقيع والختم', dr: 'د. ', phone: 'هاتف' },
  fr: { dir: 'ltr', loc: 'fr-FR', date: 'Date', patient: 'Patient', age: 'Âge', years: 'ans', title: 'Ordonnance', sign: 'Signature et cachet', dr: 'Dr ', phone: 'Tél' },
  en: { dir: 'ltr', loc: 'en-GB', date: 'Date', patient: 'Patient', age: 'Age', years: 'y/o', title: 'Prescription', sign: 'Signature & stamp', dr: 'Dr. ', phone: 'Tel' }
};
const RXP_NAMES = { ar: 'العربية', fr: 'Français', en: 'English' };
function rxTpl() {   // القيم الفعلية = ما عدّله الطبيب أو الافتراضي
  const T = RX.tpl || {}, lang = RXP_L[T.lang] ? T.lang : 'ar', L = RXP_L[lang], me = S.me || {}, nm = String(me.doctorName || me.name || '').trim();
  const dflt = nm ? (/^(د\.|dr\b)/i.test(nm) ? nm : L.dr + nm) : '';
  const v = (k, d) => T[k] == null ? d : T[k];
  return { lang, L, clinic: v('clinic', me.clinicName || ''), doctor: v('doctor', dflt), spec: v('spec', ''), phone: v('phone', ''), address: v('address', ''), logo: T.logo || '' };
}
function rxTplSet(patch) {
  const base = RX.tpl || { clinic: null, doctor: null, spec: null, phone: null, address: null, logo: '', lang: rxTpl().lang };
  RX.tpl = Object.assign({}, base, patch); clearTimeout(RX.tplT); RX.tplT = setTimeout(rxTplFlush, 700);
}
async function rxTplFlush() {
  if (!RX.tplT) return; clearTimeout(RX.tplT); RX.tplT = 0;
  try { const r = await api('PUT', '/api/rx/template', RX.tpl || {}); RX.tpl = r; } catch (e) {}
}
function rxPaperTopHTML() {
  const T = rxTpl(), L = T.L, pat = RX.pat || {}, age = pat.birthYear ? new Date().getFullYear() - pat.birthYear : null, inp = (k, ph, cls) => `<input class="${cls}" data-tp="${k}" maxlength="${k === 'phone' ? 60 : k === 'address' ? 160 : 120}" placeholder="${esc(ph)}" value="${esc(T[k])}">`;
  return `<div class="rx-ph"><div class="rx-logo">${T.logo ? `<img src="${esc(T.logo)}" alt=""><button type="button" class="rx-logo-x" data-act="rxLogoDel" title="${esc(t('rxt_logo_rm'))}">✕</button>` : `<button type="button" class="rx-logo-add" data-act="rxLogoPick">＋<small>${esc(t('rxt_logo'))}</small></button>`}</div>
    <div class="rx-pcol">${inp('clinic', t('rxt_clinic'), 'rx-pc')}${inp('doctor', t('rxt_doctor'), 'rx-pdoc')}${inp('spec', t('rxt_spec'), 'rx-psp')}<div class="rx-pcontact">${inp('phone', L.phone + ' / ' + t('rxt_phone'), 'rx-pph')}${inp('address', t('rxt_addr'), 'rx-pad')}</div></div>
    <div class="rx-pd">${esc(L.date)}: ${esc(new Date().toLocaleDateString(L.loc, { dateStyle: 'long' }))}</div></div>
    <div class="rx-pp"><span>${esc(L.patient)}: <b>${esc(pat.name || '')}</b></span>${age != null ? `<span>${esc(L.age)}: <b>${age} ${esc(L.years)}</b></span>` : ''}</div>
    <div class="rx-pt">℞ <span>${esc(L.title)}</span></div>`;
}
function rxRenderPaperTop() { const b = $('#rxPaperTop'), p = $('#rxPaper'); if (!b) return; p.dir = rxTpl().L.dir; b.innerHTML = rxPaperTopHTML(); const sg = $('#rxSign'); if (sg) sg.textContent = rxTpl().L.sign; }
function rxLogoFromFile(file) {
  return new Promise((ok, no) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      for (const max of [240, 160, 100]) {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        const g = c.getContext('2d'); g.drawImage(im, 0, 0, c.width, c.height);
        let d = c.toDataURL('image/png'); if (d.length > 150000) { g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); d = c.toDataURL('image/jpeg', .85); }
        if (d.length <= 150000) return ok(d);
      }
      no(new Error('big'));
    };
    im.onerror = () => { URL.revokeObjectURL(url); no(new Error('bad')); };
    im.src = url;
  });
}
function rxHTML() {   // في واجهة المعاينة: زر واحد وملخّص؛ كل المحتوى داخل نافذة الوصفة
  return `<div class="rx-box rx-entry"><button type="button" class="btn-action rx-open" data-act="rxOpen">💊 ${esc(t('rx_open'))} <span class="rx-cnt" id="rxCnt"></span></button><div class="rx-sum" id="rxSum"></div></div>`;
}
function rxModalHTML() {
  const L2 = RX_LISTS[rxTpl().lang] || RX_LISTS.ar, dl = (id, a) => `<datalist id="${id}">${a.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
  return `<div class="modal-card settings-modal rx-modal" id="rxBox"><button type="button" class="btn-action btn-red modal-x rx-xbtn" data-act="closeModal" aria-label="close">✕</button>
    <div class="rx-cols"><section class="rx-col rx-rxcol"><div class="rx-langbar"><label for="rxLang">🌐 ${esc(t('rxt_lang'))}</label><select id="rxLang">${Object.keys(RXP_NAMES).map(k => `<option value="${k}"${k === rxTpl().lang ? ' selected' : ''}>${RXP_NAMES[k]}</option>`).join('')}</select><button type="button" class="btn-action" data-act="rxTplReset">${esc(t('rxt_reset'))}</button><input type="file" id="rxLogoFile" accept="image/*" hidden></div>
      <div class="rx-paper" id="rxPaper" dir="${rxTpl().L.dir}"><div id="rxPaperTop">${rxPaperTopHTML()}</div>
      <div id="rxList"></div><button type="button" class="rx-newline" data-act="rxLineNew">${esc(t('rxl_new'))}</button><div class="rx-psign" id="rxSign">${esc(rxTpl().L.sign)}</div></div></section>
    <section class="rx-col rx-find"><div class="rx-sub">${esc(t('rx_basket'))}</div>
      <button type="button" class="btn-action btn-green rx-addb" id="rxFindBtn" data-act="rxFindOpen">${esc(t('rxs_open'))}</button>
      <div class="rx-findbox" id="rxFindBox" hidden><div class="rx-findhead"><b>${esc(t('rx_add_title'))}</b> <span class="rx-db" id="rxDb"></span><button type="button" class="btn-action" data-act="rxFindClose">${esc(t('rxs_close'))}</button></div>
        <input type="search" id="rxSearch" class="rx-search" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="60" placeholder="${esc(t('rx_search_ph'))}" value="${esc(RX.q)}">
        <div class="hint" style="margin:4px 0 8px">${esc(t('rxs_hint'))}</div><ul id="rxResults" class="rx-results" hidden></ul></div>
      <div id="rxBasket" class="rx-basket"></div></section></div>
    <div class="rx-actions"><button type="button" class="btn-action" data-act="rxPrint">${esc(t('rx_print'))}</button><button type="button" class="btn-action btn-red" data-act="rxClear">${esc(t('rx_clear'))}</button><button type="button" class="btn-action btn-green" data-act="closeModal" style="margin-inline-start:auto">${esc(t('rx_close'))}</button></div>
    ${dl('rxDoses', L2.dose)}${dl('rxFreqs', L2.freq)}${dl('rxDurs', L2.dur)}</div>`;
}
function rxSummary() {
  const sum = $('#rxSum'), cnt = $('#rxCnt'); if (!sum) return; const ls = RX.lines.filter(l => l.name && l.name.trim());
  cnt.textContent = ls.length ? ls.length : '';
  sum.innerHTML = ls.length ? ls.map(l => `<span>${esc(l.name)}${rxPoso(l) ? ` <em>${esc(rxPoso(l))}</em>` : ''}</span>`).join('') : `<span class="hint">${esc(t('rx_sum_empty'))}</span>`;
}
function rxOpenModal() {
  let m = $('#rxModal'); if (m) m.remove();   // يُعاد بناؤه كي تتبع اللغة والمريض الحاليين
  m = document.createElement('div'); m.id = 'rxModal'; m.className = 'modal-overlay'; RX.editB = null; RX.bd = {}; m.dataset.pid = RX.pid; m.innerHTML = rxModalHTML(); document.body.appendChild(m);
  rxRefresh(); rxLoad(); m.classList.add('active');
  if (window.matchMedia && matchMedia('(pointer:fine)').matches) { const q = $('#rxSearch'); if (q) q.focus(); }
}
function rxCloseModal() { rxTplFlush(); const m = $('#rxModal'); if (m) m.remove(); }
function rxMount(a) { RX.pid = a ? a.id : RX.pid; RX.pat = a || RX.pat; const m = $('#rxModal'); if (m && (!a || m.dataset.pid !== a.id)) rxCloseModal(); rxSummary(); rxLoad(); }

function rxBEditRow(id) {
  const d = RX.bd, f = (k, ph, list) => `<input data-bf="${k}" maxlength="${k === 'name' ? 120 : k === 'form' ? 160 : k === 'note' ? 200 : 80}"${list ? ` list="${list}"` : ''} placeholder="${esc(ph)}" value="${esc(d[k] || '')}">`;
  return `<div class="rx-brow rx-bedit"><div class="rx-bef">${f('name', t('rxb_name'))}${f('form', t('rxb_form'))}</div><div class="rx-bef3">${f('dose', t('rx_dose'), 'rxDoses')}${f('freq', t('rx_freq'), 'rxFreqs')}${f('dur', t('rx_dur'), 'rxDurs')}</div>${f('note', t('rx_note'))}
    <div class="rx-bbtns"><button type="button" class="btn-action btn-green" data-act="rxBSave">${esc(t('rxb_save'))}</button><button type="button" class="btn-action" data-act="rxBCancel">${esc(t('rxb_cancel'))}</button></div></div>`;
}
function rxRenderBasket() {
  const box = $('#rxBasket'); if (!box) return; const items = RX.basket;
  const chip = b => RX.editB === b.id ? '' : `<span class="rx-bchip" title="${esc([b.form, rxPoso(b)].filter(Boolean).join(' — '))}"><button type="button" class="rx-bn" data-act="rxBasketAdd" data-id="${esc(b.id)}">${esc(b.name)}</button><button type="button" data-act="rxBEdit" data-id="${esc(b.id)}" title="${esc(t('rxb_edit'))}">✎</button><button type="button" class="rx-x" data-act="rxBasketDel" data-id="${esc(b.id)}" aria-label="✕">✕</button></span>`;
  const editing = RX.editB && RX.editB !== 'new' ? RX.basket.find(b => b.id === RX.editB) : null;
  box.innerHTML = (editing ? rxBEditRow(editing.id) : '') + (!items.length ? `<div class="hint">${esc(t('rx_basket_empty'))}</div>` : `<div class="rx-chips">${items.map(chip).join('')}</div>`);
}
function rxRenderResults() {
  const ul = $('#rxResults'); if (!ul) return; const q = (RX.q || '').trim();
  if (rxN(q).length < 2) { ul.hidden = true; ul.innerHTML = ''; RX.res = []; return; }
  const res = RX.res = rxSearch(q), fav = new Set(RX.basket.map(rxKey));
  const custom = `<li class="rx-res rx-cust"><button type="button" class="btn-action btn-green" data-act="rxCustomFav">${esc(t('rxs_cust').split('{q}').join(q))}</button><button type="button" class="btn-action" data-act="rxCustom" title="${esc(t('rxs_to_rx'))}">${esc(t('rxs_rx'))}</button></li>`;
  ul.innerHTML = (res.length ? res.map((r, i) => {
    const forms = rxForms(r), chips = (forms.length ? forms : ['']).map((f, j) => `<span class="rx-chip${fav.has(rxKey({ name: r[0], form: f })) ? ' fav' : ''}"><button type="button" data-act="rxBAddRes" data-i="${i}" data-f="${j}" title="${esc(t('rxs_to_basket'))}">${fav.has(rxKey({ name: r[0], form: f })) ? '⭐ ' : ''}${esc(f || t('rxs_to_basket'))}</button><button type="button" class="rx-torx" data-act="rxAdd" data-i="${i}" data-f="${j}" title="${esc(t('rxs_to_rx'))}">${esc(t('rxs_rx'))}</button></span>`).join('');
    return `<li class="rx-res"><div class="rx-rn"><b>${esc(r[0])}</b>${r[1] ? ` <span class="rx-ar">${esc(r[1])}</span>` : ''}${r[4] ? ` <span class="rx-cls">${esc(r[4])}</span>` : ''}</div>${r[2] ? `<div class="rx-rb">${esc(r[2])}</div>` : ''}<div class="rx-forms">${chips}</div></li>`;
  }).join('') : `<li class="rx-res"><div class="hint">${esc(t('rx_no_results'))}</div></li>`) + custom;
  ul.hidden = false;
}
function rxRenderList() {
  rxSummary(); const box = $('#rxList'); if (!box) return; const fav = new Set(RX.basket.map(rxKey));
  box.innerHTML = !RX.lines.length ? `<div class="hint" style="padding:8px 0">${esc(t('rx_empty'))}</div>` : `<ol class="rx-lines">${RX.lines.map((l, i) => `<li class="rx-line" data-i="${i}"><div class="rx-lh"><span class="rx-grip" draggable="true" title="${esc(t('rxl_grip'))}">⠿</span><span class="rx-ln"><input class="rx-iname" data-rx="name" data-i="${i}" maxlength="120" placeholder="${esc(t('rxl_name'))}" value="${esc(l.name)}"><input class="rx-iform" data-rx="form" data-i="${i}" maxlength="160" placeholder="${esc(t('rxl_form'))}" value="${esc(l.form)}"></span><span class="rx-lbtn">
      <button type="button" data-act="rxUp" data-i="${i}" title="${esc(t('rx_up'))}"${i ? '' : ' disabled'}>▲</button><button type="button" data-act="rxDown" data-i="${i}" title="${esc(t('rx_down'))}"${i < RX.lines.length - 1 ? '' : ' disabled'}>▼</button>
      <button type="button" class="${fav.has(rxKey(l)) ? 'on' : ''}" data-act="rxLineFav" data-i="${i}" title="${esc(fav.has(rxKey(l)) ? t('rx_in_basket') : t('rx_to_basket'))}">⭐</button><button type="button" class="rx-x" data-act="rxDel" data-i="${i}" title="${esc(t('rx_del'))}">✕</button></span></div>
      <div class="rx-lf"><input data-rx="dose" data-i="${i}" list="rxDoses" maxlength="80" placeholder="${esc(t('rx_dose'))}" value="${esc(l.dose)}"><input data-rx="freq" data-i="${i}" list="rxFreqs" maxlength="80" placeholder="${esc(t('rx_freq'))}" value="${esc(l.freq)}"><input data-rx="dur" data-i="${i}" list="rxDurs" maxlength="80" placeholder="${esc(t('rx_dur'))}" value="${esc(l.dur)}"><input data-rx="note" data-i="${i}" maxlength="200" placeholder="${esc(t('rx_note'))}" value="${esc(l.note)}" class="rx-note"></div></li>`).join('')}</ol>`;
}

/* ---------- عمليات الوصفة والسلة ---------- */
function rxPush(l) {
  if (RX.lines.some(x => rxKey(x) === rxKey(l))) return toast(t('rx_dup'), 'info');
  if (RX.lines.length >= 25) return toast(t('rx_basket_full'), 'error');
  { const lg = rxTpl().lang, z = rxTrLine(l, lg); RX.lines.push({ name: l.name, form: l.form || '', dose: z.dose || '', freq: z.freq || '', dur: z.dur || '', note: l.note || '' }); } rxSave(); rxRenderList(); toast(t('rx_added'), 'success');
}
async function rxPutBasket(items, msg, type) {
  const r = await run(() => api('PUT', '/api/rx/basket', { items })); if (!r) return false;
  RX.basket = r; RX.at = Date.now(); rxRenderBasket(); rxRenderResults(); rxRenderList(); if (msg) toast(msg, type || 'success'); return true;
}
const rxFromRes = el => { const r = RX.res[+el.dataset.i]; return r ? { name: r[0], form: rxForms(r)[+el.dataset.f] || '' } : null; };
function rxToggleFav(l) {
  const ex = RX.basket.find(b => rxKey(b) === rxKey(l));
  if (ex) return rxPutBasket(RX.basket.filter(b => b !== ex), t('rx_fav_removed'), 'info');
  if (RX.basket.length >= 100) return toast(t('rx_basket_full'), 'error');
  return rxPutBasket(RX.basket.concat([{ name: l.name, form: l.form || '', dose: '', freq: '', dur: '', note: '' }]), t('rx_fav_saved'));
}
Object.assign(ACT, {
  rxAdd(el) { const l = rxFromRes(el); if (l) rxPush(l); },
  rxFav(el) { const l = rxFromRes(el); if (l) rxToggleFav(l); },
  rxCustom() { const q = ($('#rxSearch') || {}).value; if (q && q.trim()) { rxPush({ name: q.trim().slice(0, 120) }); } },
  rxCustomFav() { const q = ($('#rxSearch') || {}).value; if (q && q.trim()) rxToggleFav({ name: q.trim().slice(0, 120), form: '' }); },
  rxBasketAdd(el) { const b = RX.basket.find(x => x.id === el.dataset.id); if (b) rxPush(b); },
  rxBasketDel(el) { const b = RX.basket.find(x => x.id === el.dataset.id); if (b && confirm(t('rx_del_basket'))) rxPutBasket(RX.basket.filter(x => x !== b), t('rx_fav_removed'), 'info'); },
  rxDel(el) { RX.lines.splice(+el.dataset.i, 1); rxSave(); rxRenderList(); },
  rxUp(el) { const i = +el.dataset.i; if (i > 0) { [RX.lines[i - 1], RX.lines[i]] = [RX.lines[i], RX.lines[i - 1]]; rxSave(); rxRenderList(); } },
  rxDown(el) { const i = +el.dataset.i; if (i < RX.lines.length - 1) { [RX.lines[i + 1], RX.lines[i]] = [RX.lines[i], RX.lines[i + 1]]; rxSave(); rxRenderList(); } },
  rxLineFav(el) {   // حفظ السطر بجرعته في السلة (أو تحديث جرعة دواء موجود فيها)
    const l = RX.lines[+el.dataset.i]; if (!l) return; const ex = RX.basket.find(b => rxKey(b) === rxKey(l)), item = { ...rxCleanLine(l), id: ex ? ex.id : undefined };
    if (!ex && RX.basket.length >= 100) return toast(t('rx_basket_full'), 'error');
    rxPutBasket(ex ? RX.basket.map(b => b === ex ? item : b) : RX.basket.concat([item]), t('rx_fav_saved'));
  },
  rxOpen() { rxOpenModal(); },
  rxFindOpen() { const b = $('#rxFindBox'); if (!b) return; b.hidden = false; $('#rxFindBtn').hidden = true; const q = $('#rxSearch'); if (q) q.focus(); },
  rxFindClose() { const b = $('#rxFindBox'); if (!b) return; b.hidden = true; $('#rxFindBtn').hidden = false; RX.q = ''; const q = $('#rxSearch'); if (q) q.value = ''; rxRenderResults(); },
  rxBAddRes(el) { const l = rxFromRes(el); if (!l) return; if (RX.basket.some(b => rxKey(b) === rxKey(l))) return toast(t('rxs_dup'), 'info'); if (RX.basket.length >= 100) return toast(t('rx_basket_full'), 'error'); rxPutBasket(RX.basket.concat([{ name: l.name, form: l.form || '', dose: '', freq: '', dur: '', note: '' }]), t('rx_fav_saved')); },
  rxLineNew() { if (RX.lines.length >= 25) return toast(t('rx_basket_full'), 'error'); RX.lines.push({ name: '', form: '', dose: '', freq: '', dur: '', note: '' }); rxSave(); rxRenderList(); const n = document.querySelector(`[data-rx=name][data-i="${RX.lines.length - 1}"]`); if (n) n.focus(); },
  rxLogoPick() { const f = $('#rxLogoFile'); if (f) f.click(); },
  rxLogoDel() { rxTplSet({ logo: '' }); rxRenderPaperTop(); },
  rxTplReset() { if (!confirm(t('rxt_reset_c'))) return; RX.tpl = { clinic: null, doctor: null, spec: null, phone: null, address: null, logo: '', lang: rxTpl().lang }; RX.tplT = 1; rxTplFlush(); rxRenderPaperTop(); },
  rxBEdit(el) { const b = RX.basket.find(x => x.id === el.dataset.id); if (!b) return; RX.editB = b.id; RX.bd = { name: b.name, form: b.form, dose: b.dose, freq: b.freq, dur: b.dur, note: b.note }; rxRenderBasket(); },
  rxBCancel() { RX.editB = null; RX.bd = {}; rxRenderBasket(); },
  async rxBSave() {
    const it = rxCleanLine(RX.bd); if (!it) return toast(t('rxb_need'), 'error');
    const id = RX.editB, ex = id === 'new' ? null : RX.basket.find(b => b.id === id);
    if (!ex && RX.basket.length >= 100) return toast(t('rx_basket_full'), 'error');
    const ok = await rxPutBasket(ex ? RX.basket.map(b => b === ex ? { ...it, id: ex.id } : b) : RX.basket.concat([it]), t('rx_fav_saved'));
    if (ok) { RX.editB = null; RX.bd = {}; rxRenderBasket(); }
  },
  rxClear() { if (RX.lines.length && confirm(t('rx_clear_c'))) { RX.lines = []; rxSave(); rxRenderList(); } },
  rxPrint() { const a = RX.pat; rxPrintDoc(rxLines(), a ? { name: a.name, birthYear: a.birthYear } : { name: '' }, Date.now()); },
  rxPrintRec(el) { const g = RX.reg[el.dataset.id]; if (g) rxPrintDoc(g.rec.rx, { name: g.pat.name, birthYear: g.pat.birthYear }, g.rec.finishedAt); }
});
document.addEventListener('input', e => {
  const el = e.target; if (!el || !el.id && !el.dataset) return;
  if (el.id === 'rxSearch') { RX.q = el.value; rxRenderResults(); }
  else if (el.dataset && el.dataset.tp) { rxTplSet({ [el.dataset.tp]: el.value }); }
  else if (el.dataset && el.dataset.bf) { RX.bd[el.dataset.bf] = el.value; }
  else if (el.dataset && el.dataset.rx) { const l = RX.lines[+el.dataset.i]; if (l && ['name', 'form', 'dose', 'freq', 'dur', 'note'].includes(el.dataset.rx)) { l[el.dataset.rx] = el.value; rxSave(); } }
});
document.addEventListener('change', async e => {
  const el = e.target; if (!el) return;
  if (el.id === 'rxLang') { rxTplSet({ lang: el.value }); RX.lines = RX.lines.map(l => rxTrLine(l, el.value)); rxSave(); rxRenderPaperTop(); rxRenderList(); rxFillLists(); }
  else if (el.id === 'rxLogoFile' && el.files && el.files[0]) { try { rxTplSet({ logo: await rxLogoFromFile(el.files[0]) }); rxRenderPaperTop(); } catch (x) { toast(t('rxt_logo_bad'), 'error'); } el.value = ''; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && e.target && e.target.id === 'rxSearch') { ACT.rxFindClose(); } });

/* ---------- سحب الأسطر بالماوس لتغيير الترتيب ---------- */
let rxDrag = -1;
const rxClearDrop = () => document.querySelectorAll('.rx-line.drop-before,.rx-line.drop-after,.rx-line.dragging').forEach(n => n.classList.remove('drop-before', 'drop-after', 'dragging'));
const rxDropPos = e => { const li = e.target.closest && e.target.closest('.rx-line'); if (!li || rxDrag < 0) return null; const r = li.getBoundingClientRect(); return { li, after: e.clientY > r.top + r.height / 2 }; };
document.addEventListener('dragstart', e => {
  const g = e.target.closest && e.target.closest('.rx-grip'); if (!g) return; const li = g.closest('.rx-line'); rxDrag = +li.dataset.i;
  e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(rxDrag)); e.dataTransfer.setDragImage(li, 24, 24); } catch (x) {} setTimeout(() => li.classList.add('dragging'), 0);
});
document.addEventListener('dragover', e => { const p = rxDropPos(e); if (!p) return; e.preventDefault(); document.querySelectorAll('.rx-line.drop-before,.rx-line.drop-after').forEach(n => n.classList.remove('drop-before', 'drop-after')); p.li.classList.add(p.after ? 'drop-after' : 'drop-before'); });
document.addEventListener('drop', e => {
  const p = rxDropPos(e); if (!p) return; e.preventDefault(); let to = +p.li.dataset.i + (p.after ? 1 : 0); const from = rxDrag; rxDrag = -1; rxClearDrop();
  if (from < 0 || from >= RX.lines.length) return; const [m] = RX.lines.splice(from, 1); if (to > from) to--; RX.lines.splice(Math.max(0, Math.min(to, RX.lines.length)), 0, m); rxSave(); rxRenderList();
});
document.addEventListener('dragend', () => { rxDrag = -1; rxClearDrop(); });

/* ---------- الطباعة: تُبنى داخل الصفحة وتُظهر @media print هذا العنصر وحده ---------- */
function rxPrintDoc(lines, pat, ts) {
  if (!lines || !lines.length) return toast(t('rx_empty'), 'info');
  let box = $('#rxPrint'); if (!box) { box = document.createElement('div'); box.id = 'rxPrint'; document.body.appendChild(box); }
  const T = rxTpl(), L = T.L, yr = new Date(ts).getFullYear(), age = pat && pat.birthYear ? yr - pat.birthYear : null, contact = [T.phone ? `${L.phone}: ${T.phone}` : '', T.address].filter(Boolean).join(' · ');
  box.innerHTML = `<div class="rxp" dir="${L.dir}"><div class="rxp-head">${T.logo ? `<img class="rxp-logo" src="${esc(T.logo)}" alt="">` : ''}<div class="rxp-hc"><div class="rxp-clinic">${esc(T.clinic)}</div>${T.doctor ? `<div>${esc(T.doctor)}</div>` : ''}${T.spec ? `<div class="rxp-spec">${esc(T.spec)}</div>` : ''}${contact ? `<div class="rxp-contact">${esc(contact)}</div>` : ''}</div><div class="rxp-date">${esc(L.date)}: ${esc(new Date(ts).toLocaleDateString(L.loc, { dateStyle: 'long' }))}</div></div>
    <div class="rxp-pat"><span>${esc(L.patient)}: <b>${esc(pat && pat.name || '')}</b></span>${age != null ? `<span>${esc(L.age)}: <b>${age} ${esc(L.years)}</b></span>` : ''}</div>
    <div class="rxp-title">℞ <span>${esc(L.title)}</span></div>
    <ol class="rxp-list">${lines.map(l => `<li><div class="rxp-d"><b>${esc(l.name)}</b>${l.form ? ` <span>${esc(l.form)}</span>` : ''}</div>${rxPoso(l) ? `<div class="rxp-p">${esc(rxPoso(l))}</div>` : ''}${l.note ? `<div class="rxp-n">${esc(l.note)}</div>` : ''}</li>`).join('')}</ol>
    <div class="rxp-sign">${esc(L.sign)}</div></div>`;
  document.body.classList.add('print-rx');
  const done = () => { document.body.classList.remove('print-rx'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
}

/* ---------- عرض الوصفة داخل الأرشيف وسجل المريض ---------- */
function rxRecHTML(rec, pat) {
  if (!rec || !rec.rx || !rec.rx.length) return ''; RX.reg[rec.id] = { rec, pat };
  return `<div class="rx-rec"><div class="rx-rec-h"><b>${esc(t('rx_rec', { n: rec.rx.length }))}</b><button type="button" class="btn-action" data-act="rxPrintRec" data-id="${esc(rec.id)}">🖨️ ${esc(t('rx_reprint'))}</button></div><ul>${rec.rx.map(l => `<li><b>${esc(l.name)}</b>${l.form ? ` <small>${esc(l.form)}</small>` : ''}${rxPoso(l) ? ` — ${esc(rxPoso(l))}` : ''}${l.note ? ` <i>(${esc(l.note)})</i>` : ''}</li>`).join('')}</ul></div>`;
}

/* ---------- استيراد قوائم الأدوية (CSV / JSON / TXT) ---------- */
const KEYS = { n: ['name', 'n', 'dci', 'inn', 'denomination', 'denominationcommuneinternationale', 'nom', 'designation', 'molecule', 'substance', 'generic', 'genericname', 'activeingredient'], b: ['brand', 'b', 'marque', 'nomdemarque', 'commercial', 'nomcommercial', 'tradename', 'specialite', 'brandname'], f: ['form', 'f', 'forme', 'presentation', 'galenique'], d: ['d', 'dosage', 'dose', 'strength', 'concentration', 'dosages'], c: ['class', 'c', 'classe', 'classetherapeutique', 'categorie', 'famille', 'category'], ar: ['ar', 'arabic', 'arabe', 'nomarabe'] };
const kn = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
function rxCsv(text) {   // محلّل CSV صغير يدعم علامات الاقتباس والفاصل , ; أو Tab
  const first = text.slice(0, 2000).split(/\r?\n/)[0] || '', cnt = c => first.split(c).length - 1, sep = cnt('\t') >= cnt(';') && cnt('\t') >= cnt(',') && cnt('\t') > 0 ? '\t' : cnt(';') > cnt(',') ? ';' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === sep) { row.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim())) rows.push(row); row = []; } else cur += ch;
  }
  row.push(cur); if (row.some(x => x.trim())) rows.push(row); return rows;
}
function rxParseImport(text, filename) {
  text = text.replace(/^\uFEFF/, ''); let objs = [];
  if (/\.json$/i.test(filename) || /^\s*[\[{]/.test(text)) { const j = JSON.parse(text); objs = Array.isArray(j) ? j : (Array.isArray(j.drugs) ? j.drugs : []); }
  else {
    const rows = rxCsv(text); if (!rows.length) return [];
    const head = rows[0].map(kn), has = ks => head.findIndex(h => ks.includes(h)), hasHeader = has(KEYS.n) >= 0 || has(KEYS.b) >= 0;
    if (hasHeader) { const ix = {}; for (const k in KEYS) ix[k] = has(KEYS[k]); objs = rows.slice(1).map(r => { const o = {}; for (const k in ix) o[k] = ix[k] >= 0 ? (r[ix[k]] || '').trim() : ''; return o; }); }
    else objs = rows.map(r => ({ n: (r[0] || '').trim(), b: (r[1] || '').trim(), f: (r[2] || '').trim(), d: '', c: (r[3] || '').trim(), ar: '' }));
  }
  const pick = (o, ks) => { for (const k of Object.keys(o)) if (ks.includes(kn(k)) && o[k] != null && String(o[k]).trim()) return String(o[k]).trim(); return ''; };
  const map = new Map();
  for (const z of objs) {
    let n, ar = '', b = '', f = '', c = '';
    if (typeof z === 'string') n = z.trim();
    else if (Array.isArray(z)) { n = String(z[0] || '').trim(); ar = String(z[1] || '').trim(); b = String(z[2] || '').trim(); f = String(z[3] || '').trim(); c = String(z[4] || '').trim(); }
    else if (z && typeof z === 'object') { n = pick(z, KEYS.n); b = pick(z, KEYS.b); const fo = pick(z, KEYS.f), dd = pick(z, KEYS.d); f = [fo, dd].filter(Boolean).join(' ').trim() || ''; c = pick(z, KEYS.c); ar = pick(z, KEYS.ar); if (!n) n = b; }
    if (!n) continue; const k = rxN(n); if (!k) continue;
    const o = map.get(k) || { n, ar: '', b: new Set(), f: new Set(), c: '' }; if (ar && !o.ar) o.ar = ar; if (c && !o.c) o.c = c; if (b && rxN(b) !== k) b.split(/[,;|]/).map(x => x.trim()).filter(Boolean).forEach(x => o.b.add(x)); if (f) f.split(/\s*;\s*/).filter(Boolean).forEach(x => o.f.add(x)); map.set(k, o);
  }
  const cut = (set, sep, max) => { let s = ''; for (const x of set) { const nx = s ? s + sep + x : x; if (nx.length > max) break; s = nx; } return s; };
  return [...map.values()].map(o => [o.n, o.ar, cut(o.b, ', ', 400), cut(o.f, '; ', 400), o.c]);
}
function rxMerge(oldA, newA) {
  const m = new Map(); for (const r of oldA.concat(newA)) { const k = rxN(r[0]); const o = m.get(k); if (!o) { m.set(k, r.slice()); continue; }
    if (!o[1] && r[1]) o[1] = r[1]; if (!o[4] && r[4]) o[4] = r[4]; for (const [i, sep] of [[2, ', '], [3, '; ']]) { const have = new Set(String(o[i]).split(sep.trim()).map(x => x.trim()).filter(Boolean)); for (const x of String(r[i]).split(sep.trim()).map(x => x.trim()).filter(Boolean)) have.add(x); let s = ''; for (const x of have) { const nx = s ? s + sep + x : x; if (nx.length > 400) break; s = nx; } o[i] = s; } }
  return [...m.values()];
}
function rxDrugsInfo() { const e = $('#drugsInfo'); if (e) e.textContent = t('drugs_info', { a: DRUGS.length, b: RX.extra.length }); }
async function rxReadFile(file) {
  const buf = await file.arrayBuffer(); try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { return new TextDecoder('windows-1252').decode(buf); }
}
Object.assign(ACT, {
  drugsPick() { const f = $('#drugsFile'); if (f) { f.value = ''; f.click(); } },
  async drugsClear() { if (!confirm(t('drugs_clear_c'))) return; const r = await run(() => api('DELETE', '/api/rx/drugs')); if (r) { RX.extra = []; RX.idx = null; rxDrugsInfo(); rxRenderResults(); toast(t('drugs_cleared'), 'info'); } }
});
document.addEventListener('change', async e => {
  const el = e.target; if (!el || el.id !== 'drugsFile' || !el.files || !el.files[0]) return;
  const file = el.files[0]; if (file.size > 12e6) return toast(t('drugs_bad'), 'error');
  let list; try { list = rxParseImport(await rxReadFile(file), file.name); } catch (x) { list = []; }
  if (!list.length) return toast(t('drugs_bad'), 'error');
  await rxLoad(true); const merged = rxMerge(RX.extra, list), cap = 4000, over = merged.length > cap, final = merged.slice(0, cap);
  if (!confirm(t('drugs_confirm', { n: list.length }))) return;
  const r = await run(() => api('PUT', '/api/rx/drugs', { drugs: final })); if (!r) return;
  RX.extra = final; RX.idx = null; rxDrugsInfo(); rxRenderResults(); toast(t('drugs_done', { n: list.length }), 'success'); if (over) toast(t('drugs_trunc', { n: cap }), 'info');
});
{
  const _open = ACT.openSet;
  ACT.openSet = function (el) { if (el && el.dataset && el.dataset.m === 'set_drugsModal') { rxLoad(true).then(rxDrugsInfo); rxDrugsInfo(); } return _open.apply(this, arguments); };
}
