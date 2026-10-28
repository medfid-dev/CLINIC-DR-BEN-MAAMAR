'use strict';
(function () {
  var token = location.pathname.split('/').pop();
  var T = {
    ar: { tk: 'رقم التذكرة', hello: 'أهلاً وسهلاً {n} 👋', load: 'جارٍ التحميل…', conn: 'انقطع الاتصال — جارٍ إعادة المحاولة…', priv: '🔒 هذه الصفحة تخصّك وحدك ولا تعرض بيانات أي مريض آخر.',
      in: 'دورك الآن 🩺', in_s: 'تفضّل بالدخول إلى غرفة الكشف.', next: 'أنت التالي! 🔔', next_s: 'يرجى البقاء بالقرب من غرفة الكشف.', next_busy_s: 'الطبيب مع مريض الآن، وتكون بعده مباشرة.', turn_l: 'دورك رقم', ahead_n: 'قبلك {n} في الانتظار', est: 'الوقت التقريبي: {n} دقيقة',
      done: 'انتهت معاينتك ✅', done_s: 'شكراً لك، نتمنى لك السلامة.', visit_t: 'ما تم في زيارتك اليوم', rx: 'وصفة طبية', tooth: 'سن {t}', sess: 'الحصة {a} من {b}', more: 'يرجى مراجعة العيادة لإكمال العلاج في الحصة القادمة.', note_t: '💬 ملاحظة من الطبيب',
      expired: 'انتهت صلاحية هذه التذكرة', unknown: 'التذكرة غير صالحة', unknown_s: 'اطلب من الاستقبال تذكرة جديدة.', lang: 'English', title: 'متابعة الدور' },
    en: { tk: 'Ticket number', hello: 'Welcome {n} 👋', load: 'Loading…', conn: 'Connection lost — retrying…', priv: "🔒 This page is only about you and shows no other patient's data.",
      in: "It's your turn 🩺", in_s: 'Please go in to the examination room.', next: "You're next! 🔔", next_s: 'Please stay close to the examination room.', next_busy_s: 'The doctor is with a patient and you are right after.', turn_l: 'Your turn number', ahead_n: '{n} ahead of you', est: 'Estimated time: {n} min',
      done: 'Your visit is complete ✅', done_s: 'Thank you, take care.', visit_t: 'What was done today', rx: 'Prescription', tooth: 'Tooth {t}', sess: 'Session {a} of {b}', more: 'Please come back to the clinic for your next session.', note_t: '💬 Note from the doctor',
      expired: 'This ticket has expired', unknown: 'Invalid ticket', unknown_s: 'Please ask reception for a new ticket.', lang: 'العربية', title: 'Follow your turn' }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('tk_lang') || (/^en/i.test(navigator.language || '') ? 'en' : 'ar'); } catch (e) {}
  var data = null, es = null, retry = 0, prevAhead = null, prevState = null;
  var $ = function (id) { return document.getElementById(id); };
  function tr(k, v) { var s = T[lang][k]; if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]); return s; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function renderVisit(v, box) {
    box.textContent = ''; if (!v) { box.hidden = true; return; }
    var chips = el('div', 'chips'), more = false;
    (v.treats || []).forEach(function (x) {
      var c = el('div', 'chip'); c.appendChild(el('span', 'cn', '🦷 ' + (x.th ? tr('tooth', { t: x.th }) + ' · ' : '') + x.n));
      if (x.m > 1) { c.appendChild(el('span', 'cs', tr('sess', { a: x.no, b: x.m }))); if (x.no < x.m) more = true; }
      chips.appendChild(c);
    });
    if (v.rx) chips.appendChild(el('div', 'chip', '💊 ' + tr('rx')));
    box.appendChild(el('div', 'vt', tr('visit_t'))); box.appendChild(chips); if (more) box.appendChild(el('div', 'more', tr('more'))); box.hidden = false;
  }
  function render() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.title = tr('title');
    $('lang' + 'Btn').textContent = tr('lang'); $('priv').textContent = tr('priv'); $('lbl').textContent = tr('tk');
    var d = data, card = $('card'); card.className = 'card'; var tl = $('tl'), big = $('big'), sub = $('sub'), notes = $('notes'), visit = $('visit');
    tl.textContent = ''; big.textContent = ''; sub.textContent = ''; notes.hidden = true; notes.textContent = ''; visit.hidden = true; visit.textContent = '';
    if (!d) { big.textContent = tr('load'); $('tkt').hidden = true; $('name').textContent = ''; return; }
    $('clinic').textContent = d.clinic || ''; $('name').textContent = d.firstName ? tr('hello', { n: d.firstName }) : '';
    $('tkt').hidden = !d.ticketNo || d.state === 'unknown'; $('no').textContent = d.ticketNo ? '#' + d.ticketNo : '';
    if (d.state === 'in') { card.classList.add('in'); big.textContent = tr('in'); sub.textContent = tr('in_s'); }
    else if (d.state === 'waiting') {
      card.classList.add('wait'); tl.textContent = d.ahead === 0 ? tr('next') : tr('turn_l'); big.appendChild(el('b', '', d.ahead + 1));
      sub.textContent = d.ahead === 0 ? (d.busy ? tr('next_busy_s') : tr('next_s')) : tr('ahead_n', { n: d.ahead }) + (d.estMin ? ' · ' + tr('est', { n: d.estMin }) : '');
    } else if (d.state === 'done') {
      card.classList.add('done'); big.textContent = tr('done'); sub.textContent = tr('done_s');
      if (d.visit && d.visit.note) { notes.appendChild(el('div', 'nt', tr('note_t'))); notes.appendChild(el('div', 'nb', d.visit.note)); notes.hidden = false; }
      renderVisit(d.visit, visit);
    }
    else if (d.state === 'expired') { card.classList.add('done'); big.textContent = tr('expired'); }
    else { card.classList.add('done'); big.textContent = tr('unknown'); sub.textContent = tr('unknown_s'); $('name').textContent = ''; }
  }
  function alertChange(d) {
    var turn = d.state === 'in' && prevState !== 'in', closer = d.state === 'waiting' && prevAhead !== null && d.ahead < prevAhead && d.ahead <= 1;
    var fin = d.state === 'done' && prevState && prevState !== 'done';
    if (fin) { try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} try { window.UISound && UISound.play('finish'); } catch (e) {} }
    if (turn || closer) { try { navigator.vibrate && navigator.vibrate(turn ? [300, 150, 300, 150, 300] : [200]); } catch (e) {} if (turn) { try { window.UISound && UISound.play('turn'); } catch (e) {} } }
    prevState = d.state; prevAhead = d.state === 'waiting' ? d.ahead : null;
  }
  function apply(d) { if (data && d.updated < data.updated) return; alertChange(d); data = d; render(); }
  function poll() { fetch('/api/ticket/' + encodeURIComponent(token), { cache: 'no-store' }).then(function (r) { if (r.status === 404) { apply({ state: 'unknown', updated: Date.now() }); return null; } return r.json(); }).then(function (d) { if (d) apply(d); }).catch(function () {}); }
  function connect() {
    if (es) es.close(); es = new EventSource('/api/ticket/' + encodeURIComponent(token) + '/stream');
    es.addEventListener('ticket', function (e) { retry = 0; $('conn').textContent = ''; apply(JSON.parse(e.data)); });
    es.onerror = function () { es.close(); es = null; $('conn').textContent = tr('conn'); retry = Math.min(retry + 1, 8); setTimeout(function () { poll(); connect(); }, Math.min(15000, 1000 * retry)); };
  }
  ['click', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { try { window.UISound && UISound.unlock(); } catch (e) {} }, { passive: true }); });   // المتصفح يشترط لمسة قبل تشغيل الصوت
  $('langBtn').addEventListener('click', function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('tk_lang', lang); } catch (e) {} render(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { poll(); if (!es) connect(); } });
  render(); poll(); connect();
})();
