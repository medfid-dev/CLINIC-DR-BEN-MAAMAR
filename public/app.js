'use strict';
/* عيادتي الذكية — واجهة التطبيق (متصلة بالخادم، مزامنة فورية عبر SSE) */

/* ===================== النصوص ===================== */
const L = {
  ar: {
    offline_bar: 'غير متصل بالخادم — جارٍ إعادة الاتصال…', skip_title: 'تنبيه تخطي الدور!', skip_allow: 'نعم، السماح بالدخول ✅', skip_deny: 'رفض ❌',
    camera_title: 'كاميرا المعاينة المباشرة 📸', snap: 'التقاط الآن 📸', close: 'إغلاق', edit_patient: 'تعديل بيانات المريض ✏️', save: 'حفظ ✅', cancel: 'إلغاء',
    edit_nurse: 'تعديل بيانات الممرضة ✏️', nurse_fullname: 'اسم الممرضة الكامل', lbl_phone_s: 'رقم الهاتف', new_pass_opt: 'كلمة مرور جديدة (اتركها فارغة لعدم التغيير):',
    qr_help: 'اطلب من المريض مسح الرمز بكاميرا هاتفه ليتابع دوره دون أن يرى بيانات أي مريض آخر.',
    qr_local_warn: '⚠️ عنوان هذا الموقع محلي؛ لن يفتحه هاتف المريض إلا إن كان على نفس الشبكة. يُفضّل نشر الخادم بعنوان عام (انظر README).',
    print: '🖨️ طباعة', copy_link: 'نسخ الرابط', share: 'مشاركة', app_title: 'عيادتي الذكية', app_sub: 'إدارة الانتظار والمعاينة — متزامنة بين الأجهزة',
    seg_doctor: 'طبيب', seg_nurse: 'ممرضة', seg_register: 'حساب جديد', username: 'اسم المستخدم:', pass: 'كلمة المرور:', login: 'تسجيل الدخول 🚀',
    clinic_code: 'رمز العيادة (يعطيه لكِ الطبيب):', nurse_name: 'اسمكِ كما سجّله الطبيب:', clinic_name: 'اسم العيادة:', doc_name: 'اسم الطبيب الكامل:',
    username_hint: '3–40 حرفاً لاتينياً/أرقاماً (مثل dr.ahmed)', pass_hint: '8 أحرف على الأقل. لا يمكن استرجاعها إن نُسيت — احتفظ بها.', pass2: 'تأكيد كلمة المرور:',
    reg_code: 'رمز التسجيل (من مدير الخدمة):', create_account: 'إنشاء حساب الطبيب والبدء 🚀', logout: 'خروج', tab_waiting: 'الانتظار', tab_consult: 'المعاينة 🩺',
    tab_add: 'تسجيل ➕', tab_nurses: 'الممرضات 👩‍⚕️', tab_archive: 'الأرشيف 📁', tab_settings: 'الإعدادات ⚙️', tab_patients: 'المرضى والانتظار 👥',
    reg_doc_title: 'تسجيل مريض جديد', btn_reg_add: 'تسجيل وإضافة للانتظار 🔔', clinic_code_title: 'رمز عيادتك (تدخل به الممرضات)', copy: 'نسخ',
    manage_nurses: 'إدارة ممرضات العيادة', nurse_pass: 'كلمة مرور الممرضة (6 أحرف فأكثر)', btn_add_nurse: 'إضافة ممرضة جديدة 👩‍⚕️',
    archive_title: 'أرشيف السجلات الطبية 📁', search_name: '🔍 بحث باسم المريض...', search_year: '📅 سنة الميلاد...', search_tooth: '🦷 رقم/مكان السن...',
    all_genders: 'جميع الأجناس', male: 'ذكر', female: 'أنثى', all_treat: 'جميع العلاجات', today: 'اليوم', yesterday: 'أمس', this_week: 'هذا الأسبوع', from_l: 'من', to_l: 'إلى', clear_day: 'مسح ✖', tr_ext: 'قلع', tr_endo: 'علاج عصب', tr_cons: 'استشارة', tr_pros: 'تركيب', tr_white: 'تبييض', tr_other: 'أخرى',
    match_results: 'النتائج المطابقة:', load_more: 'عرض المزيد', waiting_rem: '👥 المرضى المتبقون في الانتظار:', today_patients: 'قائمة مرضى اليوم',
    settings_title: 'إعدادات التطبيق ⚙️', set_manage: 'إدارة العيادة', hist_title: '📋 سجل المريض', hist_first: 'أول زيارة', hist_last: 'آخر زيارة', hist_visits: 'عدد الزيارات', hist_none: 'لا توجد زيارات منتهية مسجّلة لهذا المريض بعد.', hist_cur: 'الزيارة الحالية', hist_wait_st: 'ينتظر', hist_in_st: 'في المعاينة', hist_load_fail: 'تعذّر تحميل السجل', hist_visit_n: 'زيارة {n}', set_appearance: 'المظهر والألوان', dark_mode: 'الوضع الداكن', theme_color: 'لون العيادة', set_lang: 'اللغة', app_lang: 'لغة التطبيق',
    set_sound: 'التنبيهات', sound_alerts: 'التنبيهات الصوتية', auto_qr: 'إظهار QR بعد تسجيل المريض', sys_notif: 'إشعارات النظام', sys_notif_sub: 'تصلك التنبيهات حتى لو كان التطبيق مغلقاً أو الشاشة مقفلة', enable: 'تفعيل',
    install_app: 'تثبيت التطبيق', install_sub: 'يُفتح كتطبيق مستقل على الجوال أو الحاسوب', install: 'تثبيت', set_clinic: 'بيانات العيادة', chg_pass: 'تغيير كلمة المرور',
    old_pass: 'كلمة المرور الحالية', new_pass: 'كلمة المرور الجديدة (8 أحرف فأكثر)', change: 'تغيير', chg_pass_hint: 'ستُغلق جلسات باقي الأجهزة.', set_backup: 'النسخ الاحتياطي', set_schedule: 'تسجيل الممرضة للمرضى', sched_enable: 'تقييد وقت التسجيل', sched_enable_sub: 'عند الإيقاف تسجّل الممرضة في أي وقت', sched_days: 'الأيام المسموحة:', sched_from: 'من الساعة:', sched_to: 'إلى الساعة:', sched_hint: 'خارج هذه الأيام والأوقات لا تستطيع الممرضة تسجيل مرضى جدد، أما أنت فتسجّل في أي وقت.', days_full: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], reg_closed: '⏰ التسجيل مغلق حالياً. أوقات التسجيل: {d} من {a} إلى {b}', e_registration_closed: 'التسجيل مغلق خارج الأوقات التي حدّدها الطبيب', t_sched_saved: 'تم حفظ أوقات التسجيل',
    export_data: 'تصدير نسخة 📥', import_data: 'استعادة 📤', backup_hint: 'النسخة تشمل المرضى والأرشيف والصور (دون كلمات المرور).', wipe_data: 'حذف جميع بيانات المرضى…', delete_account: 'حذف الحساب نهائياً…',
    // ديناميكية
    lbl_name: 'اسم المريض:', lbl_birth: 'سنة الازدياد:', lbl_gender: 'الجنس:', lbl_reason: 'سبب الزيارة:', lbl_tooth: 'السن (اختياري):', lbl_phone: 'رقم الهاتف (اختياري):',
    age_fmt: 'العمر: {n} سنة', age_none: 'العمر: --', years_short: 'سنة', doc_title: 'لوحة الطبيب 🔔', doc_sub: 'إشراف عام وعيادة مباشرة', nurse_title: 'شاشة الممرضة', nurse_welcome: 'الممرضة: {n}',
    hero_doc: 'د. {n}', price_cat_base: 'عام', price_cat_front: 'أمامية', price_cat_pre: 'ضواحك', price_cat_molar: 'أضراس', price_cat_wisdom: 'ضرس العقل', prices_hint2: 'اترك «أمامية/ضواحك/أضراس/ضرس العقل» فارغة ليُطبَّق سعر «عام» مهما كان السن. وإن ملأتها يُحسب سعر كل سن بحسب نوعه ويُجمع (القواطع والأنياب = أمامية، الأضراس اللبنية = أضراس، الأسنان 18/28/38/48 = ضرس العقل، وإن تركتها فارغة يُطبَّق سعر «أضراس»).', due_l: 'المستحق', paid_now: 'المدفوع الآن', pay_all: 'سداد كل المتبقي', pay_half: 'النصف', pay_zero: 'لا شيء', acct_title: '💼 حساب المريض', acct_prev: 'متبقٍّ من زيارات سابقة:', follow_l: 'حصة متابعة لعلاج سابق (بدون سعر جديد)', after_l: 'المتبقي بعد هذه الزيارة:', over_warn: '⚠️ المدفوع أكبر من المستحق والمتبقي السابق، ولن يُحتسب الفائض.', rem_l: 'متبقٍّ', paid_l: 'مدفوع', add_pay: '💵 دفعة', pay_prompt: 'مبلغ الدفعة (المتبقي: {r}):', t_paid: 'تم تسجيل الدفعة ✅', pays_l: 'الدفعات:', total_due: 'المستحق:', total_paid: 'المحصَّل:', total_debt: 'المتبقي:',  set_prices: '💰 قائمة الأسعار', prices_hint: 'سعر كل علاج. يظهر تلقائياً في المعاينة ويمكنك تعديله لكل مريض.', currency_l: 'العملة (اختياري):', price_l: 'السعر', price_total: 'الإجمالي:', t_prices_saved: 'تم حفظ الأسعار ✅', teeth_title: '🦷 مخطط الأسنان (اختر السن المعالج)', teeth_perm: 'أسنان دائمة (بالغ)', teeth_prim: 'أسنان لبنية (طفل)', teeth_sel: 'المحدد:', teeth_none: 'لم يُحدَّد سن', teeth_clear: 'مسح', teeth_ur: 'علوي أيمن', teeth_ul: 'علوي أيسر', teeth_lr: 'سفلي أيمن', teeth_ll: 'سفلي أيسر', doc_sub2: '{c} — {n}', in_room: 'في المعاينة 🩺', enter: 'دخول', edit: 'تعديل', del: 'حذف', call: 'استدعاء 🩺', qr: 'QR', doctor_word: 'طبيب', ticket_no: 'تذكرة',
    sex: 'الجنس', birth: 'سنة الميلاد', tooth: 'السن', empty_today: 'لا توجد سجلات اليوم', empty_wait: 'قاعة الانتظار فارغة', empty_room: 'لا يوجد مريض حالياً في غرفة الكشف.',
    consult_patient: '👤 المريض:', reason_l: '📌 السبب:', tooth_l: '🦷 رقم/مكان السن:', gender_l: '👤 الجنس:', birth_l: '📅 الميلاد:', phone_l: '📞 الهاتف:', wait_l: '⏳ وقت الانتظار:', not_set: 'غير مسجل',
    xrays: '📷 صور الكشف / الأشعة المرفقة:', no_images: 'لم يتم إرفاق صور بعد.', cam_live: '📷 الكاميرا المباشرة', upload_gal: '📁 رفع من الاستوديو', pick_treat: 'اختر العلاجات المنجزة للمريض:', pick_treat_multi: 'يمكنك تحديد أكثر من علاج، ويُجمع سعرها تلقائياً.', pick_treat_min: 'يجب أن يبقى علاج واحد على الأقل',
    task_title: '📌 مهمة للممرضة', task_to_l: 'إرسال إلى:', task_all: 'كل الممرضات', task_ph: 'اكتب المهمة…', task_send: 'إرسال المهمة', task_sent: 'تم إرسال المهمة ✅', task_list_t: 'المهام المرسلة', task_empty: 'لا توجد مهام بعد', task_pending: 'بانتظار الممرضة', task_done_by: 'أنجزتها: {n}', task_to_n: 'إلى: {n}', task_ok: '✔ تمت المهمة', task_new: 'مهمة جديدة من الطبيب', task_finished: '✅ تمت المهمة', task_del: 'حذف', task_q1: 'تحضير الغرفة', task_q2: 'تعقيم الأدوات', task_q3: 'استدعاء المريض التالي', task_q4: 'تجهيز جهاز الأشعة', task_confirm_del: 'حذف هذه المهمة؟',
    t_ext: '🦷 قلع', t_endo: '🩺 عصب', t_cons: '📋 استشارة', t_pros: '💎 تركيب', t_white: '✨ تبييض', t_other: '📝 أخرى', notes_ph: 'ملاحظات / تشخيص (اختياري)...', finish: '✅ إنهاء المعاينة وحفظ السجل بالأرشيف',
    lt1: 'أقل من دقيقة', min_n: '{n} دقيقة', no_nurses: 'لا توجد ممرضات مسجلات حالياً', phone_short: 'الهاتف: {p}', no_results: 'لا توجد نتائج مطابقة', date_l: 'التاريخ:', reason_s: 'السبب', dur_l: 'مدة المعاينة', wait_s: 'الانتظار', notes_l: 'ملاحظات:',
    skip_msg: 'الممرضة تحاول إدخال المريض ({a}) بالرغم من وجود المريض ({b}) قبله في القائمة. هل تسمح بتخطي الدور؟',
    // رسائل
    t_welcome_new: '🔔 مريض جديد في الانتظار', t_added: 'تمت إضافة: {n}', t_enter: '🩺 دخول مريض للمعاينة', t_entered: 'تم إدخال المريض: {n}', t_done: '✅ انتهت المعاينة!', t_done_msg: 'أنهى الطبيب معاينة {n}. يمكنك إدخال المريض التالي الآن.',
    t_skip_denied: 'رفض الطبيب إدخال {n} قبل دوره.', t_skip_sent: 'المريض ليس في أول القائمة. تم إرسال طلب تجاوز للطبيب!', t_busy: 'الطبيب مشغول حالياً بمعاينة مريض آخر.', t_registered: 'تم تسجيل المريض بنجاح!', t_saved: 'تم الحفظ بنجاح ✅',
    t_deleted: 'تم الحذف.', t_finished: 'تم إنهاء المعاينة وحفظ الملف في الأرشيف! ✅', t_nurse_added: 'تمت إضافة الممرضة بنجاح 👩‍⚕️', t_copied: 'تم النسخ ✅', t_img_ok: 'تمت إضافة الصور 📷', t_img_fail: 'تعذّر تحميل بعض الصور',
    c_del_patient: 'هل تأكدت من حذف هذا المريض؟', c_del_nurse: 'هل أنت متأكد من حذف حساب هذه الممرضة؟', c_del_arch: 'حذف هذا السجل نهائياً من الأرشيف؟', c_restore: 'سيتم استبدال بيانات المرضى والأرشيف الحالية بالنسخة الاحتياطية. المتابعة؟',
    c_wipe: 'سيتم حذف كل المرضى والأرشيف والصور نهائياً. اكتب كلمة مرور الطبيب للتأكيد:', c_delacc: 'سيتم حذف حسابك وكل بياناته نهائياً ولا يمكن التراجع. اكتب كلمة مرور الطبيب للتأكيد:', restored: 'تمت الاستعادة: {p} مريض في الانتظار، {a} سجل أرشيف',
    cam_not_ready: 'الكاميرا غير جاهزة بعد', pass_mismatch: 'كلمتا المرور غير متطابقتين', bad_year: 'تحقق من اسم المريض وسنة الازدياد (1900 – {y})', notif_on: 'تم تفعيل الإشعارات', notif_denied: 'الإشعارات محظورة من إعدادات المتصفح', push_on: '✅ مفعّلة على هذا الجهاز', push_off: '⚠️ غير مفعّلة — اضغط «تفعيل» لتصلك التنبيهات والتطبيق مغلق', push_blocked: '⛔ محظورة — فعّلها من إعدادات الموقع في المتصفح/النظام', push_ios: 'ℹ️ على آيفون: أضف التطبيق إلى الشاشة الرئيسية (مشاركة ← إضافة إلى الشاشة الرئيسية) ثم افتحه وفعّل التنبيهات', push_unsupported: 'ℹ️ هذا المتصفح لا يدعم إشعارات النظام', push_fail: 'تعذّر تفعيل الإشعارات، حاول مجدداً', install_done: '✅ التطبيق مثبّت ويعمل كتطبيق مستقل', install_ready: 'اضغط «تثبيت» ليُضاف إلى شاشتك الرئيسية ويفتح كتطبيق مستقل', install_ios: 'على آيفون/آيباد: اضغط زر المشاركة في سفاري ثم «إضافة إلى الشاشة الرئيسية»', install_manual: 'من قائمة المتصفح ⋮ اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». (يتطلب اتصال HTTPS)', tr_add: '＋ إضافة علاج', tr_name_ph: 'اسم العلاج', tr_hint: 'أضف علاجاتك أو عدّل أسماءها وأسعارها أو احذفها. تظهر هذه القائمة في واجهة المعاينة. السجلات القديمة في الأرشيف لا تتغيّر.', tr_last: 'يجب أن يبقى علاج واحد على الأقل', e_duplicate: 'اسم علاج مكرر', tr_empty_name: 'اكتب اسماً لكل علاج', tr_up: 'أعلى', tr_down: 'أسفل', tr_del: 'حذف',
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
    print: '🖨️ Print', copy_link: 'Copy link', share: 'Share', app_title: 'MY SMART CLINIC', app_sub: 'Queue & consultation — synced across devices',
    seg_doctor: 'Doctor', seg_nurse: 'Nurse', seg_register: 'New account', username: 'Username:', pass: 'Password:', login: 'Login 🚀',
    clinic_code: 'Clinic code (from your doctor):', nurse_name: 'Your name as registered by the doctor:', clinic_name: 'Clinic name:', doc_name: 'Doctor full name:',
    username_hint: '3–40 latin letters/digits (e.g. dr.ahmed)', pass_hint: 'At least 8 characters. It cannot be recovered if forgotten.', pass2: 'Confirm password:',
    reg_code: 'Registration code (from the service admin):', create_account: 'Create doctor account 🚀', logout: 'Logout', tab_waiting: 'Queue', tab_consult: 'Consultation 🩺',
    tab_add: 'Register ➕', tab_nurses: 'Nurses 👩‍⚕️', tab_archive: 'Archive 📁', tab_settings: 'Settings ⚙️', tab_patients: 'Patients & Queue 👥',
    reg_doc_title: 'Register new patient', btn_reg_add: 'Register & add to queue 🔔', clinic_code_title: 'Your clinic code (nurses log in with it)', copy: 'Copy',
    manage_nurses: 'Manage clinic nurses', nurse_pass: 'Nurse password (6+ chars)', btn_add_nurse: 'Add nurse 👩‍⚕️',
    archive_title: 'Medical records archive 📁', search_name: '🔍 Search by name...', search_year: '📅 Birth year...', search_tooth: '🦷 Tooth / location...',
    all_genders: 'All genders', male: 'Male', female: 'Female', all_treat: 'All treatments', today: 'Today', yesterday: 'Yesterday', this_week: 'This week', from_l: 'From', to_l: 'To', clear_day: 'Clear ✖', tr_ext: 'Extraction', tr_endo: 'Root canal', tr_cons: 'Consultation', tr_pros: 'Prosthetics', tr_white: 'Whitening', tr_other: 'Other',
    match_results: 'Matching records:', load_more: 'Load more', waiting_rem: '👥 Patients waiting:', today_patients: "Today's patients",
    settings_title: 'App settings ⚙️', set_manage: 'Clinic management', hist_title: '📋 Patient record', hist_first: 'First visit', hist_last: 'Last visit', hist_visits: 'Visits', hist_none: 'No completed visits recorded for this patient yet.', hist_cur: 'Current visit', hist_wait_st: 'Waiting', hist_in_st: 'In consultation', hist_load_fail: 'Could not load the record', hist_visit_n: 'Visit {n}', set_appearance: 'Appearance', dark_mode: 'Dark mode', theme_color: 'Theme color', set_lang: 'Language', app_lang: 'Interface language',
    set_sound: 'Notifications', sound_alerts: 'Sound alerts', auto_qr: 'Show QR after registering a patient', sys_notif: 'System notifications', sys_notif_sub: 'Alerts reach you even when the app is closed or the screen is locked', enable: 'Enable',
    install_app: 'Install app', install_sub: 'Opens as a standalone app on phone or computer', install: 'Install', set_clinic: 'Clinic info', chg_pass: 'Change password',
    old_pass: 'Current password', new_pass: 'New password (8+ chars)', change: 'Change', chg_pass_hint: 'Other devices will be signed out.', set_backup: 'Backup', set_schedule: 'Nurse patient registration', sched_enable: 'Restrict registration times', sched_enable_sub: 'When off, nurses can register at any time', sched_days: 'Allowed days:', sched_from: 'From:', sched_to: 'To:', sched_hint: 'Outside these days and times nurses cannot register new patients. You can always register.', days_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], reg_closed: '⏰ Registration is closed right now. Hours: {d}, {a} to {b}', e_registration_closed: 'Registration is closed outside the hours set by the doctor', t_sched_saved: 'Registration hours saved',
    export_data: 'Export backup 📥', import_data: 'Restore 📤', backup_hint: 'Includes patients, archive and images (not passwords).', wipe_data: 'Delete all patient data…', delete_account: 'Delete account permanently…',
    lbl_name: 'Patient name:', lbl_birth: 'Birth year:', lbl_gender: 'Gender:', lbl_reason: 'Reason for visit:', lbl_tooth: 'Tooth (optional):', lbl_phone: 'Phone (optional):',
    age_fmt: 'Age: {n}', age_none: 'Age: --', years_short: 'y', doc_title: 'Doctor panel 🔔', doc_sub: 'Supervision & direct clinic', nurse_title: 'Nurse screen', nurse_welcome: 'Nurse: {n}',
    hero_doc: 'Dr. {n}', price_cat_base: 'General', price_cat_front: 'Front', price_cat_pre: 'Premolar', price_cat_molar: 'Molar', price_cat_wisdom: 'Wisdom', prices_hint2: 'Leave Front/Premolar/Molar/Wisdom empty to use the General price for any tooth. If filled, each tooth is priced by its type and summed (incisors & canines = Front, primary molars = Molar, teeth 18/28/38/48 = Wisdom; if Wisdom is empty the Molar price applies).', due_l: 'Amount due', paid_now: 'Paid now', pay_all: 'Pay all outstanding', pay_half: 'Half', pay_zero: 'None', acct_title: '💼 Patient account', acct_prev: 'Outstanding from earlier visits:', follow_l: 'Follow-up session of an earlier treatment (no new charge)', after_l: 'Outstanding after this visit:', over_warn: '⚠️ Paid exceeds what is due plus earlier balance; the excess is ignored.', rem_l: 'Outstanding', paid_l: 'Paid', add_pay: '💵 Payment', pay_prompt: 'Payment amount (outstanding: {r}):', t_paid: 'Payment recorded ✅', pays_l: 'Payments:', total_due: 'Due:', total_paid: 'Collected:', total_debt: 'Outstanding:',  set_prices: '💰 Price list', prices_hint: 'Price of each treatment. It appears in the consultation and can be changed per patient.', currency_l: 'Currency (optional):', price_l: 'Price', price_total: 'Total:', t_prices_saved: 'Prices saved ✅', teeth_title: '🦷 Tooth chart (select treated tooth)', teeth_perm: 'Permanent (adult)', teeth_prim: 'Primary (child)', teeth_sel: 'Selected:', teeth_none: 'No tooth selected', teeth_clear: 'Clear', teeth_ur: 'Upper right', teeth_ul: 'Upper left', teeth_lr: 'Lower right', teeth_ll: 'Lower left', doc_sub2: '{c} — {n}', in_room: 'In consultation 🩺', enter: 'Enter', edit: 'Edit', del: 'Delete', call: 'Call in 🩺', qr: 'QR', doctor_word: 'Doctor', ticket_no: 'Ticket',
    sex: 'Gender', birth: 'Birth year', tooth: 'Tooth', empty_today: 'No records today', empty_wait: 'Waiting room is empty', empty_room: 'No patient in the consultation room.',
    consult_patient: '👤 Patient:', reason_l: '📌 Reason:', tooth_l: '🦷 Tooth:', gender_l: '👤 Gender:', birth_l: '📅 Born:', phone_l: '📞 Phone:', wait_l: '⏳ Waited:', not_set: 'Not set',
    xrays: '📷 Attached photos / X-rays:', no_images: 'No images attached yet.', cam_live: '📷 Live camera', upload_gal: '📁 Upload from gallery', pick_treat: 'Select the treatments performed:', pick_treat_multi: 'You can select more than one treatment; prices are added up automatically.', pick_treat_min: 'At least one treatment must stay selected',
    task_title: '📌 Task for the nurse', task_to_l: 'Send to:', task_all: 'All nurses', task_ph: 'Write the task…', task_send: 'Send task', task_sent: 'Task sent ✅', task_list_t: 'Sent tasks', task_empty: 'No tasks yet', task_pending: 'Waiting for the nurse', task_done_by: 'Done by: {n}', task_to_n: 'To: {n}', task_ok: '✔ Task done', task_new: 'New task from the doctor', task_finished: '✅ Task completed', task_del: 'Delete', task_q1: 'Prepare the room', task_q2: 'Sterilize instruments', task_q3: 'Call the next patient', task_q4: 'Set up the X-ray unit', task_confirm_del: 'Delete this task?',
    t_ext: '🦷 Extraction', t_endo: '🩺 Root canal', t_cons: '📋 Consult', t_pros: '💎 Prosthetics', t_white: '✨ Whitening', t_other: '📝 Other', notes_ph: 'Notes / diagnosis (optional)...', finish: '✅ Finish consultation & archive record',
    lt1: 'under a minute', min_n: '{n} min', no_nurses: 'No nurses registered yet', phone_short: 'Phone: {p}', no_results: 'No matching records', date_l: 'Date:', reason_s: 'Reason', dur_l: 'Consultation', wait_s: 'Waited', notes_l: 'Notes:',
    skip_msg: 'The nurse wants to send in ({a}) although ({b}) is before them in the queue. Allow skipping?',
    t_welcome_new: '🔔 New patient waiting', t_added: 'Added: {n}', t_enter: '🩺 Patient entering', t_entered: 'Patient sent in: {n}', t_done: '✅ Consultation finished!', t_done_msg: 'The doctor finished with {n}. You can send in the next patient.',
    t_skip_denied: 'The doctor declined to see {n} before their turn.', t_skip_sent: 'Patient is not first in the queue. Skip request sent to the doctor!', t_busy: 'The doctor is busy with another patient.', t_registered: 'Patient registered!', t_saved: 'Saved ✅',
    t_deleted: 'Deleted.', t_finished: 'Consultation finished and archived! ✅', t_nurse_added: 'Nurse added 👩‍⚕️', t_copied: 'Copied ✅', t_img_ok: 'Images added 📷', t_img_fail: 'Some images could not be uploaded',
    c_del_patient: 'Delete this patient?', c_del_nurse: "Delete this nurse's account?", c_del_arch: 'Permanently delete this archive record?', c_restore: 'Current patients and archive will be replaced by the backup. Continue?',
    c_wipe: 'All patients, archive and images will be permanently deleted. Enter the doctor password to confirm:', c_delacc: 'Your account and all its data will be permanently deleted. Enter the doctor password to confirm:', restored: 'Restored: {p} waiting, {a} archive records',
    cam_not_ready: 'Camera not ready yet', pass_mismatch: 'Passwords do not match', bad_year: 'Check patient name and birth year (1900 – {y})', notif_on: 'Notifications enabled', notif_denied: 'Notifications are blocked in browser settings', push_on: '✅ Enabled on this device', push_off: '⚠️ Not enabled — tap “Enable” to receive alerts while the app is closed', push_blocked: '⛔ Blocked — allow notifications in the site/system settings', push_ios: 'ℹ️ On iPhone: add the app to the Home Screen (Share → Add to Home Screen), open it, then enable alerts', push_unsupported: 'ℹ️ This browser does not support system notifications', push_fail: 'Could not enable notifications, please retry', install_done: '✅ The app is installed and runs standalone', install_ready: 'Tap “Install” to add it to your home screen and open it as a standalone app', install_ios: 'On iPhone/iPad: tap Share in Safari, then “Add to Home Screen”', install_manual: 'From the browser menu ⋮ choose “Install app” or “Add to Home screen”. (Requires HTTPS)', tr_add: '＋ Add treatment', tr_name_ph: 'Treatment name', tr_hint: 'Add your treatments, or edit their names and prices, or delete them. This list appears in the consultation screen. Existing archive records are not changed.', tr_last: 'At least one treatment must remain', e_duplicate: 'Duplicate treatment name', tr_empty_name: 'Enter a name for every treatment', tr_up: 'Up', tr_down: 'Down', tr_del: 'Delete',
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
const REASON_TREAT = { 'قلع أسنان': 'قلع', 'علاج عصب (قناة الجذر)': 'علاج عصب', 'استشارة وطوارئ': 'استشارة', 'تركيب وجسور': 'جلسة تركيب', 'تبييض وتنظيف': 'تبييض أسنان', 'إجراء طبي آخر': 'أخرى' };
const TREAT_I18N = { 'قلع': 't_ext', 'علاج عصب': 't_endo', 'استشارة': 't_cons', 'جلسة تركيب': 't_pros', 'تبييض أسنان': 't_white', 'أخرى': 't_other' };
const TREATS = [['قلع', 't_ext'], ['علاج عصب', 't_endo'], ['استشارة', 't_cons'], ['جلسة تركيب', 't_pros'], ['تبييض أسنان', 't_white'], ['أخرى', 't_other']];

