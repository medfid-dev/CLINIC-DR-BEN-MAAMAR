'use strict';
/* عيادتي الهادئة — واجهة التطبيق (متصلة بالخادم، مزامنة فورية عبر SSE) */

/* ===================== النصوص ===================== */
const L = {
  ar: {
    offline_bar: 'غير متصل بالخادم — جارٍ إعادة الاتصال…', skip_title: 'تنبيه تخطي الدور!', skip_allow: 'نعم، السماح بالدخول ✅', skip_deny: 'رفض ❌',
    camera_title: 'كاميرا المعاينة المباشرة 📸', snap: 'التقاط الآن 📸', close: 'إغلاق', edit_patient: 'تعديل بيانات المريض ✏️', save: 'حفظ ✅', cancel: 'إلغاء',
    edit_nurse: 'تعديل بيانات الممرضة ✏️', nurse_fullname: 'اسم الممرضة الكامل', lbl_phone_s: 'رقم الهاتف', new_pass_opt: 'كلمة مرور جديدة (اتركها فارغة لعدم التغيير):',
    qr_help: 'اطلب من المريض مسح الرمز بكاميرا هاتفه ليتابع دوره دون أن يرى بيانات أي مريض آخر.',
    qr_local_warn: '⚠️ عنوان هذا الموقع محلي؛ لن يفتحه هاتف المريض إلا إن كان على نفس الشبكة. يُفضّل نشر الخادم بعنوان عام (انظر README).',
    print: '🖨️ طباعة', copy_link: 'نسخ الرابط', share: 'مشاركة', app_title: 'عيادتي الهادئة', app_sub: 'إدارة الانتظار والمعاينة — متزامنة بين الأجهزة',
    seg_doctor: 'طبيب', seg_nurse: 'ممرضة', seg_register: 'حساب جديد', username: 'اسم المستخدم:', pass: 'كلمة المرور:', login: 'تسجيل الدخول 🚀',
    clinic_code: 'رمز العيادة (يعطيه لكِ الطبيب):', nurse_name: 'اسمكِ كما سجّله الطبيب:', clinic_name: 'اسم العيادة:', doc_name: 'اسم الطبيب الكامل:',
    username_hint: '3–40 حرفاً لاتينياً/أرقاماً (مثل dr.ahmed)', pass_hint: '8 أحرف على الأقل. لا يمكن استرجاعها إن نُسيت — احتفظ بها.', pass2: 'تأكيد كلمة المرور:',
    reg_code: 'رمز التسجيل (من مدير الخدمة):', create_account: 'إنشاء حساب الطبيب والبدء 🚀', logout: 'خروج', tab_waiting: 'الانتظار', tab_consult: 'المعاينة 🩺',
    tab_add: 'تسجيل ➕', tab_nurses: 'الممرضات 👩‍⚕️', tab_archive: 'الأرشيف 📁', tab_settings: 'الإعدادات ⚙️', tab_patients: 'المرضى والانتظار 👥',
    reg_doc_title: 'تسجيل مريض جديد', btn_reg_add: 'تسجيل وإضافة للانتظار 🔔', clinic_code_title: 'رمز عيادتك (تدخل به الممرضات)', copy: 'نسخ',
    manage_nurses: 'إدارة ممرضات العيادة', nurse_pass: 'كلمة مرور الممرضة (6 أحرف فأكثر)', btn_add_nurse: 'إضافة ممرضة جديدة 👩‍⚕️',
    set_hours: '⏰ ساعات تسجيل الممرضة للمرضى', hours_enable: 'تحديد وقت للتسجيل', hours_hint: 'خارج هذا الوقت لا تستطيع الممرضة إضافة أي مريض. أنت (الطبيب) تسجّل في أي وقت.', hours_from: 'من', hours_to: 'إلى', hours_open: '🟢 التسجيل مفتوح للممرضة الآن', hours_closed: '🔴 التسجيل مغلق على الممرضة الآن', hours_off: 'غير مفعّل: الممرضة تسجّل في أي وقت', nurse_closed: '⏰ التسجيل مغلق الآن. يفتح من {a} إلى {b}.', e_closed: 'التسجيل مغلق خارج الأوقات التي حدّدها الطبيب',
    filter_day: '📆 اليوم:', day_today: 'اليوم', day_yest: 'أمس', day_all: 'الكل',
    archive_title: 'أرشيف السجلات الطبية 📁', search_name: '🔍 بحث باسم المريض...', search_year: '📅 سنة الميلاد...', search_tooth: '🦷 رقم/مكان السن...',
    all_genders: 'جميع الأجناس', male: 'ذكر', female: 'أنثى', all_treat: 'جميع العلاجات', tr_ext: 'قلع', tr_endo: 'علاج عصب', tr_cons: 'استشارة', tr_pros: 'تركيب', tr_white: 'تبييض', tr_other: 'أخرى',
    match_results: 'النتائج المطابقة:', load_more: 'عرض المزيد', waiting_rem: '👥 المرضى المتبقون في الانتظار:', today_patients: 'قائمة مرضى اليوم',
    settings_title: 'إعدادات التطبيق ⚙️', set_appearance: 'المظهر والألوان', dark_mode: 'الوضع الداكن', theme_color: 'لون العيادة', set_lang: 'اللغة', app_lang: 'لغة التطبيق',
    set_sound: 'التنبيهات', sound_alerts: 'التنبيهات الصوتية', auto_qr: 'إظهار QR بعد تسجيل المريض', sys_notif: 'إشعارات النظام', sys_notif_sub: 'تظهر عندما يكون التطبيق مفتوحاً في الخلفية', enable: 'تفعيل',
    install_app: 'تثبيت التطبيق', install_sub: 'يُفتح كتطبيق مستقل على الجوال أو الحاسوب', install: 'تثبيت', set_clinic: 'بيانات العيادة', chg_pass: 'تغيير كلمة المرور',
    old_pass: 'كلمة المرور الحالية', new_pass: 'كلمة المرور الجديدة (8 أحرف فأكثر)', change: 'تغيير', chg_pass_hint: 'ستُغلق جلسات باقي الأجهزة.', set_backup: 'النسخ الاحتياطي',
    export_data: 'تصدير نسخة 📥', import_data: 'استعادة 📤', backup_hint: 'النسخة تشمل المرضى والأرشيف والصور (دون كلمات المرور).', wipe_data: 'حذف جميع بيانات المرضى…', delete_account: 'حذف الحساب نهائياً…',
    // ديناميكية
    sg_visits: 'الزيارات: {n} · آخرها {d}', sg_waiting: '⏳ في الانتظار الآن', sg_already: 'هذا المريض مسجّل بالفعل في قائمة الانتظار.', lbl_name: 'اسم المريض:', lbl_birth: 'سنة الازدياد:', lbl_gender: 'الجنس:', lbl_reason: 'سبب الزيارة:', lbl_tooth: 'السن (اختياري):', lbl_phone: 'رقم الهاتف (اختياري):',
    age_fmt: 'العمر: {n} سنة', age_none: 'العمر: --', years_short: 'سنة', doc_title: 'لوحة الطبيب 🔔', doc_sub: 'إشراف عام وعيادة مباشرة', nurse_title: 'شاشة الممرضة', nurse_welcome: 'الممرضة: {n}',
    doc_sub2: '{c} — {n}', doc_sub3: '👨‍⚕️ {n} · لوحة الطبيب', in_room: 'في المعاينة 🩺', enter: 'دخول', edit: 'تعديل', del: 'حذف', call: 'استدعاء 🩺', qr: 'QR', doctor_word: 'طبيب', ticket_no: 'تذكرة',
    sex: 'الجنس', birth: 'سنة الميلاد', tooth: 'السن', empty_today: 'لا توجد سجلات اليوم', empty_wait: 'قاعة الانتظار فارغة', empty_room: 'لا يوجد مريض حالياً في غرفة الكشف.',
    consult_patient: '👤 المريض:', reason_l: '📌 السبب:', tooth_l: '🦷 رقم/مكان السن:', gender_l: '👤 الجنس:', birth_l: '📅 الميلاد:', phone_l: '📞 الهاتف:', wait_l: '⏳ وقت الانتظار:', not_set: 'غير مسجل',
    xrays: '📷 صور الكشف / الأشعة المرفقة:', no_images: 'لم يتم إرفاق صور بعد.', cam_live: '📷 الكاميرا المباشرة', upload_gal: '📁 رفع من الاستوديو', pick_treat: 'اختر نوع العلاج المنجز للمريض:',
    t_ext: '🦷 قلع', t_endo: '🩺 عصب', t_cons: '📋 استشارة', t_pros: '💎 تركيب', t_white: '✨ تبييض', t_other: '📝 أخرى', notes_ph: 'ملاحظات / تشخيص (اختياري)...', finish: '✅ إنهاء المعاينة وحفظ السجل بالأرشيف',
    lt1: 'أقل من دقيقة', min_n: '{n} دقيقة', no_nurses: 'لا توجد ممرضات مسجلات حالياً', phone_short: 'الهاتف: {p}', no_results: 'لا توجد نتائج مطابقة', date_l: 'التاريخ:', reason_s: 'السبب', dur_l: 'مدة المعاينة', wait_s: 'الانتظار', notes_l: 'ملاحظات:',
    skip_msg: 'الممرضة تحاول إدخال المريض ({a}) بالرغم من وجود المريض ({b}) قبله في القائمة. هل تسمح بتخطي الدور؟',
    // رسائل
    t_welcome_new: '🔔 مريض جديد في الانتظار', t_added: 'تمت إضافة: {n}', t_enter: '🩺 دخول مريض للمعاينة', t_entered: 'تم إدخال المريض: {n}', t_done: '✅ انتهت المعاينة!', t_done_msg: 'أنهى الطبيب معاينة {n}. يمكنك إدخال المريض التالي الآن.',
    t_skip_denied: 'رفض الطبيب إدخال {n} قبل دوره.', t_skip_sent: 'المريض ليس في أول القائمة. تم إرسال طلب تجاوز للطبيب!', t_busy: 'الطبيب مشغول حالياً بمعاينة مريض آخر.', t_registered: 'تم تسجيل المريض بنجاح!', t_saved: 'تم الحفظ بنجاح ✅',
    t_deleted: 'تم الحذف.', t_finished: 'تم إنهاء المعاينة وحفظ الملف في الأرشيف! ✅', t_nurse_added: 'تمت إضافة الممرضة بنجاح 👩‍⚕️', t_copied: 'تم النسخ ✅', t_img_ok: 'تمت إضافة الصور 📷', t_img_fail: 'تعذّر تحميل بعض الصور',
    c_del_patient: 'هل تأكدت من حذف هذا المريض؟', c_del_nurse: 'هل أنت متأكد من حذف حساب هذه الممرضة؟', c_del_arch: 'حذف هذا السجل نهائياً من الأرشيف؟', c_restore: 'سيتم استبدال بيانات المرضى والأرشيف الحالية بالنسخة الاحتياطية. المتابعة؟',
    c_wipe: 'سيتم حذف كل المرضى والأرشيف والصور نهائياً. اكتب كلمة مرور الطبيب للتأكيد:', c_delacc: 'سيتم حذف حسابك وكل بياناته نهائياً ولا يمكن التراجع. اكتب كلمة مرور الطبيب للتأكيد:', restored: 'تمت الاستعادة: {p} مريض في الانتظار، {a} سجل أرشيف',
    cam_not_ready: 'الكاميرا غير جاهزة بعد', pass_mismatch: 'كلمتا المرور غير متطابقتين', bad_year: 'تحقق من اسم المريض وسنة الازدياد (1900 – {y})', notif_on: 'تم تفعيل الإشعارات', notif_denied: 'الإشعارات محظورة من إعدادات المتصفح',
    qr_title: 'تذكرة {n} — {name}', slip_title: 'تابع دورك من هاتفك', slip_sub: 'امسح الرمز لمعرفة عدد المنتظرين قبلك. لا تظهر لك بيانات أي مريض آخر.',
    e_bad_credentials: 'بيانات الدخول غير صحيحة', e_rate_limited: 'محاولات كثيرة، أعد المحاولة بعد قليل', e_exists: 'الاسم مستخدم مسبقاً', e_invalid_input: 'تحقق من البيانات المدخلة', e_forbidden: 'غير مسموح لك بهذا الإجراء',
    e_unauthorized: 'انتهت الجلسة، سجّل الدخول من جديد', e_reg_closed: 'التسجيل مغلق على هذا الخادم', e_bad_code: 'رمز التسجيل غير صحيح', e_busy: 'الطبيب مشغول حالياً بمعاينة مريض آخر.', e_not_found: 'العنصر غير موجود (ربما حُذف)',
    e_not_waiting: 'حالة المريض تغيّرت', e_limit: 'تم بلوغ الحد الأقصى', e_too_large: 'الملف كبير جداً', e_network: 'تعذّر الاتصال بالخادم', e_server_error: 'خطأ في الخادم'
  },
  en: {
    offline_bar: 'Disconnected from server — reconnecting…', skip_title: 'Queue skip request!', skip_allow: 'Yes, allow entry ✅', skip_deny: 'Deny ❌',
    camera_title: 'Live camera 📸', snap: 'Capture 📸', close: 'Close', edit_patient: 'Edit patient ✏️', save: 'Save ✅', cancel: 'Cancel',
    edit_nurse: 'Edit nurse ✏️', nurse_fullname: 'Nurse full name', lbl_phone_s: 'Phone number', new_pass_opt: 'New password (leave empty to keep):',
    qr_help: "Ask the patient to scan this code with their phone camera to follow their turn — they can't see any other patient's data.",
    qr_local_warn: "⚠️ This site's address is local; the patient's phone can only open it on the same network. Publish the server on a public address (see README).",
    print: '🖨️ Print', copy_link: 'Copy link', share: 'Share', app_title: 'Calm Clinic Pro', app_sub: 'Queue & consultation — synced across devices',
    seg_doctor: 'Doctor', seg_nurse: 'Nurse', seg_register: 'New account', username: 'Username:', pass: 'Password:', login: 'Login 🚀',
    clinic_code: 'Clinic code (from your doctor):', nurse_name: 'Your name as registered by the doctor:', clinic_name: 'Clinic name:', doc_name: 'Doctor full name:',
    username_hint: '3–40 latin letters/digits (e.g. dr.ahmed)', pass_hint: 'At least 8 characters. It cannot be recovered if forgotten.', pass2: 'Confirm password:',
    reg_code: 'Registration code (from the service admin):', create_account: 'Create doctor account 🚀', logout: 'Logout', tab_waiting: 'Queue', tab_consult: 'Consultation 🩺',
    tab_add: 'Register ➕', tab_nurses: 'Nurses 👩‍⚕️', tab_archive: 'Archive 📁', tab_settings: 'Settings ⚙️', tab_patients: 'Patients & Queue 👥',
    reg_doc_title: 'Register new patient', btn_reg_add: 'Register & add to queue 🔔', clinic_code_title: 'Your clinic code (nurses log in with it)', copy: 'Copy',
    manage_nurses: 'Manage clinic nurses', nurse_pass: 'Nurse password (6+ chars)', btn_add_nurse: 'Add nurse 👩‍⚕️',
    set_hours: '⏰ Nurse registration hours', hours_enable: 'Limit registration time', hours_hint: 'Outside this time the nurse cannot add any patient. You (the doctor) can register anytime.', hours_from: 'From', hours_to: 'To', hours_open: '🟢 Registration is open for the nurse now', hours_closed: '🔴 Registration is closed for the nurse now', hours_off: 'Off: the nurse can register anytime', nurse_closed: '⏰ Registration is closed now. Open from {a} to {b}.', e_closed: 'Registration is closed outside the hours set by the doctor',
    filter_day: '📆 Day:', day_today: 'Today', day_yest: 'Yesterday', day_all: 'All',
    archive_title: 'Medical records archive 📁', search_name: '🔍 Search by name...', search_year: '📅 Birth year...', search_tooth: '🦷 Tooth / location...',
    all_genders: 'All genders', male: 'Male', female: 'Female', all_treat: 'All treatments', tr_ext: 'Extraction', tr_endo: 'Root canal', tr_cons: 'Consultation', tr_pros: 'Prosthetics', tr_white: 'Whitening', tr_other: 'Other',
    match_results: 'Matching records:', load_more: 'Load more', waiting_rem: '👥 Patients waiting:', today_patients: "Today's patients",
    settings_title: 'App settings ⚙️', set_appearance: 'Appearance', dark_mode: 'Dark mode', theme_color: 'Theme color', set_lang: 'Language', app_lang: 'Interface language',
    set_sound: 'Notifications', sound_alerts: 'Sound alerts', auto_qr: 'Show QR after registering a patient', sys_notif: 'System notifications', sys_notif_sub: 'Shown when the app is open in the background', enable: 'Enable',
    install_app: 'Install app', install_sub: 'Opens as a standalone app on phone or computer', install: 'Install', set_clinic: 'Clinic info', chg_pass: 'Change password',
    old_pass: 'Current password', new_pass: 'New password (8+ chars)', change: 'Change', chg_pass_hint: 'Other devices will be signed out.', set_backup: 'Backup',
    export_data: 'Export backup 📥', import_data: 'Restore 📤', backup_hint: 'Includes patients, archive and images (not passwords).', wipe_data: 'Delete all patient data…', delete_account: 'Delete account permanently…',
    sg_visits: 'Visits: {n} · last {d}', sg_waiting: '⏳ Waiting now', sg_already: 'This patient is already in the waiting list.', lbl_name: 'Patient name:', lbl_birth: 'Birth year:', lbl_gender: 'Gender:', lbl_reason: 'Reason for visit:', lbl_tooth: 'Tooth (optional):', lbl_phone: 'Phone (optional):',
    age_fmt: 'Age: {n}', age_none: 'Age: --', years_short: 'y', doc_title: 'Doctor panel 🔔', doc_sub: 'Supervision & direct clinic', nurse_title: 'Nurse screen', nurse_welcome: 'Nurse: {n}',
    doc_sub2: '{c} — {n}', doc_sub3: '👨‍⚕️ {n} · Doctor panel', in_room: 'In consultation 🩺', enter: 'Enter', edit: 'Edit', del: 'Delete', call: 'Call in 🩺', qr: 'QR', doctor_word: 'Doctor', ticket_no: 'Ticket',
    sex: 'Gender', birth: 'Birth year', tooth: 'Tooth', empty_today: 'No records today', empty_wait: 'Waiting room is empty', empty_room: 'No patient in the consultation room.',
    consult_patient: '👤 Patient:', reason_l: '📌 Reason:', tooth_l: '🦷 Tooth:', gender_l: '👤 Gender:', birth_l: '📅 Born:', phone_l: '📞 Phone:', wait_l: '⏳ Waited:', not_set: 'Not set',
    xrays: '📷 Attached photos / X-rays:', no_images: 'No images attached yet.', cam_live: '📷 Live camera', upload_gal: '📁 Upload from gallery', pick_treat: 'Select the treatment performed:',
    t_ext: '🦷 Extraction', t_endo: '🩺 Root canal', t_cons: '📋 Consult', t_pros: '💎 Prosthetics', t_white: '✨ Whitening', t_other: '📝 Other', notes_ph: 'Notes / diagnosis (optional)...', finish: '✅ Finish consultation & archive record',
    lt1: 'under a minute', min_n: '{n} min', no_nurses: 'No nurses registered yet', phone_short: 'Phone: {p}', no_results: 'No matching records', date_l: 'Date:', reason_s: 'Reason', dur_l: 'Consultation', wait_s: 'Waited', notes_l: 'Notes:',
    skip_msg: 'The nurse wants to send in ({a}) although ({b}) is before them in the queue. Allow skipping?',
    t_welcome_new: '🔔 New patient waiting', t_added: 'Added: {n}', t_enter: '🩺 Patient entering', t_entered: 'Patient sent in: {n}', t_done: '✅ Consultation finished!', t_done_msg: 'The doctor finished with {n}. You can send in the next patient.',
    t_skip_denied: 'The doctor declined to see {n} before their turn.', t_skip_sent: 'Patient is not first in the queue. Skip request sent to the doctor!', t_busy: 'The doctor is busy with another patient.', t_registered: 'Patient registered!', t_saved: 'Saved ✅',
    t_deleted: 'Deleted.', t_finished: 'Consultation finished and archived! ✅', t_nurse_added: 'Nurse added 👩‍⚕️', t_copied: 'Copied ✅', t_img_ok: 'Images added 📷', t_img_fail: 'Some images could not be uploaded',
    c_del_patient: 'Delete this patient?', c_del_nurse: "Delete this nurse's account?", c_del_arch: 'Permanently delete this archive record?', c_restore: 'Current patients and archive will be replaced by the backup. Continue?',
    c_wipe: 'All patients, archive and images will be permanently deleted. Enter the doctor password to confirm:', c_delacc: 'Your account and all its data will be permanently deleted. Enter the doctor password to confirm:', restored: 'Restored: {p} waiting, {a} archive records',
    cam_not_ready: 'Camera not ready yet', pass_mismatch: 'Passwords do not match', bad_year: 'Check patient name and birth year (1900 – {y})', notif_on: 'Notifications enabled', notif_denied: 'Notifications are blocked in browser settings',
    qr_title: 'Ticket {n} — {name}', slip_title: 'Follow your turn on your phone', slip_sub: "Scan the code to see how many people are ahead of you. You can't see any other patient's data.",
    e_bad_credentials: 'Incorrect login details', e_rate_limited: 'Too many attempts, try again shortly', e_exists: 'Name already in use', e_invalid_input: 'Please check the entered data', e_forbidden: 'You are not allowed to do this',
    e_unauthorized: 'Session expired, please sign in again', e_reg_closed: 'Registration is closed on this server', e_bad_code: 'Wrong registration code', e_busy: 'The doctor is busy with another patient.', e_not_found: 'Item not found (maybe deleted)',
    e_not_waiting: 'Patient status changed', e_limit: 'Limit reached', e_too_large: 'File too large', e_network: 'Cannot reach the server', e_server_error: 'Server error'
  }
};
const REASONS = [
  ['قلع أسنان', 'Dental extraction'], ['علاج عصب (قناة الجذر)', 'Root canal treatment'], ['استشارة وطوارئ', 'Consultation & emergency'],
  ['تركيب وجسور', 'Crowns & bridges'], ['تبييض وتنظيف', 'Whitening & scaling'], ['إجراء طبي آخر', 'Other procedure']
];
const TREATS = [['قلع', 't_ext'], ['علاج عصب', 't_endo'], ['استشارة', 't_cons'], ['جلسة تركيب', 't_pros'], ['تبييض أسنان', 't_white'], ['أخرى', 't_other']];

