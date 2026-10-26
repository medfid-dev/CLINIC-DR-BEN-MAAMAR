'use strict';
/* لوحة مالك التطبيق: كل نص يأتي من الخادم يُعرَض بـ textContent فقط (أسماء العيادات يكتبها المستخدمون) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var tok = ''; try { tok = sessionStorage.getItem('own_tok') || ''; } catch (e) {}
  var data = null, filter = 'all', timer = null, lastPending = -1;
  var ERR = { bad_credentials: 'كلمة المرور غير صحيحة', rate_limited: 'محاولات كثيرة، أعد المحاولة بعد قليل', unauthorized: 'انتهت الجلسة، سجّل الدخول من جديد', not_found: 'الحساب غير موجود (ربما حُذف)', bad_state: 'تغيّرت حالة الحساب، حدّث الصفحة', network: 'تعذّر الاتصال بالخادم' };
  var ST = { pending: 'بانتظار الموافقة', active: 'فعّال', suspended: 'موقوف' };

  async function api(method, path, body) {
    var r;
    try { r = await fetch(path, { method: method, headers: Object.assign({}, tok ? { Authorization: 'Bearer ' + tok } : {}, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { throw { code: 'network' }; }
    var j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw { code: (j && j.error) || 'server_error', status: r.status };
    return j;
  }
  function msg(e) { return ERR[e && e.code] || 'حدث خطأ غير متوقع'; }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function fmt(v) { return v ? new Date(v).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function row(label, val, cls) { var d = el('div'); d.appendChild(document.createTextNode(label + ': ')); var b = el('b', cls, val); d.appendChild(b); return d; }

  function show(loggedIn) { $('loginBox').hidden = loggedIn; $('panel').hidden = !loggedIn; }
  function logout(silent) {
    tok = ''; try { sessionStorage.removeItem('own_tok'); } catch (e) {} clearInterval(timer); lastPending = -1; data = null; document.title = 'لوحة مالك التطبيق'; show(false);
    if (!silent) toast('تم تسجيل الخروج');
  }

  function render() {
    if (!data) return;
    var cl = data.clinics, c = { all: cl.length, pending: 0, active: 0, suspended: 0 };
    cl.forEach(function (x) { c[x.status]++; });
    var st = $('stats'); st.textContent = '';
    [['all', 'إجمالي الحسابات', ''], ['pending', 'بانتظار الموافقة', 'p'], ['active', 'فعّالة', 'a'], ['suspended', 'موقوفة', 's']].forEach(function (z) {
      var d = el('div', 'stat ' + z[2]); d.appendChild(el('b', '', String(c[z[0]]))); d.appendChild(el('span', '', z[1])); st.appendChild(d);
    });
    $('approvalToggle').checked = !!data.approval;
    $('updated').textContent = 'آخر تحديث: ' + fmt(data.serverTime);
    document.title = (c.pending ? '(' + c.pending + ') ' : '') + 'لوحة مالك التطبيق';
    if (lastPending >= 0 && c.pending > lastPending) { try { window.UISound && UISound.play('add'); } catch (e) {} toast('طلب حساب جديد بانتظار موافقتك'); }
    lastPending = c.pending;
    var q = $('q').value.trim().toLowerCase();
    var items = cl.filter(function (x) { return (filter === 'all' || x.status === filter) && (!q || [x.name, x.doctor, x.username, x.code].join(' ').toLowerCase().indexOf(q) >= 0); });
    var list = $('list'); list.textContent = '';
    if (!items.length) { list.appendChild(el('div', 'empty', cl.length ? 'لا نتائج مطابقة' : 'لا توجد حسابات بعد')); return; }
    items.forEach(function (x) {
      var card = el('div', 'card ' + x.status), h = el('div', 'ch');
      h.appendChild(el('strong', '', x.name)); h.appendChild(el('span', 'badge ' + x.status, ST[x.status])); card.appendChild(h);
      var g = el('div', 'grid');
      g.appendChild(row('الطبيب', x.doctor)); g.appendChild(row('اسم المستخدم', x.username, 'code')); g.appendChild(row('رمز العيادة', x.code, 'code'));
      g.appendChild(row('تاريخ الطلب', fmt(x.createdAt)));
      if (x.status !== 'pending') { g.appendChild(row('تاريخ القبول', x.approvedAt ? fmt(x.approvedAt) : 'قبل تفعيل نظام الموافقة')); g.appendChild(row('آخر دخول', fmt(x.lastLoginAt)));
        g.appendChild(row('الممرضات', String(x.nurses))); g.appendChild(row('المرضى الحاليون', String(x.patients))); g.appendChild(row('الزيارات المؤرشفة', String(x.visits))); g.appendChild(row('أجهزة مسجّلة الدخول', String(x.devices))); }
      card.appendChild(g);
      var a = el('div', 'acts');
      function btn(label, cls, fn) { var b = el('button', 'btn ' + cls, label); b.type = 'button'; b.addEventListener('click', function () { b.disabled = true; fn().then(function () { return load(); }).catch(function (e) { toast(msg(e)); if (e.code === 'unauthorized') logout(true); }).then(function () { b.disabled = false; }); }); a.appendChild(b); }
      if (x.status === 'pending') {
        btn('قبول الحساب', 'ok', function () { return api('POST', '/api/owner/clinics/' + x.id + '/approve').then(function () { toast('تم قبول حساب «' + x.name + '»'); }); });
        btn('رفض وحذف', 'bad', function () { if (!confirm('رفض طلب «' + x.name + '» وحذفه نهائياً؟')) return Promise.resolve(); return api('DELETE', '/api/owner/clinics/' + x.id).then(function () { toast('تم حذف الطلب'); }); });
      } else {
        if (x.status === 'active') btn('إيقاف الحساب', 'warn', function () { if (!confirm('إيقاف «' + x.name + '»؟ سيُخرَج كل من فيها فوراً ولن يستطيعوا الدخول حتى تعيد التفعيل. البيانات لا تُحذف.')) return Promise.resolve(); return api('POST', '/api/owner/clinics/' + x.id + '/suspend').then(function () { toast('تم إيقاف الحساب'); }); });
        else btn('إعادة التفعيل', 'ok', function () { return api('POST', '/api/owner/clinics/' + x.id + '/activate').then(function () { toast('تمت إعادة التفعيل'); }); });
        btn('حذف نهائي', 'bad', function () {
          var t = prompt('حذف «' + x.name + '» نهائياً مع كل مرضاها وأرشيفها وصورها؟ لا يمكن التراجع.\nاكتب اسم العيادة للتأكيد:');
          if (t == null) return Promise.resolve(); if (t.trim() !== x.name) { toast('الاسم غير مطابق، لم يُحذف شيء'); return Promise.resolve(); }
          return api('DELETE', '/api/owner/clinics/' + x.id).then(function () { toast('تم حذف الحساب'); });
        });
      }
      card.appendChild(a); list.appendChild(card);
    });
  }

  async function load() {
    try { data = await api('GET', '/api/owner/clinics'); render(); }
    catch (e) { if (e.code === 'unauthorized') { logout(true); $('loginErr').textContent = msg(e); } else toast(msg(e)); }
  }
  function start() { show(true); load(); clearInterval(timer); timer = setInterval(function () { if (!document.hidden) load(); }, 15000); }

  $('loginForm').addEventListener('submit', async function (ev) {
    ev.preventDefault(); $('loginErr').textContent = '';
    try { var r = await api('POST', '/api/owner/login', { password: $('pw').value }); tok = r.token; try { sessionStorage.setItem('own_tok', tok); } catch (e) {} $('pw').value = ''; start(); }
    catch (e) { $('loginErr').textContent = msg(e); }
  });
  $('logoutBtn').addEventListener('click', function () { api('POST', '/api/owner/logout').catch(function () {}); logout(); });
  $('approvalToggle').addEventListener('change', async function (ev) {
    var on = ev.target.checked;
    try { await api('POST', '/api/owner/settings', { requireApproval: on }); toast(on ? 'الحسابات الجديدة تحتاج موافقتك' : 'تنبيه: صار التسجيل مفتوحاً دون موافقتك'); await load(); }
    catch (e) { ev.target.checked = !on; toast(msg(e)); }
  });
  $('tabs').addEventListener('click', function (ev) { var b = ev.target.closest('button[data-f]'); if (!b) return; filter = b.dataset.f; Array.prototype.forEach.call($('tabs').children, function (x) { x.classList.toggle('on', x === b); }); render(); });
  $('q').addEventListener('input', render);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && tok) load(); });
  if (tok) start(); else show(false);
})();