/* ===================== الحالة ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

const settings = Object.assign({ darkMode: false, theme: 'sky', lang: 'ar', sound: true, autoQr: true }, jget('cc_settings', {}));
const S = { token: localStorage.getItem('cc_token') || '', me: null, patients: [], skipRequests: [], stamp: 0, es: null, retry: 0, treatment: 'قلع', treatments: [], archive: { items: [], total: 0 }, archOffset: 0, nurses: [], activePid: null, qrPid: null, installEvt: null, shownSkip: '', config: null, schedule: null, schedSig: '' };
const YEAR = new Date().getFullYear();

const t = (k, v) => { let s = (L[settings.lang] && L[settings.lang][k]) || L.ar[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
Object.assign(L.ar, { ae_title: 'تصحيح سجل الأرشيف ✏️', ae_name: 'الاسم', ae_year: 'سنة الميلاد', ae_phone: 'الهاتف', ae_treats: 'العلاجات (افصل بينها بـ +)', ae_price: 'السعر', ae_paid: 'المدفوع', ae_follow: 'زيارة متابعة', ae_hint: 'تغيير «المدفوع» يستبدل سجل الدفعات بدفعة واحدة بالمبلغ الجديد. الصور والوصفة لا تتغيّر.' });
Object.assign(L.en, { ae_title: 'Correct archive record ✏️', ae_name: 'Name', ae_year: 'Birth year', ae_phone: 'Phone', ae_treats: 'Treatments (separate with +)', ae_price: 'Price', ae_paid: 'Paid', ae_follow: 'Follow-up visit', ae_hint: 'Changing "Paid" replaces the payment history with one payment of the new amount. Images and prescription are unchanged.' });
Object.assign(L.ar, { dlg_ok: 'موافق', lock_ask: '🔒 هذا القسم محميّ. أدخل كلمة مرور الطبيب:', e_locked: 'محميّ بكلمة المرور', prot_title: '🔒 حماية الأرشيف والتعديلات', prot_on: 'الحماية مفعّلة — اضغط للإيقاف', prot_off: 'الحماية معطّلة — اضغط للتفعيل', prot_pw_on: 'أدخل كلمة مرور الطبيب لتفعيل الحماية:', prot_pw_off: 'أدخل كلمة مرور الطبيب لإيقاف الحماية:', prot_hint: 'عند التفعيل يطلب البرنامج كلمة مرور الطبيب لفتح الأرشيف أو سجل المريض أو تعديل السجلات وحذفها وتسجيل الدفعات وتصدير النسخ الاحتياطية. يبقى الفتح صالحاً 10 دقائق من آخر استعمال.' });
Object.assign(L.en, { dlg_ok: 'OK', lock_ask: '🔒 This section is protected. Enter the doctor password:', e_locked: 'Password protected', prot_title: '🔒 Archive & edits protection', prot_on: 'Protection is ON — tap to turn off', prot_off: 'Protection is OFF — tap to turn on', prot_pw_on: 'Enter the doctor password to turn protection on:', prot_pw_off: 'Enter the doctor password to turn protection off:', prot_hint: 'When on, the app asks for the doctor password to open the archive or a patient history, edit or delete records, add payments or export backups. Unlock stays valid 10 minutes after last use.' });
Object.assign(L.ar, { pay_ledger: '💵 سجل الدفعات', pay_for: 'عن زيارة' }); Object.assign(L.en, { pay_ledger: '💵 Payments ledger', pay_for: 'for visit' });
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
  if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden || S.pushOk) return;
  const o = { body, icon: 'icons/icon-192.png', tag: 'calm-clinic', dir: 'auto' };
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistration)
    navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(title, o) : new Notification(title, o)).catch(() => {});
  else try { new Notification(title, o); } catch (e) {}
}
function openModal(id) { $('#' + id).classList.add('active'); }
function closeModals() { const pf = $('form[data-form=prices]'); if (pf && pf.closest('.modal-overlay.active')) { delete pf.dataset.dirty; renderPriceForm(); }
  $$('.modal-overlay.active').forEach(m => { if (m.id !== 'skipQueueModal') m.classList.remove('active'); }); closeCamera(); }
function showScreen(id) { $$('.screen').forEach(s => s.classList.remove('active')); $('#' + id).classList.add('active'); }
function setOnline(on) { document.body.classList.toggle('offline', !on); }
const fmtMin = m => (m < 1 ? t('lt1') : t('min_n', { n: m }));
const waitText = ts => fmtMin(Math.floor((Date.now() - ts) / 60000));

/* ===================== API ===================== */
/* ===== نوافذ حوار داخل البرنامج (بديل confirm/prompt الخاصة بالمتصفح) ===== */
function appDialog({ msg, input, def, pass }) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal-overlay active'; m.style.zIndex = 30000;
    m.innerHTML = `<div class="modal-card" style="max-width:420px" role="dialog" aria-modal="true"><div style="white-space:pre-line;line-height:1.7;font-size:15px;margin-bottom:12px">${esc(msg)}</div>${input ? `<input class="app-dlg-in" type="${pass ? 'password' : 'text'}" value="${esc(def == null ? '' : def)}"${pass ? ' autocomplete="current-password"' : ''} style="width:100%;box-sizing:border-box;margin-bottom:12px">` : ''}<div style="display:flex;gap:10px"><button type="button" class="btn-primary" data-d="ok">${t('dlg_ok')}</button><button type="button" class="btn-action btn-red" style="width:35%" data-d="no">${t('cancel')}</button></div></div>`;
    const inp = m.querySelector('input'), no = input ? null : false, val = () => input ? inp.value : true;
    const done = v => { document.removeEventListener('keydown', key, true); m.remove(); res(v); };
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(no); } else if (e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); e.stopPropagation(); done(val()); } };
    m.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-d]'); if (b) done(b.dataset.d === 'ok' ? val() : no); else if (e.target === m) done(no); });
    document.addEventListener('keydown', key, true); document.body.appendChild(m); const f = inp || m.querySelector('[data-d=ok]'); f.focus(); if (inp) inp.select();
  });
}
const appConfirm = msg => appDialog({ msg });
const appPrompt = (msg, def, pass) => appDialog({ msg, input: true, def, pass });