/* ===================== الحالة ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

const settings = Object.assign({ darkMode: false, theme: 'sky', lang: 'ar', sound: true, autoQr: true }, jget('cc_settings', {}));
const S = { token: localStorage.getItem('cc_token') || '', me: null, patients: [], skipRequests: [], stamp: 0, es: null, retry: 0, treatment: 'قلع', archive: { items: [], total: 0 }, archOffset: 0, nurses: [], activePid: null, qrPid: null, installEvt: null, shownSkip: '', config: null };
const YEAR = new Date().getFullYear();

const t = (k, v) => { let s = (L[settings.lang] && L[settings.lang][k]) || L.ar[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const errMsg = e => t('e_' + ((e && e.code) || 'server_error')) || t('e_server_error');
const genderL = g => (g === 'أنثى' ? t('female') : t('male'));
const reasonL = r => { const f = REASONS.find(x => x[0] === r); return f ? (settings.lang === 'en' ? f[1] : f[0]) : r; };
const locale = () => (settings.lang === 'en' ? 'en-GB' : 'ar-u-nu-latn');

/* ===================== أدوات الواجهة ===================== */
function toast(msg, type = 'info') {
  const c = $('#toast-container'), el = document.createElement('div');
  el.className = 'toast toast-' + type; el.textContent = msg; c.appendChild(el); setTimeout(() => el.remove(), 3200);
}
let audioCtx = null;
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {} }
document.addEventListener('click', unlockAudio, { passive: true });
function beep(freq = 650, dur = 0.35) {
  if (!settings.sound) return;
  try {
    unlockAudio(); if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.value = 0.3; o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}
let alertTimer;
function visualAlert(title, text, ok) {
  const c = $('#visual-alert-container');
  c.innerHTML = `<div class="card-alert-banner ${ok ? 'success-banner' : ''}"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:24px">${ok ? '✅' : '🔔'}</span><div><div style="font-size:12px;opacity:.85">${esc(title)}</div><div style="font-size:15px;font-weight:600;margin-top:2px">${esc(text)}</div></div></div><button type="button" class="alert-close" data-act="closeAlert" aria-label="close">✕</button></div>`;
  clearTimeout(alertTimer); alertTimer = setTimeout(() => { c.innerHTML = ''; }, 7000);
}
function sysNotify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return;
  const o = { body, icon: 'icons/icon-192.png', tag: 'calm-clinic', dir: 'auto' };
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistration)
    navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(title, o) : new Notification(title, o)).catch(() => {});
  else try { new Notification(title, o); } catch (e) {}
}
function openModal(id) { $('#' + id).classList.add('active'); }
function closeModals() { $$('.modal-overlay.active').forEach(m => { if (m.id !== 'skipQueueModal') m.classList.remove('active'); }); closeCamera(); }
function showScreen(id) { $$('.screen').forEach(s => s.classList.remove('active')); $('#' + id).classList.add('active'); }
function setOnline(on) { document.body.classList.toggle('offline', !on); }
const fmtMin = m => (m < 1 ? t('lt1') : t('min_n', { n: m }));
const waitText = ts => fmtMin(Math.floor((Date.now() - ts) / 60000));

