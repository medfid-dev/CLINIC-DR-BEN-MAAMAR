'use strict';
/* عيادتي الذكية — مصمّم تخطيط الوصفة الطبية.
   كل عنصر (شعار، اسم العيادة، الطبيب، المريض، الأدوية، التوقيع، خطوط، نصوص حرة) يوضع بالمليمتر على الورقة
   مع التحكم في الحجم والخط والمحاذاة واللون. يُحفظ في قالب العيادة على الخادم (rxTpl.lay).
   إن لم يُحفظ تخطيط يبقى التخطيط الكلاسيكي كما هو. يعتمد على rx.js وapp.js. */

Object.assign(L.ar, {
  rxl_btn: 'تعديل التخطيط', rxl_title: '🎨 مصمّم تخطيط الوصفة', rxl_paper: 'الورقة', rxl_w: 'العرض (مم)', rxl_h: 'الارتفاع (مم)', rxl_swap: 'تبديل الاتجاه ↔',
  rxl_grid: 'خطوة التحريك', rxl_nogrid: 'حرّة', rxl_zoom: 'التكبير', rxl_font: 'نوع الخط', rxl_ff_def: 'الافتراضي', rxl_ff_serif: 'مزخرف (Serif)', rxl_ff_sans: 'بسيط', rxl_ff_mono: 'ثابت العرض',
  rxl_blocks: 'العناصر', rxl_show: 'إظهار العنصر', rxl_x: 'X — من اليسار (مم)', rxl_y: 'Y — من الأعلى (مم)', rxl_bw: 'العرض (مم)', rxl_bh: 'الارتفاع (مم)', rxl_fs: 'حجم الخط (pt)',
  rxl_bold: 'عريض', rxl_it: 'مائل', rxl_col: 'اللون', rxl_th: 'السماكة (مم)', rxl_ds: 'متقطّع', rxl_txt: 'النص', rxl_lh: 'تباعد الأسطر', rxl_gap: 'المسافة بين الأدوية (مم)', rxl_num: 'ترقيم الأدوية',
  rxl_addt: '＋ نص حر', rxl_addr: '＋ خط', rxl_remove: 'إزالة هذا العنصر', rxl_reset: 'استعادة التخطيط الافتراضي', rxl_classic: 'العودة للتخطيط الكلاسيكي', rxl_classic_c: 'حذف التخطيط المخصّص والعودة للتخطيط الكلاسيكي؟',
  rxl_save: 'حفظ التخطيط', rxl_cancel: 'إغلاق بلا حفظ', rxl_test: '🖨️ طباعة تجريبية', rxl_saved: 'حُفظ تخطيط الوصفة', rxl_reset_c: 'استعادة المواضع والأحجام الافتراضية؟',
  rxl_hint: 'اسحب أي عنصر لتحريكه، واسحب المربع الصغير في زاويته لتغيير عرضه. الأسهم تحرّك بدقة (Shift = ×5).', rxl_sample: 'اسم المريض', rxl_cust: 'نص جديد', rxl_close_c: 'إغلاق بدون حفظ التغييرات؟',
  rxl_al_l: 'يسار', rxl_al_c: 'وسط', rxl_al_r: 'يمين', rxl_al: 'المحاذاة', rxl_none: 'اختر عنصراً من الورقة أو من القائمة', rxl_content: 'محتوى النص', rxl_logo_pick: 'اختيار شعار', rxl_logo_rm: 'إزالة الشعار', rxl_logo_bad: 'تعذّر قراءة الصورة',
  rxlb_logo: 'الشعار', rxlb_clinic: 'اسم العيادة', rxlb_doctor: 'اسم الطبيب', rxlb_spec: 'التخصص', rxlb_contact: 'الهاتف والعنوان', rxlb_date: 'التاريخ', rxlb_patient: 'اسم المريض', rxlb_age: 'العمر',
  rxlb_title: 'عنوان الوصفة ℞', rxlb_list: 'قائمة الأدوية', rxlb_sign: 'التوقيع والختم', rxlb_rule1: 'خط 1', rxlb_rule2: 'خط 2', rxlb_rule3: 'خط 3',
  rxlb_t1: 'نص حر 1', rxlb_t2: 'نص حر 2', rxlb_t3: 'نص حر 3', rxlb_t4: 'نص حر 4', rxlb_t5: 'نص حر 5', rxlb_t6: 'نص حر 6'
});
Object.assign(L.en, {
  rxl_btn: 'Customize prescription layout', rxl_title: '🎨 Prescription layout designer', rxl_paper: 'Paper', rxl_w: 'Width (mm)', rxl_h: 'Height (mm)', rxl_swap: 'Swap orientation ↔',
  rxl_grid: 'Move step', rxl_nogrid: 'Free', rxl_zoom: 'Zoom', rxl_font: 'Font family', rxl_ff_def: 'Default', rxl_ff_serif: 'Serif', rxl_ff_sans: 'Sans', rxl_ff_mono: 'Monospace',
  rxl_blocks: 'Elements', rxl_show: 'Show element', rxl_x: 'X — from left (mm)', rxl_y: 'Y — from top (mm)', rxl_bw: 'Width (mm)', rxl_bh: 'Height (mm)', rxl_fs: 'Font size (pt)',
  rxl_bold: 'Bold', rxl_it: 'Italic', rxl_col: 'Color', rxl_th: 'Thickness (mm)', rxl_ds: 'Dashed', rxl_txt: 'Text', rxl_lh: 'Line spacing', rxl_gap: 'Gap between drugs (mm)', rxl_num: 'Number the drugs',
  rxl_addt: '＋ Free text', rxl_addr: '＋ Line', rxl_remove: 'Remove this element', rxl_reset: 'Restore default layout', rxl_classic: 'Back to classic layout', rxl_classic_c: 'Delete the custom layout and go back to the classic one?',
  rxl_save: 'Save layout', rxl_cancel: 'Close without saving', rxl_test: '🖨️ Test print', rxl_saved: 'Prescription layout saved', rxl_reset_c: 'Restore default positions and sizes?',
  rxl_hint: 'Drag any element to move it; drag the small square at its corner to resize its width. Arrow keys nudge precisely (Shift = ×5).', rxl_sample: 'Patient name', rxl_cust: 'New text', rxl_close_c: 'Close without saving changes?',
  rxl_al_l: 'Left', rxl_al_c: 'Center', rxl_al_r: 'Right', rxl_al: 'Alignment', rxl_none: 'Pick an element on the page or in the list', rxl_content: 'Text content', rxl_logo_pick: 'Choose logo', rxl_logo_rm: 'Remove logo', rxl_logo_bad: 'Could not read the image',
  rxlb_logo: 'Logo', rxlb_clinic: 'Clinic name', rxlb_doctor: 'Doctor name', rxlb_spec: 'Specialty', rxlb_contact: 'Phone & address', rxlb_date: 'Date', rxlb_patient: 'Patient name', rxlb_age: 'Age',
  rxlb_title: 'Prescription title ℞', rxlb_list: 'Drug list', rxlb_sign: 'Signature & stamp', rxlb_rule1: 'Line 1', rxlb_rule2: 'Line 2', rxlb_rule3: 'Line 3',
  rxlb_t1: 'Free text 1', rxlb_t2: 'Free text 2', rxlb_t3: 'Free text 3', rxlb_t4: 'Free text 4', rxlb_t5: 'Free text 5', rxlb_t6: 'Free text 6'
});