async function api(method, path, body, opt = {}) {
  const h = {}; if (S.token && !opt.anon) h.Authorization = 'Bearer ' + S.token; if (S.unlock) h['X-Unlock'] = S.unlock;
  let b; if (opt.raw) { h['Content-Type'] = 'image/jpeg'; b = opt.raw; } else if (opt.text) { h['Content-Type'] = 'application/json'; b = opt.text; } else if (body !== undefined) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body); }
  let r; try { r = await fetch(path, { method, headers: h, body: b }); } catch (e) { throw Object.assign(new Error('network'), { code: 'network' }); }
  if (opt.blob && r.ok) return r.blob();
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) {
    if (r.status === 401 && S.token && !opt.anon) forceLogout();
    if (r.status === 423 && !opt.noUnlock) {   // محميّ بكلمة المرور: نطلبها داخل البرنامج ثم نعيد الطلب
      S.unlock = ''; const pw = await appPrompt(t('lock_ask'), '', true);
      if (pw) { try { const u = await api('POST', '/api/clinic/unlock', { password: pw }, { noUnlock: true }); S.unlock = u.token; return api(method, path, body, opt); } catch (e) { if (e.code === 'locked') throw e; throw e; } }
    }
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
    setHero();
    $('#clinicCodeShow').textContent = S.me.code || '------';
    showScreen('doctorScreen'); docTab(startTab(['waiting', 'consultation', 'addPatientDoc', 'archive', 'stats'], 'waiting'));
  } else {
    setHero();
    showScreen('nurseScreen'); nurseTab('patientsNurse');
  }
  connect(); renderAll(); requestNotifOnce(); pushSync();
}
async function logout() {
  await pushOff();
  try { await api('POST', '/api/logout'); } catch (e) {}
  forceLogout(true);
}
function forceLogout(silent) {
  if (S.es) { S.es.close(); S.es = null; }
  S.token = ''; S.unlock = ''; S.me = null; S.patients = []; S.tasks = []; S.tasksSeen = null; renderTasks(); setBadge(0); localStorage.removeItem('cc_token'); delete document.body.dataset.role; closeModals(); closeCamera();
  $('#skipQueueModal').classList.remove('active'); S.shownSkip = '';
  showScreen('authScreen'); setOnline(true);
  if (!silent) toast(t('e_unauthorized'), 'warning');
}

/* ===================== المزامنة الفورية ===================== */
function applyState(st, force) {
  if (!force && st.serverTime < S.stamp) return;
  S.stamp = st.serverTime; S.patients = st.patients; S.tasks = st.tasks || []; S.skipRequests = st.skipRequests || []; if (st.schedule) S.schedule = st.schedule;
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
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.token) { if (!S.es) { S.retry = 0; connect(); } refresh(); pushSync(); } });
window.addEventListener('focus', () => { if (S.token) refresh(); });
window.addEventListener('online', () => { if (S.token) { if (!S.es) connect(); refresh(); } });
async function refresh() { try { applyState(await api('GET', '/api/state')); renderAll(); } catch (e) {} }

let lastOwnAdd = 0;
function onNotify(n) {
  if (!S.me) return;
  if (S.me.role === 'doctor') {
    if (n.type === 'add' && Date.now() - lastOwnAdd > 3000) { beep(800, 0.4); visualAlert(t('t_welcome_new'), t('t_added', { n: n.name })); sysNotify(t('app_title'), t('t_added', { n: n.name })); }
    else if (n.type === 'task_done') { beep(900, 0.4); toast(t('task_finished') + ' ' + n.by + ': ' + n.text, 'success'); sysNotify(t('task_finished'), n.by + ': ' + n.text); }
    else if (n.type === 'enter') { docTab('consultation'); beep(700, 0.3); visualAlert(t('t_enter'), t('t_entered', { n: n.name })); }
  } else {
    if (n.type === 'finish') { beep(900, 0.5); visualAlert(t('t_done'), t('t_done_msg', { n: n.name }), true); sysNotify(t('t_done'), t('t_done_msg', { n: n.name })); }
    else if (n.type === 'task') sysNotify(t('task_new'), n.text);
    else if (n.type === 'skip_denied') { beep(500, 0.3); toast(t('t_skip_denied', { n: n.name }), 'warning'); }
  }
}