/* ===================== API ===================== */
async function api(method, path, body, opt = {}) {
  const h = {}; if (S.token && !opt.anon) h.Authorization = 'Bearer ' + S.token;
  let b; if (opt.raw) { h['Content-Type'] = 'image/jpeg'; b = opt.raw; } else if (opt.text) { h['Content-Type'] = 'application/json'; b = opt.text; } else if (body !== undefined) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body); }
  let r; try { r = await fetch(path, { method, headers: h, body: b }); } catch (e) { throw Object.assign(new Error('network'), { code: 'network' }); }
  if (opt.blob && r.ok) return r.blob();
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) {
    if (r.status === 401 && S.token && !opt.anon) forceLogout();
    throw Object.assign(new Error(j.error || 'error'), { code: j.error || 'server_error', status: r.status });
  }
  return j;
}
async function run(fn) { try { return await fn(); } catch (e) { if (e.code !== 'unauthorized') toast(errMsg(e), 'danger'); return null; } }

/* ===================== الدخول ===================== */
function authMode(mode) {
  $$('.auth-seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  $('#formDoctor').style.display = mode === 'doctor' ? 'block' : 'none';
  $('#formNurse').style.display = mode === 'nurse' ? 'block' : 'none';
  $('#formRegister').style.display = mode === 'register' ? 'block' : 'none';
  $('#authErr').textContent = '';
}
function authError(e) { $('#authErr').textContent = errMsg(e); }
async function afterLogin(r) {
  S.token = r.token; localStorage.setItem('cc_token', r.token);
  $$('input[type=password]').forEach(i => { i.value = ''; });
  await boot();
}
async function boot() {
  if (!S.token) { showScreen('authScreen'); return; }
  try {
    const st = await api('GET', '/api/state'); S.me = st.me; applyState(st, true);
  } catch (e) {
    if (e.code === 'network') { setOnline(false); setTimeout(boot, 3000); } return;
  }
  document.body.dataset.role = S.me.role; setOnline(true);
  renderSettingsBoxes(); applySettings();
  if (S.me.role === 'doctor') {
    $('#doctorHeaderTitle').textContent = S.me.clinicName; $('#doctorSubtitle').textContent = t('doc_sub3', { n: S.me.name });
    $('#clinicCodeShow').textContent = S.me.code || '------';
    showScreen('doctorScreen'); docTab('waiting');
  } else {
    $('#nurseHeaderTitle').textContent = S.me.clinicName; $('#nurseUserWelcome').textContent = t('nurse_welcome', { n: S.me.name });
    showScreen('nurseScreen'); nurseTab('patientsNurse');
  }
  connect(); renderAll(); requestNotifOnce();
}
async function logout() {
  try { await api('POST', '/api/logout'); } catch (e) {}
  forceLogout(true);
}
function forceLogout(silent) {
  if (S.es) { S.es.close(); S.es = null; }
  S.token = ''; S.me = null; S.patients = []; localStorage.removeItem('cc_token'); delete document.body.dataset.role; closeModals(); closeCamera();
  $('#skipQueueModal').classList.remove('active'); S.shownSkip = '';
  showScreen('authScreen'); setOnline(true);
  if (!silent) toast(t('e_unauthorized'), 'warning');
}

/* ===================== المزامنة الفورية ===================== */
function applyState(st, force) {
  if (!force && st.serverTime < S.stamp) return;
  S.stamp = st.serverTime; S.patients = st.patients; S.skipRequests = st.skipRequests || [];
  if (st.hours) { S.hours = st.hours; clearTimeout(S.hoursTimer); if (st.hours.enabled && st.hours.nextIn) S.hoursTimer = setTimeout(() => refresh(), st.hours.nextIn + 800); }
}
async function connect() {
  if (S.es) { S.es.close(); S.es = null; }
  if (!S.token) return;
  let tk; try { tk = (await api('POST', '/api/stream-ticket')).ticket; } catch (e) { if (e.code === 'unauthorized') return; setOnline(false); return retryConnect(); }
  const es = new EventSource('/api/stream?ticket=' + encodeURIComponent(tk)); S.es = es;
  es.onopen = () => { S.retry = 0; setOnline(true); };
  es.addEventListener('state', ev => { applyState(JSON.parse(ev.data)); renderAll(); });
  es.addEventListener('notify', ev => onNotify(JSON.parse(ev.data)));
  es.onerror = () => { es.close(); if (S.es === es) S.es = null; setOnline(false); retryConnect(); };
}
function retryConnect() { if (!S.token) return; S.retry = Math.min(S.retry + 1, 8); setTimeout(() => { if (S.token && !S.es) connect(); }, Math.min(15000, 1000 * S.retry)); }
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.token && !S.es) { S.retry = 0; connect(); } });
window.addEventListener('online', () => { if (S.token && !S.es) connect(); });
async function refresh() { try { applyState(await api('GET', '/api/state')); renderAll(); } catch (e) {} }