const RXL_IDS = ['logo', 'clinic', 'doctor', 'spec', 'contact', 'date', 'patient', 'age', 'title', 'list', 'sign', 'rule1', 'rule2', 'rule3', 't1', 't2', 't3', 't4', 't5', 't6'];
const RXL_PAPERS = { A4: [210, 297], A5: [148, 210], A6: [105, 148], LETTER: [216, 279] };
const RXL_FF = { serif: "Georgia,'Times New Roman',serif", sans: "'Segoe UI',Tahoma,Arial,sans-serif", mono: "'Courier New',monospace" };
const RXL_PXMM = 96 / 25.4;
const RXL = { lay: null, sel: 'clinic', k: 1, drag: null, dir: 'rtl' };
const rxlKind = id => id === 'logo' ? 'img' : /^rule/.test(id) ? 'rule' : id === 'list' ? 'list' : /^t\d$/.test(id) ? 'free' : 'text';
const rxlName = id => t('rxlb_' + id);
const rxlNum = v => Math.round(v * 100) / 100;

function rxlDefault(w, h, dir) {
  const rtl = dir === 'rtl', m = Math.round(w * 0.07), cw = w - 2 * m, side = Math.round(cw * 0.2), dw = Math.round(cw * 0.25), tx = m + side + 4, tw = cw - 2 * (side + 4);
  const startAl = rtl ? 'right' : 'left', endAl = rtl ? 'left' : 'right', pw = rxlNum(cw * 0.62), aw = rxlNum(cw - pw);
  const extra = (y) => ({ x: m, y, w: rxlNum(cw * 0.5), fs: 12, vis: 0, al: startAl, txt: '' });
  return {
    logo: { x: rtl ? w - m - side : m, y: 10, w: side, h: 24, vis: 1 },
    date: { x: rtl ? m : w - m - dw, y: 12, w: dw, fs: 10.5, al: endAl, vis: 1 },
    clinic: { x: tx, y: 11, w: tw, fs: 18, b: 1, al: 'center', vis: 1 },
    doctor: { x: tx, y: 21, w: tw, fs: 13, al: 'center', vis: 1 },
    spec: { x: tx, y: 28, w: tw, fs: 11, al: 'center', vis: 1 },
    contact: { x: tx, y: 34, w: tw, fs: 10.5, al: 'center', col: '#333333', vis: 1 },
    rule1: { x: m, y: 42, w: cw, th: 0.6, vis: 1 },
    patient: { x: rtl ? m + aw : m, y: 47, w: pw, fs: 12, al: startAl, vis: 1 },
    age: { x: rtl ? m : m + pw, y: 47, w: aw, fs: 12, al: endAl, vis: 1 },
    rule2: { x: m, y: 55, w: cw, th: 0.3, ds: 1, vis: 1 },
    title: { x: m, y: 59, w: cw, fs: 26, b: 1, al: startAl, vis: 1 },
    list: { x: m, y: 79, w: cw, fs: 14, lh: 1.5, gap: 4, num: 1, al: startAl, vis: 1 },
    sign: { x: rtl ? m : w - m - 55, y: rxlNum(h - 45), w: 55, fs: 11, al: 'center', vis: 1 },
    rule3: { x: m, y: 100, w: cw, th: 0.3, vis: 0 },
    t1: extra(100), t2: extra(110), t3: extra(120), t4: extra(130), t5: extra(140), t6: extra(150)
  };
}
const rxlNew = (w, h, dir) => ({ w, h, grid: 1, ff: '', blocks: rxlDefault(w, h, dir) });
function rxlMerge(lay, dir) {
  const d = rxlDefault(lay.w, lay.h, dir), o = {};
  for (const id of RXL_IDS) o[id] = Object.assign({}, d[id], (lay.blocks || {})[id] || {});
  return o;
}