/* ===================== العرض ===================== */
function renderAll() {
  if (!S.me) return;
  const waiting = S.patients.filter(p => p.status === 'waiting');
  $('#waitingCount').textContent = waiting.length; $('#nurseWaitingBadge').textContent = waiting.length; setBadge(waiting.length); syncSchedule(); updateRegGate();
  renderTasks(); if (S.me.role === 'nurse') renderNurseList(); else { renderDocWaiting(); renderConsultation(); renderSkip(); }
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
  list.innerHTML = w.length ? w.map(p => `<li class="patient-card" data-act="patHistory" data-name="${esc(p.name)}" data-year="${p.birthYear}"><div><span class="queue-badge">#${r++}</span><strong style="font-size:15px">${esc(p.name)}</strong> <span class="badge">${esc(reasonL(p.reason))}</span>
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${patientMeta(p)}</div><div class="note-line">${t('ticket_no')} ${p.ticketNo} · ⏳ <span data-wait="${p.createdAt}">${waitText(p.createdAt)}</span></div></div>
    <div class="actions"><button type="button" class="btn-action btn-green" data-act="enter" data-id="${p.id}">${t('call')}</button><button type="button" class="btn-action btn-qr" data-act="showQr" data-id="${p.id}">${t('qr')}</button>
    <button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${p.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delPatient" data-id="${p.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('empty_wait')}</li>`;
}
function renderConsultation() {
  const area = $('#consultationArea'), a = S.patients.find(p => p.status === 'in');
  $('#consultationNavBtn').classList.toggle('has-patient', !!a);
  const sig = a ? a.id + ':' + a.images.join(',') + ':' + settings.lang + ':' + a.reason : '';
  if (area.dataset.sig === sig) return;
  const samePid = area.dataset.pid === (a ? a.id : ''), notes = samePid && $('#consultNotes') ? $('#consultNotes').value : '';
  if (!samePid) { S.treatments = [(a && REASON_TREAT[a.reason]) || 'أخرى']; if (a) teethInit(a); moneyReset(); if (window.rxReset) rxReset(a); }
  S.treatments = S.treatments.filter(v => treatList().includes(v)); if (!S.treatments.length) S.treatments = [treatList().includes('أخرى') ? 'أخرى' : treatList()[0]];
  if (!a) { area.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);background:var(--surface-card);border-radius:16px">${t('empty_room')}</div>`; }
  else {
    const imgs = a.images.length ? a.images.map(id => `<div class="thumb-box"><img data-rec="${a.id}" data-img="${id}" data-act="lightbox" alt=""><button type="button" class="del-img" data-act="delImage" data-id="${a.id}" data-img="${id}">✕</button></div>`).join('') : `<span style="font-size:12px;color:var(--text-muted)">${t('no_images')}</span>`;
    area.innerHTML = `<div class="consultation-card"><div class="patient-highlight-box">
      <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:20px;font-weight:600">${t('consult_patient')} ${esc(a.name)}</div><span style="display:flex;gap:8px;align-items:center"><button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${a.id}">✏️ ${t('edit')}</button><span style="background:var(--orange);padding:4px 14px;border-radius:20px;font-weight:600;font-size:13px">${t('ticket_no')} ${a.ticketNo}</span></span></div>
      <div style="margin-top:10px;padding:10px 14px;border-radius:12px;background:var(--surface-card);border-inline-start:5px solid var(--orange);font-size:15px">${t('reason_l')} <strong style="font-size:17px">${esc(reasonL(a.reason))}</strong></div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px;font-size:13px">
        <div>${t('tooth_l')} <strong>${esc(a.tooth)}</strong></div><div>${t('gender_l')} <strong>${esc(genderL(a.gender))}</strong></div>
        <div>${t('birth_l')} <strong>${a.birthYear} (${a.age} ${t('years_short')})</strong></div><div>${t('phone_l')} <strong>${esc(a.phone || t('not_set'))}</strong></div><div>${t('wait_l')} <strong data-wait="${a.createdAt}">${waitText(a.createdAt)}</strong></div></div></div>
      <div style="background:var(--surface-sunk);border:1px dashed var(--border-calm);padding:16px;border-radius:12px;margin-bottom:20px"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:8px">${t('xrays')}</label>
        <div class="patient-images-container">${imgs}</div>
        <div style="display:flex;gap:10px;margin-top:12px"><button type="button" class="btn-action btn-green" style="flex:1" data-act="openCamera" data-id="${a.id}">${t('cam_live')}</button><button type="button" class="btn-action btn-yellow" style="flex:1" data-act="pickFile" data-id="${a.id}">${t('upload_gal')}</button></div></div>
      ${teethHTML()}
      <label style="font-size:13px;font-weight:600;color:var(--text-secondary)">${t('pick_treat')}</label><div class="hint" style="margin:2px 0 6px">${t('pick_treat_multi')}</div>
      <div class="treatment-grid">${treatList().map(v => `<div class="treatment-item ${S.treatments.includes(v) ? 'selected' : ''}" role="checkbox" aria-checked="${S.treatments.includes(v)}" data-act="treat" data-v="${esc(v)}">${esc(treatLabel(v))}</div>`).join('')}</div>
      ${moneyHTML()}
      ${window.rxHTML ? rxHTML() : ''}
      <textarea id="consultNotes" maxlength="2000" placeholder="${esc(t('notes_ph'))}" style="height:80px;margin-bottom:15px"></textarea>
      <button type="button" class="btn-primary btn-green" data-act="finish" data-id="${a.id}" style="padding:16px;font-size:16px">${t('finish')}</button></div>`;
    if (notes) $('#consultNotes').value = notes;
    recalc(); if (!samePid) loadAccount(a);
    hydrate(area); if (window.rxMount) rxMount(a);
  }
  area.dataset.sig = sig; area.dataset.pid = a ? a.id : '';
}
/* ===== مهام الطبيب للممرضة (فقاعات) ===== */
S.tasks = []; S.tasksSeen = null;
const taskTime = ts => new Date(ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
function renderTasks() {
  const box = $('#taskBubbles'), fab = $('#taskFabBadge'); if (!box) return;
  const pending = (S.tasks || []).filter(k => !k.done);
  if (!S.me) { box.innerHTML = ''; box.dataset.sig = ''; return; }
  if (S.me.role === 'nurse') {
    const list = pending.slice().sort((a, b) => a.createdAt - b.createdAt), sig = list.map(k => k.id).join(',') + settings.lang;
    const fresh = S.tasksSeen ? list.filter(k => !S.tasksSeen.has(k.id)) : [];
    if (fresh.length) { beep(880, 0.25); setTimeout(() => beep(1175, 0.3), 260); try { navigator.vibrate && navigator.vibrate([300, 120, 300]); } catch (e) {} }
    S.tasksSeen = new Set(list.map(k => k.id).concat([...(S.tasksSeen || [])]));
    if (box.dataset.sig === sig) return; box.dataset.sig = sig;
    const doc = t('hero_doc', { n: S.me.doctorName || '' }), newIds = new Set(fresh.map(k => k.id));
    box.innerHTML = list.map(k => `<div class="tbub${newIds.has(k.id) ? ' is-new' : ''}" role="alert"><div class="tbub-av">🩺</div><div class="tbub-body"><div class="tbub-from">${esc(doc)} · ${taskTime(k.createdAt)}</div><div class="tbub-text">${esc(k.text)}</div><button type="button" class="tbub-ok" data-act="taskDone" data-id="${k.id}">${t('task_ok')}</button></div></div>`).join('');
    box.scrollTop = box.scrollHeight; return;
  }
  box.innerHTML = ''; box.dataset.sig = '';
  if (fab) { fab.textContent = pending.length; fab.hidden = !pending.length; }
  const ul = $('#taskList'); if (ul && $('#tasksModal.active')) renderTaskList();
}
function renderTaskList() {
  const ul = $('#taskList'); if (!ul) return;
  ul.innerHTML = (S.tasks || []).length ? S.tasks.map(k => `<li class="task-item${k.done ? ' done' : ''}"><div class="ti-main"><div class="ti-text">${esc(k.text)}</div><div class="ti-meta">${k.done ? '✅ ' + esc(t('task_done_by', { n: k.doneBy })) + ' · ' + taskTime(k.doneAt) : '⏳ ' + esc(t('task_pending'))} · ${esc(k.to ? t('task_to_n', { n: k.toName || '—' }) : t('task_all'))} · ${taskTime(k.createdAt)}</div></div><button type="button" class="btn-action btn-red" data-act="taskDel" data-id="${k.id}" title="${esc(t('task_del'))}" aria-label="${esc(t('task_del'))}">✕</button></li>`).join('') : `<li class="task-empty">${t('task_empty')}</li>`;
}
async function openTasks() {
  const sel = $('#taskTo'), keep = sel.value;
  $('#taskChips').innerHTML = [1, 2, 3, 4].map(i => `<button type="button" class="chip" data-act="taskQuick" data-k="task_q${i}">${esc(t('task_q' + i))}</button>`).join('');
  sel.innerHTML = `<option value="all">${esc(t('task_all'))}</option>`; renderTaskList(); openModal('tasksModal');
  try { const ns = await api('GET', '/api/nurses'); sel.innerHTML = `<option value="all">${esc(t('task_all'))}</option>` + ns.map(n => `<option value="${esc(n.id)}">${esc(n.name)}</option>`).join(''); if ([...sel.options].some(o => o.value === keep)) sel.value = keep; } catch (e) {}
}
/* ===== الأسعار والحساب المالي ===== */
const CATS = ['base', 'front', 'pre', 'molar', 'wisdom'];
/* قائمة العلاجات يعدّلها الطبيب من الإعدادات؛ الافتراضية تُترجَم، والمخصّصة تُعرض بأسمائها */
const treatList = () => (S.me && S.me.prices && S.me.prices.treatments && S.me.prices.treatments.length) ? S.me.prices.treatments : TREATS.map(x => x[0]);
const treatLabel = v => TREAT_I18N[v] ? t(TREAT_I18N[v]) : v;
function fillTreatFilter() {
  const sel = $('#aTreat'); if (!sel || !S.me || S.me.role !== 'doctor') return; const v = sel.value, sig = treatList().join('\u0001') + settings.lang;
  if (sel.dataset.sig === sig) return; sel.dataset.sig = sig;
  sel.innerHTML = `<option value="" data-i18n="all_treat">${esc(t('all_treat'))}</option>` + treatList().map(k => `<option value="${esc(k)}">${esc(treatLabel(k))}</option>`).join(''); const keep = treatList().includes(v) ? v : ''; sel.value = keep;
  if (v && !keep && $('#archiveTab.active')) loadArchive(true);   // العلاج المحدَّد في الفلتر حُذف
}
const cur = () => (S.me && S.me.prices && S.me.prices.currency) || '';
const money = v => v == null ? '' : Number(v).toLocaleString(settings.lang === 'en' ? 'en-US' : 'ar-u-nu-latn') + (cur() ? ' ' + cur() : '');
const toothCat = n => { n = +n; const d = n % 10, q = Math.floor(n / 10); if (d === 8 && q < 5) return 'wisdom'; return d <= 3 ? 'front' : (q >= 5 ? 'molar' : d <= 5 ? 'pre' : 'molar'); };
/* سعر العلاج: إن وُجدت أسعار حسب نوع السن يُجمع سعر كل سن، وإلا السعر العام */
function priceFor(tr, teeth) {
  const p = S.me && S.me.prices, e = p && p.list[tr]; if (!e) return { total: '', parts: [] };
  const perTooth = ['front', 'pre', 'molar', 'wisdom'].some(c => e[c] != null);
  if (!perTooth || !teeth.length) return { total: e.base != null ? e.base : '', parts: [] };
  const parts = teeth.slice().sort().map(n => { const c = toothCat(n); return { n, c, v: e[c] != null ? e[c] : (c === 'wisdom' && e.molar != null ? e.molar : (e.base || 0)) }; });
  return { total: Math.round(parts.reduce((x, y) => x + y.v, 0) * 100) / 100, parts };
}
function treatRowHTML(v, vals) {
  const o = vals || {};
  return `<div class="treat-row" ${v ? `data-orig="${esc(v)}"` : ''}><div class="treat-head"><input type="text" class="treat-name" maxlength="40" placeholder="${esc(t('tr_name_ph'))}" value="${esc(v ? treatLabel(v) : '')}">
    <button type="button" class="btn-action" data-act="moveTreat" data-d="-1" title="${esc(t('tr_up'))}" aria-label="${esc(t('tr_up'))}">▲</button><button type="button" class="btn-action" data-act="moveTreat" data-d="1" title="${esc(t('tr_down'))}" aria-label="${esc(t('tr_down'))}">▼</button><button type="button" class="btn-action btn-red" data-act="delTreat" title="${esc(t('tr_del'))}" aria-label="${esc(t('tr_del'))}">✕</button></div>
    <div class="price-grid">${CATS.map(c => `<label><span>${t('price_cat_' + c)}</span><input type="number" min="0" step="any" inputmode="decimal" data-cat="${c}" value="${o[c] != null ? o[c] : ''}" placeholder="0"></label>`).join('')}</div></div>`;
}
function renderPriceForm() {
  fillTreatFilter();
  const f = $('form[data-form=prices]'); if (!f || !S.me || S.me.role !== 'doctor') return;
  if (f.contains(document.activeElement) || f.dataset.dirty) return;   // لا نمحو تعديلات لم تُحفظ
  const L2 = S.me.prices.list;
  $('.priceRows', f).innerHTML = treatList().map(v => treatRowHTML(v, L2[v])).join('') + `<div class="hint" style="margin-bottom:6px">${t('prices_hint2')}</div>`;
  $('.priceCur', f).value = cur();
}
document.addEventListener('input', ev => { const f = ev.target.closest && ev.target.closest('form[data-form=prices]'); if (f) f.dataset.dirty = '1'; });
/* حالة المال في المعاينة */
const prevBal = () => (S.account && S.account.balance) || 0;
function moneyReset() { S.price = ''; S.paid = ''; S.priceDirty = false; S.paidDirty = false; S.followUp = false; S.account = null; }
/* سعر عدة علاجات: مجموع سعر كل علاج مختار (كلٌّ يُسعَّر بحسب الأسنان المحددة) */
function priceForMany(trs, teeth) {
  const items = trs.map(n => { const r = priceFor(n, teeth); return { name: n, price: r.total === '' ? 0 : r.total, has: r.total !== '', parts: r.parts }; });
  const any = items.some(i => i.has);
  return { total: any ? Math.round(items.reduce((x, y) => x + y.price, 0) * 100) / 100 : '', items };
}
function recalc() {
  const auto = S.followUp ? { total: 0, items: [] } : priceForMany(S.treatments, [...S.teeth]); S.items = auto.items;
  if (!S.priceDirty) S.price = auto.total === '' ? '' : String(auto.total);
  const due = +S.price || 0;
  if (!S.paidDirty) S.paid = S.followUp ? (prevBal() ? String(prevBal()) : '') : (S.price === '' ? '' : String(due));
  const set = (id, v) => { const e = $(id); if (e && e !== document.activeElement) e.value = v; };
  set('#consultPrice', S.price); set('#consultPaid', S.paid);
  const hint = $('#priceHint'); if (hint) hint.innerHTML = auto.items.length && !S.priceDirty && auto.items.some(i => i.has) ? auto.items.map(i => `<span class="ph-item"><b>${esc(treatLabel(i.name))}</b>${i.parts.length ? ` <small>(${i.parts.map(x => x.n + ' ' + t('price_cat_' + x.c)).join('، ')})</small>` : ''} ${money(i.price)}</span>`).join(' + ') + (auto.items.length > 1 ? ` <span class="ph-total">= <b>${money(auto.total)}</b></span>` : '') : '';
  const after = Math.round((prevBal() + due - (+S.paid || 0)) * 100) / 100, sum = $('#moneySum');
  if (sum) { const over = (+S.paid || 0) > due + prevBal(); sum.innerHTML = `${t('after_l')} <b style="color:${after > 0 ? 'var(--danger-soft,#e8607a)' : 'var(--success,#2e9e6b)'}">${money(Math.max(0, after))}</b>${over ? `<div style="color:var(--warning-warm);font-size:12px;margin-top:4px">${t('over_warn')}</div>` : ''}`; }
}
function moneyHTML() {
  const ac = S.account, has = ac && ac.records && ac.records.length;
  const acct = has ? `<div class="acct-box"><div class="acct-head"><strong>${t('acct_title')}</strong>${ac.balance > 0 ? `<span class="acct-debt">${t('acct_prev')} <b>${money(ac.balance)}</b></span>` : ''}</div>
    ${ac.records.filter(r => r.remaining > 0).map(r => `<div class="acct-row"><span>${esc(r.treatment)}${r.tooth ? ' · ' + esc(r.tooth) : ''} · ${new Date(r.finishedAt).toLocaleDateString(locale())}</span><span>${t('paid_l')} ${money(r.paid)} / ${money(r.price)}</span></div>`).join('')}
    <label class="acct-follow"><input type="checkbox" data-act="followUp" ${S.followUp ? 'checked' : ''} style="width:auto"> ${t('follow_l')}</label></div>` : '';
  return acct + `<div class="money-box">
    <div class="money-row"><label>${t('due_l')}${cur() ? ' (' + esc(cur()) + ')' : ''}</label><input type="number" id="consultPrice" min="0" step="any" inputmode="decimal" placeholder="0" value="${esc(String(S.price))}" data-input="price"></div>
    <div id="priceHint" class="price-hint"></div>
    <div class="money-row"><label>${t('paid_now')}</label><input type="number" id="consultPaid" min="0" step="any" inputmode="decimal" placeholder="0" value="${esc(String(S.paid))}" data-input="paid"></div>
    <div class="money-quick"><button type="button" data-act="payQuick" data-v="all">${t('pay_all')}</button><button type="button" data-act="payQuick" data-v="half">${t('pay_half')}</button><button type="button" data-act="payQuick" data-v="zero">${t('pay_zero')}</button></div>
    <div id="moneySum" class="money-sum"></div></div>`;
}
async function loadAccount(a) {
  try { const r = await api('GET', `/api/account?name=${encodeURIComponent(a.name)}&year=${a.birthYear}`); if (!S.me || $('#consultationArea').dataset.pid !== a.id) return; S.account = r; recalc(); if (r.records.length) { const c = $('#consultationArea'); c.dataset.sig = ''; renderAll(); } } catch (e) {}
}
/* ===== مخطط الأسنان (FDI) ===== */
const TEETH = { adult: { up: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28], lo: [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38] }, child: { up: [55,54,53,52,51,61,62,63,64,65], lo: [85,84,83,82,81,71,72,73,74,75] } };
const ALL_TEETH = new Set([].concat(...Object.values(TEETH).map(x => x.up.concat(x.lo))).map(String));
S.teeth = new Set(); S.teethSet = 'adult'; moneyReset();
function teethInit(a) { S.teeth = new Set(String(a.tooth || '').match(/\d{2}/g) ? String(a.tooth).match(/\d{2}/g).filter(x => ALL_TEETH.has(x)) : []); S.teethSet = [...S.teeth].some(x => +x >= 51 && +x <= 85) && ![...S.teeth].some(x => +x <= 48) ? 'child' : (a.age <= 5 ? 'child' : 'adult'); }
function teethHTML() {
  const set = TEETH[S.teethSet], row = arr => arr.map(n => `<button type="button" class="tooth-btn${S.teeth.has(String(n)) ? ' on' : ''}${n % 10 >= 6 && S.teethSet === 'adult' ? ' molar' : ''}" data-act="tooth" data-n="${n}">${n}</button>`).join('');
  const half = arr => `<div class="arch-half">${row(arr.slice(0, arr.length / 2))}</div><div class="arch-half">${row(arr.slice(arr.length / 2))}</div>`;
  return `<div class="teeth-box"><div class="teeth-head"><label>${t('teeth_title')}</label><div class="teeth-switch"><button type="button" data-act="teethSet" data-v="adult" class="${S.teethSet === 'adult' ? 'on' : ''}">${t('teeth_perm')}</button><button type="button" data-act="teethSet" data-v="child" class="${S.teethSet === 'child' ? 'on' : ''}">${t('teeth_prim')}</button></div></div>
    <div class="teeth-chart"><div class="teeth-lbl"><span>${t('teeth_ur')}</span><span>${t('teeth_ul')}</span></div><div class="arch">${half(set.up)}</div><div class="arch-sep"></div><div class="arch">${half(set.lo)}</div><div class="teeth-lbl"><span>${t('teeth_lr')}</span><span>${t('teeth_ll')}</span></div></div>
    <div class="teeth-sum"><span id="teethSum">${teethSumText()}</span><button type="button" class="btn-action btn-red" data-act="teethClear">${t('teeth_clear')}</button></div></div>`;
}
const teethSumText = () => S.teeth.size ? t('teeth_sel') + ' ' + [...S.teeth].sort().map(x => `<b>${x}</b>`).join(' · ') : t('teeth_none');
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
function fieldsHTML(pre) {
  const opts = REASONS.map(r => `<option value="${esc(r[0])}">${esc(settings.lang === 'en' ? r[1] : r[0])}</option>`).join('');
  return `<div class="form-group" style="position:relative"><label>${t('lbl_name')}</label><input type="text" id="${pre}Name" maxlength="80" required${pre === 'pe' ? '' : ` autocomplete="off" data-suggest="${pre}"`}><ul class="suggest-box" id="${pre}Sug" hidden></ul></div>
    <div style="display:flex;gap:12px"><div class="form-group" style="flex:1"><label>${t('lbl_birth')}</label><input type="number" id="${pre}Year" min="1900" max="${YEAR}" placeholder="1990" data-input="age" data-pre="${pre}" required><div id="${pre}Age" style="font-size:12px;color:var(--warning-warm);font-weight:600;margin-top:3px">${t('age_none')}</div></div>
    <div class="form-group" style="flex:1"><label>${t('lbl_gender')}</label><select id="${pre}Gender"><option value="ذكر">${t('male')}</option><option value="أنثى">${t('female')}</option></select></div></div>
    <div style="display:flex;gap:12px"><div class="form-group" style="flex:1"><label>${t('lbl_reason')}</label><select id="${pre}Reason">${opts}</select></div>
    <div class="form-group" style="flex:1"><label>${t('lbl_tooth')}</label><input type="text" id="${pre}Tooth" maxlength="20" placeholder="16"></div></div>
    <div class="form-group"><label>${t('lbl_phone')}</label><input type="tel" id="${pre}Phone" maxlength="25" placeholder="05xxxxxxxx"></div>`;
}
function renderPatientForms() {
  $$('form[data-form=addPatient]').forEach(f => { const keep = {}; $$('input,select', f).forEach(i => { keep[i.id] = i.value; }); $('.fields', f).innerHTML = fieldsHTML(f.dataset.pre); $$('input,select', f).forEach(i => { if (keep[i.id]) i.value = keep[i.id]; }); });
  const ef = $('#editFields'); const keep = {}; $$('input,select', ef).forEach(i => { keep[i.id] = i.value; }); ef.innerHTML = fieldsHTML('pe'); $$('input,select', ef).forEach(i => { if (keep[i.id]) i.value = keep[i.id]; });
}
/* اقتراحات المرضى السابقين: عند الاختيار تُملأ سنة الميلاد والجنس والهاتف */
const sugTimers = {}, sugData = {};
function hideSug(pre) { const b = $('#' + pre + 'Sug'); if (b) { b.hidden = true; b.innerHTML = ''; } }
document.addEventListener('input', e => {
  const el = e.target, pre = el.dataset && el.dataset.suggest; if (!pre) return;
  clearTimeout(sugTimers[pre]);
  const q = el.value.trim(); if (q.length < 2) return hideSug(pre);
  sugTimers[pre] = setTimeout(async () => {
    try {
      const r = await api('GET', '/api/suggest?q=' + encodeURIComponent(q)); if (el.value.trim() !== q) return;
      sugData[pre] = r; const b = $('#' + pre + 'Sug'); if (!b) return;
      b.innerHTML = r.map((x, i) => `<li data-sug="${i}" data-pre="${pre}"><strong>${esc(x.name)}</strong><span>${x.birthYear}${x.phone ? ' · ' + esc(x.phone) : ''}</span></li>`).join(''); b.hidden = !r.length;
    } catch (x) { hideSug(pre); }
  }, 200);
});
document.addEventListener('mousedown', e => {
  const li = e.target.closest('li[data-sug]');
  if (!li) { if (!e.target.closest('.suggest-box')) $$('.suggest-box').forEach(b => { b.hidden = true; }); return; }
  e.preventDefault();
  const pre = li.dataset.pre, x = (sugData[pre] || [])[+li.dataset.sug]; if (!x) return;
  $('#' + pre + 'Name').value = x.name; $('#' + pre + 'Year').value = x.birthYear; $('#' + pre + 'Gender').value = x.gender === 'أنثى' ? 'أنثى' : 'ذكر'; $('#' + pre + 'Phone').value = x.phone || '';
  updateAge(pre); hideSug(pre);
});
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
  const q = new URLSearchParams({ name: $('#aName').value, year: $('#aYear').value, gender: $('#aGender').value, tooth: $('#aTooth').value, treatment: $('#aTreat').value, from: $('#aFrom').value, to: $('#aTo').value, tz: new Date().getTimezoneOffset(), offset: off, limit: 30 });
  return q.toString();
}
let archTimer, archSeq = 0;
function protectUI() { const b = $('#protBtn'); if (b && S.me) { b.textContent = (S.me.protect ? '🔒 ' : '🔓 ') + t(S.me.protect ? 'prot_on' : 'prot_off'); b.classList.toggle('btn-green', !!S.me.protect); } }
function loadArchive(reset = true) {
  clearTimeout(archTimer);
  archTimer = setTimeout(async () => {
    const seq = ++archSeq, off = reset ? 0 : S.archive.items.length;
    const r = await run(() => api('GET', '/api/archive?' + archiveParams(off))); if (!r || seq !== archSeq) return;
    S.archive = { total: r.total, sum: r.sum, paidSum: r.paidSum, debt: r.debt, items: reset ? r.items : S.archive.items.concat(r.items) }; renderArchive();
  }, reset ? 250 : 0);
}
function renderArchive() {
  $('#archiveResultCount').textContent = S.archive.total; $('#archiveSum').innerHTML = S.archive.sum ? `${t('total_due')} <b>${money(S.archive.sum)}</b> · ${t('total_paid')} <b>${money(S.archive.paidSum)}</b>${S.archive.debt ? ` · ${t('total_debt')} <b style="color:var(--danger-soft,#e8607a)">${money(S.archive.debt)}</b>` : ''}` : '';
  const l = $('#archiveList');
  l.innerHTML = S.archive.items.length ? S.archive.items.map(a => `<li class="patient-card" style="align-items:flex-start" data-act="patHistory" data-name="${esc(a.name)}" data-year="${a.birthYear}"><div style="min-width:0"><strong style="font-size:15px">${esc(a.name)}</strong> ${(a.treatments || [a.treatment]).map(n => `<span class="badge">${esc(n)}</span>`).join(' ')}${a.price != null ? ` <span class="badge" style="background:color-mix(in srgb,var(--orange) 18%,transparent);color:var(--orange)">💰 ${money(a.price)}</span>` : ''}${a.remaining > 0 ? ` <span class="badge" style="background:color-mix(in srgb,var(--danger-soft,#e8607a) 20%,transparent);color:var(--danger-soft,#e8607a)">${t('rem_l')} ${money(a.remaining)}</span>` : (a.price > 0 ? ` <span class="badge" style="background:color-mix(in srgb,#2e9e6b 18%,transparent);color:#2e9e6b">✔ ${t('paid_l')}</span>` : '')}${a.followUp ? ' <span class="badge">↻</span>' : ''}
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${t('sex')}: <strong>${esc(genderL(a.gender))}</strong> | ${t('birth')}: <strong>${a.birthYear}</strong> (${a.age} ${t('years_short')}) | ${t('reason_s')}: ${esc(reasonL(a.reason))} | ${t('tooth')}: <strong style="color:var(--warning-warm)">${esc(a.tooth || '---')}</strong></div>
    ${a.notes ? `<div class="note-line">${t('notes_l')} ${esc(a.notes)}</div>` : ''}${window.rxRecHTML ? rxRecHTML(a, a) : ''}
    ${a.images.length ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${a.images.map(i => `<img data-rec="${a.id}" data-img="${i}" data-act="lightbox" style="width:42px;height:42px;border-radius:8px;object-fit:cover;cursor:pointer;background:var(--surface-sunk)" alt="">`).join('')}</div>` : ''}
    ${a.payments && a.payments.length ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:6px">${t('pays_l')} ${a.payments.map(p => money(p.amt) + ' (' + new Date(p.t).toLocaleDateString(locale()) + ')').join(' · ')}</div>` : ''}
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${t('date_l')} ${new Date(a.finishedAt).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })} · ${t('wait_s')} ${fmtMin(a.waitMin)} · ${t('dur_l')} ${fmtMin(a.durationMin)}</div></div>
    <div style="display:flex;flex-direction:column;gap:6px">${a.remaining > 0 ? `<button type="button" class="btn-action btn-green" data-act="addPayment" data-id="${a.id}" data-rem="${a.remaining}">${t('add_pay')}</button>` : ''}    <button type="button" class="btn-action btn-yellow" data-act="editArchive" data-id="${a.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delArchive" data-id="${a.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('no_results')}</li>`;
  $('#archiveMore').style.display = S.archive.items.length < S.archive.total ? '' : 'none';
  hydrate(l);
}
/* سجل المريض الكامل: من أول زيارة إلى آخرها */
async function showHistory(name, year) {
  const body = $('#historyBody'); body.innerHTML = `<div class="hint" style="text-align:center;padding:20px">…</div>`; openModal('historyModal');
  const r = await run(() => api('GET', '/api/history?name=' + encodeURIComponent(name) + '&year=' + encodeURIComponent(year)));
  if (!r) { body.innerHTML = `<div class="hint" style="text-align:center;padding:20px">${t('hist_load_fail')}</div>`; return; }
  const dt = v => v ? new Date(v).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' }) : '—', dd = v => v ? new Date(v).toLocaleDateString(locale(), { dateStyle: 'medium' }) : '—';
  const teethOf = x => (x.teeth && x.teeth.length ? x.teeth.join('، ') : (x.tooth && x.tooth !== 'غير محدد' ? x.tooth : '---'));
  const imgs = x => x.images && x.images.length ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${x.images.map(i => `<img data-rec="${x.id}" data-img="${i}" data-act="lightbox" style="width:48px;height:48px;border-radius:8px;object-fit:cover;cursor:pointer;background:var(--surface-card)" alt="">`).join('')}</div>` : '';
  const cur = r.current ? `<div class="hist-item cur"><div class="hi-date">${t('hist_cur')} · ${r.current.status === 'in' ? t('hist_in_st') : t('hist_wait_st')}</div>
      <div class="hi-line">${t('reason_s')}: ${esc(reasonL(r.current.reason))} | ${t('tooth')}: <strong>${esc(r.current.tooth || '---')}</strong> | ${t('date_l')} ${dt(r.current.createdAt)}</div>${imgs(r.current)}</div>` : '';
  const items = r.records.slice().reverse().map((x, i) => `<div class="hist-item"><div class="hi-date">${t('hist_visit_n', { n: r.records.length - i })} · ${dt(x.finishedAt)}${x.followUp ? ' · ↻' : ''}</div>
      <div class="hi-line">${(x.treatments || [x.treatment]).map(n => `<span class="badge">${esc(n)}</span>`).join(' ')} ${t('tooth')}: <strong>${esc(teethOf(x))}</strong> | ${t('reason_s')}: ${esc(reasonL(x.reason))}</div>
      ${x.price != null ? `<div class="hi-line">💰 ${money(x.price)} · ${t('paid_l')} ${money(x.paid)}${x.remaining > 0 ? ` · <b style="color:var(--danger-soft,#e8607a)">${t('rem_l')} ${money(x.remaining)}</b>` : ''}</div>` : ''}
      ${x.payments && x.payments.length ? `<div class="hi-line">${t('pays_l')} ${x.payments.map(p => money(p.amt) + ' (' + new Date(p.t).toLocaleDateString(locale()) + ')').join(' · ')}</div>` : ''}
      ${x.notes ? `<div class="hi-notes">${t('notes_l')} ${esc(x.notes)}</div>` : ''}${imgs(x)}${window.rxRecHTML ? rxRecHTML(x, r) : ''}
      <div class="hi-line" style="font-size:11px">${t('wait_s')} ${fmtMin(x.waitMin)} · ${t('dur_l')} ${fmtMin(x.durationMin)}</div></div>`).join('');
  const pays = r.records.flatMap(x => (x.payments || []).map(p => ({ t: p.t, amt: p.amt, v: x.finishedAt, n: (x.treatments || [x.treatment]).join(' + ') }))).sort((p, q) => q.t - p.t);
  const ledger = pays.length ? `<div class="hist-pays"><b>${t('pay_ledger')} (${pays.length})</b><ul>${pays.map(p => `<li><span>${dt(p.t)}</span><b>${money(p.amt)}</b><small>${t('pay_for')} ${dd(p.v)} · ${esc(p.n)}</small></li>`).join('')}</ul></div>` : '';
  body.innerHTML = `<div class="hist-sum"><div class="hs-name">${esc(r.name)}</div>
      <div class="hs-meta">${t('sex')}: <strong>${esc(genderL(r.gender))}</strong> | ${t('birth')}: <strong>${r.birthYear}</strong> (${new Date().getFullYear() - r.birthYear} ${t('years_short')})${r.phone ? ` | ☎ <span dir="ltr">${esc(r.phone)}</span>` : ''}</div>
      <div class="hist-stats"><div>${t('hist_visits')}<b>${r.visits}</b></div><div>${t('hist_first')}<b>${dd(r.firstVisit)}</b></div><div>${t('hist_last')}<b>${dd(r.lastVisit)}</b></div>
      ${r.due ? `<div>${t('total_due')}<b>${money(r.due)}</b></div><div>${t('total_paid')}<b>${money(r.paid)}</b></div>` : ''}${r.balance ? `<div>${t('total_debt')}<b style="color:var(--danger-soft,#e8607a)">${money(r.balance)}</b></div>` : ''}</div></div>
    ${ledger}
    <div class="hist-tl">${cur}${items || (cur ? '' : `<div class="hint">${t('hist_none')}</div>`)}</div>`;
  hydrate(body);
}
async function loadNurses() { const r = await run(() => api('GET', '/api/nurses')); if (r) { S.nurses = r; renderNurses(); } }
function renderNurses() {
  $('#nursesList').innerHTML = S.nurses.length ? S.nurses.map(n => `<li class="patient-card"><div><strong>👩‍⚕️ ${esc(n.name)}</strong><div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${t('phone_short', { p: esc(n.phone || '---') })}</div></div>
    <div class="actions"><button type="button" class="btn-action btn-yellow" data-act="editNurse" data-id="${n.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delNurse" data-id="${n.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('no_nurses')}</li>`;
}