let lastOwnAdd = 0;
function onNotify(n) {
  if (!S.me) return;
  if (S.me.role === 'doctor') {
    if (n.type === 'add' && Date.now() - lastOwnAdd > 3000) { beep(800, 0.4); visualAlert(t('t_welcome_new'), t('t_added', { n: n.name })); sysNotify(t('app_title'), t('t_added', { n: n.name })); }
    else if (n.type === 'enter') { docTab('consultation'); beep(700, 0.3); visualAlert(t('t_enter'), t('t_entered', { n: n.name })); }
  } else {
    if (n.type === 'finish') { beep(900, 0.5); visualAlert(t('t_done'), t('t_done_msg', { n: n.name }), true); sysNotify(t('t_done'), t('t_done_msg', { n: n.name })); }
    else if (n.type === 'skip_denied') { beep(500, 0.3); toast(t('t_skip_denied', { n: n.name }), 'warning'); }
  }
}

/* ===================== العرض ===================== */
function renderHours() {
  const h = S.hours; if (!h) return;
  const closed = !h.open, box = $('#nurseClosed');
  if (box) { box.style.display = closed && S.me.role === 'nurse' ? '' : 'none'; box.textContent = t('nurse_closed', { a: h.start, b: h.end }); }
  const nf = $('form[data-form=addPatient][data-pre=pn]'); if (nf) nf.style.display = closed && S.me.role === 'nurse' ? 'none' : '';
  $$('form[data-form=hours]').forEach(f => {
    const st = $('.hoursStatus', f); st.textContent = !h.enabled ? t('hours_off') : h.open ? t('hours_open') : t('hours_closed'); st.dataset.open = h.enabled ? (h.open ? '1' : '0') : '';
    if (f.contains(document.activeElement)) return;
    $('.hoursOn', f).checked = h.enabled; $('.hoursStart', f).value = h.start; $('.hoursEnd', f).value = h.end;
  });
}
function renderAll() {
  if (!S.me) return;
  renderHours();
  const waiting = S.patients.filter(p => p.status === 'waiting');
  $('#waitingCount').textContent = waiting.length; $('#nurseWaitingBadge').textContent = waiting.length;
  if (S.me.role === 'nurse') renderNurseList(); else { renderDocWaiting(); renderConsultation(); renderSkip(); }
}
const busy = () => S.patients.some(p => p.status === 'in');
function patientMeta(p) { return `${t('sex')}: ${esc(genderL(p.gender))} | ${t('birth')}: ${p.birthYear} (${p.age} ${t('years_short')}) | ${t('tooth')}: ${esc(p.tooth)}`; }
function renderNurseList() {
  const list = $('#nursePatientList'), isBusy = busy(); let rank = 1;
  list.innerHTML = S.patients.length ? S.patients.map(p => {
    const inRoom = p.status === 'in';
    const act = inRoom ? `<span style="font-size:12px;color:var(--warning-warm);font-weight:600">${t('in_room')}</span>`
      : `<button type="button" class="btn-action btn-green ${isBusy ? 'btn-disabled' : ''}" ${isBusy ? 'disabled' : ''} data-act="enter" data-id="${p.id}">🟢 ${t('enter')}</button>`;
    const extra = inRoom ? '' : `<button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${p.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delPatient" data-id="${p.id}">${t('del')}</button>`;
    return `<li class="patient-card ${inRoom ? 'in-doctor' : ''}"><div><span class="queue-badge">${inRoom ? t('doctor_word') : '#' + rank++}</span><strong style="font-size:15px">${esc(p.name)}</strong> <span class="badge">${esc(reasonL(p.reason))}</span>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${patientMeta(p)}</div><div class="note-line">${t('ticket_no')} ${p.ticketNo}</div></div>
      <div class="actions">${act}<button type="button" class="btn-action btn-qr" data-act="showQr" data-id="${p.id}">${t('qr')}</button>${extra}</div></li>`;
  }).join('') : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('empty_today')}</li>`;
}
function renderDocWaiting() {
  const w = S.patients.filter(p => p.status === 'waiting'), list = $('#docWaitingList'); let r = 1;
  list.innerHTML = w.length ? w.map(p => `<li class="patient-card"><div><span class="queue-badge">#${r++}</span><strong style="font-size:15px">${esc(p.name)}</strong> <span class="badge">${esc(reasonL(p.reason))}</span>
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${patientMeta(p)}</div><div class="note-line">${t('ticket_no')} ${p.ticketNo} · ⏳ <span data-wait="${p.createdAt}">${waitText(p.createdAt)}</span></div></div>
    <div class="actions"><button type="button" class="btn-action btn-green" data-act="enter" data-id="${p.id}">${t('call')}</button><button type="button" class="btn-action btn-qr" data-act="showQr" data-id="${p.id}">${t('qr')}</button>
    <button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${p.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delPatient" data-id="${p.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('empty_wait')}</li>`;
}
function renderConsultation() {
  const area = $('#consultationArea'), a = S.patients.find(p => p.status === 'in');
  $('#consultationNavBtn').classList.toggle('has-patient', !!a);
  const sig = a ? a.id + ':' + a.images.join(',') + ':' + settings.lang : '';
  if (area.dataset.sig === sig) return;
  const samePid = area.dataset.pid === (a ? a.id : ''), notes = samePid && $('#consultNotes') ? $('#consultNotes').value : '';
  if (!samePid) S.treatment = 'قلع';
  if (!a) { area.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);background:var(--surface-card);border-radius:16px">${t('empty_room')}</div>`; }
  else {
    const imgs = a.images.length ? a.images.map(id => `<div class="thumb-box"><img data-rec="${a.id}" data-img="${id}" data-act="lightbox" alt=""><button type="button" class="del-img" data-act="delImage" data-id="${a.id}" data-img="${id}">✕</button></div>`).join('') : `<span style="font-size:12px;color:var(--text-muted)">${t('no_images')}</span>`;
    area.innerHTML = `<div class="consultation-card"><div class="patient-highlight-box">
      <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:20px;font-weight:600">${t('consult_patient')} ${esc(a.name)}</div><span style="background:var(--orange);padding:4px 14px;border-radius:20px;font-weight:600;font-size:13px">${t('ticket_no')} ${a.ticketNo}</span></div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px;font-size:13px">
        <div>${t('reason_l')} <strong>${esc(reasonL(a.reason))}</strong></div><div>${t('tooth_l')} <strong>${esc(a.tooth)}</strong></div>
        <div>${t('gender_l')} <strong>${esc(genderL(a.gender))}</strong></div><div>${t('birth_l')} <strong>${a.birthYear} (${a.age} ${t('years_short')})</strong></div>
        <div>${t('phone_l')} <strong>${esc(a.phone || t('not_set'))}</strong></div><div>${t('wait_l')} <strong data-wait="${a.createdAt}">${waitText(a.createdAt)}</strong></div></div></div>
      <div style="background:var(--surface-sunk);border:1px dashed var(--border-calm);padding:16px;border-radius:12px;margin-bottom:20px"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:8px">${t('xrays')}</label>
        <div class="patient-images-container">${imgs}</div>
        <div style="display:flex;gap:10px;margin-top:12px"><button type="button" class="btn-action btn-green" style="flex:1" data-act="openCamera" data-id="${a.id}">${t('cam_live')}</button><button type="button" class="btn-action btn-yellow" style="flex:1" data-act="pickFile" data-id="${a.id}">${t('upload_gal')}</button></div></div>
      <label style="font-size:13px;font-weight:600;color:var(--text-secondary)">${t('pick_treat')}</label>
      <div class="treatment-grid">${TREATS.map(([v, k]) => `<div class="treatment-item ${v === S.treatment ? 'selected' : ''}" data-act="treat" data-v="${esc(v)}">${t(k)}</div>`).join('')}</div>
      <textarea id="consultNotes" maxlength="2000" placeholder="${esc(t('notes_ph'))}" style="height:80px;margin-bottom:15px"></textarea>
      <button type="button" class="btn-primary btn-green" data-act="finish" data-id="${a.id}" style="padding:16px;font-size:16px">${t('finish')}</button></div>`;
    if (notes) $('#consultNotes').value = notes;
    hydrate(area);
  }
  area.dataset.sig = sig; area.dataset.pid = a ? a.id : '';
}
function renderSkip() {
  const m = $('#skipQueueModal'), r = S.skipRequests[0];
  if (!r) { m.classList.remove('active'); S.shownSkip = ''; return; }
  $('#skipQueueMessage').textContent = t('skip_msg', { a: r.name, b: r.firstName });
  m.dataset.pid = r.id;
  if (S.shownSkip !== r.id) { S.shownSkip = r.id; beep(950, 0.5); sysNotify(t('skip_title'), t('skip_msg', { a: r.name, b: r.firstName })); }
  m.classList.add('active');
}
setInterval(() => $$('[data-wait]').forEach(el => { el.textContent = waitText(+el.dataset.wait); }), 30000);