/* ---------- الرسم (للطباعة وللمعاينة وللمصمّم) ---------- */
function rxlRender(lay, T, lines, pat, ts, o) {
  o = o || {};
  const L = T.L, dir = L.dir, B = rxlMerge(lay, dir), d = new Date(ts).toLocaleDateString(L.loc, { dateStyle: 'long' });
  const age = pat && pat.birthYear ? new Date(ts).getFullYear() - pat.birthYear : (o.design ? 30 : null);
  const contact = [T.phone ? `${L.phone}: ${T.phone}` : '', T.address].filter(Boolean).join(' · ');
  const content = {
    clinic: T.clinic, doctor: T.doctor, spec: T.spec, contact, date: `${L.date}: ${d}`,
    patient: `${L.patient}: <b>${esc(pat && pat.name || (o.design ? t('rxl_sample') : ''))}</b>`, age: age == null ? '' : `${L.age}: <b>${age} ${L.years}</b>`
  };
  const parts = [];
  for (const id of RXL_IDS) {
    const b = B[id]; if (!b.vis) continue; const kind = rxlKind(id);
    let st = `left:${b.x}mm;top:${b.y}mm;width:${b.w}mm;`, inner = '';
    if (kind === 'rule') {
      const th = b.th || 0.5; st += `height:${o.design ? Math.max(th, 2.5) : th}mm;`;
      inner = `<div style="position:absolute;left:0;right:0;top:0;border-top:${th}mm ${b.ds ? 'dashed' : 'solid'} ${b.col || '#000'}"></div>`;
    } else if (kind === 'img') {
      st += `height:${b.h || 24}mm;`;
      inner = T.logo ? `<img src="${esc(T.logo)}" alt="" style="width:100%;height:100%;object-fit:contain;display:block">` : (o.design ? `<div class="rxl-logoph">LOGO</div>` : '');
    } else {
      st += `font-size:${b.fs || 12}pt;font-weight:${b.b ? 700 : 400};font-style:${b.i ? 'italic' : 'normal'};text-align:${b.al || (dir === 'rtl' ? 'right' : 'left')};color:${b.col || '#000'};direction:${dir};`;
      if (kind === 'list') {
        const ls = lines && lines.length ? lines : (o.design ? [{ name: 'Amoxicilline 1g', form: 'cp', dose: '1 cp', freq: '3x/j', dur: '7 j', note: '' }, { name: 'Paracétamol 500mg', form: '', dose: '1 cp', freq: 'si douleur', dur: '3 j', note: '' }] : []);
        st += `line-height:${b.lh || 1.5};`;
        inner = ls.map((l, i) => `<div style="margin-bottom:${b.gap == null ? 4 : b.gap}mm;break-inside:avoid">${b.num === 0 ? '' : (i + 1) + '. '}<b>${esc(l.name)}</b>${l.form ? ` <span style="font-size:.85em">${esc(l.form)}</span>` : ''}${rxPoso(l) ? `<div style="font-size:.88em;margin-inline-start:${b.num === 0 ? 0 : 1.4}em">${esc(rxPoso(l))}</div>` : ''}${l.note ? `<div style="font-size:.8em;font-style:italic;margin-inline-start:${b.num === 0 ? 0 : 1.4}em">${esc(l.note)}</div>` : ''}</div>`).join('');
      } else if (kind === 'free') {
        inner = esc(b.txt || (o.design ? t('rxl_cust') : '')).replace(/\n/g, '<br>');
      } else if (id === 'title') {
        inner = `℞ <span style="font-size:.5em;font-weight:400;margin-inline-start:2mm">${esc(L.title)}</span>`;
      } else if (id === 'sign') {
        st += 'border-top:.3mm solid #000;padding-top:1mm;'; inner = esc(L.sign);
      } else if (id === 'patient' || id === 'age' || id === 'date') {
        inner = content[id];
      } else {
        inner = content[id] ? esc(content[id]) : (o.design ? `<span class="rxl-ph">${esc(rxlName(id))}</span>` : '');
      }
    }
    if (!inner && !o.design && kind !== 'rule') continue;
    parts.push(`<div class="rb${o.design && RXL.sel === id ? ' sel' : ''}" data-b="${id}" style="${st}">${inner}${o.design ? '<i class="rs"></i>' : ''}</div>`);
  }
  const ff = RXL_FF[lay.ff] ? `font-family:${RXL_FF[lay.ff]};` : '';
  const z = o.zoom ? `zoom:${Math.min(1, (window.innerWidth - 70) / (lay.w * RXL_PXMM)).toFixed(3)};` : '';
  return `<div class="rxl${o.design ? ' rxl-dz' : ''}" style="width:${lay.w}mm;height:${lay.h - (o.design ? 0 : 1)}mm;${ff}${z}">${parts.join('')}</div>`;
}