/* ===================== التبويبات ===================== */
/* اختصارات الشاشة الرئيسية: /?tab=... (تُستعمل مرة واحدة عند الفتح) */
function startTab(allowed, def) { let v = ''; try { v = new URLSearchParams(location.search).get('tab') || ''; } catch (e) {} return allowed.includes(v) ? v : def; }
/* شارة أيقونة التطبيق: عدد المنتظرين */
function setBadge(n) { try { if (!navigator.setAppBadge) return; if (n > 0) navigator.setAppBadge(n).catch(() => {}); else navigator.clearAppBadge().catch(() => {}); } catch (e) {} }
/* ===== أوقات تسجيل الممرضة ===== */
function schedOpenNow(s) {
  if (!s || !s.enabled) return true;
  const d = new Date(Date.now() + s.tz * 6e4), m = d.getUTCHours() * 60 + d.getUTCMinutes();
  const [fh, fm] = s.from.split(':').map(Number), [th, tm] = s.to.split(':').map(Number);
  return s.days.includes(d.getUTCDay()) && m >= fh * 60 + fm && m < th * 60 + tm;
}
function updateRegGate() {
  if (!S.me || S.me.role !== 'nurse') return;
  const open = schedOpenNow(S.schedule), b = $('#regClosedBanner'), s = S.schedule;
  b.style.display = open ? 'none' : 'block';
  if (!open) b.textContent = t('reg_closed', { d: s.days.map(i => t('days_full')[i]).join('، '), a: s.from, b: s.to });
  const btn = $('form[data-form=addPatient][data-pre=pn] button[type=submit]'); if (btn) btn.disabled = !open;
}
setInterval(updateRegGate, 30000);
function syncSchedule() {
  const form = $('form[data-form=schedule]'), s = S.schedule;
  if (!form || !s || S.me.role !== 'doctor') return;
  const sig = JSON.stringify(s) + settings.lang; if (sig === S.schedSig || form.contains(document.activeElement)) return;
  S.schedSig = sig;
  $('.schedEnabled', form).checked = s.enabled; $('.schedFrom', form).value = s.from; $('.schedTo', form).value = s.to;
  $('.schedDays', form).innerHTML = t('days_full').map((n, i) => `<label style="display:flex;align-items:center;gap:6px;font-size:13px;background:var(--surface-sunk);padding:6px 12px;border-radius:999px"><input type="checkbox" value="${i}" style="width:auto" ${s.days.includes(i) ? 'checked' : ''}>${esc(n)}</label>`).join('');
}
function docTab(tab) {
  if (window.showHero) showHero();
  $$('#doctorScreen .tab-content').forEach(s => s.classList.remove('active')); $$('#doctorScreen .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#' + tab + 'Tab').classList.add('active');
  if (tab === 'archive') loadArchive(true); if (tab === 'nurses') loadNurses(); if (tab === 'stats' && window.loadStats) { const st = S.stats; if (st) st.data = null; loadStats(); }
}
function nurseTab(tab) {
  if (window.showHero) showHero();
  $$('#nurseScreen .tab-content').forEach(s => s.classList.remove('active')); $$('#nurseScreen .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#' + tab + 'Tab').classList.add('active');
}