/* صور محمّلة بالتوثيق وتُخزَّن مؤقتاً كـ blob */
const blobCache = new Map();
function imgBlobUrl(rec, img) {
  const k = rec + '/' + img;
  if (!blobCache.has(k)) blobCache.set(k, api('GET', `/api/records/${rec}/images/${img}`, undefined, { blob: true }).then(b => URL.createObjectURL(b)).catch(e => { blobCache.delete(k); throw e; }));
  return blobCache.get(k);
}
function hydrate(root) { $$('img[data-rec]', root).forEach(el => { if (!el.src) imgBlobUrl(el.dataset.rec, el.dataset.img).then(u => { el.src = u; }).catch(() => {}); }); }

/* ===================== نماذج المرضى ===================== */
const sg = (mode, pre) => (pre === 'pe' ? '' : ` data-suggest="${mode}" data-pre="${pre}" autocomplete="off"`);
function fieldsHTML(pre) {
  const opts = REASONS.map(r => `<option value="${esc(r[0])}">${esc(settings.lang === 'en' ? r[1] : r[0])}</option>`).join('');
  return `<div class="form-group suggest-wrap"><label>${t('lbl_name')}</label><input type="text" id="${pre}Name" maxlength="80" required${sg('name', pre)}><ul class="suggest-box" role="listbox" hidden></ul></div>
    <div style="display:flex;gap:12px"><div class="form-group" style="flex:1"><label>${t('lbl_birth')}</label><input type="number" id="${pre}Year" min="1900" max="${YEAR}" placeholder="1990" data-input="age" data-pre="${pre}" required><div id="${pre}Age" style="font-size:12px;color:var(--warning-warm);font-weight:600;margin-top:3px">${t('age_none')}</div></div>
    <div class="form-group" style="flex:1"><label>${t('lbl_gender')}</label><select id="${pre}Gender"><option value="ذكر">${t('male')}</option><option value="أنثى">${t('female')}</option></select></div></div>
    <div style="display:flex;gap:12px"><div class="form-group" style="flex:1"><label>${t('lbl_reason')}</label><select id="${pre}Reason">${opts}</select></div>
    <div class="form-group" style="flex:1"><label>${t('lbl_tooth')}</label><input type="text" id="${pre}Tooth" maxlength="20" placeholder="16"></div></div>
    <div class="form-group suggest-wrap"><label>${t('lbl_phone')}</label><input type="tel" id="${pre}Phone" maxlength="25" placeholder="05xxxxxxxx"${sg('phone', pre)}><ul class="suggest-box" role="listbox" hidden></ul></div>`;
}
/* ===================== اقتراح المرضى من الأرشيف ===================== */
const SG = { seq: 0, timer: 0, items: [], active: -1, input: null };
function sgClose() { $$('.suggest-box').forEach(b => { b.hidden = true; b.innerHTML = ''; }); SG.items = []; SG.active = -1; SG.input = null; }
function sgMark() { $$('.suggest-box:not([hidden]) .suggest-item').forEach((li, i) => { li.classList.toggle('sg-on', i === SG.active); if (i === SG.active) li.scrollIntoView({ block: 'nearest' }); }); }
function sgRender(inp, items) {
  const box = inp.parentElement.querySelector('.suggest-box');
  $$('.suggest-box').forEach(b => { if (b !== box) { b.hidden = true; b.innerHTML = ''; } });
  SG.items = items; SG.active = -1; SG.input = inp;
  if (!items.length) { box.hidden = true; box.innerHTML = ''; return; }
  box.innerHTML = items.map((x, i) => `<li role="option" class="suggest-item${x.active ? ' sg-busy' : ''}" data-act="sgPick" data-i="${i}"><div class="sg-main"><strong>${esc(x.name)}</strong><span>${esc(genderL(x.gender))} · ${x.birthYear} · ${t('age_fmt', { n: x.age })}</span></div><div class="sg-sub">${x.phone ? `<span dir="ltr">${esc(x.phone)}</span>` : ''}<span>${x.active ? t('sg_waiting') : t('sg_visits', { n: x.visits, d: new Date(x.lastVisit).toLocaleDateString(locale()) })}</span></div></li>`).join('');
  box.hidden = false;
}
function sgQuery(inp) {
  clearTimeout(SG.timer); const v = inp.value.trim();
  const enough = inp.dataset.suggest === 'phone' ? v.replace(/\D/g, '').length >= 3 : v.length >= 2;
  const seq = ++SG.seq; if (!enough) return sgClose();
  SG.timer = setTimeout(async () => {
    let r; try { r = await api('GET', '/api/patients/suggest?q=' + encodeURIComponent(v)); } catch (e) { return; }
    if (seq === SG.seq && document.activeElement === inp) sgRender(inp, (r && r.items) || []);
  }, 180);
}
function sgPick(i) {
  const x = SG.items[i], pre = SG.input && SG.input.dataset.pre; if (!x || !pre) return;
  if (x.active) { toast(t('sg_already'), 'warning'); return sgClose(); }
  $('#' + pre + 'Name').value = x.name; $('#' + pre + 'Year').value = x.birthYear; $('#' + pre + 'Gender').value = x.gender;
  if (x.phone) $('#' + pre + 'Phone').value = x.phone;
  updateAge(pre); sgClose(); $('#' + pre + 'Reason').focus();
}
document.addEventListener('mousedown', e => { if (e.target.closest('.suggest-box')) e.preventDefault(); });
document.addEventListener('focusout', e => { const el = e.target; if (el.dataset && el.dataset.suggest) setTimeout(() => { if (SG.input === el && document.activeElement !== el) sgClose(); }, 200); });
document.addEventListener('keydown', e => {
  const el = e.target; if (!el.dataset || !el.dataset.suggest || !SG.items.length || SG.input !== el) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = SG.items.length; SG.active = e.key === 'ArrowDown' ? (SG.active + 1) % n : (SG.active - 1 + n) % n; sgMark(); }
  else if (e.key === 'Enter' && SG.active >= 0) { e.preventDefault(); sgPick(SG.active); }
  else if (e.key === 'Escape') sgClose();
});
function renderPatientForms() {
  $$('form[data-form=addPatient]').forEach(f => { const keep = {}; $$('input,select', f).forEach(i => { keep[i.id] = i.value; }); $('.fields', f).innerHTML = fieldsHTML(f.dataset.pre); $$('input,select', f).forEach(i => { if (keep[i.id]) i.value = keep[i.id]; }); });
  const ef = $('#editFields'); const keep = {}; $$('input,select', ef).forEach(i => { keep[i.id] = i.value; }); ef.innerHTML = fieldsHTML('pe'); $$('input,select', ef).forEach(i => { if (keep[i.id]) i.value = keep[i.id]; });
}
function updateAge(pre) { const v = parseInt($('#' + pre + 'Year').value); $('#' + pre + 'Age').textContent = v >= 1900 && v <= YEAR ? t('age_fmt', { n: YEAR - v }) : t('age_none'); }
function readPatient(pre) {
  const name = $('#' + pre + 'Name').value.trim(), y = parseInt($('#' + pre + 'Year').value);
  if (!name || !(y >= 1900 && y <= YEAR)) { toast(t('bad_year', { y: YEAR }), 'warning'); return null; }
  return { name, birthYear: y, gender: $('#' + pre + 'Gender').value, reason: $('#' + pre + 'Reason').value, tooth: $('#' + pre + 'Tooth').value.trim(), phone: $('#' + pre + 'Phone').value.trim() };
}