/* ---------- ربط مع rx.js: القالب، العرض، الطباعة ---------- */
const _rxTpl = rxTpl, _rxDocHTML = rxDocHTML, _rxModalHTML = rxModalHTML, _rxPrintDoc = rxPrintDoc;
rxTpl = function (h) { const r = _rxTpl(h); r.lay = (RX.tpl || {}).lay || null; return r; };
rxDocHTML = function (lines, pat, ts, head) {
  const T = rxTpl(head); if (!T.lay) return _rxDocHTML(lines, pat, ts, head);
  return rxlRender(T.lay, T, lines, pat, ts, { zoom: true });
};
rxPrintDoc = function (lines, pat, ts, head, layOverride) {
  const T = rxTpl(head), lay = layOverride || T.lay;
  if (!lay) return _rxPrintDoc(lines, pat, ts, head);
  if (!lines || !lines.length) return toast(t('rx_empty'), 'info');
  let box = $('#rxPrint'); if (!box) { box = document.createElement('div'); box.id = 'rxPrint'; document.body.appendChild(box); }
  box.innerHTML = rxlRender(lay, T, lines, pat, ts);
  let st = $('#rxPageSt'); if (st) st.remove(); st = document.createElement('style'); st.id = 'rxPageSt'; st.textContent = `@page{size:${lay.w}mm ${lay.h}mm;margin:0}`; document.head.appendChild(st);
  document.body.classList.add('print-rx', 'print-rxl');
  const done = () => { document.body.classList.remove('print-rx', 'print-rxl'); const s = $('#rxPageSt'); if (s) s.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done); setTimeout(() => window.print(), 60);
};
rxModalHTML = function () {
  const big = `<button type="button" class="btn-action btn-green rxl-open-big" data-act="rxlOpen">🎨 ${esc(t('rxl_btn'))}</button>`;
  return _rxModalHTML().replace('<div class="rx-actions">', '<div class="rx-actions">' + big).replace('<button type="button" class="btn-action" data-act="rxTplReset">', `<button type="button" class="btn-action btn-green" data-act="rxlOpen">🎨 ${esc(t('rxl_btn'))}</button><button type="button" class="btn-action" data-act="rxTplReset">`);
};

