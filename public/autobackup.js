'use strict';
/* نسخ احتياطي تلقائي يومي (طبيب فقط).
   يُحفظ على جهاز الطبيب لا على الخادم، لأن ملفات الخادم قد تُمسح (مثل الاستضافة المجانية):
   - متصفح حاسوب (Chrome/Edge): في مجلد يختاره الطبيب مرة واحدة، ويُحتفظ بآخر 14 يوماً.
   - غير ذلك (جوال…): يُنزَّل ملف النسخة تلقائياً مرة كل يوم.
   ويحذّر إن وجد الخادم فارغاً بينما كانت آخر نسخة تحتوي سجلات (علامة مسح البيانات). */
Object.assign(L.ar, {
  ab_title: '🗓️ نسخ احتياطي تلقائي يومي', ab_on: 'مفعّل — اضغط للإيقاف', ab_off: 'متوقف — اضغط للتفعيل', ab_pick: '📁 اختيار مجلد الحفظ', ab_now: '💾 نسخة الآن',
  ab_time: '⏰ وقت النسخة اليومية', ab_time_open: 'عند فتح التطبيق', ab_time_clear: 'عند الفتح', ab_time_hint: 'تُؤخذ النسخة بعد هذا الوقت يومياً، بشرط أن يكون التطبيق مفتوحاً على جهازك؛ وإن كان مغلقاً وقتها تُؤخذ عند فتحه لاحقاً. اتركه فارغاً لتؤخذ عند أول فتح كل يوم.', ab_time_set: 'تم ضبط وقت النسخة اليومية',
  ab_folder: 'المجلد', ab_dl: 'ملف يُنزَّل تلقائياً (اختر مجلداً لحفظ أنظف)', ab_last: 'آخر نسخة', ab_never: 'لم تؤخذ بعد',
  ab_hint: 'تؤخذ نسخة واحدة كل يوم عند فتح التطبيق، وتُحفظ على جهازك (آخر 14 يوماً). إن كان الأرشيف محميّاً بكلمة مرور فتُؤخذ بعد إدخالها.',
  ab_done: 'تم حفظ النسخة الاحتياطية اليومية ✅', ab_tap: '💾 اضغط في أي مكان للسماح بحفظ النسخة اليومية', ab_fail: 'تعذّر أخذ النسخة الاحتياطية',
  ab_ask: 'ينصح باختيار مجلد على هذا الجهاز لتُحفظ فيه نسخة احتياطية يومية تلقائياً (آخر 14 يوماً). اختيار المجلد الآن؟', ab_ask_ok: 'اختيار مجلد', ab_ask_no: 'لاحقاً (تنزيل ملف)',
  ab_empty: '⚠️ تنبيه: سجلات الأرشيف على الخادم فارغة بينما كانت آخر نسخة تحوي {n} سجلاً. قد تكون البيانات مُسحت من الخادم (مثلاً بعد تحديث الاستضافة).\nلم أستبدل أي نسخة قديمة. استعدها من الإعدادات ← النسخ الاحتياطي ← «استعادة» باختيار آخر ملف نسخة.'
});
Object.assign(L.ar, { ab_last_note: '✅ آخر نسخة احتياطية: {d} — {n} سجلاً — {w}', ab_where_dir: 'في مجلد «{f}»', ab_where_dl: 'ملف نُزِّل على الجهاز', ab_next: '⏭️ النسخة القادمة: {d}', ab_next_open: 'عند أول فتح للتطبيق {d}', ab_none_note: '⚠️ لم تؤخذ أي نسخة احتياطية بعد' });
Object.assign(L.en, { ab_last_note: '✅ Last backup: {d} — {n} records — {w}', ab_where_dir: 'in folder "{f}"', ab_where_dl: 'downloaded file', ab_next: '⏭️ Next backup: {d}', ab_next_open: 'on first open {d}', ab_none_note: '⚠️ No backup has been taken yet' });
Object.assign(L.en, {
  ab_title: '🗓️ Automatic daily backup', ab_on: 'ON — tap to turn off', ab_off: 'OFF — tap to turn on', ab_pick: '📁 Choose backup folder', ab_now: '💾 Back up now',
  ab_time: '⏰ Daily backup time', ab_time_open: 'when the app is opened', ab_time_clear: 'On open', ab_time_hint: 'The backup runs daily after this time, provided the app is open on your device; if it was closed then, it runs when you next open it. Leave empty to back up on first open each day.', ab_time_set: 'Backup time saved',
  ab_folder: 'Folder', ab_dl: 'File downloaded automatically (choose a folder for a cleaner setup)', ab_last: 'Last backup', ab_never: 'none yet',
  ab_hint: 'One backup per day when the app is opened, saved on your device (last 14 days). If the archive is password-protected it runs after you unlock it.',
  ab_done: 'Daily backup saved ✅', ab_tap: '💾 Tap anywhere to allow saving the daily backup', ab_fail: 'Backup failed',
  ab_ask: 'We recommend choosing a folder on this device to receive an automatic daily backup (last 14 days). Choose one now?', ab_ask_ok: 'Choose folder', ab_ask_no: 'Later (download file)',
  ab_empty: '⚠️ Warning: the archive on the server is empty although the last backup had {n} records. Data may have been wiped from the server (e.g. after a hosting redeploy).\nNo older backup was overwritten. Restore from Settings → Backup → "Restore" using your latest backup file.'
});