/* ===================== QR ===================== */
function publicBase() { return (S.me && S.me.publicUrl) || location.origin; }
const ticketUrl = p => publicBase() + '/t/' + p.ticket;
function isLocalHost() { return /^(localhost|127\.|\[?::1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|.*\.local$)/.test(new URL(publicBase()).hostname); }
function showQr(id) {
  const p = S.patients.find(x => x.id === id); if (!p) return;
  S.qrPid = id; const url = ticketUrl(p);
  $('#qrTitle').textContent = t('qr_title', { n: '#' + p.ticketNo, name: p.name });
  $('#qrBox').innerHTML = QR.svg(url); $('#qrLink').textContent = url;
  $('#qrWarn').style.display = isLocalHost() ? 'block' : 'none';
  $('#qrShareBtn').style.display = navigator.share ? '' : 'none';
  openModal('qrModal');
}
function printQr() {
  const p = S.patients.find(x => x.id === S.qrPid); if (!p) return;
  $('#printSlip').innerHTML = `<h2>${esc(S.me.clinicName)}</h2><div class="no">${p.ticketNo}</div><div class="qr">${QR.svg(ticketUrl(p))}</div><p><strong>${t('slip_title')}</strong></p><p>${t('slip_sub')}</p>`;
  window.print();
}
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); } catch (e) { const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); }
  toast(t('t_copied'), 'success');
}

/* ===================== الصور والكاميرا ===================== */
function toJpegBlob(src, w, h) {
  const k = Math.min(1, 1280 / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/jpeg', 0.82));
}
async function fileToBitmap(f) {
  try { return await createImageBitmap(f, { imageOrientation: 'from-image' }); } catch (e) {}
  return new Promise((res, rej) => { const i = new Image(), u = URL.createObjectURL(f); i.onload = () => { res(i); }; i.onerror = rej; i.src = u; });
}
async function uploadBlob(pid, blob) { await api('POST', `/api/patients/${pid}/images`, undefined, { raw: blob }); }
let camStream = null;
async function openCamera(pid) {
  S.activePid = pid;
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    $('#cameraVideo').srcObject = camStream; openModal('cameraLiveModal');
  } catch (e) { pickFile(pid); }
}
function closeCamera() { if (camStream) { camStream.getTracks().forEach(x => x.stop()); camStream = null; } $('#cameraLiveModal').classList.remove('active'); }
async function snap() {
  const v = $('#cameraVideo'); if (!camStream || !v.videoWidth) return toast(t('cam_not_ready'), 'warning');
  const blob = await toJpegBlob(v, v.videoWidth, v.videoHeight), pid = S.activePid; closeCamera();
  await run(async () => { await uploadBlob(pid, blob); await refresh(); toast(t('t_img_ok'), 'success'); });
}
function pickFile(pid) { S.activePid = pid; const i = $('#globalImageInput'); i.value = ''; i.click(); }
$('#globalImageInput').addEventListener('change', async ev => {
  const files = Array.from(ev.target.files || []), pid = S.activePid; if (!files.length || !pid) return;
  let ok = 0;
  for (const f of files) { try { const bm = await fileToBitmap(f); await uploadBlob(pid, await toJpegBlob(bm, bm.width, bm.height)); ok++; } catch (e) { if (e.code === 'limit') { toast(errMsg(e), 'warning'); break; } } }
  await refresh(); if (ok) toast(t('t_img_ok'), 'success'); if (ok < files.length) toast(t('t_img_fail'), 'warning');
});