/* ---------- المصمّم ---------- */
const rxlSnap = v => { const g = RXL.lay.grid; return g ? Math.round(v / g) * g : rxlNum(v); };
const rxlFit = () => Math.max(0.3, Math.min(1.5, ((window.innerWidth > 900 ? window.innerWidth - 420 : window.innerWidth - 40)) / (RXL.lay.w * RXL_PXMM)));
function rxlSampleLines() { const l = typeof rxLines === 'function' ? rxLines() : []; return l && l.length ? l : [{ name: 'Amoxicilline 1g', form: 'cp', dose: '1 cp', freq: '3 fois/jour', dur: '7 jours', note: '' }, { name: 'Paracétamol 500mg', form: '', dose: '1 cp', freq: 'si douleur', dur: '3 jours', note: '' }]; }
function rxlT() { const h = RXL.head || {}, T = rxTpl(Object.assign(rxHeadSnap(), h)); if ('logo' in h) T.logo = h.logo; return T; }
function rxlStageHTML() {
  const lay = RXL.lay, k = RXL.k, u = RXL_PXMM * k;
  return `<div class="rxl-wrap" style="width:${Math.ceil(lay.w * u)}px;height:${Math.ceil(lay.h * u)}px"><div class="rxl-scale" style="transform:scale(${k});--k:${k}">${rxlRender(lay, rxlT(), RX.lines && RX.lines.length ? RX.lines : [], RX.pat, Date.now(), { design: true })}</div></div>`;
}
function rxlDraw() { const s = $('#rxlStage'); if (!s) return; const sx = s.scrollLeft, sy = s.scrollTop; s.innerHTML = rxlStageHTML(); s.scrollLeft = sx; s.scrollTop = sy; }
function rxlBlk() { return RXL.lay.blocks[RXL.sel]; }
function rxlPanel() {
  const p = $('#rxlPanel'); if (!p) return; const lay = RXL.lay, id = RXL.sel, kind = rxlKind(id), b = Object.assign({}, rxlMerge(lay, RXL.dir)[id]);
  const num = (key, label, v, step, min) => `<label class="rxl-f"><span>${esc(label)}</span><input type="number" data-rl="${key}" value="${v}" step="${step || 0.5}"${min != null ? ` min="${min}"` : ''}></label>`;
  const chk = (key, label, on) => `<label class="rxl-chk"><input type="checkbox" data-rl="${key}"${on ? ' checked' : ''}> ${esc(label)}</label>`;
  const paperSel = Object.keys(RXL_PAPERS).find(n => (RXL_PAPERS[n][0] === lay.w && RXL_PAPERS[n][1] === lay.h) || (RXL_PAPERS[n][0] === lay.h && RXL_PAPERS[n][1] === lay.w)) || 'custom';
  let h = `<div class="rxl-sec"><b>${esc(t('rxl_paper'))}</b><div class="rxl-row"><select data-rl="paper">${Object.keys(RXL_PAPERS).map(n => `<option value="${n}"${paperSel === n ? ' selected' : ''}>${n}</option>`).join('')}<option value="custom"${paperSel === 'custom' ? ' selected' : ''}>…</option></select><button type="button" class="btn-action" data-act="rxlSwap">${esc(t('rxl_swap'))}</button></div>
    <div class="rxl-row">${num('pw', t('rxl_w'), lay.w, 1, 50)}${num('ph', t('rxl_h'), lay.h, 1, 50)}</div>
    <div class="rxl-row"><label class="rxl-f"><span>${esc(t('rxl_grid'))}</span><select data-rl="grid">${[[0, t('rxl_nogrid')], [1, '1 mm'], [2, '2 mm'], [5, '5 mm']].map(g => `<option value="${g[0]}"${lay.grid === g[0] ? ' selected' : ''}>${g[1]}</option>`).join('')}</select></label>
    <label class="rxl-f"><span>${esc(t('rxl_font'))}</span><select data-rl="ff">${[['', t('rxl_ff_def')], ['serif', t('rxl_ff_serif')], ['sans', t('rxl_ff_sans')], ['mono', t('rxl_ff_mono')]].map(g => `<option value="${g[0]}"${lay.ff === g[0] ? ' selected' : ''}>${g[1]}</option>`).join('')}</select></label></div>
    <label class="rxl-f"><span>🌐 ${esc(t('rxt_lang'))}</span><select data-rh="lang">${Object.keys(RXP_NAMES).map(k => `<option value="${k}"${rxlT().lang === k ? ' selected' : ''}>${RXP_NAMES[k]}</option>`).join('')}</select></label>
    <label class="rxl-f"><span>${esc(t('rxl_zoom'))}</span><input type="range" data-rl="zoom" min="0.3" max="1.5" step="0.05" value="${RXL.k}"></label></div>
    <div class="rxl-sec"><b>${esc(t('rxl_blocks'))}</b><div class="rxl-chips">${RXL_IDS.filter(x => !/^(t\d|rule3)$/.test(x) || rxlMerge(lay, RXL.dir)[x].vis || x === id).map(x => `<button type="button" class="rxl-chip${x === id ? ' on' : ''}${rxlMerge(lay, RXL.dir)[x].vis ? '' : ' off'}" data-act="rxlSel" data-id="${x}">${esc(rxlName(x))}</button>`).join('')}</div>
    <div class="rxl-row"><button type="button" class="btn-action" data-act="rxlAdd" data-k="t">${esc(t('rxl_addt'))}</button><button type="button" class="btn-action" data-act="rxlAdd" data-k="r">${esc(t('rxl_addr'))}</button></div></div>`;
  const T = rxlT(), tin = (k, label) => `<label class="rxl-f"><span>${esc(label)}</span><input type="text" data-rh="${k}" maxlength="${k === 'address' ? 160 : k === 'phone' ? 60 : 120}" value="${esc(T[k])}"></label>`;
  let ct = '';
  if (id === 'clinic') ct = tin('clinic', t('rxt_clinic')); else if (id === 'doctor') ct = tin('doctor', t('rxt_doctor')); else if (id === 'spec') ct = tin('spec', t('rxt_spec'));
  else if (id === 'contact') ct = tin('phone', t('rxt_phone')) + tin('address', t('rxt_addr'));
  else if (id === 'logo') ct = `<div class="rxl-row"><button type="button" class="btn-action btn-green" data-act="rxlLogoPick">＋ ${esc(t('rxl_logo_pick'))}</button>${T.logo ? `<button type="button" class="btn-action btn-red" data-act="rxlLogoDel">${esc(t('rxl_logo_rm'))}</button>` : ''}</div><input type="file" id="rxlLogoFile" accept="image/*" hidden>`;
  h += `<div class="rxl-sec rxl-selsec"><b>${esc(rxlName(id))}</b>${ct ? `<div class="rxl-sec rxl-ct"><b>${esc(t('rxl_content'))}</b>${ct}</div>` : ''}${chk('vis', t('rxl_show'), b.vis)}
    <div class="rxl-row">${num('x', t('rxl_x'), rxlNum(b.x), 0.5)}${num('y', t('rxl_y'), rxlNum(b.y), 0.5)}</div><div class="rxl-row">${num('w', t('rxl_bw'), rxlNum(b.w), 0.5, 3)}${kind === 'img' ? num('h', t('rxl_bh'), rxlNum(b.h || 24), 0.5, 3) : ''}</div>`;
  if (kind === 'rule') h += `<div class="rxl-row">${num('th', t('rxl_th'), b.th || 0.5, 0.1, 0.1)}${chk('ds', t('rxl_ds'), b.ds)}</div><label class="rxl-f"><span>${esc(t('rxl_col'))}</span><input type="color" data-rl="col" value="${b.col || '#000000'}"></label>`;
  else if (kind !== 'img') {
    h += `<div class="rxl-row rxl-fsrow"><button type="button" class="btn-action" data-act="rxlFs" data-d="-1">A−</button>${num('fs', t('rxl_fs'), b.fs || 12, 0.5, 5)}<button type="button" class="btn-action" data-act="rxlFs" data-d="1">A＋</button></div>
    <div class="rxl-row"><button type="button" class="btn-action rxl-tg${b.b ? ' on' : ''}" data-act="rxlTog" data-p="b"><b>B</b> ${esc(t('rxl_bold'))}</button><button type="button" class="btn-action rxl-tg${b.i ? ' on' : ''}" data-act="rxlTog" data-p="i"><i>I</i> ${esc(t('rxl_it'))}</button></div>
    <div class="rxl-row">${[['left', 'rxl_al_l'], ['center', 'rxl_al_c'], ['right', 'rxl_al_r']].map(a => `<button type="button" class="btn-action rxl-tg${b.al === a[0] ? ' on' : ''}" data-act="rxlAl" data-v="${a[0]}">${esc(t(a[1]))}</button>`).join('')}</div>
    <div class="rxl-row"><label class="rxl-f"><span>${esc(t('rxl_col'))}</span><input type="color" data-rl="col" value="${b.col || '#000000'}"></label></div>`;
    if (kind === 'free') h += `<label class="rxl-f"><span>${esc(t('rxl_txt'))}</span><textarea data-rl="txt" rows="3" maxlength="400">${esc(b.txt || '')}</textarea></label>`;
    if (kind === 'list') h += `<div class="rxl-row">${num('lh', t('rxl_lh'), b.lh || 1.5, 0.1, 1)}${num('gap', t('rxl_gap'), b.gap == null ? 4 : b.gap, 0.5, 0)}</div>${chk('num', t('rxl_num'), b.num !== 0)}`;
  }
  if (/^(t\d|rule3)$/.test(id)) h += `<button type="button" class="btn-action btn-red" data-act="rxlRemove">${esc(t('rxl_remove'))}</button>`;
  h += `</div><div class="hint">${esc(t('rxl_hint'))}</div>`;
  p.innerHTML = h;
}
function rxlOpen() {
  const T = rxTpl(), cur = (RX.tpl || {}).lay;
  RXL.head = {}; RXL.dir = T.L.dir; RXL.lay = cur ? JSON.parse(JSON.stringify(cur)) : rxlNew(210, 297, RXL.dir); RXL.sel = 'clinic'; RXL.k = Math.round(rxlFit() * 20) / 20; RXL.dirty = false;
  let m = $('#rxlModal'); if (m) m.remove();
  m = document.createElement('div'); m.id = 'rxlModal'; m.className = 'modal-overlay active';
  m.innerHTML = `<div class="modal-card rxl-card"><div class="rxl-head"><h4>${esc(t('rxl_title'))}</h4><span class="rxl-hb"><button type="button" class="btn-action" data-act="rxlTest">${esc(t('rxl_test'))}</button><button type="button" class="btn-action btn-green" data-act="rxlSave">${esc(t('rxl_save'))}</button><button type="button" class="btn-action btn-red" data-act="rxlClose">${esc(t('rxl_cancel'))}</button></span></div>
    <div class="rxl-body"><div class="rxl-stage" id="rxlStage">${rxlStageHTML()}</div><div class="rxl-panel" id="rxlPanel"></div></div>
    <div class="rxl-foot"><button type="button" class="btn-action" data-act="rxlReset">${esc(t('rxl_reset'))}</button><button type="button" class="btn-action" data-act="rxlClassic">${esc(t('rxl_classic'))}</button></div></div>`;
  document.body.appendChild(m); rxlPanel();
}
function rxlSelect(id) { RXL.sel = id; document.querySelectorAll('#rxlStage .rb').forEach(e => e.classList.toggle('sel', e.dataset.b === id)); rxlPanel(); }
function rxlRaw() { const id = RXL.sel; if (!RXL.lay.blocks[id]) RXL.lay.blocks[id] = Object.assign({}, rxlMerge(RXL.lay, RXL.dir)[id]); return RXL.lay.blocks[id]; }
function rxlSyncXY() { const b = rxlRaw(); for (const k of ['x', 'y', 'w', 'h']) { const i = document.querySelector(`#rxlPanel [data-rl="${k}"]`); if (i && b[k] != null) i.value = rxlNum(b[k]); } }
function rxlInput(el) {
  const k = el.dataset.rl, lay = RXL.lay, n = parseFloat(el.value);
  RXL.dirty = true;
  if (k === 'paper') { const s = RXL_PAPERS[el.value]; if (s) rxlResize(lay.w > lay.h && s[0] < s[1] ? s[1] : s[0], lay.w > lay.h && s[0] < s[1] ? s[0] : s[1]); rxlPanel(); return; }
  if (k === 'pw' || k === 'ph') { if (!(n >= 50)) return; rxlResize(k === 'pw' ? n : lay.w, k === 'ph' ? n : lay.h); return; }
  if (k === 'grid') { lay.grid = parseInt(el.value, 10) || 0; return; }
  if (k === 'ff') { lay.ff = el.value; rxlDraw(); return; }
  if (k === 'zoom') { RXL.k = Math.max(0.3, Math.min(1.5, n || 1)); rxlDraw(); return; }
  const b = rxlRaw();
  if (k === 'vis' || k === 'ds' || k === 'num') { b[k] = el.checked ? 1 : 0; if (k === 'num' && el.checked) b.num = 1; if (k === 'vis') rxlPanel(); }
  else if (k === 'txt') b.txt = el.value;
  else if (k === 'col') b.col = el.value;
  else if (Number.isFinite(n)) b[k] = n;
  rxlDraw();
}
function rxlResize(w, h) {
  const lay = RXL.lay, fx = w / lay.w, fy = h / lay.h;
  for (const id of RXL_IDS) { const b = rxlMerge(lay, RXL.dir)[id]; lay.blocks[id] = Object.assign({}, lay.blocks[id] || b, { x: rxlNum((lay.blocks[id] || b).x * fx), w: rxlNum((lay.blocks[id] || b).w * fx), y: rxlNum((lay.blocks[id] || b).y * fy) }); }
  lay.w = w; lay.h = h; RXL.k = Math.round(rxlFit() * 20) / 20; rxlDraw(); const z = $('#rxlPanel [data-rl="zoom"]'); if (z) z.value = RXL.k;
}
document.addEventListener('input', e => { const el = e.target; if (el && el.dataset && el.dataset.rl && $('#rxlModal') && el.type !== 'checkbox' && el.tagName !== 'SELECT') rxlInput(el); });
document.addEventListener('change', e => { const el = e.target; if (el && el.dataset && el.dataset.rl && $('#rxlModal') && (el.type === 'checkbox' || el.tagName === 'SELECT')) rxlInput(el); });