/* ===================== الإعدادات ===================== */
function renderSettingsBoxes() {
  const tpl = $('#settingsTemplate').innerHTML;
  $$('.settings-container-box').forEach(b => { b.innerHTML = tpl; }); S.schedSig = ''; renderPriceForm();
  $$('.setClinicName').forEach(i => { i.value = S.me.clinicName; }); $$('.setDoctorName').forEach(i => { i.value = S.me.role === 'doctor' ? S.me.name : ''; });
}
function translate() {
  $$('[data-i18n]').forEach(e => { const k = e.dataset.i18n; if (L[settings.lang][k] != null) e.textContent = L[settings.lang][k]; });
  $$('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
}
/* ترويسة العيادة + الساعة الحيّة */
function setHero() {
  if (!S.me) return; const doc = S.me.role === 'doctor';
  const pre = doc ? 'doctor' : 'nurse';
  $('#' + pre + 'HeaderTitle').textContent = S.me.clinicName;
  $('#' + pre + (doc ? 'Subtitle' : 'UserWelcome')).textContent = doc ? t('hero_doc', { n: S.me.name }) : t('nurse_welcome', { n: S.me.name }) + (S.me.doctorName ? ' · ' + t('hero_doc', { n: S.me.doctorName }) : '');
}
function tickClock() {
  const d = new Date(), loc = settings.lang === 'en' ? 'en-GB' : 'ar-u-nu-latn';
  const hm = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: false }), s = String(d.getSeconds()).padStart(2, '0');
  const date = d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $$('.clk').forEach(c => { $('.clk-hm', c).textContent = hm; $('.clk-s', c).textContent = s; $('.clk-date', c).textContent = date; });
}
setInterval(tickClock, 1000); tickClock();
function applySettings() {
  document.body.classList.toggle('light-mode', !settings.darkMode);
  document.body.classList.remove('theme-mint', 'theme-purple', 'theme-rose'); if (settings.theme !== 'sky') document.body.classList.add('theme-' + settings.theme);
  document.documentElement.lang = settings.lang; document.documentElement.dir = settings.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('app_title');
  $$('.darkModeToggle').forEach(x => { x.checked = settings.darkMode; }); $$('.soundToggle').forEach(x => { x.checked = settings.sound; }); $$('.autoQrToggle').forEach(x => { x.checked = settings.autoQr; });
  $$('.langSelect').forEach(x => { x.value = settings.lang; });
  renderPatientForms(); translate(); renderPriceForm(); if (window.renderStats) renderStats();
  if (S.me) {
    setHero();
    const c = $('#consultationArea'); c.dataset.sig = ''; renderAll(); if (S.me.role === 'doctor') { renderArchive(); renderNurses(); }
  } else { $('#nurseHeaderTitle').textContent = t('nurse_title'); }
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(document.body).getPropertyValue('--bar').trim() || '#2E2A6E';
  jset('cc_settings', settings); updatePushStatus(); updateInstallUI(); if (S.token && settings.lang !== S.pushLang) { S.pushLang = settings.lang; pushSync(); }
}
/* ===== إشعارات النظام (Web Push) ===== */
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function pushState() {
  if (!pushSupported()) return IS_IOS ? 'ios' : 'unsupported';
  return Notification.permission === 'denied' ? 'blocked' : (Notification.permission === 'granted' && S.pushOk ? 'on' : 'off');
}
/* ===== تثبيت التطبيق ===== */
const isStandalone = () => S.installed || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches || navigator.standalone === true;
function updateInstallUI() {
  const done = isStandalone(), msg = done ? 'install_done' : S.installEvt ? 'install_ready' : IS_IOS ? 'install_ios' : 'install_manual';
  $$('.installStatus').forEach(el => { el.textContent = t(msg); });
  $$('.installBtn').forEach(b => { b.disabled = done; b.classList.toggle('btn-disabled', done); });
}
function updatePushStatus() { const el = $('#pushStatus'); if (el) { const k = pushState(); el.textContent = t('push_' + k); el.dataset.state = k; } }
const keyBytes = b64 => Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
/* يسجّل اشتراك هذا الجهاز لدى الخادم (آمن للاستدعاء مراراً: يجدّد الاشتراك عند الحاجة) */
async function pushSync(force) {
  if (!S.token || !pushSupported() || Notification.permission !== 'granted') { S.pushOk = false; return updatePushStatus(); }
  if (S.pushBusy) return; S.pushBusy = true;
  try {
    const reg = await navigator.serviceWorker.ready, key = (await api('GET', '/api/push/key')).key;
    let sub = await reg.pushManager.getSubscription();
    if (sub && sub.options && sub.options.applicationServerKey && btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== key) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
    const sig = S.token.slice(-8) + settings.lang + sub.endpoint;
    if (force || S.pushSig !== sig) { await api('POST', '/api/push/subscribe', { subscription: sub.toJSON(), lang: settings.lang }); S.pushSig = sig; }
    S.pushOk = true;
  } catch (e) { S.pushOk = false; S.pushSig = ''; }
  S.pushBusy = false; updatePushStatus();
}
async function pushOff() {
  try { if (S.token) await api('DELETE', '/api/push/subscribe'); const r = await navigator.serviceWorker.getRegistration(); const s = r && await r.pushManager.getSubscription(); if (s) await s.unsubscribe(); } catch (e) {}
  S.pushOk = false; S.pushSig = '';
}
function requestNotifOnce() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default' && !localStorage.getItem('cc_asked')) { localStorage.setItem('cc_asked', '1'); setTimeout(() => Notification.requestPermission().then(() => pushSync(true)), 1500); }
  else if (Notification.permission !== 'granted') setTimeout(() => { if (S.token && pushState() !== 'on') toast(t('push_' + pushState()), 'warning'); }, 2500);
}
async function askNotif() {
  if (!('Notification' in window)) return toast(t('push_unsupported'), 'warning');
  const r = await Notification.requestPermission(); await pushSync(true);
  if (r === 'granted' && pushState() !== 'on') toast(t('push_fail'), 'warning'); else toast(r === 'granted' ? t('notif_on') : t('notif_denied'), r === 'granted' ? 'success' : 'warning');
}
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', ev => { const d = ev.data || {}; if (d.type === 'push' || d.type === 'push-open') { if (S.token) refresh(); } });
function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }

/* ===================== الأفعال (تفويض الأحداث) ===================== */
const ACT = {
  authMode: el => authMode(el.dataset.mode), logout, closeAlert: el => el.parentElement.remove(),
  docTab: el => docTab(el.dataset.tab), nurseTab: el => nurseTab(el.dataset.tab),
  closeModal: closeModals,
  openTasks,
  taskQuick(el) { const ta = $('#taskText'); ta.value = (ta.value ? ta.value.replace(/\s+$/, '') + ' ' : '') + t(el.dataset.k); ta.focus(); },
  async taskDone(el) { el.disabled = true; const r = await run(() => api('POST', `/api/tasks/${el.dataset.id}/done`)); if (!r) { el.disabled = false; return; } S.tasks = S.tasks.filter(k => k.id !== el.dataset.id); renderTasks(); refresh(); },
  async taskDel(el) { if (!await appConfirm(t('task_confirm_del'))) return; if (await run(() => api('DELETE', `/api/tasks/${el.dataset.id}`))) { S.tasks = S.tasks.filter(k => k.id !== el.dataset.id); renderTasks(); renderTaskList(); } },
  patHistory: el => showHistory(el.dataset.name, el.dataset.year),
  openSet(el) {
    const m = el.dataset.m; if (m === 'set_clinicModal') { $$('.setClinicName').forEach(i => { i.value = S.me.clinicName; }); $$('.setDoctorName').forEach(i => { i.value = S.me.name; }); }
    if (m === 'set_pricesModal') { const f = $('form[data-form=prices]'); delete f.dataset.dirty; renderPriceForm(); }
    if (m === 'set_backupModal') protectUI();
    if (m === 'set_scheduleModal') { S.schedSig = ''; syncSchedule(); }
    openModal(m);
  }, closeLightbox: () => $('#lightboxModal').classList.remove('active'),
  lightbox: async el => { try { $('#lightboxImg').src = await imgBlobUrl(el.dataset.rec, el.dataset.img); $('#lightboxModal').classList.add('active'); } catch (e) {} },
  async enter(el) {
    const r = await run(() => api('POST', `/api/patients/${el.dataset.id}/enter`)); if (!r) return;
    if (r.skipRequested) toast(t('t_skip_sent'), 'info'); await refresh();
  },
  async skipAllow() { const id = $('#skipQueueModal').dataset.pid; $('#skipQueueModal').classList.remove('active'); await run(() => api('POST', `/api/patients/${id}/skip`, { allow: true })); refresh(); },
  async skipDeny() { const id = $('#skipQueueModal').dataset.pid; $('#skipQueueModal').classList.remove('active'); await run(() => api('POST', `/api/patients/${id}/skip`, { allow: false })); refresh(); },
  async delPatient(el) { if (!await appConfirm(t('c_del_patient'))) return; if (await run(() => api('DELETE', `/api/patients/${el.dataset.id}`))) { toast(t('t_deleted'), 'info'); refresh(); } },
  editPatient(el) {
    const p = S.patients.find(x => x.id === el.dataset.id); if (!p) return;
    $('#editPatientId').value = p.id; $('#peName').value = p.name; $('#peYear').value = p.birthYear; $('#peGender').value = p.gender; $('#peReason').value = p.reason;
    $('#peTooth').value = p.tooth === 'غير محدد' ? '' : p.tooth; $('#pePhone').value = p.phone || ''; updateAge('pe'); openModal('editPatientModal');
  },
  showQr: el => showQr(el.dataset.id), qrPrint: printQr, qrCopy: () => { const p = S.patients.find(x => x.id === S.qrPid); if (p) copyText(ticketUrl(p)); },
  qrShare: () => { const p = S.patients.find(x => x.id === S.qrPid); if (p && navigator.share) navigator.share({ title: S.me.clinicName, url: ticketUrl(p) }).catch(() => {}); },
  openCamera: el => openCamera(el.dataset.id), pickFile: el => pickFile(el.dataset.id), snap, closeCamera,
  async delImage(el) { if (await run(() => api('DELETE', `/api/patients/${el.dataset.id}/images/${el.dataset.img}`))) refresh(); },
  tooth(el) { const n = el.dataset.n; if (S.teeth.has(n)) S.teeth.delete(n); else S.teeth.add(n); el.classList.toggle('on', S.teeth.has(n)); $('#teethSum').innerHTML = teethSumText(); recalc(); },
  teethSet(el) { S.teethSet = el.dataset.v; const box = el.closest('.teeth-box'); box.outerHTML = teethHTML(); },
  teethClear() { S.teeth.clear(); $$('.tooth-btn.on').forEach(x => x.classList.remove('on')); $('#teethSum').innerHTML = teethSumText(); recalc(); },
  followUp(el) {
    S.followUp = el.checked; S.priceDirty = false; S.paidDirty = false;
    const r = el.checked && S.account && S.account.records.find(x => x.remaining > 0) || null;
    if (r) { const tl = (r.treatments || [r.treatment]).filter(x => treatList().includes(x)); if (tl.length) S.treatments = tl; S.teeth = new Set(r.teeth || []); }
    const c = $('#consultationArea'); c.dataset.sig = ''; renderAll();
  },
  payQuick(el) { const due = +S.price || 0, v = el.dataset.v; S.paid = v === 'all' ? String(Math.round((due + prevBal()) * 100) / 100) : v === 'half' ? String(Math.round(due * 50) / 100) : '0'; S.paidDirty = true; recalc(); },
  async addPayment(el) {
    const rem = +el.dataset.rem, v = await appPrompt(t('pay_prompt', { r: money(rem) }), rem); if (v == null) return;
    if (await run(() => api('POST', `/api/archive/${el.dataset.id}/payment`, { amount: v }))) { toast(t('t_paid'), 'success'); loadArchive(true); }
  },
  treat(el) { const v = el.dataset.v, i = S.treatments.indexOf(v); if (i >= 0) { if (S.treatments.length <= 1) return toast(t('pick_treat_min'), 'warning'); S.treatments.splice(i, 1); } else S.treatments.push(v); el.classList.toggle('selected', i < 0); el.setAttribute('aria-checked', String(i < 0)); recalc(); },
  async finish(el) {
    const r = await run(() => api('POST', `/api/patients/${el.dataset.id}/finish`, { treatment: S.treatments.join(' + '), treatments: S.treatments, items: (S.items || []).map(i => ({ name: i.name, price: i.price })), price: $('#consultPrice') ? $('#consultPrice').value : '', paid: $('#consultPaid') ? $('#consultPaid').value : '', followUp: S.followUp, teeth: [...S.teeth], notes: ($('#consultNotes') || {}).value || '', rx: window.rxLines ? rxLines() : [], rxHead: window.rxHeadSnap ? rxHeadSnap() : undefined })); if (!r) return; if (window.rxDone) rxDone();
    toast(t('t_finished'), 'success'); await refresh(); docTab('waiting');
  },
  copyCode: () => copyText(S.me.code || ''),
  async delNurse(el) { if (await appConfirm(t('c_del_nurse')) && await run(() => api('DELETE', `/api/nurses/${el.dataset.id}`))) { toast(t('t_deleted'), 'info'); loadNurses(); } },
  editNurse(el) { const n = S.nurses.find(x => x.id === el.dataset.id); if (!n) return; $('#editNurseId').value = n.id; $('#editNurseName').value = n.name; $('#editNursePhone').value = n.phone || ''; $('#editNursePass').value = ''; openModal('editNurseModal'); },
  editArchive(el) {
    const a = S.archive.items.find(z => z.id === el.dataset.id); if (!a) return;
    let m = $('#archEditModal'); if (m) m.remove(); m = document.createElement('div'); m.id = 'archEditModal'; m.className = 'modal-overlay';
    const f = (id, label, val, extra) => `<div class="form-group"><label>${esc(label)}</label><input id="ae${id}" value="${esc(val == null ? '' : val)}" ${extra || ''}></div>`;
    m.innerHTML = `<div class="modal-card"><h3 style="margin-bottom:12px;font-size:16px">${t('ae_title')}</h3>
      ${f('Name', t('ae_name'), a.name, 'maxlength="80"')}${f('Year', t('ae_year'), a.birthYear, 'type="number" min="1900" max="' + YEAR + '"')}
      <div class="form-group"><label>${t('sex')}</label><select id="aeGender"><option value="ذكر"${a.gender !== 'أنثى' ? ' selected' : ''}>${t('male')}</option><option value="أنثى"${a.gender === 'أنثى' ? ' selected' : ''}>${t('female')}</option></select></div>
      <div class="form-group"><label>${t('reason_s')}</label><select id="aeReason">${REASONS.map(r => `<option value="${esc(r[0])}"${a.reason === r[0] ? ' selected' : ''}>${esc(settings.lang === 'en' ? r[1] : r[0])}</option>`).join('')}</select></div>
      ${f('Tooth', t('tooth'), a.tooth === 'غير محدد' ? '' : a.tooth, 'maxlength="20"')}${f('Phone', t('ae_phone'), a.phone || '', 'type="tel" maxlength="25"')}
      ${f('Treats', t('ae_treats'), (a.treatments || [a.treatment]).join(' + '), 'maxlength="200"')}
      <div class="form-group"><label>${t('notes_l')}</label><textarea id="aeNotes" rows="3" maxlength="2000">${esc(a.notes || '')}</textarea></div>
      <div style="display:flex;gap:10px">${f('Price', t('ae_price'), a.price == null ? '' : a.price, 'type="number" min="0" step="any"')}${f('Paid', t('ae_paid'), a.paid, 'type="number" min="0" step="any"')}</div>
      <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="aeFollow"${a.followUp ? ' checked' : ''}> ${t('ae_follow')}</label>
      <div class="hint" style="margin-top:6px">${t('ae_hint')}</div>
      <div style="display:flex;gap:10px;margin-top:16px"><button type="button" class="btn-primary" data-act="editArchiveSave" data-id="${a.id}">${t('save')}</button><button type="button" class="btn-action btn-red" style="width:35%" data-act="closeModal">${t('cancel')}</button></div></div>`;
    document.body.appendChild(m); m.classList.add('active');
  },
  async editArchiveSave(el) {
    const name = $('#aeName').value.trim(), y = parseInt($('#aeYear').value);
    if (!name || !(y >= 1900 && y <= YEAR)) return toast(t('bad_year', { y: YEAR }), 'warning');
    const body = { name, birthYear: y, gender: $('#aeGender').value, reason: $('#aeReason').value, tooth: $('#aeTooth').value.trim(), phone: $('#aePhone').value.trim(),
      treatments: $('#aeTreats').value.split(/\s*[+،,]\s*/).map(x => x.trim()).filter(Boolean), notes: $('#aeNotes').value, price: $('#aePrice').value, paid: $('#aePaid').value === '' ? 0 : $('#aePaid').value, followUp: $('#aeFollow').checked };
    if (await run(() => api('PUT', `/api/archive/${el.dataset.id}`, body))) { const m = $('#archEditModal'); if (m) m.remove(); toast(t('t_saved'), 'success'); loadArchive(true); }
  },
  async delArchive(el) { if (await appConfirm(t('c_del_arch')) && await run(() => api('DELETE', `/api/archive/${el.dataset.id}`))) loadArchive(true); },
  archiveMore: () => loadArchive(false),
  archiveRange: el => {
    const iso = d => d.toLocaleDateString('en-CA'), now = new Date(), r = el.dataset.r;
    let a = '', b = '';
    if (r === 'today') a = b = iso(now);
    else if (r === 'yesterday') { const y = new Date(now); y.setDate(y.getDate() - 1); a = b = iso(y); }
    else if (r === 'week') { const w = new Date(now); w.setDate(w.getDate() - w.getDay()); a = iso(w); b = iso(now); }  // الأسبوع يبدأ الأحد
    $('#aFrom').value = a; $('#aTo').value = b; loadArchive(true);
  },
  addTreat(el) { const f = el.closest('form'); const row = document.createElement('div'); row.innerHTML = treatRowHTML('', null); const n = row.firstElementChild; $('.priceRows', f).insertBefore(n, $('.priceRows .hint', f)); f.dataset.dirty = '1'; $('.treat-name', n).focus(); n.scrollIntoView({ block: 'center' }); },
  delTreat(el) { const f = el.closest('form'); if ($$('.treat-row', f).length <= 1) return toast(t('tr_last'), 'warning'); el.closest('.treat-row').remove(); f.dataset.dirty = '1'; },
  moveTreat(el) { const row = el.closest('.treat-row'), f = el.closest('form'), d = +el.dataset.d, sib = d < 0 ? row.previousElementSibling : row.nextElementSibling; if (!sib || !sib.classList.contains('treat-row')) return; if (d < 0) sib.before(row); else sib.after(row); f.dataset.dirty = '1'; },
  setTheme: el => { settings.theme = el.dataset.theme; applySettings(); }, askNotif,
  installApp: async () => {
    if (isStandalone()) return;
    if (!S.installEvt) { toast(t(IS_IOS ? 'install_ios' : 'install_manual'), 'info'); return; }
    const e = S.installEvt; S.installEvt = null; e.prompt(); try { await e.userChoice; } catch (x) {} updateInstallUI();
  },
  async exportData() { const b = await run(() => api('GET', '/api/backup', undefined, { blob: true })); if (b) download(b, `clinic_backup_${new Date().toISOString().slice(0, 10)}.json`); },
  importData() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = async () => {
      const f = i.files[0]; if (!f || !await appConfirm(t('c_restore'))) return;
      const r = await run(async () => api('POST', '/api/restore', undefined, { text: await f.text() })); if (r) { toast(t('restored', { p: r.patients, a: r.archive }), 'success'); refresh(); loadArchive(true); }
    }; i.click();
  },
  async toggleProtect() {
    const on = !(S.me && S.me.protect), pw = await appPrompt(t(on ? 'prot_pw_on' : 'prot_pw_off'), '', true); if (!pw) return;
    const r = await run(() => api('POST', '/api/clinic/protect', { password: pw, on })); if (!r) return;
    S.me.protect = !!r.protect; S.unlock = ''; protectUI(); toast(t('t_saved'), 'success');
  },
  async wipeData() { const pw = await appPrompt(t('c_wipe'), '', true); if (!pw) return; if (await run(() => api('POST', '/api/clinic/wipe', { password: pw }))) { toast(t('t_deleted'), 'info'); refresh(); loadArchive(true); } },
  async deleteAccount() { const pw = await appPrompt(t('c_delacc'), '', true); if (!pw) return; if (await run(() => api('POST', '/api/clinic/wipe', { password: pw, account: true }))) forceLogout(true); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { if (el.tagName === 'A') e.preventDefault(); f(el, e); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.input === 'age') updateAge(el.dataset.pre);
  else if (el.dataset.input === 'archive') loadArchive(true);
  else if (el.dataset.input === 'price') { S.price = el.value; S.priceDirty = true; recalc(); }
  else if (el.dataset.input === 'paid') { S.paid = el.value; S.paidDirty = true; recalc(); }
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
  } else if (kind === 'sendTask') {
    const text = $('#taskText').value.trim(); if (!text) return;
    if (await run(() => api('POST', '/api/tasks', { text, to: $('#taskTo').value }))) { $('#taskText').value = ''; toast(t('task_sent'), 'success'); await refresh(); renderTaskList(); }
  } else if (kind === 'loginNurse') {
    jset('cc_last_n', { c: $('#nCode').value.trim(), n: $('#nName').value.trim() });
    try { await afterLogin(await api('POST', '/api/login/nurse', { code: $('#nCode').value, name: $('#nName').value, password: $('#nPass').value }, { anon: true })); } catch (x) { authError(x); }
  } else if (kind === 'register') {
    if ($('#rPass').value !== $('#rPass2').value) return void ($('#authErr').textContent = t('pass_mismatch'));
    try { await afterLogin(await api('POST', '/api/register', { clinicName: $('#rClinic').value, doctorName: $('#rDoctor').value, username: $('#rUser').value, password: $('#rPass').value, registrationCode: $('#rCode').value }, { anon: true })); } catch (x) { authError(x); }
  } else if (kind === 'addPatient') {
    const pre = f.dataset.pre, v = readPatient(pre); if (!v) return;
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
  } else if (kind === 'clinicInfo') {
    const r = await run(() => api('PUT', '/api/clinic', { clinicName: $('.setClinicName', f).value, doctorName: $('.setDoctorName', f).value }));
    if (r) { S.me = { ...S.me, ...r }; applySettings(); toast(t('t_saved'), 'success'); }
  } else if (kind === 'prices') {
    const treatments = [], list = {}, seen = new Set();
    for (const row of $$('.treat-row', f)) {
      const name = $('.treat-name', row).value.trim().replace(/\s+/g, ' '), orig = row.dataset.orig;
      if (!name) { toast(t('tr_empty_name'), 'danger'); return; }
      const key = orig && name === treatLabel(orig) ? orig : name;   // الاسم الافتراضي غير المعدَّل يحتفظ بمفتاحه الأصلي
      if (seen.has(key.toLowerCase())) { toast(t('e_duplicate'), 'danger'); return; } seen.add(key.toLowerCase());
      treatments.push(key); $$('input[data-cat]', row).forEach(i => { if (i.value !== '') (list[key] = list[key] || {})[i.dataset.cat] = i.value; });
    }
    if (!treatments.length) { toast(t('tr_last'), 'danger'); return; }
    const r = await run(() => api('PUT', '/api/prices', { currency: $('.priceCur', f).value, list, treatments }));
    if (r) { S.me.prices = r; delete f.dataset.dirty; toast(t('t_prices_saved'), 'success'); S.treatments = S.treatments.filter(v => treatList().includes(v)); if (!S.treatments.length) S.treatments = [treatList()[0]]; fillTreatFilter(); renderPriceForm(); recalc(); const c = $('#consultationArea'); if (c) c.dataset.sig = ''; renderAll(); closeModals(); }
  } else if (kind === 'schedule') {
    const days = $$('.schedDays input:checked', f).map(x => +x.value), enabled = $('.schedEnabled', f).checked;
    if (enabled && !days.length) { toast(t('e_invalid_input'), 'danger'); return; }
    const r = await run(() => api('PUT', '/api/schedule', { enabled, days, from: $('.schedFrom', f).value, to: $('.schedTo', f).value, tz: -new Date().getTimezoneOffset() }));
    if (r) { S.schedule = r; S.schedSig = ''; syncSchedule(); toast(t('t_sched_saved'), 'success'); }
  } else if (kind === 'changePass') {
    if (await run(() => api('POST', '/api/account/password', { oldPassword: $('.oldPass', f).value, newPassword: $('.newPass', f).value }))) { f.reset(); toast(t('t_saved'), 'success'); }
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); $('#lightboxModal').classList.remove('active'); } });
document.addEventListener('click', e => { if (e.target.classList && e.target.classList.contains('modal-overlay') && e.target.id !== 'skipQueueModal' && !(e.target.querySelector('form[data-dirty]') || e.target.querySelector('form[data-form=prices][data-dirty]'))) closeModals(); });