(function () {
  const KEEP = 14, KEY = 'cc_ab', NAME = /^clinic_backup_(\d{4}-\d{2}-\d{2})\.json$/;
  const cfg = () => Object.assign({ on: true, last: '', lastTs: 0, where: '', n: -1, asked: false, folder: '', time: '' }, jget(KEY, {}));
  const setCfg = p => jset(KEY, Object.assign(cfg(), p));
  const day = () => new Date().toLocaleDateString('en-CA');
  const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
  const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  let nextTry = 0, ticking = false;
  const fmt = ts => new Date(ts).toLocaleString(locale(), { dateStyle: 'full', timeStyle: 'short' });
  /* موعد آخر استحقاق: بلا وقت محدد = بداية اليوم (أول فتح)؛ وبوقت محدد = آخر مرة مرّ فيها هذا الوقت. النسخة مستحقة إن لم تُؤخذ منذ ذلك الموعد */
  const lastTs = c => c.lastTs || (c.last ? Date.parse(c.last + 'T00:00:00') : 0);
  function occurrence(c) { const d = new Date(); if (TIME.test(c.time || '')) { const [h, m] = c.time.split(':'); d.setHours(+h, +m, 0, 0); if (d.getTime() > Date.now()) d.setDate(d.getDate() - 1); } else d.setHours(0, 0, 0, 0); return d.getTime(); }
  const isDue = c => lastTs(c) < occurrence(c);
  function nextDue(c) { const o = new Date(occurrence(c)); o.setDate(o.getDate() + 1); if (isDue(c)) return Date.now(); return o.getTime(); }
  const canDir = () => typeof window.showDirectoryPicker === 'function' && !!window.indexedDB;
  const idb = () => new Promise((ok, no) => { const r = indexedDB.open('cc_ab_db', 1); r.onupgradeneeded = () => r.result.createObjectStore('h'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const hGet = async () => { try { const d = await idb(); return await new Promise(ok => { const q = d.transaction('h').objectStore('h').get('dir'); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); } catch (e) { return null; } };
  const hSet = async v => { const d = await idb(); return new Promise((ok, no) => { const tx = d.transaction('h', 'readwrite'); if (v) tx.objectStore('h').put(v, 'dir'); else tx.objectStore('h').delete('dir'); tx.oncomplete = ok; tx.onerror = () => no(tx.error); }); };
  let busy = false, waiting = false;

  const isDoctor = () => !!(S.token && S.me && S.me.role === 'doctor');
  async function prune(h) {
    try { const names = []; for await (const [n] of h.entries()) if (NAME.test(n)) names.push(n); names.sort().reverse(); for (const n of names.slice(KEEP)) await h.removeEntry(n); } catch (e) {}
  }
  async function pickFolder() {
    if (!canDir()) return false;
    try { const h = await showDirectoryPicker({ id: 'clinic-backup', mode: 'readwrite' }); await hSet(h); setCfg({ folder: h.name, asked: true }); return true; } catch (e) { return false; }
  }
  /* manual=true: بحركة من المستخدم (يسمح بطلب إذن المجلد) */
  async function runBackup(manual) {
    if (busy || !isDoctor()) return false; busy = true;
    try {
      const h = canDir() ? await hGet() : null; let useDir = false;
      if (h) {   // الإذن أولاً (قبل أي انتظار) كي يبقى «تفاعل المستخدم» صالحاً
        let perm = await h.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted' && manual) perm = await h.requestPermission({ mode: 'readwrite' });
        if (perm === 'granted') useDir = true;
        else if (!manual) { askTap(); return false; }
      }
      let n; try { n = (await api('GET', '/api/archive?limit=1', undefined, { noUnlock: true })).total; } catch (e) { if (e && e.code === 'locked') { if (manual) toast(t('e_locked'), 'warning'); return false; } throw e; }
      const c = cfg();
      if (n === 0 && c.n > 0) { if (c.warned !== day()) { setCfg({ warned: day() }); await appDialog({ msg: t('ab_empty', { n: c.n }), okL: t('dlg_ok') }); } return false; }
      let blob; try { blob = await api('GET', '/api/backup', undefined, { blob: true, noUnlock: true }); } catch (e) { if (e && e.code === 'locked') return false; throw e; }
      if (!blob || !blob.size) throw new Error('empty');
      blob = withUi(blob);
      const name = `clinic_backup_${day()}.json`;
      if (useDir) { const fh = await h.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close(); prune(h); }
      else download(blob, name);
      setCfg({ last: day(), lastTs: Date.now(), n, where: useDir ? 'dir:' + (h && h.name || '') : 'dl' }); toast(t('ab_done'), 'success'); abUI(); return true;
    } catch (e) { if (e && e.code === 'unauthorized') return false; toast(t('ab_fail') + (e && e.message ? ': ' + e.message : ''), 'danger'); return false; }
    finally { busy = false; }
  }
  function askTap() {
    if (waiting) return; waiting = true; toast(t('ab_tap'), 'info');
    document.addEventListener('click', () => { waiting = false; runBackup(true); }, { once: true, capture: true });
  }
  async function tick(force) {
    if (!isDoctor()) return; const c = cfg(); if (!c.on || !isDue(c)) return;   // لم يحن موعد النسخة (أو أُخذت منذ آخر موعد)
    if (!force && Date.now() < nextTry) return;                 // إعادة المحاولة كل 10 دقائق عند الفشل
    if (ticking) return; ticking = true;
    try {
    if (!c.asked && canDir() && !(await hGet())) {   // أول مرة: اقتراح اختيار مجلد
      setCfg({ asked: true });
      if (await appDialog({ msg: t('ab_ask'), okL: t('ab_ask_ok'), cancelL: t('ab_ask_no'), noL: t('ab_ask_no') }) === true) await pickFolder();
    }
    const ok = await runBackup(false); if (!ok) nextTry = Date.now() + 10 * 60 * 1000;
    } finally { ticking = false; }
  }
  async function abUI() {
    const b = $('#abBox'); if (!b) return; const c = cfg(), h = canDir() ? await hGet() : null;
    b.querySelector('#abToggle').textContent = (c.on ? '✅ ' : '⏸️ ') + t(c.on ? 'ab_on' : 'ab_off');
    const pk = b.querySelector('#abPick'); pk.style.display = canDir() ? '' : 'none';
    const ti = b.querySelector('#abTime'); if (ti && document.activeElement !== ti) ti.value = TIME.test(c.time || '') ? c.time : '';
    const lt = lastTs(c), where = c.where && c.where.startsWith('dir:') ? t('ab_where_dir', { f: c.where.slice(4) }) : t('ab_where_dl'), nx = nextDue(c);
    const note = b.querySelector('#abNote'); note.textContent = lt ? t('ab_last_note', { d: fmt(lt), n: c.n >= 0 ? c.n : '؟', w: c.where ? where : '' }).replace(/ — $/, '') : t('ab_none_note'); note.style.color = lt ? 'var(--accent-mint,#3FA66B)' : 'var(--danger-soft,#D6455D)';
    b.querySelector('#abStat').textContent = `${c.on ? t('ab_next', { d: TIME.test(c.time || '') ? fmt(nx) : t('ab_next_open', { d: new Date(nx).toLocaleDateString(locale(), { dateStyle: 'full' }) }) }) + ' · ' : ''}${t('ab_time')}: ${TIME.test(c.time || '') ? c.time : t('ab_time_open')} · ${t('ab_folder')}: ${h ? h.name : t('ab_dl')}`;
  }
  window.abUI = abUI;
  function inject() {
    const m = $('#set_backupModal .settings-modal'); if (!m || $('#abBox')) return;
    const box = document.createElement('div'); box.id = 'abBox'; box.className = 'rxl-sec'; box.style.cssText = 'margin-top:12px;border:1px solid rgba(128,128,150,.35);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px';
    box.innerHTML = `<b>${esc(t('ab_title'))}</b><div id="abNote" style="font-weight:700;font-size:13px"></div><button type="button" class="btn-action" id="abToggle" data-act="abToggle"></button>
      <div style="display:flex;gap:8px"><button type="button" class="btn-action" id="abPick" data-act="abPick" style="flex:1">${esc(t('ab_pick'))}</button><button type="button" class="btn-action btn-green" data-act="abNow" style="flex:1">${esc(t('ab_now'))}</button></div>
      <div data-nonumpad style="display:flex;gap:8px;align-items:center"><label for="abTime" style="flex:1">${esc(t('ab_time'))}</label><input type="time" id="abTime" step="60" style="flex:1;min-width:0"><button type="button" class="btn-action" data-act="abTimeClear">${esc(t('ab_time_clear'))}</button></div>
      <div class="hint">${esc(t('ab_time_hint'))}</div>
      <div class="hint" id="abStat"></div><div class="hint">${esc(t('ab_hint'))}</div>`;
    let tmr; const saveTime = e => { clearTimeout(tmr); tmr = setTimeout(() => { const v = e.target.value; if (v && !TIME.test(v)) return; if ((cfg().time || '') === v) return; setCfg({ time: v }); nextTry = 0; toast(t('ab_time_set'), 'success'); abUI(); tick(true); }, 500); };
    box.querySelector('#abTime').addEventListener('change', saveTime); box.querySelector('#abTime').addEventListener('input', saveTime);
    const prot = m.querySelector('.rxl-sec'); if (prot) m.insertBefore(box, prot); else m.appendChild(box);
  }
  Object.assign(ACT, {
    abToggle() { setCfg({ on: !cfg().on }); abUI(); if (cfg().on) tick(); },
    async abPick() { if (await pickFolder()) { toast(t('t_saved'), 'success'); abUI(); runBackup(true); } },
    abTimeClear() { setCfg({ time: '' }); nextTry = 0; toast(t('ab_time_set'), 'success'); abUI(); tick(true); },
    abNow() { runBackup(true); }
  });
  inject(); abUI();
  setTimeout(tick, 15000); setInterval(() => { tick(); abUI(); }, 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(tick, 2000); });
})();