document.addEventListener('input', e => { const el = e.target; if (el && el.dataset && el.dataset.rh && el.type === 'text' && $('#rxlModal')) { RXL.head[el.dataset.rh] = el.value; RXL.dirty = true; rxlDraw(); } });
document.addEventListener('change', async e => {
  const el = e.target; if (!el || !$('#rxlModal')) return;
  if (el.dataset && el.dataset.rh === 'lang') { RXL.head.lang = el.value; RXL.dir = RXP_L[el.value].dir; RXL.dirty = true; rxlDraw(); rxlPanel(); }
  else if (el.id === 'rxlLogoFile' && el.files && el.files[0]) { try { RXL.head.logo = await rxLogoFromFile(el.files[0]); RXL.dirty = true; rxlDraw(); rxlPanel(); } catch (x) { toast(t('rxl_logo_bad'), 'error'); } el.value = ''; }
});

/* السحب وتغيير العرض */
document.addEventListener('pointerdown', e => {
  const m = $('#rxlModal'); if (!m || !e.target.closest) return; const el = e.target.closest('.rb'); if (!el || !m.contains(el)) return;
  e.preventDefault(); const id = el.dataset.b; if (RXL.sel !== id) rxlSelect(id);
  const b = rxlRaw(), mg = rxlMerge(RXL.lay, RXL.dir)[id];
  RXL.drag = { el, id, rs: e.target.classList.contains('rs'), sx: e.clientX, sy: e.clientY, x: mg.x, y: mg.y, w: mg.w, h: mg.h || 24 };
  try { el.setPointerCapture(e.pointerId); } catch (x) {}
});
document.addEventListener('pointermove', e => {
  const d = RXL.drag; if (!d) return; const u = RXL_PXMM * RXL.k, dx = (e.clientX - d.sx) / u, dy = (e.clientY - d.sy) / u, b = rxlRaw(); RXL.dirty = true;
  if (d.rs) { b.w = Math.max(3, rxlSnap(d.w + dx)); d.el.style.width = b.w + 'mm'; if (rxlKind(d.id) === 'img') { b.h = Math.max(3, rxlSnap(d.h + dy)); d.el.style.height = b.h + 'mm'; } }
  else { b.x = rxlSnap(d.x + dx); b.y = rxlSnap(d.y + dy); d.el.style.left = b.x + 'mm'; d.el.style.top = b.y + 'mm'; }
  rxlSyncXY();
});
const rxlUp = () => { if (RXL.drag) { RXL.drag = null; rxlPanel(); } };
document.addEventListener('pointerup', rxlUp); document.addEventListener('pointercancel', rxlUp);
document.addEventListener('keydown', e => {
  if (!$('#rxlModal')) return; const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
  const st = (RXL.lay.grid || 0.5) * (e.shiftKey ? 5 : 1), mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key]; if (!mv) return;
  e.preventDefault(); const b = rxlRaw(), mg = rxlMerge(RXL.lay, RXL.dir)[RXL.sel]; b.x = rxlNum(mg.x + mv[0]); b.y = rxlNum(mg.y + mv[1]); RXL.dirty = true; rxlDraw(); rxlSyncXY();
});