/* ===================== التثبيت وبدء التشغيل ===================== */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; updateInstallUI(); });
window.addEventListener('appinstalled', () => { S.installEvt = null; S.installed = true; updateInstallUI(); });
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

/* ===== ترويسة ذكية (جوال): إخفاء عند التمرير لأسفل، وإظهار عند التمرير لأعلى أو عند أعلى الصفحة ===== */
(function smartHeader() {
  const mq = window.matchMedia('(max-width:700px)');
  ['doctorScreen', 'nurseScreen'].forEach(id => {
    const sc = document.getElementById(id), hero = sc && sc.querySelector('.hero'); if (!hero) return;
    let last = 0, acc = 0, tick = false;
    const show = () => hero.classList.remove('hide');
    sc.addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        tick = false; const y = sc.scrollTop, d = y - last; last = y;
        if (!mq.matches || y < 0) return show();           // مطاطية iOS أو شاشة كبيرة
        if (y <= 24) { acc = 0; return show(); }
        if (sc.scrollHeight - sc.clientHeight < 160) return show();   // محتوى قصير: لا داعي للإخفاء
        if ((d > 0) !== (acc > 0)) acc = 0; acc += d;       // تجميع الاتجاه لتجاهل الاهتزازات الصغيرة
        if (acc > 12 && y > 80) hero.classList.add('hide'); else if (acc < -8) show();
      });
    }, { passive: true });
    mq.addEventListener && mq.addEventListener('change', show);
    new MutationObserver(show).observe(sc, { attributes: true, attributeFilter: ['class'] });   // عند فتح/إغلاق الشاشة
  });
  window.showHero = () => document.querySelectorAll('#doctorScreen>.hero,#nurseScreen>.hero').forEach(h => h.classList.remove('hide'));
})();
