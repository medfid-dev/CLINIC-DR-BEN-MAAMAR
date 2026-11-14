'use strict';
(function () {
  var code = location.pathname.split('/').pop(), API = '/api/book/' + encodeURIComponent(code), KEY = 'bk_ref_' + code;
  var T = {
    ar: {
      title: 'حجز موعد', load: 'جارٍ التحميل…', fail: 'تعذّر الاتصال. حاول مرة أخرى.', priv: '🔒 بياناتك تصل إلى العيادة فقط.',
      closed: 'الحجز عبر الإنترنت غير متاح حالياً', closed_s: 'يمكنك الحضور إلى العيادة أو الاتصال بها.',
      tab_today: '🕘 الانضمام لطابور اليوم', tab_appt: '📅 حجز موعد',
      name: 'الاسم الكامل', phone: 'رقم الهاتف', year: 'سنة الميلاد', gender: 'الجنس', male: 'ذكر', female: 'أنثى', reason: 'سبب الزيارة', note: 'ملاحظة (اختياري)',
      day: 'اختر اليوم', time: 'اختر الساعة', send_today: 'أرسل طلب الانضمام', send_appt: 'احجز الموعد', sending: 'جارٍ الإرسال…',
      today_hint: 'بعد إرسال الطلب تؤكده العيادة، ثم تصلك تذكرة لمتابعة دورك من هاتفك.', appt_hint: 'يصلك تأكيد الموعد على هذه الصفحة بعد موافقة العيادة.', no_slots: 'لا توجد مواعيد متاحة حالياً.',
      today_closed: 'التسجيل لطابور اليوم غير متاح الآن (خارج أوقات العمل).',
      pending: 'تم إرسال طلبك ✅', pending_s: 'بانتظار تأكيد العيادة. أبقِ هذه الصفحة أو افتحها لاحقاً من نفس الهاتف.',
      ok_today: 'تم قبولك في طابور اليوم 🎉', ok_today_s: 'اضغط الزر لمتابعة دورك لحظة بلحظة.', track: 'تابع دورك',
      ok_appt: 'تم تأكيد موعدك 🎉', no: 'نعتذر، لم يُقبل الطلب', no_s: 'يمكنك إرسال طلب جديد أو الاتصال بالعيادة.', gone: 'انتهت صلاحية هذا الطلب', again: 'طلب جديد',
      e_invalid: 'تحقّق من البيانات: الاسم، الهاتف (أرقام فقط)، وسنة الميلاد.', e_slot_taken: 'هذا الموعد حُجز للتو، اختر موعداً آخر.', e_too_many: 'لديك حجزان قائمان بالفعل.',
      e_already_requested: 'لديك طلب لهذا اليوم بالفعل.', e_already_registered: 'أنت مسجّل في طابور اليوم بالفعل.', e_registration_closed: 'التسجيل مغلق الآن.',
      e_rate_limited: 'محاولات كثيرة، حاول بعد قليل.', e_closed: 'الحجز غير متاح حالياً.', e_limit: 'الطابور ممتلئ، اتصل بالعيادة.', lang: 'English'
    },
    en: {
      title: 'Book a visit', load: 'Loading…', fail: 'Connection failed. Please try again.', priv: '🔒 Your details go to the clinic only.',
      closed: 'Online booking is not available right now', closed_s: 'You can visit or call the clinic.',
      tab_today: '🕘 Join today’s queue', tab_appt: '📅 Book an appointment',
      name: 'Full name', phone: 'Phone number', year: 'Birth year', gender: 'Gender', male: 'Male', female: 'Female', reason: 'Reason for visit', note: 'Note (optional)',
      day: 'Pick a day', time: 'Pick a time', send_today: 'Send join request', send_appt: 'Book appointment', sending: 'Sending…',
      today_hint: 'The clinic confirms your request, then you get a ticket to follow your turn from your phone.', appt_hint: 'Your confirmation shows here once the clinic approves.', no_slots: 'No slots available right now.',
      today_closed: 'Joining today’s queue is closed right now (outside working hours).',
      pending: 'Request sent ✅', pending_s: 'Waiting for the clinic to confirm. Keep this page or reopen it later on this phone.',
      ok_today: 'You’re in today’s queue 🎉', ok_today_s: 'Tap the button to follow your turn live.', track: 'Follow my turn',
      ok_appt: 'Your appointment is confirmed 🎉', no: 'Sorry, the request was not accepted', no_s: 'You can send a new request or call the clinic.', gone: 'This request has expired', again: 'New request',
      e_invalid: 'Check your details: name, phone (digits only) and birth year.', e_slot_taken: 'That slot was just taken, pick another.', e_too_many: 'You already have two open bookings.',
      e_already_requested: 'You already have a request for today.', e_already_registered: 'You are already in today’s queue.', e_registration_closed: 'Registration is closed now.',
      e_rate_limited: 'Too many attempts, try again shortly.', e_closed: 'Booking is unavailable.', e_limit: 'The queue is full, please call the clinic.', lang: 'العربية'
    }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('tk_lang') || (/^en/i.test(navigator.language || '') ? 'en' : 'ar'); } catch (e) {}
  var info = null, mode = 'appt', sel = { date: '', time: '' }, form = { name: '', phone: '', year: '', gender: 'ذكر', reason: '', note: '' }, poll = null, busy = false, err = '';
  var $ = function (id) { return document.getElementById(id); };
  function tr(k) { return T[lang][k] || k; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function api(method, url, body) {
    return fetch(url, { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); });
  }
  function fmtDate(d) { try { return new Date(d + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'numeric' }); } catch (e) { return d; } }
  function fmtTime(t) { var p = t.split(':'), h = +p[0], m = p[1], ap = lang === 'en' ? (h >= 12 ? 'PM' : 'AM') : (h >= 12 ? 'م' : 'ص'); h = h % 12 || 12; return h + ':' + m + ' ' + ap; }
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(v) { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch (e) {} }
  function setText() { document.documentElement.lang = lang; document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'; document.title = tr('title'); $('priv').textContent = tr('priv'); $('langBtn').textContent = tr('lang'); }

  function field(label, input) { var w = el('div'); w.appendChild(el('label', 'f', label)); w.appendChild(input); return w; }
  function inp(key, type, mode_, max) {
    var i = el('input'); i.type = type; i.value = form[key]; i.maxLength = max || 80; if (mode_) i.inputMode = mode_; i.autocomplete = key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'off';
    i.addEventListener('input', function () { form[key] = i.value; }); return i;
  }
  function renderForm() {
    var app = $('app'); app.textContent = ''; stopPoll();
    if (!info.open) { var c0 = el('div', 'card center'); c0.appendChild(el('div', 'ic', '🔒')); c0.appendChild(el('div', 'big', tr('closed'))); c0.appendChild(el('div', 'hint', tr('closed_s'))); app.appendChild(c0); return; }
    var card = el('div', 'card'), days = Object.keys(info.slots || {});
    var tabs = el('div', 'tabs'), b1 = el('button', mode === 'today' ? 'on' : '', tr('tab_today')), b2 = el('button', mode === 'appt' ? 'on' : '', tr('tab_appt'));
    b1.type = b2.type = 'button'; b1.onclick = function () { mode = 'today'; err = ''; renderForm(); }; b2.onclick = function () { mode = 'appt'; err = ''; renderForm(); };
    tabs.appendChild(b1); tabs.appendChild(b2); card.appendChild(tabs);
    card.appendChild(field(tr('name'), inp('name', 'text', '', 80)));
    card.appendChild(field(tr('phone'), (function () { var i = inp('phone', 'tel', 'tel', 25); i.dir = 'ltr'; i.style.textAlign = lang === 'en' ? 'left' : 'right'; return i; })()));
    if (mode === 'today') {
      if (!info.today) { card.appendChild(el('div', 'err', tr('today_closed'))); }
      var r2 = el('div', 'row2'); var y = inp('year', 'text', 'numeric', 4); y.placeholder = '1990'; r2.appendChild(field(tr('year'), y));
      var sg = el('div', 'seg'); [['ذكر', tr('male')], ['أنثى', tr('female')]].forEach(function (g) { var b = el('button', form.gender === g[0] ? 'on' : '', g[1]); b.type = 'button'; b.onclick = function () { form.gender = g[0]; Array.prototype.forEach.call(sg.children, function (x) { x.classList.remove('on'); }); b.classList.add('on'); }; sg.appendChild(b); });
      r2.appendChild(field(tr('gender'), sg)); card.appendChild(r2);
      var sl = el('select'); (info.reasons || []).forEach(function (r) { var o = el('option', '', r); o.value = r; sl.appendChild(o); }); if (form.reason) sl.value = form.reason; else form.reason = sl.value; sl.onchange = function () { form.reason = sl.value; };
      if ((info.reasons || []).length) card.appendChild(field(tr('reason'), sl));
      card.appendChild(el('div', 'hint', tr('today_hint')));
    } else {
      if (!days.length) card.appendChild(el('div', 'hint', tr('no_slots')));
      else {
        card.appendChild(el('label', 'f', tr('day'))); var dc = el('div', 'chips');
        days.forEach(function (d) { var c = el('button', 'chip' + (sel.date === d ? ' on' : ''), fmtDate(d)); c.type = 'button'; c.onclick = function () { sel.date = d; sel.time = ''; renderForm(); }; dc.appendChild(c); }); card.appendChild(dc);
        if (sel.date && info.slots[sel.date]) { card.appendChild(el('label', 'f', tr('time'))); var tc = el('div', 'chips'); info.slots[sel.date].forEach(function (t) { var c = el('button', 'chip' + (sel.time === t ? ' on' : ''), fmtTime(t)); c.type = 'button'; c.onclick = function () { sel.time = t; Array.prototype.forEach.call(tc.children, function (x) { x.classList.remove('on'); }); c.classList.add('on'); }; tc.appendChild(c); }); card.appendChild(tc); }
        card.appendChild(el('div', 'hint', tr('appt_hint')));
      }
    }
    var nt = el('textarea'); nt.maxLength = 200; nt.value = form.note; nt.oninput = function () { form.note = nt.value; }; card.appendChild(field(tr('note'), nt));
    var e = el('div', 'err', err); card.appendChild(e);
    var go = el('button', 'go', mode === 'today' ? tr('send_today') : tr('send_appt')); go.type = 'button';
    go.disabled = (mode === 'today' && !info.today) || (mode === 'appt' && !days.length);
    go.onclick = function () { submit(go, e); }; card.appendChild(go); app.appendChild(card);
  }
  function submit(go, e) {
    if (busy) return; err = ''; e.textContent = '';
    var name = form.name.trim(), phone = form.phone.trim(), body;
    if (name.length < 2 || !/^[0-9+\-\s()]{6,25}$/.test(phone)) { e.textContent = tr('e_invalid'); return; }
    if (mode === 'today') { var y = parseInt(form.year, 10); if (!(y >= 1900 && y <= new Date().getFullYear())) { e.textContent = tr('e_invalid'); return; } body = { kind: 'today', name: name, phone: phone, birthYear: y, gender: form.gender, reason: form.reason, note: form.note }; }
    else { if (!sel.date || !sel.time) { e.textContent = tr(sel.date ? 'time' : 'day'); return; } body = { name: name, phone: phone, date: sel.date, time: sel.time, note: form.note }; }
    busy = true; go.disabled = true; go.textContent = tr('sending');
    api('POST', API, body).then(function (r) {
      busy = false;
      if (r.s === 200 && r.j.ref) { save({ ref: r.j.ref, kind: mode }); showStatus({ status: 'pending', kind: mode, date: sel.date, time: sel.time }); startPoll(); return; }
      err = tr('e_' + (r.j && r.j.error)) !== 'e_' + (r.j && r.j.error) ? tr('e_' + r.j.error) : tr('fail');
      if (r.s === 409 && r.j.error === 'slot_taken') { load(); return; } renderForm();
    }).catch(function () { busy = false; err = tr('fail'); renderForm(); });
  }
  function showStatus(s) {
    var app = $('app'); app.textContent = ''; var c = el('div', 'card center'), st = s.status;
    if (st === 'ok') {
      c.appendChild(el('div', 'ic ok', '✅'));
      if (s.kind === 'today') { c.appendChild(el('div', 'big ok', tr('ok_today'))); c.appendChild(el('div', 'hint', tr('ok_today_s'))); if (s.ticket) { var a = el('a', 'lnk', tr('track')); a.href = '/t/' + encodeURIComponent(s.ticket); c.appendChild(a); } }
      else { c.appendChild(el('div', 'big ok', tr('ok_appt'))); if (s.date) c.appendChild(el('div', 'hint', fmtDate(s.date) + (s.time ? ' — ' + fmtTime(s.time) : ''))); }
    } else if (st === 'no') { c.appendChild(el('div', 'ic bad', '✕')); c.appendChild(el('div', 'big bad', tr('no'))); c.appendChild(el('div', 'hint', tr('no_s'))); }
    else if (st === 'gone') { c.appendChild(el('div', 'ic', '⌛')); c.appendChild(el('div', 'big', tr('gone'))); }
    else { c.appendChild(el('div', 'ic', '⏳')); c.appendChild(el('div', 'big', tr('pending'))); c.appendChild(el('div', 'hint', tr('pending_s'))); if (s.kind === 'appt' && s.date) c.appendChild(el('div', 'hint', fmtDate(s.date) + (s.time ? ' — ' + fmtTime(s.time) : ''))); }
    var again = el('button', 'ghost', tr('again')); again.type = 'button'; again.onclick = function () { save(null); stopPoll(); sel = { date: '', time: '' }; load(); }; c.appendChild(again);
    app.appendChild(c); last = s;
  }
  var last = null;
  function stopPoll() { if (poll) { clearInterval(poll); poll = null; } }
  function check() {
    var sv = saved(); if (!sv) return Promise.resolve(null);
    return api('GET', API + '?ref=' + encodeURIComponent(sv.ref)).then(function (r) { if (r.s !== 200) return null; var j = r.j; j.kind = j.kind || sv.kind; showStatus(j); if (j.status !== 'pending') stopPoll(); return j; }).catch(function () { return null; });
  }
  function startPoll() { stopPoll(); poll = setInterval(check, 15000); }
  function load() {
    $('app').textContent = ''; $('app').appendChild(el('div', 'card center', tr('load')));
    api('GET', API).then(function (r) {
      if (r.s === 404) { $('clinic').textContent = '—'; $('app').textContent = ''; var c = el('div', 'card center'); c.appendChild(el('div', 'big', tr('closed'))); $('app').appendChild(c); return; }
      if (r.s !== 200) throw 0;
      info = r.j; $('clinic').textContent = info.clinic; $('doctor').textContent = info.doctor || ''; if (!(info.today)) mode = 'appt'; else if (!sel.date && mode === 'appt' && !Object.keys(info.slots || {}).length) mode = 'today';
      var sv = saved();
      if (sv) { check().then(function (j) { if (j && j.status !== 'gone') { if (j.status === 'pending') startPoll(); } else { save(null); renderForm(); } }); }
      else renderForm();
    }).catch(function () { $('app').textContent = ''; $('app').appendChild(el('div', 'card center', tr('fail'))); });
  }
  $('langBtn').onclick = function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('tk_lang', lang); } catch (e) {} setText(); if (last && saved()) showStatus(last); else if (info) renderForm(); };
  setText(); load();
})();