async function rxlSaveNow(lay) {
  const h = RXL.head || {}, cur = rxTpl().lang;
  if (h.lang && h.lang !== cur) { RX.lines = (RX.lines || []).map(l => rxTrLine(l, h.lang)); if (typeof rxSave === 'function') rxSave(); }
  rxTplSet(Object.assign({}, h, { lay })); await rxTplFlush();
  if ($('#rxPaperTop')) { rxRenderPaperTop(); const lg = $('#rxLang'); if (lg) lg.value = rxTpl().lang; if (h.lang && typeof rxRenderList === 'function') { rxRenderList(); if (typeof rxFillLists === 'function') rxFillLists(); } }
}
Object.assign(ACT, {
  rxlOpen() { rxlOpen(); },
  rxlSel(el) { rxlSelect(el.dataset.id); },
  rxlSwap() { const l = RXL.lay; rxlResize(l.h, l.w); rxlPanel(); },
  rxlFs(el) { const b = rxlRaw(), mg = rxlMerge(RXL.lay, RXL.dir)[RXL.sel]; b.fs = Math.max(5, rxlNum((mg.fs || 12) + Number(el.dataset.d))); RXL.dirty = true; rxlDraw(); const i = $('#rxlPanel [data-rl="fs"]'); if (i) i.value = b.fs; },
  rxlTog(el) { const b = rxlRaw(), mg = rxlMerge(RXL.lay, RXL.dir)[RXL.sel], p = el.dataset.p; b[p] = mg[p] ? 0 : 1; RXL.dirty = true; rxlDraw(); rxlPanel(); },
  rxlAl(el) { rxlRaw().al = el.dataset.v; RXL.dirty = true; rxlDraw(); rxlPanel(); },
  rxlAdd(el) {
    const ids = el.dataset.k === 'r' ? ['rule3'] : ['t1', 't2', 't3', 't4', 't5', 't6'], mg = rxlMerge(RXL.lay, RXL.dir), id = ids.find(x => !mg[x].vis); if (!id) return;
    RXL.sel = id; const b = rxlRaw(); b.vis = 1; b.x = mg[id].x; b.y = rxlNum(RXL.lay.h / 2); if (id !== 'rule3') b.txt = t('rxl_cust'); RXL.dirty = true; rxlDraw(); rxlPanel();
  },
  rxlRemove() { rxlRaw().vis = 0; RXL.dirty = true; RXL.sel = 'clinic'; rxlDraw(); rxlPanel(); },
  async rxlReset() { if (!await appConfirm(t('rxl_reset_c'))) return; RXL.lay = rxlNew(RXL.lay.w, RXL.lay.h, RXL.dir); RXL.dirty = true; rxlDraw(); rxlPanel(); },
  async rxlClassic() { if (!await appConfirm(t('rxl_classic_c'))) return; await rxlSaveNow(null); const m = $('#rxlModal'); if (m) m.remove(); const r = $('#rxPaperTop'); if (r) rxRenderPaperTop(); toast(t('rxl_saved'), 'success'); },
  async rxlSave() { await rxlSaveNow(JSON.parse(JSON.stringify(RXL.lay))); const m = $('#rxlModal'); if (m) m.remove(); toast(t('rxl_saved'), 'success'); },
  async rxlClose() { if (RXL.dirty && !await appConfirm(t('rxl_close_c'))) return; const m = $('#rxlModal'); if (m) m.remove(); },
  rxlLogoPick() { const f = $('#rxlLogoFile'); if (f) f.click(); },
  rxlLogoDel() { RXL.head.logo = ''; RXL.dirty = true; rxlDraw(); rxlPanel(); },
  rxlTest() {
    const a = RX.pat, old = RX.tpl, h = RXL.head || {};
    if ('logo' in h) RX.tpl = Object.assign({}, old || {}, { logo: h.logo });
    try { rxPrintDoc(rxlSampleLines(), a ? { name: a.name, birthYear: a.birthYear } : { name: t('rxl_sample') }, Date.now(), Object.assign(rxHeadSnap(), h), JSON.parse(JSON.stringify(RXL.lay))); } finally { RX.tpl = old; }
  }
});
