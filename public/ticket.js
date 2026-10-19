'use strict';
(function () {
  var token = location.pathname.split('/').pop();
  var T = {
    ar: { tk: 'رقم تذكرتك', hello: 'مرحباً {n}', load: 'جارٍ التحميل…', conn: 'انقطع الاتصال — جارٍ إعادة المحاولة…', priv: '🔒 هذه الصفحة تخصّك وحدك ولا تعرض بيانات أي مريض آخر.',
      in: 'دورك الآن 🩺', in_s: 'تفضّل بالدخول إلى غرفة الكشف.', next: 'أنت التالي!', next_s: 'يرجى البقاء بالقرب من غرفة الكشف.', next_busy_s: 'الطبيب مع مريض الآن، وتكون بعده مباشرة.', ahead: 'عدد المنتظرين قبلك', est: 'الوقت التقريبي: {n} دقيقة',
      done: 'انتهت معاينتك ✅', done_s: 'شكراً لك، نتمنى لك السلامة.', expired: 'انتهت صلاحية هذه التذكرة', unknown: 'التذكرة غير صالحة', unknown_s: 'اطلب من الاستقبال تذكرة جديدة.', lang: 'English', title: 'متابعة الدور' },
    en: { tk: 'Your ticket number', hello: 'Hello {n}', load: 'Loading…', conn: 'Connection lost — retrying…', priv: "🔒 This page is only about you and shows no other patient's data.",
      in: "It's your turn 🩺", in_s: 'Please go in to the examination room.', next: "You're next!", next_s: 'Please stay close to the examination room.', next_busy_s: 'The doctor is with a patient and you are right after.', ahead: 'People ahead of you', est: 'Estimated time: {n} min',
      done: 'Your visit is complete ✅', done_s: 'Thank you, take care.', expired: 'This ticket has expired', unknown: 'Invalid ticket', unknown_s: 'Please ask reception for a new ticket.', lang: 'العربية', title: 'Follow your turn' }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('tk_lang') || (/^en/i.test(navigator.language || '') ? 'en' : 'ar'); } catch (e) {}
  var data = null, es = null, retry = 0, prevAhead = null, prevState = null;
  var $ = function (id) { return document.getElementById(id); };
  function tr(k, v) { var s = T[lang][k]; if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]); return s; }
  function render() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.title = tr('title');
    $('lang' + 'Btn').textContent = tr('lang'); $('priv').textContent = tr('priv'); $('lbl').textContent = tr('tk');
    var d = data, card = $('card'); card.className = 'card';
    if (!d) { $('big').textContent = tr('load'); return; }
    $('clinic').textContent = d.clinic || ''; $('no').textContent = d.ticketNo ? '#' + d.ticketNo : '–'; $('name').textContent = d.firstName ? tr('hello', { n: d.firstName }) : '';
    var big = $('big'), sub = $('sub'); big.textContent = ''; sub.textContent = '';
    if (d.state === 'in') { card.classList.add('in'); big.textContent = tr('in'); sub.textContent = tr('in_s'); }
    else if (d.state === 'waiting') {
      card.classList.add('wait');
      if (d.ahead === 0) { big.textContent = tr('next'); sub.textContent = d.busy ? tr('next_busy_s') : tr('next_s'); }
      else { var b = document.createElement('b'); b.textContent = d.ahead; big.appendChild(b); big.appendChild(document.createTextNode(tr('ahead'))); if (d.estMin) sub.textContent = tr('est', { n: d.estMin }); }
    } else if (d.state === 'done') { card.classList.add('done'); big.textContent = tr('done'); sub.textContent = tr('done_s'); }
    else if (d.state === 'expired') { card.classList.add('done'); big.textContent = tr('expired'); }
    else { card.classList.add('done'); big.textContent = tr('unknown'); sub.textContent = tr('unknown_s'); $('no').textContent = '–'; }
  }
  function alertChange(d) {
    var turn = d.state === 'in' && prevState !== 'in', closer = d.state === 'waiting' && prevAhead !== null && d.ahead < prevAhead && d.ahead <= 1;
    if (turn || closer) { try { navigator.vibrate && navigator.vibrate(turn ? [300, 150, 300, 150, 300] : [200]); } catch (e) {} if (turn) { try { var c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); o.stop(c.currentTime + 0.4); } catch (e) {} } }
    prevState = d.state; prevAhead = d.state === 'waiting' ? d.ahead : null;
  }
  function apply(d) { if (data && d.updated < data.updated) return; alertChange(d); data = d; render(); }
  function poll() { fetch('/api/ticket/' + encodeURIComponent(token), { cache: 'no-store' }).then(function (r) { if (r.status === 404) { apply({ state: 'unknown', updated: Date.now() }); return null; } return r.json(); }).then(function (d) { if (d) apply(d); }).catch(function () {}); }
  function connect() {
    if (es) es.close(); es = new EventSource('/api/ticket/' + encodeURIComponent(token) + '/stream');
    es.addEventListener('ticket', function (e) { retry = 0; $('conn').textContent = ''; apply(JSON.parse(e.data)); });
    es.onerror = function () { es.close(); es = null; $('conn').textContent = tr('conn'); retry = Math.min(retry + 1, 8); setTimeout(function () { poll(); connect(); }, Math.min(15000, 1000 * retry)); };
  }
  $('langBtn').addEventListener('click', function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('tk_lang', lang); } catch (e) {} render(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { poll(); if (!es) connect(); } });
  render(); poll(); connect();
})();