/* ===================== الأرشيف والممرضات ===================== */
function archiveParams(off) {
  const q = new URLSearchParams({ name: $('#aName').value, year: $('#aYear').value, gender: $('#aGender').value, tooth: $('#aTooth').value, treatment: $('#aTreat').value, offset: off, limit: 30 });
  const day = $('#aDay').value;   // yyyy-mm-dd بالتوقيت المحلي
  if (day) { const [y, m, d] = day.split('-').map(Number); q.set('from', new Date(y, m - 1, d).getTime()); q.set('to', new Date(y, m - 1, d + 1).getTime()); }
  return q.toString();
}
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function setArchDay(offset) { const d = new Date(); if (offset !== null) d.setDate(d.getDate() + offset); $('#aDay').value = offset === null ? '' : ymd(d); loadArchive(true); }
let archTimer, archSeq = 0;
function loadArchive(reset = true) {
  clearTimeout(archTimer);
  archTimer = setTimeout(async () => {
    const seq = ++archSeq, off = reset ? 0 : S.archive.items.length;
    const r = await run(() => api('GET', '/api/archive?' + archiveParams(off))); if (!r || seq !== archSeq) return;
    S.archive = { total: r.total, items: reset ? r.items : S.archive.items.concat(r.items) }; renderArchive();
  }, reset ? 250 : 0);
}
function renderArchive() {
  $('#archiveResultCount').textContent = S.archive.total;
  const l = $('#archiveList');
  l.innerHTML = S.archive.items.length ? S.archive.items.map(a => `<li class="patient-card" style="align-items:flex-start"><div style="min-width:0"><strong style="font-size:15px">${esc(a.name)}</strong> <span class="badge">${esc(a.treatment)}</span>
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${t('sex')}: <strong>${esc(genderL(a.gender))}</strong> | ${t('birth')}: <strong>${a.birthYear}</strong> (${a.age} ${t('years_short')}) | ${t('reason_s')}: ${esc(reasonL(a.reason))} | ${t('tooth')}: <strong style="color:var(--warning-warm)">${esc(a.tooth || '---')}</strong></div>
    ${a.notes ? `<div class="note-line">${t('notes_l')} ${esc(a.notes)}</div>` : ''}
    ${a.images.length ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${a.images.map(i => `<img data-rec="${a.id}" data-img="${i}" data-act="lightbox" style="width:42px;height:42px;border-radius:8px;object-fit:cover;cursor:pointer;background:var(--surface-sunk)" alt="">`).join('')}</div>` : ''}
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${t('date_l')} ${new Date(a.finishedAt).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })} · ${t('wait_s')} ${fmtMin(a.waitMin)} · ${t('dur_l')} ${fmtMin(a.durationMin)}</div></div>
    <button type="button" class="btn-action btn-red" data-act="delArchive" data-id="${a.id}">${t('del')}</button></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('no_results')}</li>`;
  $('#archiveMore').style.display = S.archive.items.length < S.archive.total ? '' : 'none';
  hydrate(l);
}
async function loadNurses() { const r = await run(() => api('GET', '/api/nurses')); if (r) { S.nurses = r; renderNurses(); } }
function renderNurses() {
  $('#nursesList').innerHTML = S.nurses.length ? S.nurses.map(n => `<li class="patient-card"><div><strong>👩‍⚕️ ${esc(n.name)}</strong><div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${t('phone_short', { p: esc(n.phone || '---') })}</div></div>
    <div class="actions"><button type="button" class="btn-action btn-yellow" data-act="editNurse" data-id="${n.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delNurse" data-id="${n.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('no_nurses')}</li>`;
}

/* ===================== التبويبات ===================== */
function docTab(tab) {
  $$('#doctorScreen .tab-content').forEach(s => s.classList.remove('active')); $$('#doctorScreen .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#' + tab + 'Tab').classList.add('active');
  if (tab === 'archive') loadArchive(true); if (tab === 'nurses') loadNurses();
}
function nurseTab(tab) {
  $$('#nurseScreen .tab-content').forEach(s => s.classList.remove('active')); $$('#nurseScreen .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#' + tab + 'Tab').classList.add('active');
}

/* ===================== الإعدادات ===================== */
function renderSettingsBoxes() {
  const tpl = $('#settingsTemplate').innerHTML;
  $$('.settings-container-box').forEach(b => { b.innerHTML = tpl; });
  $$('.setClinicName').forEach(i => { i.value = S.me.clinicName; }); $$('.setDoctorName').forEach(i => { i.value = S.me.role === 'doctor' ? S.me.name : ''; });
}
function translate() {
  $$('[data-i18n]').forEach(e => { const k = e.dataset.i18n; if (L[settings.lang][k] != null) e.textContent = L[settings.lang][k]; });
  $$('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
}
function applySettings() {
  document.body.classList.toggle('light-mode', !settings.darkMode);
  document.body.classList.remove('theme-mint', 'theme-purple', 'theme-rose'); if (settings.theme !== 'sky') document.body.classList.add('theme-' + settings.theme);
  document.documentElement.lang = settings.lang; document.documentElement.dir = settings.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('app_title');
  $$('.darkModeToggle').forEach(x => { x.checked = settings.darkMode; }); $$('.soundToggle').forEach(x => { x.checked = settings.sound; }); $$('.autoQrToggle').forEach(x => { x.checked = settings.autoQr; });
  $$('.langSelect').forEach(x => { x.value = settings.lang; });
  renderPatientForms(); translate();
  if (S.me) {
    if (S.me.role === 'doctor') { $('#doctorHeaderTitle').textContent = S.me.clinicName; $('#doctorSubtitle').textContent = t('doc_sub3', { n: S.me.name }); }
    else $('#nurseUserWelcome').textContent = t('nurse_welcome', { n: S.me.name });
    const c = $('#consultationArea'); c.dataset.sig = ''; renderAll(); if (S.me.role === 'doctor') { renderArchive(); renderNurses(); }
  } else { $('#nurseHeaderTitle').textContent = t('nurse_title'); }
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(document.body).getPropertyValue('--bar').trim() || '#2E2A6E';
  jset('cc_settings', settings);
}
function requestNotifOnce() { if ('Notification' in window && Notification.permission === 'default' && !localStorage.getItem('cc_asked')) { localStorage.setItem('cc_asked', '1'); setTimeout(() => Notification.requestPermission(), 1500); } }
async function askNotif() {
  if (!('Notification' in window)) return;
  const r = await Notification.requestPermission(); toast(r === 'granted' ? t('notif_on') : t('notif_denied'), r === 'granted' ? 'success' : 'warning');
}
function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }

/* ===================== الأفعال (تفويض الأحداث) ===================== */
const ACT = {
  authMode: el => authMode(el.dataset.mode), logout, closeAlert: el => el.parentElement.remove(),
  docTab: el => docTab(el.dataset.tab), nurseTab: el => nurseTab(el.dataset.tab),
  closeModal: closeModals, closeLightbox: () => $('#lightboxModal').classList.remove('active'),
  lightbox: async el => { try { $('#lightboxImg').src = await imgBlobUrl(el.dataset.rec, el.dataset.img); $('#lightboxModal').classList.add('active'); } catch (e) {} },
  async enter(el) {
    const r = await run(() => api('POST', `/api/patients/${el.dataset.id}/enter`)); if (!r) return;
    if (r.skipRequested) toast(t('t_skip_sent'), 'info'); await refresh();
  },
  async skipAllow() { const id = $('#skipQueueModal').dataset.pid; $('#skipQueueModal').classList.remove('active'); await run(() => api('POST', `/api/patients/${id}/skip`, { allow: true })); refresh(); },
  async skipDeny() { const id = $('#skipQueueModal').dataset.pid; $('#skipQueueModal').classList.remove('active'); await run(() => api('POST', `/api/patients/${id}/skip`, { allow: false })); refresh(); },
  async delPatient(el) { if (!confirm(t('c_del_patient'))) return; if (await run(() => api('DELETE', `/api/patients/${el.dataset.id}`))) { toast(t('t_deleted'), 'info'); refresh(); } },
  editPatient(el) {
    const p = S.patients.find(x => x.id === el.dataset.id); if (!p) return;
    $('#editPatientId').value = p.id; $('#peName').value = p.name; $('#peYear').value = p.birthYear; $('#peGender').value = p.gender; $('#peReason').value = p.reason;
    $('#peTooth').value = p.tooth === 'غير محدد' ? '' : p.tooth; $('#pePhone').value = p.phone || ''; updateAge('pe'); openModal('editPatientModal');
  },
  showQr: el => showQr(el.dataset.id), qrPrint: printQr, qrCopy: () => { const p = S.patients.find(x => x.id === S.qrPid); if (p) copyText(ticketUrl(p)); },
  qrShare: () => { const p = S.patients.find(x => x.id === S.qrPid); if (p && navigator.share) navigator.share({ title: S.me.clinicName, url: ticketUrl(p) }).catch(() => {}); },
  openCamera: el => openCamera(el.dataset.id), pickFile: el => pickFile(el.dataset.id), snap, closeCamera,
  async delImage(el) { if (await run(() => api('DELETE', `/api/patients/${el.dataset.id}/images/${el.dataset.img}`))) refresh(); },
  treat(el) { S.treatment = el.dataset.v; $$('.treatment-item').forEach(x => x.classList.toggle('selected', x === el)); },
  async finish(el) {
    const r = await run(() => api('POST', `/api/patients/${el.dataset.id}/finish`, { treatment: S.treatment, notes: ($('#consultNotes') || {}).value || '' })); if (!r) return;
    toast(t('t_finished'), 'success'); await refresh(); docTab('waiting');
  },
  copyCode: () => copyText(S.me.code || ''),
  async delNurse(el) { if (confirm(t('c_del_nurse')) && await run(() => api('DELETE', `/api/nurses/${el.dataset.id}`))) { toast(t('t_deleted'), 'info'); loadNurses(); } },
  editNurse(el) { const n = S.nurses.find(x => x.id === el.dataset.id); if (!n) return; $('#editNurseId').value = n.id; $('#editNurseName').value = n.name; $('#editNursePhone').value = n.phone || ''; $('#editNursePass').value = ''; openModal('editNurseModal'); },
  async delArchive(el) { if (confirm(t('c_del_arch')) && await run(() => api('DELETE', `/api/archive/${el.dataset.id}`))) loadArchive(true); },
  archiveMore: () => loadArchive(false),
  dayToday: () => setArchDay(0), dayYest: () => setArchDay(-1), dayAll: () => setArchDay(null),
  sgPick: el => sgPick(+el.dataset.i),
  setTheme: el => { settings.theme = el.dataset.theme; applySettings(); }, askNotif,
  installApp: async () => { if (!S.installEvt) return; S.installEvt.prompt(); S.installEvt = null; document.body.classList.remove('can-install'); },
  async exportData() { const b = await run(() => api('GET', '/api/backup', undefined, { blob: true })); if (b) download(b, `clinic_backup_${new Date().toISOString().slice(0, 10)}.json`); },
  importData() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = async () => {
      const f = i.files[0]; if (!f || !confirm(t('c_restore'))) return;
      const r = await run(async () => api('POST', '/api/restore', undefined, { text: await f.text() })); if (r) { toast(t('restored', { p: r.patients, a: r.archive }), 'success'); refresh(); loadArchive(true); }
    }; i.click();
  },
  async wipeData() { const pw = prompt(t('c_wipe')); if (!pw) return; if (await run(() => api('POST', '/api/clinic/wipe', { password: pw }))) { toast(t('t_deleted'), 'info'); refresh(); loadArchive(true); } },
  async deleteAccount() { const pw = prompt(t('c_delacc')); if (!pw) return; if (await run(() => api('POST', '/api/clinic/wipe', { password: pw, account: true }))) forceLogout(true); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { if (el.tagName === 'A') e.preventDefault(); f(el, e); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.input === 'age') updateAge(el.dataset.pre);
  else if (el.dataset.input === 'archive') loadArchive(true);
  else if (el.dataset.suggest) sgQuery(el);
});
document.addEventListener('change', e => {
  const el = e.target, c = el.dataset.change;
  if (c === 'dark') settings.darkMode = el.checked; else if (c === 'lang') settings.lang = el.value; else if (c === 'sound') settings.sound = el.checked; else if (c === 'autoQr') settings.autoQr = el.checked; else if (el.dataset.input === 'archive') { loadArchive(true); return; } else return;
  applySettings();
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
  const kind = f.dataset.form;
  if (kind === 'loginDoctor') {
    jset('cc_last', { u: $('#lUser').value.trim() });
    try { await afterLogin(await api('POST', '/api/login/doctor', { username: $('#lUser').value, password: $('#lPass').value }, { anon: true })); } catch (x) { authError(x); }
  } else if (kind === 'loginNurse') {
    jset('cc_last_n', { c: $('#nCode').value.trim(), n: $('#nName').value.trim() });
    try { await afterLogin(await api('POST', '/api/login/nurse', { code: $('#nCode').value, name: $('#nName').value, password: $('#nPass').value }, { anon: true })); } catch (x) { authError(x); }
  } else if (kind === 'register') {
    if ($('#rPass').value !== $('#rPass2').value) return void ($('#authErr').textContent = t('pass_mismatch'));
    try { await afterLogin(await api('POST', '/api/register', { clinicName: $('#rClinic').value, doctorName: $('#rDoctor').value, username: $('#rUser').value, password: $('#rPass').value, registrationCode: $('#rCode').value }, { anon: true })); } catch (x) { authError(x); }
  } else if (kind === 'addPatient') {
    const pre = f.dataset.pre, v = readPatient(pre); if (!v) return;
    clearTimeout(SG.timer); SG.seq++; sgClose();
    lastOwnAdd = Date.now();
    const r = await run(() => api('POST', '/api/patients', v)); if (!r) return;
    ['Name', 'Year', 'Tooth', 'Phone'].forEach(k => { $('#' + pre + k).value = ''; }); updateAge(pre);
    toast(t('t_registered'), 'success'); await refresh(); if (settings.autoQr) showQr(r.id); if (pre === 'pd') docTab('waiting');
  } else if (kind === 'editPatient') {
    const v = readPatient('pe'); if (!v) return;
    if (await run(() => api('PUT', `/api/patients/${$('#editPatientId').value}`, v))) { closeModals(); toast(t('t_saved'), 'success'); refresh(); }
  } else if (kind === 'addNurse') {
    const r = await run(() => api('POST', '/api/nurses', { name: $('#newNurseName').value, phone: $('#newNursePhone').value, password: $('#newNursePass').value }));
    if (r) { f.reset(); toast(t('t_nurse_added'), 'success'); loadNurses(); }
  } else if (kind === 'editNurse') {
    const body = { name: $('#editNurseName').value, phone: $('#editNursePhone').value }; if ($('#editNursePass').value) body.password = $('#editNursePass').value;
    if (await run(() => api('PUT', `/api/nurses/${$('#editNurseId').value}`, body))) { closeModals(); toast(t('t_saved'), 'success'); loadNurses(); }
  } else if (kind === 'hours') {
    let tz = 'UTC'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (x) {}
    const r = await run(() => api('PUT', '/api/clinic/hours', { enabled: $('.hoursOn', f).checked, start: $('.hoursStart', f).value, end: $('.hoursEnd', f).value, tz }));
    if (r) { S.hours = r; toast(t('t_saved'), 'success'); renderHours(); }
  } else if (kind === 'clinicInfo') {
    const r = await run(() => api('PUT', '/api/clinic', { clinicName: $('.setClinicName', f).value, doctorName: $('.setDoctorName', f).value }));
    if (r) { S.me = { ...S.me, ...r }; applySettings(); toast(t('t_saved'), 'success'); }
  } else if (kind === 'changePass') {
    if (await run(() => api('POST', '/api/account/password', { oldPassword: $('.oldPass', f).value, newPassword: $('.newPass', f).value }))) { f.reset(); toast(t('t_saved'), 'success'); }
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); $('#lightboxModal').classList.remove('active'); } });
document.addEventListener('click', e => { if (e.target.classList && e.target.classList.contains('modal-overlay') && e.target.id !== 'skipQueueModal') closeModals(); });

/* ===================== التثبيت وبدء التشغيل ===================== */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; document.body.classList.add('can-install'); });
window.addEventListener('appinstalled', () => document.body.classList.remove('can-install'));
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

(async function init() {
  applySettings();
  const last = jget('cc_last', null), ln = jget('cc_last_n', null);
  if (last) $('#lUser').value = last.u || ''; if (ln) { $('#nCode').value = ln.c || ''; $('#nName').value = ln.n || ''; }
  try {
    S.config = await api('GET', '/api/config', undefined, { anon: true });
    $('#rCodeGroup').style.display = S.config.registration === 'code' ? 'flex' : 'none';
    if (!S.config.hasClinics && !S.token) authMode('register');
  } catch (e) { if (!S.token) $('#authErr').textContent = errMsg(e); }
  await boot();
})();


/* ===================== الساعة الحيّة ===================== */
(function liveClock() {
  const p2 = n => String(n).padStart(2, '0');
  function tick() {
    const d = new Date(), lang = (typeof settings !== 'undefined' && settings.lang === 'en') ? 'en-GB' : 'ar-u-nu-latn';
    const date = d.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.querySelectorAll('.live-clock').forEach(c => {
      c.querySelector('.lc-h').textContent = p2(d.getHours()); c.querySelector('.lc-m').textContent = p2(d.getMinutes()); c.querySelector('.lc-s').textContent = p2(d.getSeconds());
      const dt = c.querySelector('.lc-date'); if (dt.textContent !== date) dt.textContent = date;
    });
  }
  let timer = null;
  const run = () => { clearTimeout(timer); if (document.hidden) return; tick(); timer = setTimeout(run, 1000 - (Date.now() % 1000) + 5); };   // يتزامن مع بداية كل ثانية
  document.addEventListener('visibilitychange', run); run();
})();
