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
    settings_title: 'إعدادات التطبيق ⚙️', set_manage: 'إدارة العيادة', teeth_map: '🦷 مخطط أسنان المريض', teeth_map_ext: 'مقلوع', teeth_map_trt: 'تمّ علاجه', teeth_map_none: 'لا توجد أسنان مسجّلة بعد', hist_title: '📋 سجل المريض', hist_first: 'أول زيارة', hist_last: 'آخر زيارة', hist_visits: 'عدد الزيارات', hist_none: 'لا توجد زيارات منتهية مسجّلة لهذا المريض بعد.', hist_cur: 'الزيارة الحالية', hist_wait_st: 'ينتظر', hist_in_st: 'في المعاينة', hist_load_fail: 'تعذّر تحميل السجل', hist_visit_n: 'زيارة {n}', set_appearance: 'المظهر والألوان', dark_mode: 'الوضع الداكن', theme_color: 'لون العيادة', set_lang: 'اللغة', app_lang: 'لغة التطبيق',
    set_sound: 'التنبيهات', sound_alerts: 'التنبيهات الصوتية', auto_qr: 'إظهار QR بعد تسجيل المريض', sys_notif: 'إشعارات النظام', sys_notif_sub: 'تصلك التنبيهات حتى لو كان التطبيق مغلقاً أو الشاشة مقفلة', enable: 'تفعيل',
    install_app: 'تثبيت التطبيق', install_sub: 'يُفتح كتطبيق مستقل على الجوال أو الحاسوب', install: 'تثبيت', set_clinic: 'بيانات العيادة', chg_pass: 'تغيير كلمة المرور',
    old_pass: 'كلمة المرور الحالية', new_pass: 'كلمة المرور الجديدة (8 أحرف فأكثر)', change: 'تغيير', chg_pass_hint: 'ستُغلق جلسات باقي الأجهزة.', set_backup: 'النسخ الاحتياطي', set_schedule: 'تسجيل الممرضة للمرضى', sched_enable: 'تقييد وقت التسجيل', sched_enable_sub: 'عند الإيقاف تسجّل الممرضة في أي وقت', sched_days: 'الأيام المسموحة:', sched_from: 'من الساعة:', sched_to: 'إلى الساعة:', sched_hint: 'خارج هذه الأيام والأوقات لا تستطيع الممرضة تسجيل مرضى جدد، أما أنت فتسجّل في أي وقت.', days_full: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], reg_closed: '⏰ التسجيل مغلق حالياً. أوقات التسجيل: {d} من {a} إلى {b}', e_registration_closed: 'التسجيل مغلق خارج الأوقات التي حدّدها الطبيب', t_sched_saved: 'تم حفظ أوقات التسجيل',
    export_data: 'تصدير نسخة 📥', import_data: 'استعادة 📤', backup_hint: 'النسخة تشمل المرضى والأرشيف والصور (دون كلمات المرور).', wipe_data: 'حذف جميع بيانات المرضى…', delete_account: 'حذف الحساب نهائياً…',
    // ديناميكية
    lbl_name: 'اسم المريض:', lbl_birth: 'سنة الازدياد:', lbl_gender: 'الجنس:', lbl_reason: 'سبب الزيارة:', lbl_tooth: 'السن (اختياري):', lbl_phone: 'رقم الهاتف (اختياري):',
    age_fmt: 'العمر: {n} سنة', age_none: 'العمر: --', years_short: 'سنة', doc_title: 'لوحة الطبيب 🔔', doc_sub: 'إشراف عام وعيادة مباشرة', nurse_title: 'شاشة الممرضة', nurse_welcome: 'الممرضة: {n}',
    hero_doc: 'د. {n}', price_cat_base: 'عام', price_cat_front: 'أمامية', price_cat_pre: 'ضواحك', price_cat_molar: 'أضراس', price_cat_wisdom: 'ضرس العقل', prices_hint2: 'اترك «أمامية/ضواحك/أضراس/ضرس العقل» فارغة ليُطبَّق سعر «عام» مهما كان السن. وإن ملأتها يُحسب سعر كل سن بحسب نوعه ويُجمع (القواطع والأنياب = أمامية، الأضراس اللبنية = أضراس، الأسنان 18/28/38/48 = ضرس العقل، وإن تركتها فارغة يُطبَّق سعر «أضراس»).', due_l: 'المستحق', paid_now: 'المدفوع الآن', pay_all: 'سداد كل المتبقي', pay_half: 'النصف', pay_zero: 'لا شيء', acct_title: '💼 حساب المريض', acct_prev: 'متبقٍّ من زيارات سابقة:', follow_l: 'حصة متابعة لعلاج سابق (بدون سعر جديد)', after_l: 'المتبقي بعد هذه الزيارة:', over_warn: '⚠️ المدفوع أكبر من المستحق والمتبقي السابق، ولن يُحتسب الفائض.', rem_l: 'متبقٍّ', paid_l: 'مدفوع', add_pay: 'إضافة دفعة', pay_prompt: 'مبلغ الدفعة (المتبقي: {r}):\nأي زيادة تسدّد ديوناً أخرى للمريض ثم تُودَع في وعائه.', t_paid: 'تم تسجيل الدفعة ✅', pays_l: 'الدفعات:', total_due: 'المستحق:', total_paid: 'المحصَّل:', total_debt: 'المتبقي:',  set_prices: '💰 قائمة الأسعار', prices_hint: 'سعر كل علاج. يظهر تلقائياً في المعاينة ويمكنك تعديله لكل مريض.', currency_l: 'العملة (اختياري):', price_l: 'السعر', price_total: 'الإجمالي:', t_prices_saved: 'تم حفظ الأسعار ✅', teeth_title: '🦷 مخطط الأسنان (اختر السن المعالج)', teeth_perm: 'أسنان دائمة (بالغ)', teeth_prim: 'أسنان لبنية (طفل)', teeth_sel: 'المحدد:', teeth_none: 'لم يُحدَّد سن', teeth_clear: 'مسح', teeth_ur: 'علوي أيمن', teeth_ul: 'علوي أيسر', teeth_lr: 'سفلي أيمن', teeth_ll: 'سفلي أيسر', doc_sub2: '{c} — {n}', in_room: 'في المعاينة 🩺', enter: 'دخول', edit: 'تعديل', del: 'حذف', call: 'استدعاء 🩺', qr: 'QR', doctor_word: 'طبيب', ticket_no: 'تذكرة',
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
    e_unauthorized: 'انتهت الجلسة، سجّل الدخول من جديد', e_reg_closed: 'التسجيل مغلق على هذا الخادم', e_pending: 'حسابك بانتظار موافقة مالك التطبيق. سيُفعَّل بعد القبول.', e_suspended: 'هذا الحساب موقوف. تواصل مع مالك التطبيق.', e_too_many_pending: 'عدد طلبات التسجيل المعلّقة كبير، حاول لاحقاً', reg_pending: 'تم استلام طلبك ✅ حسابك بانتظار موافقة مالك التطبيق، ثم تستطيع الدخول.', e_bad_code: 'رمز التسجيل غير صحيح', e_busy: 'الطبيب مشغول حالياً بمعاينة مريض آخر.', e_not_found: 'العنصر غير موجود (ربما حُذف)',
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
    settings_title: 'App settings ⚙️', set_manage: 'Clinic management', teeth_map: '🦷 Patient dental chart', teeth_map_ext: 'Extracted', teeth_map_trt: 'Treated', teeth_map_none: 'No teeth recorded yet', hist_title: '📋 Patient record', hist_first: 'First visit', hist_last: 'Last visit', hist_visits: 'Visits', hist_none: 'No completed visits recorded for this patient yet.', hist_cur: 'Current visit', hist_wait_st: 'Waiting', hist_in_st: 'In consultation', hist_load_fail: 'Could not load the record', hist_visit_n: 'Visit {n}', set_appearance: 'Appearance', dark_mode: 'Dark mode', theme_color: 'Theme color', set_lang: 'Language', app_lang: 'Interface language',
    set_sound: 'Notifications', sound_alerts: 'Sound alerts', auto_qr: 'Show QR after registering a patient', sys_notif: 'System notifications', sys_notif_sub: 'Alerts reach you even when the app is closed or the screen is locked', enable: 'Enable',
    install_app: 'Install app', install_sub: 'Opens as a standalone app on phone or computer', install: 'Install', set_clinic: 'Clinic info', chg_pass: 'Change password',
    old_pass: 'Current password', new_pass: 'New password (8+ chars)', change: 'Change', chg_pass_hint: 'Other devices will be signed out.', set_backup: 'Backup', set_schedule: 'Nurse patient registration', sched_enable: 'Restrict registration times', sched_enable_sub: 'When off, nurses can register at any time', sched_days: 'Allowed days:', sched_from: 'From:', sched_to: 'To:', sched_hint: 'Outside these days and times nurses cannot register new patients. You can always register.', days_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], reg_closed: '⏰ Registration is closed right now. Hours: {d}, {a} to {b}', e_registration_closed: 'Registration is closed outside the hours set by the doctor', t_sched_saved: 'Registration hours saved',
    export_data: 'Export backup 📥', import_data: 'Restore 📤', backup_hint: 'Includes patients, archive and images (not passwords).', wipe_data: 'Delete all patient data…', delete_account: 'Delete account permanently…',
    lbl_name: 'Patient name:', lbl_birth: 'Birth year:', lbl_gender: 'Gender:', lbl_reason: 'Reason for visit:', lbl_tooth: 'Tooth (optional):', lbl_phone: 'Phone (optional):',
    age_fmt: 'Age: {n}', age_none: 'Age: --', years_short: 'y', doc_title: 'Doctor panel 🔔', doc_sub: 'Supervision & direct clinic', nurse_title: 'Nurse screen', nurse_welcome: 'Nurse: {n}',
    hero_doc: 'Dr. {n}', price_cat_base: 'General', price_cat_front: 'Front', price_cat_pre: 'Premolar', price_cat_molar: 'Molar', price_cat_wisdom: 'Wisdom', prices_hint2: 'Leave Front/Premolar/Molar/Wisdom empty to use the General price for any tooth. If filled, each tooth is priced by its type and summed (incisors & canines = Front, primary molars = Molar, teeth 18/28/38/48 = Wisdom; if Wisdom is empty the Molar price applies).', due_l: 'Amount due', paid_now: 'Paid now', pay_all: 'Pay all outstanding', pay_half: 'Half', pay_zero: 'None', acct_title: '💼 Patient account', acct_prev: 'Outstanding from earlier visits:', follow_l: 'Follow-up session of an earlier treatment (no new charge)', after_l: 'Outstanding after this visit:', over_warn: '⚠️ Paid exceeds what is due plus earlier balance; the excess is ignored.', rem_l: 'Outstanding', paid_l: 'Paid', add_pay: 'Add payment', pay_prompt: 'Payment amount (outstanding: {r}):\nAny excess pays the patient\'s other debts, then goes to the wallet.', t_paid: 'Payment recorded ✅', pays_l: 'Payments:', total_due: 'Due:', total_paid: 'Collected:', total_debt: 'Outstanding:',  set_prices: '💰 Price list', prices_hint: 'Price of each treatment. It appears in the consultation and can be changed per patient.', currency_l: 'Currency (optional):', price_l: 'Price', price_total: 'Total:', t_prices_saved: 'Prices saved ✅', teeth_title: '🦷 Tooth chart (select treated tooth)', teeth_perm: 'Permanent (adult)', teeth_prim: 'Primary (child)', teeth_sel: 'Selected:', teeth_none: 'No tooth selected', teeth_clear: 'Clear', teeth_ur: 'Upper right', teeth_ul: 'Upper left', teeth_lr: 'Lower right', teeth_ll: 'Lower left', doc_sub2: '{c} — {n}', in_room: 'In consultation 🩺', enter: 'Enter', edit: 'Edit', del: 'Delete', call: 'Call in 🩺', qr: 'QR', doctor_word: 'Doctor', ticket_no: 'Ticket',
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
    e_unauthorized: 'Session expired, please sign in again', e_reg_closed: 'Registration is closed on this server', e_pending: 'Your account is waiting for the app owner\'s approval.', e_suspended: 'This account is suspended. Contact the app owner.', e_too_many_pending: 'Too many pending requests, try later', reg_pending: 'Request received ✅ Your account is waiting for the app owner\'s approval, then you can sign in.', e_bad_code: 'Wrong registration code', e_busy: 'The doctor is busy with another patient.', e_not_found: 'Item not found (maybe deleted)',
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

const settings = Object.assign({ darkMode: false, theme: 'sky', themeColor: '', lang: 'ar', sound: true, autoQr: true }, jget('cc_settings', {}));
/* لون التطبيق: لون واحد يُشتقّ منه كل شيء (الشريط والخلفيات والبطاقات والحدود والنصوص) في الوضعين الفاتح والداكن */
const THEMES = { sky: '#2E2A6E', mint: '#1F6F78', purple: '#7B2D6E', rose: '#A8324A', green: '#1E7A4C', blue: '#1D5FB4', brown: '#8A4A1C', slate: '#3A4A5C' };
const themeHex = () => /^#[0-9a-f]{6}$/i.test(settings.themeColor) ? settings.themeColor : (THEMES[settings.theme] || THEMES.sky);
function hexHsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; const l = (mx + mn) / 2; return { h: Math.round(h * 60), s: d ? d / (1 - Math.abs(2 * l - 1)) * 100 : 0, l: l * 100 }; }
function paletteFor(hex, dark) {
  const { h, s: s0, l } = hexHsl(hex), s = Math.max(28, Math.min(80, s0)), H = (x, sat, lig, a) => `hsl(${(h + x + 360) % 360} ${sat}% ${lig}%${a != null ? ' / ' + a : ''})`;
  const base = l > 36 ? H(0, s, 30) : hex;   // لون الشريط والأزرار الرئيسية: غامق دائماً ليبقى النص الأبيض واضحاً
  if (dark) return { '--bar': H(0, 45, 11), '--g1': H(0, 32, 20), '--g2': H(0, 32, 15), '--g3': H(0, 38, 11), '--bg-calm': H(0, 32, 15), '--surface-calm': H(0, 34, 13), '--surface-card': H(0, 30, 20), '--surface-input': H(0, 34, 13), '--surface-sunk': H(0, 32, 16),
    '--border-calm': H(0, 40, 80, .30), '--primary-sage': H(0, Math.max(s, 70), 76), '--on-primary': H(0, 50, 10), '--accent-soft': H(0, 70, 74), '--text-primary': '#FFFFFF', '--text-secondary': H(0, 35, 88), '--text-muted': H(0, 25, 76), '--shadow-calm': '0 10px 24px -14px rgba(0,0,0,.75)', '--auth1': H(-12, 30, 26), '--auth2': H(0, 35, 19), '--auth3': H(0, 40, 13), '--hl1': H(-12, 30, 28), '--hl2': H(0, 40, 20) };
  return { '--bar': base, '--g1': H(-10, 50, 95), '--g2': H(0, 42, 91), '--g3': H(10, 40, 87), '--bg-calm': H(0, 42, 91), '--surface-calm': H(0, 40, 95), '--surface-card': '#FFFFFF', '--surface-input': '#FFFFFF', '--surface-sunk': H(0, 36, 93),
    '--border-calm': H(0, 40, 22, .30), '--primary-sage': base, '--on-primary': '#FFFFFF', '--accent-soft': H(0, s, 38), '--text-primary': H(0, 50, 9), '--text-secondary': H(0, 32, 22), '--text-muted': H(0, 22, 33), '--shadow-calm': `0 10px 24px -14px ${H(0, 50, 20, .5)}`, '--auth1': H(-12, 30, 32), '--auth2': H(0, 36, 25), '--auth3': H(0, 42, 18), '--hl1': H(-12, 30, 34), '--hl2': base };
}
function applyPalette() { const b = document.body, p = paletteFor(themeHex(), settings.darkMode); for (const k in p) b.style.setProperty(k, p[k]); }
const S = { token: localStorage.getItem('cc_token') || '', me: null, patients: [], skipRequests: [], stamp: 0, es: null, retry: 0, treatment: 'قلع', treatments: [], archive: { items: [], total: 0 }, archOffset: 0, nurses: [], activePid: null, qrPid: null, installEvt: null, shownSkip: '', config: null, schedule: null, schedSig: '' };
const YEAR = new Date().getFullYear();

const t = (k, v) => { let s = (L[settings.lang] && L[settings.lang][k]) || L.ar[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
Object.assign(L.ar, { ae_title: 'تصحيح سجل الأرشيف ✏️', ae_name: 'الاسم', ae_year: 'سنة الميلاد', ae_phone: 'الهاتف', ae_treats: 'العلاجات (افصل بينها بـ +)', ae_price: 'السعر', ae_paid: 'المدفوع', ae_follow: 'زيارة متابعة', ae_hint: 'تغيير «المدفوع» يستبدل سجل الدفعات بدفعة واحدة بالمبلغ الجديد. الصور والوصفة لا تتغيّر.' });
Object.assign(L.en, { ae_title: 'Correct archive record ✏️', ae_name: 'Name', ae_year: 'Birth year', ae_phone: 'Phone', ae_treats: 'Treatments (separate with +)', ae_price: 'Price', ae_paid: 'Paid', ae_follow: 'Follow-up visit', ae_hint: 'Changing "Paid" replaces the payment history with one payment of the new amount. Images and prescription are unchanged.' });
Object.assign(L.ar, { dlg_ok: 'موافق', lock_ask: '🔒 هذا القسم محميّ. أدخل كلمة مرور الطبيب:', e_locked: 'محميّ بكلمة المرور', prot_title: '🔒 حماية الأرشيف والتعديلات', prot_on: 'الحماية مفعّلة — اضغط للإيقاف', prot_off: 'الحماية معطّلة — اضغط للتفعيل', prot_pw_on: 'أدخل كلمة مرور الطبيب لتفعيل الحماية:', prot_pw_off: 'أدخل كلمة مرور الطبيب لإيقاف الحماية:', prot_hint: 'عند التفعيل يطلب البرنامج كلمة مرور الطبيب لفتح الأرشيف أو سجل المريض أو تعديل السجلات وحذفها وتسجيل الدفعات وتصدير النسخ الاحتياطية. يبقى الفتح صالحاً 10 دقائق من آخر استعمال.' });
Object.assign(L.en, { dlg_ok: 'OK', lock_ask: '🔒 This section is protected. Enter the doctor password:', e_locked: 'Password protected', prot_title: '🔒 Archive & edits protection', prot_on: 'Protection is ON — tap to turn off', prot_off: 'Protection is OFF — tap to turn on', prot_pw_on: 'Enter the doctor password to turn protection on:', prot_pw_off: 'Enter the doctor password to turn protection off:', prot_hint: 'When on, the app asks for the doctor password to open the archive or a patient history, edit or delete records, add payments or export backups. Unlock stays valid 10 minutes after last use.' });
Object.assign(L.ar, { debt_note: 'تنبيه: على هذا المريض متبقٍّ غير مدفوع قدره {x}', pay_recv: 'سدّد دَين الحصة {n} ({tr})', wal_chk: 'الدفع من الوعاء', rc_price: 'سعر هذه الحصة', rc_wallet: 'من الوعاء', rc_cash: 'نقداً', rc_left: 'المتبقي من هذه الحصة', rc_to_debt: 'الزيادة تسدّد دَيناً سابقاً', rc_to_wal: 'الزيادة تُودَع في الوعاء', rc_all_debt: 'مجموع ديون المريض بعد الحصة', pay_src_q: 'سداد {a} — من أين؟', pay_ledger: '💵 سجل الدفعات', pay_for: 'عن الحصة', pay_same: 'في نفس الحصة', pay_in_visit: 'في الحصة {n} ({d})', pay_later: 'لاحقاً من الأرشيف', pay_cash: 'دفعة نقدية', pay_wallet: 'من الوعاء', pay_cut_wal: 'اقتُطع من الوعاء', snd_test: 'تجربة النغمات', snd_names: ['مريض جديد', 'دخول المعاينة', 'انتهاء المعاينة', 'مهمة جديدة', 'إنجاز مهمة', 'طلب تخطي', 'رفض الطلب', 'حان دور المريض'], paid_full: 'مدفوع بالكامل', follow_b: 'حصة متابعة', wal_bal_b: 'رصيد الوعاء', treat_l: 'العلاج:', pay_dep: 'إيداع في الوعاء', pay_out: 'استرجاع نقدي من الوعاء', pay_dep_in: 'أثناء الحصة {n} ({d})', pay_dep_manual: 'إيداع مباشر',
  wal_title: 'وعاء المريض', wal_bal: 'الرصيد:', wal_use: 'اقتطاع من الوعاء', wal_dep: 'إيداع في الوعاء', wal_out: 'استرجاع نقدي', wal_dep_q: 'مبلغ الإيداع في وعاء المريض:', wal_out_q: 'المبلغ المسترجع نقداً للمريض:', wal_saved: 'تم تحديث الوعاء ✅', wal_excess: 'الفائض {x} يُودَع في وعاء المريض', wal_after: 'رصيد الوعاء بعد الحصة:', pay_from_wal_q: 'سداد الدفعة من وعاء المريض (الرصيد {w})؟\nموافق = من الوعاء · إلغاء = نقداً', e_wallet_empty: 'لا يوجد رصيد في الوعاء', e_wallet_short: 'المبلغ أكبر من رصيد الوعاء', hist_wallet: 'الوعاء' });
Object.assign(L.ar, { pat_debt: 'دين المريض', pl_title: 'خطة علاج اليوم', pl_none: 'لا توجد بنود. اختر السن والعلاج في الأعلى.', pl_session_n: 'الحصة {n} من {m}', pl_total: 'السعر الكلي للعلاج', pl_sess_1: 'حصة واحدة', pl_sess_2: 'حصتان', pl_split_hint: 'يُقسَّم السعر بين الحصتين: يُقترح دفع {a} اليوم والباقي في الحصة الثانية (يمكنك تغيير المبلغ).', pl_one_hint: 'يُدفع كامل السعر في هذه الحصة.', pl_pay_now: 'يُدفع اليوم', pl_left_after: 'المتبقي من هذا البند بعد اليوم', pl_all: 'الكل', pl_half: 'النصف', pl_zero: '٠', pl_del: 'إزالة البند', pl_prev_title: 'متبقٍّ سابق وخطط جارية', pl_next_session: 'الحصة القادمة {n} من {m}', pl_go: '▶ متابعة اليوم', pl_close: 'إغلاق الخطة', pl_close_q: 'إغلاق هذه الخطة؟ لن تُطلب لها حصص أخرى، ويبقى متبقّيها ديناً يمكن سداده لاحقاً.', pl_closed_t: 'أُغلقت الخطة', pl_tr_missing: 'العلاج «{n}» غير موجود في قائمة العلاجات؛ أضفه من الإعدادات أولاً', pl_sum_today: 'قيمة بنود اليوم', pl_sum_paid: 'المدفوع اليوم', pl_sum_wal: 'من الوعاء', pl_sum_cash: 'نقداً', pl_sum_after: 'المتبقي على المريض بعد هذه الزيارة', e_plan_closed: 'هذه الخطة مكتملة أو مغلقة' });
Object.assign(L.en, { debt_note: 'Note: this patient has an unpaid balance of {x}', pay_recv: 'paid the debt of session {n} ({tr})', wal_chk: 'Pay from wallet', rc_price: 'This session price', rc_wallet: 'From wallet', rc_cash: 'Cash', rc_left: 'Left for this session', rc_to_debt: 'Excess pays an earlier debt', rc_to_wal: 'Excess goes to wallet', rc_all_debt: 'Total patient debt after', pay_src_q: 'Pay {a} — from where?', pay_ledger: '💵 Payments ledger', pay_for: 'for session', pay_same: 'same session', pay_in_visit: 'in session {n} ({d})', pay_later: 'later, from archive', pay_cash: 'Cash payment', pay_wallet: 'From wallet', pay_cut_wal: 'Deducted from wallet', snd_test: 'Preview sounds', snd_names: ['New patient', 'Patient entered', 'Consultation finished', 'New task', 'Task done', 'Skip request', 'Request denied', 'Patient turn'], paid_full: 'Fully paid', follow_b: 'Follow-up session', wal_bal_b: 'Wallet balance', treat_l: 'Treatment:', pay_dep: 'Wallet deposit', pay_out: 'Cash refund from wallet', pay_dep_in: 'during session {n} ({d})', pay_dep_manual: 'direct deposit',
  wal_title: 'Patient wallet', wal_bal: 'Balance:', wal_use: 'Deduct from wallet', wal_dep: 'Deposit to wallet', wal_out: 'Cash refund', wal_dep_q: 'Amount to deposit in the patient wallet:', wal_out_q: 'Amount refunded in cash to the patient:', wal_saved: 'Wallet updated ✅', wal_excess: 'The excess {x} goes to the patient wallet', wal_after: 'Wallet balance after this session:', pay_from_wal_q: 'Pay from the patient wallet (balance {w})?\nOK = wallet · Cancel = cash', e_wallet_empty: 'The wallet is empty', e_wallet_short: 'Amount exceeds the wallet balance', hist_wallet: 'Wallet' });
Object.assign(L.en, { pat_debt: 'Patient debt', pl_title: "Today's treatment plan", pl_none: 'No items. Pick the tooth and treatment above.', pl_session_n: 'Session {n} of {m}', pl_total: 'Total treatment price', pl_sess_1: 'One session', pl_sess_2: 'Two sessions', pl_split_hint: 'The price is split between the two sessions: {a} is suggested today, the rest in session 2 (you can change the amount).', pl_one_hint: 'The full price is paid in this session.', pl_pay_now: 'Pay today', pl_left_after: 'Left on this item after today', pl_all: 'All', pl_half: 'Half', pl_zero: '0', pl_del: 'Remove item', pl_prev_title: 'Previous balance & ongoing plans', pl_next_session: 'Next: session {n} of {m}', pl_go: '▶ Continue today', pl_close: 'Close plan', pl_close_q: 'Close this plan? No more sessions will be expected and its remaining amount stays as a debt to settle later.', pl_closed_t: 'Plan closed', pl_tr_missing: 'The treatment "{n}" is not in your treatment list; add it in settings first', pl_sum_today: "Today's items value", pl_sum_paid: 'Paid today', pl_sum_wal: 'From wallet', pl_sum_cash: 'Cash', pl_sum_after: 'Patient balance after this visit', e_plan_closed: 'This plan is complete or closed' });
Object.assign(L.ar, { set_prices: '💰 الحصص والأسعار', prices_hint: 'لكل علاج: عدد حصصه وسعره. يظهر تلقائياً في المعاينة ويمكنك تعديله لكل مريض، وإضافة حصة أثناء العلاج.', pl_sess_n: 'عدد الحصص', pl_add_sess: 'إضافة حصة', pl_sess_added: 'أُضيفت حصة إلى العلاج ✅', e_max_sessions: 'بلغ العلاج أقصى عدد من الحصص (12)',
  pl_split_hint: 'يُقسَّم السعر على {m} حصص: يُقترح دفع {a} اليوم والباقي في الحصص التالية (يمكنك تغيير المبلغ).' });
Object.assign(L.en, { set_prices: '💰 Sessions & prices', prices_hint: 'Sessions count and price for each treatment. Shown automatically in the consultation (editable per patient); you can add a session mid-treatment.', pl_sess_n: 'Number of sessions', pl_add_sess: 'Add a session', pl_sess_added: 'Session added to the treatment ✅', e_max_sessions: 'Treatment reached the maximum of 12 sessions',
  pl_split_hint: 'The price is split over {m} sessions: {a} is suggested today, the rest in the following sessions (you can change the amount).' });
Object.assign(L.ar, { theme_custom: 'لون مخصّص' });
Object.assign(L.en, { theme_custom: 'Custom color' });
Object.assign(L.ar, { col_on_l: 'تلوين السن', col_part_l: 'أثناء العلاج', col_done_l: 'عند الاكتمال', col_hint: 'لكل علاج: لون السن أثناء العلاج (حصص متبقية) ولونه عند اكتمال الحصص، ويظهران في مخطط الأسنان بالمعاينة وفي سجل المريض.' });
Object.assign(L.en, { col_on_l: 'Color the tooth', col_part_l: 'In progress', col_done_l: 'Completed', col_hint: 'Per treatment: tooth color while sessions remain and once completed; shown in the consultation tooth chart and the patient record.' });
Object.assign(L.ar, { money_all: 'الكل (مدينون ودائنون وغيرهم)', money_debtors: '🔴 المدينون (عليهم متبقٍّ)', money_creditors: '🟢 الدائنون (رصيدهم في الوعاء)', money_wal_sum: 'مجموع أرصدة الوعاء:' });
Object.assign(L.en, { money_all: 'All (debtors, creditors, others)', money_debtors: '🔴 Debtors (owe a balance)', money_creditors: '🟢 Creditors (wallet balance)', money_wal_sum: 'Total wallet balances:' });
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
function unlockAudio() { try { window.UISound && UISound.unlock(); } catch (e) {} }
document.addEventListener('click', unlockAudio, { passive: true });
/* نغمات الواجهة: انظر sounds.js (name: add | enter | finish | task | taskdone | skip | denied | turn) */
function chime(name) { if (!settings.sound) return; try { window.UISound && UISound.play(name); } catch (e) {} }
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
function appDialog({ msg, input, def, pass, num, okL, noL, cancelL }) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal-overlay active'; m.style.zIndex = 30000;
    m.innerHTML = `<div class="modal-card" style="max-width:420px" role="dialog" aria-modal="true"><div style="white-space:pre-line;line-height:1.7;font-size:15px;margin-bottom:12px">${esc(msg)}</div>${input ? `<input class="app-dlg-in" type="${pass ? 'password' : num ? 'number' : 'text'}"${num ? ` step="any" min="0" inputmode="decimal" aria-label="${esc(msg)}"` : ''} value="${esc(def == null ? '' : def)}"${pass ? ' autocomplete="current-password"' : ''} style="width:100%;box-sizing:border-box;margin-bottom:12px">` : ''}<div style="display:flex;gap:10px"><button type="button" class="btn-primary" data-d="ok">${esc(okL || t('dlg_ok'))}</button>${cancelL ? `<button type="button" class="btn-primary btn-green" data-d="no">${esc(noL)}</button><button type="button" class="btn-action btn-red" style="width:30%" data-d="cx">${t('cancel')}</button>` : `<button type="button" class="btn-action btn-red" style="width:35%" data-d="no">${esc(noL || t('cancel'))}</button>`}</div></div>`;
    const inp = m.querySelector('input'), no = input || cancelL ? null : false, val = () => input ? inp.value : true;
    const done = v => { document.removeEventListener('keydown', key, true); m.remove(); res(v); };
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(no); } else if (e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); e.stopPropagation(); done(val()); } };
    m.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-d]'); if (b) done(b.dataset.d === 'ok' ? val() : b.dataset.d === 'no' && cancelL ? false : no); else if (e.target === m) done(no); });
    document.addEventListener('keydown', key, true); document.body.appendChild(m); const f = inp || m.querySelector('[data-d=ok]'); f.focus(); if (inp) inp.select();
  });
}
const appConfirm = msg => appDialog({ msg });
const appPrompt = (msg, def, pass, num) => appDialog({ msg, input: true, def, pass, num });

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
  $('#authErr').textContent = ''; $('#authErr').classList.remove('ok');
}
function authError(e) { const x = $('#authErr'); x.classList.remove('ok'); x.textContent = errMsg(e); }
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
  es.addEventListener('state', ev => { applyState(JSON.parse(ev.data)); renderSoon(); });
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
    if (n.type === 'add' && Date.now() - lastOwnAdd > 3000) { chime('add'); visualAlert(t('t_welcome_new'), t('t_added', { n: n.name })); sysNotify(t('app_title'), t('t_added', { n: n.name })); }
    else if (n.type === 'task_done') { chime('taskdone'); toast(t('task_finished') + ' ' + n.by + ': ' + n.text, 'success'); sysNotify(t('task_finished'), n.by + ': ' + n.text); }
    else if (n.type === 'enter') { docTab('consultation'); chime('enter'); visualAlert(t('t_enter'), t('t_entered', { n: n.name })); }
  } else {
    if (n.type === 'finish') { chime('finish'); visualAlert(t('t_done'), t('t_done_msg', { n: n.name }), true); sysNotify(t('t_done'), t('t_done_msg', { n: n.name })); }
    else if (n.type === 'task') sysNotify(t('task_new'), n.text);
    else if (n.type === 'skip_denied') { chime('denied'); toast(t('t_skip_denied', { n: n.name }), 'warning'); }
  }
}

/* ===================== العرض ===================== */
let rsT = 0;
function renderSoon() { if (rsT) return; rsT = requestAnimationFrame(() => { rsT = 0; renderAll(); }); }
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
  const html = w.length ? w.map(p => `<li class="patient-card${p.debt > 0 ? ' has-debt' : p.wallet > 0 ? ' has-wallet' : ''}" data-act="patHistory" data-name="${esc(p.name)}" data-year="${p.birthYear}"><div><span class="queue-badge">#${r++}</span><strong style="font-size:15px">${esc(p.name)}</strong> <span class="badge">${esc(reasonL(p.reason))}</span>${p.debt > 0 ? ` <span class="badge debt-badge">⚠️ ${t('rem_l')} ${money(p.debt)}</span>` : ''}
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${patientMeta(p)}</div><div class="note-line">${t('ticket_no')} ${p.ticketNo} · ⏳ <span data-wait="${p.createdAt}">${waitText(p.createdAt)}</span></div></div>
    <div class="actions"><button type="button" class="btn-action btn-green" data-act="enter" data-id="${p.id}">${t('call')}</button><button type="button" class="btn-action btn-qr" data-act="showQr" data-id="${p.id}">${t('qr')}</button>
    <button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${p.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delPatient" data-id="${p.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('empty_wait')}</li>`;
  if (list._h !== html) { list._h = html; list.innerHTML = html; }
}
/* شريط اسم المريض الثابت: يظهر فقط بعد أن يغيب صندوق المريض عن الشاشة بالتمرير */
let consIO = null;
function consStickInit(area) {
  if (consIO) { consIO.disconnect(); consIO = null; }
  const card = area.querySelector('.consultation-card'), box = area.querySelector('.patient-highlight-box'), scr = area.closest('.screen');
  if (!card || !box || !scr || !window.IntersectionObserver) return;
  const hero = scr.querySelector('.hero'), setH = () => { if (hero) scr.style.setProperty('--hero-h', hero.offsetHeight + 'px'); };
  setH(); if (!scr._consRz) { scr._consRz = true; window.addEventListener('resize', setH); }
  const h = hero ? hero.offsetHeight : 64;
  consIO = new IntersectionObserver(([e]) => card.classList.toggle('cons-scrolled', !e.isIntersecting && e.boundingClientRect.top < h), { root: scr, rootMargin: `-${h}px 0px 0px 0px`, threshold: 0 });
  consIO.observe(box);
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
    const owed = Math.max(a.debt || 0, (S.account && S.account.balance) || 0);
    area.innerHTML = `<div class="consultation-card"><div class="cons-stick" aria-hidden="true"><div class="cons-stick-in">👤 ${esc(a.name)}</div></div>${owed > 0 ? `<div class="debt-alert">⚠️ ${t('debt_note', { x: money(owed) })}</div>` : ''}<div class="patient-highlight-box${owed > 0 ? ' has-debt' : (a.wallet > 0 || wBal() > 0) ? ' has-wallet' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:20px;font-weight:600">${t('consult_patient')} ${esc(a.name)}</div><span style="display:flex;gap:8px;align-items:center"><button type="button" class="btn-action btn-green" data-act="patHistory" data-name="${esc(a.name)}" data-year="${a.birthYear}">${t('hist_title')}</button><button type="button" class="btn-action btn-yellow" data-act="editPatient" data-id="${a.id}">✏️ ${t('edit')}</button><span style="background:var(--orange);padding:4px 14px;border-radius:20px;font-weight:600;font-size:13px">${t('ticket_no')} ${a.ticketNo}</span></span></div>
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
    hydrate(area); if (window.rxMount) rxMount(a); consStickInit(area);
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
    if (fresh.length) { chime('task'); try { navigator.vibrate && navigator.vibrate([300, 120, 300]); } catch (e) {} }
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
  const o = vals || {}, cc = o.col || defCol(v || '');
  return `<div class="treat-row" ${v ? `data-orig="${esc(v)}"` : ''}><div class="treat-head"><input type="text" class="treat-name" maxlength="40" placeholder="${esc(t('tr_name_ph'))}" value="${esc(v ? treatLabel(v) : '')}">
    <button type="button" class="btn-action" data-act="moveTreat" data-d="-1" title="${esc(t('tr_up'))}" aria-label="${esc(t('tr_up'))}">▲</button><button type="button" class="btn-action" data-act="moveTreat" data-d="1" title="${esc(t('tr_down'))}" aria-label="${esc(t('tr_down'))}">▼</button><button type="button" class="btn-action btn-red" data-act="delTreat" title="${esc(t('tr_del'))}" aria-label="${esc(t('tr_del'))}">✕</button></div>
    <div class="sess-row"><label><span>${t('pl_sess_n')}</span><input type="number" min="1" max="12" step="1" inputmode="numeric" class="treat-sess" value="${o.sessions || (v ? defSessions(v) : 1)}"></label>
      <label class="col-on"><input type="checkbox" class="treat-col-on" ${cc.on ? 'checked' : ''}><span>🎨 ${t('col_on_l')}</span></label>
      <label class="col-pick"><span>${t('col_part_l')}</span><input type="color" class="treat-col-part" value="${cc.part}"></label><label class="col-pick"><span>${t('col_done_l')}</span><input type="color" class="treat-col-done" value="${cc.done}"></label></div>
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
/* ===== خطة العلاج والحساب في المعاينة =====
   كل بند = (سن + علاج). خطة بحصة واحدة تُدفع كاملة، أو بحصتين يُقسَّم سعرها الكلي بينهما (الحصة 1 دفعة، والحصة 2 المتبقي).
   البنود تُشتقّ من اختيار الأسنان والعلاجات أعلاه؛ فإن كان للمريض خطة جارية على نفس السن والعلاج
   يصير البند «متابعة» لها ويعرض متبقّيها مباشرة. ما عدا ذلك من متبقٍّ سابق يظهر أسفلها ليُسدَّد اختيارياً. */
const wBal = () => (S.account && S.account.wallet) || 0, r2c = v => Math.round(v * 100) / 100;
function moneyReset() { S.useWal = true; S.removed = new Set(); S.lov = {}; S.dpay = {}; S.account = null; }
const MAXS = 12, defSessions = tr => { const e = S.me && S.me.prices && S.me.prices.list && S.me.prices.list[tr]; return (e && e.sessions) || (/عصب|root|endo/i.test(tr) ? 2 : 1); };   // عدد حصص العلاج يُضبط من «الحصص والأسعار»
const splitPay = (rem, left) => left > 1 ? r2c(rem / left) : rem;   // المقترح دفعه اليوم: المتبقي موزَّعاً على الحصص المتبقية
const lineKey = (th, tr) => th + '|' + tr;
function consLines() {
  const plans = (S.account && S.account.plans) || [], teeth = [...S.teeth].sort(), used = new Set(), out = [];
  for (const tr of S.treatments) for (const th of (teeth.length ? teeth : [''])) {
    const key = lineKey(th, tr); if (S.removed.has(key)) continue;
    const ov = S.lov[key] || {}, p = plans.find(x => x.tooth === th && x.treatment === tr && !used.has(x.id)); let L;
    if (p) { used.add(p.id); const ps = ov.pay != null ? ov.pay : String(splitPay(p.remaining, p.sessions - p.done)); L = { key, th, tr, plan: p, cont: true, tot: p.total, sessions: p.sessions, no: p.done + 1, cap: p.remaining, payStr: ps, pay: Math.min(p.remaining, Math.max(0, +ps || 0)) }; }
    else {
      const auto = priceFor(tr, th ? [th] : []), ts = ov.total != null ? ov.total : (auto.total === '' ? '' : String(auto.total)), tot = Math.max(0, +ts || 0), sessions = ov.sessions || defSessions(tr);
      const ps = ov.pay != null ? ov.pay : (ts === '' ? '' : String(splitPay(tot, sessions)));
      L = { key, th, tr, cont: false, totStr: ts, tot, sessions, no: 1, cap: tot, payStr: ps, pay: Math.min(tot, Math.max(0, +ps || 0)), parts: auto.parts };
    }
    L.left = r2c((L.cont ? L.cap : L.tot) - L.pay); out.push(L);
  }
  return out;
}
/* متبقٍّ سابق: خطط جارية لم يُتابَع بها اليوم + خطط مغلقة + سجلات قديمة غير مسدَّدة */
function prevItems() {
  const ac = S.account; if (!ac) return []; const cont = new Set(consLines().filter(l => l.cont).map(l => l.plan.id)), out = [];
  for (const p of ac.plans || []) if (!cont.has(p.id)) out.push({ id: p.id, kind: 'plan', open: true, th: p.tooth, tr: p.treatment, tot: p.total, paid: p.paid, rem: p.remaining, next: p.done + 1, sessions: p.sessions });
  for (const d of ac.debts || []) out.push({ id: d.plan || d.rec, kind: d.plan ? 'plan' : 'rec', open: false, th: d.tooth || '', tr: d.treatment, tot: d.total, paid: d.paid, rem: d.remaining });
  for (const i of out) { i.payStr = S.dpay[i.id] == null ? '' : S.dpay[i.id]; i.pay = Math.min(i.rem, Math.max(0, +i.payStr || 0)); }
  return out;
}
function moneyTotals() {
  const ls = consLines(), ps = prevItems(), pay = r2c(ls.reduce((x, l) => x + l.pay, 0) + ps.reduce((x, i) => x + i.pay, 0)), due = r2c(ls.reduce((x, l) => x + (l.cont ? 0 : l.tot), 0));
  const w = S.useWal && wBal() > 0 ? Math.min(wBal(), pay) : 0, bal = (S.account && S.account.balance) || 0;
  return { ls, ps, pay, due, w, cash: r2c(pay - w), after: Math.max(0, r2c(bal + due - pay)) };
}
const wUse = () => moneyTotals().w;
const plBadge = (th, tr) => `${th ? `<span class="pl-tooth">${esc(th)}</span>` : ''}<b>${esc(treatLabel(tr))}</b>`;
function quickBtns(act, attrs) { return `<span class="pl-quick">${[['all', 'pl_all'], ['half', 'pl_half'], ['zero', 'pl_zero']].map(([v, k]) => `<button type="button" data-act="${act}" ${attrs} data-v="${v}">${t(k)}</button>`).join('')}</span>`; }
const sessHint = l => l.sessions > 1 ? t('pl_split_hint', { a: money(r2c(l.tot / l.sessions)), m: l.sessions }) : t('pl_one_hint');
function lineHTML(l) {
  const k = esc(l.key), del = `<button type="button" class="pl-del" data-act="lineDel" data-key="${k}" title="${esc(t('pl_del'))}" aria-label="${esc(t('pl_del'))}">✕</button>`;
  const pay = `<div class="pl-row"><label>💵 ${t('pl_pay_now')}</label><input type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="${esc(l.payStr)}" data-input="lpay" data-key="${k}">${quickBtns('lpayQuick', `data-key="${k}"`)}</div><div class="pl-foot"><span>${t('pl_left_after')}</span><b class="pl-left"></b></div>`;
  if (l.cont) return `<div class="pl-line pl-cont" data-key="${k}"><div class="pl-head">${plBadge(l.th, l.tr)}<span class="pl-badge cont">${t('pl_session_n', { n: l.no, m: l.sessions })}</span>${del}</div>
    <div class="pl-info">${t('pl_total')} <b>${money(l.tot)}</b> · ${t('paid_l')} <b>${money(l.plan.paid)}</b> · ${t('rem_l')} <b class="pl-rem">${money(l.plan.remaining)}</b></div>${pay}
    ${l.sessions < MAXS ? `<div class="pl-acts"><button type="button" class="btn-action btn-green" data-act="sessAdd" data-id="${esc(l.plan.id)}">➕ ${t('pl_add_sess')}</button></div>` : ''}</div>`;
  const hint = sessHint(l);
  return `<div class="pl-line" data-key="${k}"><div class="pl-head">${plBadge(l.th, l.tr)}<span class="pl-badge">${t('pl_session_n', { n: 1, m: l.sessions })}</span>${del}</div>
    ${l.parts && l.parts.length ? `<div class="pl-info"><small>${l.parts.map(x => x.n + ' ' + t('price_cat_' + x.c)).join('، ')}</small></div>` : ''}
    <div class="pl-row"><label>${t('pl_total')}${cur() ? ' (' + esc(cur()) + ')' : ''}</label><input type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="${esc(l.totStr)}" data-input="ltotal" data-key="${k}"></div>
    <div class="pl-row pl-sess"><label>${t('pl_sess_n')}</label><span class="pl-stepper"><button type="button" data-act="lineSess" data-key="${k}" data-v="-1" aria-label="-">−</button><b>${l.sessions}</b><button type="button" data-act="lineSess" data-key="${k}" data-v="1" aria-label="+">+</button></span></div>
    <div class="pl-hint" id="plh">${hint}</div>${pay}</div>`;
}
function prevHTML(i) {
  const id = esc(i.id), title = plBadge(i.th, i.tr) + (i.open ? `<span class="pl-badge cont">${t('pl_next_session', { n: i.next, m: i.sessions })}</span>` : '');
  return `<div class="pl-line pl-prev" data-id="${id}"><div class="pl-head">${title}</div>
    <div class="pl-info">${t('paid_l')} <b>${money(i.paid)}</b> / ${money(i.tot)} · ${t('rem_l')} <b class="pl-rem" style="color:var(--danger-soft,#e8607a)">${money(i.rem)}</b></div>
    ${i.rem > 0 ? `<div class="pl-row"><label>💵 ${t('pl_pay_now')}</label><input type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="${esc(i.payStr)}" data-input="dpay" data-id="${id}"><span class="pl-quick"><button type="button" data-act="dpayAll" data-id="${id}">${t('pl_all')}</button></span></div>` : ''}
    ${i.open ? `<div class="pl-acts"><button type="button" class="btn-action btn-green" data-act="planGo" data-id="${id}">${t('pl_go')}</button><button type="button" class="btn-action btn-red" data-act="planClose" data-id="${id}">${t('pl_close')}</button></div>` : ''}</div>`;
}
function sumHTML(m) {
  const ln = (l, v, cls) => `<div class="rc-row${cls ? ' ' + cls : ''}"><span>${l}</span><b>${v}</b></div>`;
  return (m.due > 0 ? ln(t('pl_sum_today'), money(m.due)) : '') + (m.pay > 0 ? ln(t('pl_sum_paid'), money(m.pay)) + (m.w > 0 ? ln('🏺 ' + t('pl_sum_wal'), '− ' + money(m.w), 'rc-w') + ln('💵 ' + t('pl_sum_cash'), money(m.cash)) : '') : '')
    + ln(t('pl_sum_after'), money(m.after), (m.after > 0 ? 'rc-bad' : 'rc-ok') + ' rc-total') + (S.account && wBal() > 0 ? ln(t('wal_after'), money(r2c(wBal() - m.w)), 'rc-note') : '');
}
function planBoxInner() {
  const m = moneyTotals(), ac = S.account;
  const wal = ac ? `<div class="wallet-box"><div class="acct-head"><strong>🏺 ${t('wal_title')}</strong><span>${t('wal_bal')} <b>${money(wBal())}</b></span></div>
    ${wBal() > 0 ? `<label class="acct-follow"><input type="checkbox" data-act="useWal" ${S.useWal ? 'checked' : ''} style="width:auto"> ${t('wal_chk')} <b id="walLine">${S.useWal && m.w > 0 ? '− ' + money(m.w) : ''}</b></label>` : ''}
    <button type="button" class="btn-action btn-green" data-act="walDeposit" data-name="${esc(ac.key.name)}" data-year="${ac.key.year}" data-ctx="room">${t('wal_dep')}</button></div>` : '';
  return `<div class="plan-box"><div class="acct-head"><strong>🦷 ${t('pl_title')}</strong></div>${m.ls.length ? m.ls.map(lineHTML).join('') : `<div class="hint" style="padding:6px 0">${t('pl_none')}</div>`}</div>
    ${m.ps.length ? `<div class="acct-box"><div class="acct-head"><strong>${t('pl_prev_title')}</strong>${ac && ac.balance > 0 ? `<span class="acct-debt">${t('acct_prev')} <b>${money(ac.balance)}</b></span>` : ''}</div>${m.ps.map(prevHTML).join('')}</div>` : ''}
    ${wal}<div id="moneySum" class="money-sum">${sumHTML(m)}</div>`;
}
const moneyHTML = () => `<div id="planBox">${planBoxInner()}</div>`;
/* تحديث الأرقام فقط (أثناء الكتابة) دون إعادة بناء الحقول فلا يضيع التركيز */
function moneyUpdate() {
  const m = moneyTotals(), act = document.activeElement;
  $$('#planBox .pl-line[data-key]').forEach(row => { const l = m.ls.find(x => x.key === row.dataset.key); if (!l) return; const pi = $('[data-input=lpay]', row); if (pi && pi !== act) pi.value = l.payStr; const lf = $('.pl-left', row); if (lf) { lf.textContent = money(l.left); lf.style.color = l.left > 0 ? 'var(--danger-soft,#e8607a)' : 'var(--success,#2e9e6b)'; } const h = $('.pl-hint', row); if (h && !l.cont) h.textContent = sessHint(l); });
  const sm = $('#moneySum'); if (sm) sm.innerHTML = sumHTML(m); const wl = $('#walLine'); if (wl) wl.textContent = S.useWal && m.w > 0 ? '− ' + money(m.w) : '';
}
function recalc() { const b = $('#planBox'); if (!b) return; if (b.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return moneyUpdate(); b.innerHTML = planBoxInner(); moneyUpdate(); }
/* مفاتيح بنود محذوفة يدوياً تعود إن اختار الطبيب السن أو العلاج من جديد */
const unRemove = (th, tr) => { for (const k of [...S.removed]) { const [a, b] = k.split('|'); if ((th && a === th) || (tr && b === tr)) S.removed.delete(k); } };
async function loadAccount(a) {
  try { const r = await api('GET', `/api/account?name=${encodeURIComponent(a.name)}&year=${a.birthYear}`); if (!S.me || $('#consultationArea').dataset.pid !== a.id) return; r.key = { name: a.name, year: a.birthYear }; S.account = r; recalc(); const c = $('#consultationArea'); c.dataset.sig = ''; renderAll(); } catch (e) {}
}
/* ===== مخطط الأسنان (FDI) ===== */
const TEETH = { adult: { up: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28], lo: [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38] }, child: { up: [55,54,53,52,51,61,62,63,64,65], lo: [85,84,83,82,81,71,72,73,74,75] } };
const ALL_TEETH = new Set([].concat(...Object.values(TEETH).map(x => x.up.concat(x.lo))).map(String));
S.teeth = new Set(); S.teethSet = 'adult'; moneyReset();
function teethInit(a) { S.teeth = new Set(String(a.tooth || '').match(/\d{2}/g) ? String(a.tooth).match(/\d{2}/g).filter(x => ALL_TEETH.has(x)) : []); S.teethSet = [...S.teeth].some(x => +x >= 51 && +x <= 85) && ![...S.teeth].some(x => +x <= 48) ? 'child' : (a.age <= 5 ? 'child' : 'adult'); }
function teethHTML() {
  const set = TEETH[S.teethSet], st = statusFromItems((S.account && S.account.teeth) || []), row = arr => arr.map(n => { const o = st.get(String(n)); return `<button type="button" class="tooth-btn${S.teeth.has(String(n)) ? ' on' : ''}${n % 10 >= 6 && S.teethSet === 'adult' ? ' molar' : ''}${toothCls(o)}"${o ? ` title="${esc(o.label)}"` : ''}${toothSty(o)} data-act="tooth" data-n="${n}">${n}</button>`; }).join('');
  const half = arr => `<div class="arch-half">${row(arr.slice(0, arr.length / 2))}</div><div class="arch-half">${row(arr.slice(arr.length / 2))}</div>`;
  return `<div class="teeth-box"><div class="teeth-head"><label>${t('teeth_title')}</label><div class="teeth-switch"><button type="button" data-act="teethSet" data-v="adult" class="${S.teethSet === 'adult' ? 'on' : ''}">${t('teeth_perm')}</button><button type="button" data-act="teethSet" data-v="child" class="${S.teethSet === 'child' ? 'on' : ''}">${t('teeth_prim')}</button></div></div>
    <div class="teeth-chart"><div class="teeth-lbl"><span>${t('teeth_ur')}</span><span>${t('teeth_ul')}</span></div><div class="arch">${half(set.up)}</div><div class="arch-sep"></div><div class="arch">${half(set.lo)}</div><div class="teeth-lbl"><span>${t('teeth_lr')}</span><span>${t('teeth_ll')}</span></div></div>
    ${colLegend(st)}<div class="teeth-sum"><span id="teethSum">${teethSumText()}</span><button type="button" class="btn-action btn-red" data-act="teethClear">${t('teeth_clear')}</button></div></div>`;
}
const teethSumText = () => S.teeth.size ? t('teeth_sel') + ' ' + [...S.teeth].sort().map(x => `<b>${x}</b>`).join(' · ') : t('teeth_none');
function renderSkip() {
  const m = $('#skipQueueModal'), r = S.skipRequests[0];
  if (!r) { m.classList.remove('active'); S.shownSkip = ''; return; }
  $('#skipQueueMessage').textContent = t('skip_msg', { a: r.name, b: r.firstName });
  m.dataset.pid = r.id;
  if (S.shownSkip !== r.id) { S.shownSkip = r.id; chime('skip'); sysNotify(t('skip_title'), t('skip_msg', { a: r.name, b: r.firstName })); }
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
  const q = new URLSearchParams({ name: $('#aName').value, year: $('#aYear').value, gender: $('#aGender').value, tooth: $('#aTooth').value, treatment: $('#aTreat').value, money: $('#aMoney').value, from: $('#aFrom').value, to: $('#aTo').value, tz: new Date().getTimezoneOffset(), offset: off, limit: 30 });
  return q.toString();
}
let archTimer, archSeq = 0;
function protectUI() { const b = $('#protBtn'); if (b && S.me) { b.textContent = (S.me.protect ? '🔒 ' : '🔓 ') + t(S.me.protect ? 'prot_on' : 'prot_off'); b.classList.toggle('btn-green', !!S.me.protect); } }
function loadArchive(reset = true) {
  clearTimeout(archTimer);
  archTimer = setTimeout(async () => {
    const seq = ++archSeq, off = reset ? 0 : S.archive.items.length;
    const r = await run(() => api('GET', '/api/archive?' + archiveParams(off))); if (!r || seq !== archSeq) return;
    S.archive = { total: r.total, walSum: r.walSum, sum: r.sum, paidSum: r.paidSum, debt: r.debt, items: reset ? r.items : S.archive.items.concat(r.items) }; renderArchive();
  }, reset ? 250 : 0);
}
function renderArchive() {
  $('#archiveResultCount').textContent = S.archive.total; $('#archiveSum').innerHTML = S.archive.walSum ? `🏺 ${t('money_wal_sum')} <b>${money(S.archive.walSum)}</b>` : S.archive.sum ? `${t('total_due')} <b>${money(S.archive.sum)}</b> · ${t('total_paid')} <b>${money(S.archive.paidSum)}</b>${S.archive.debt ? ` · ${t('total_debt')} <b style="color:var(--danger-soft,#e8607a)">${money(S.archive.debt)}</b>` : ''}` : '';
  const l = $('#archiveList');
  l.innerHTML = S.archive.items.length ? S.archive.items.map(a => `<li class="patient-card${a.remaining > 0 || a.patDebt > 0 ? ' has-debt' : a.wallet > 0 ? ' has-wallet' : ''}" style="align-items:flex-start" data-act="patHistory" data-name="${esc(a.name)}" data-year="${a.birthYear}"><div style="min-width:0"><strong style="font-size:15px">${esc(a.name)}</strong> ${lineBadges(a, 'badge')}${a.price != null ? ` <span class="badge" style="background:color-mix(in srgb,var(--orange) 18%,transparent);color:var(--orange)">${t('due_l')} ${money(a.price)}</span>` : ''}${a.patDebt > 0 ? ` <span class="badge debt-badge">${t('pat_debt')} ${money(a.patDebt)}</span>` : ''}${a.remaining > 0 ? ` <span class="badge" style="background:color-mix(in srgb,var(--danger-soft,#e8607a) 20%,transparent);color:var(--danger-soft,#e8607a)">${t('rem_l')} ${money(a.remaining)}</span>` : (a.price > 0 ? ` <span class="badge" style="background:color-mix(in srgb,#2e9e6b 18%,transparent);color:#2e9e6b">${t('paid_full')}</span>` : '')}${a.n ? ` <span class="badge">${t('hist_visit_n', { n: a.n })}</span>` : ''}${a.wallet > 0 ? ` <span class="badge" style="background:color-mix(in srgb,#3b82c4 18%,transparent);color:#3b82c4">${t('wal_bal_b')} ${money(a.wallet)}</span>` : ''}${a.followUp ? ` <span class="badge">${t('follow_b')}</span>` : ''}
    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${t('sex')}: <strong>${esc(genderL(a.gender))}</strong> | ${t('birth')}: <strong>${a.birthYear}</strong> (${a.age} ${t('years_short')}) | ${t('reason_s')}: ${esc(reasonL(a.reason))} | ${t('tooth')}: <strong style="color:var(--warning-warm)">${esc(a.tooth || '---')}</strong></div>
    ${a.notes ? `<div class="note-line">${t('notes_l')} ${esc(a.notes)}</div>` : ''}${window.rxRecHTML ? rxRecHTML(a, a) : ''}
    ${a.images.length ? `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${a.images.map(i => `<img data-rec="${a.id}" data-img="${i}" data-act="lightbox" style="width:42px;height:42px;border-radius:8px;object-fit:cover;cursor:pointer;background:var(--surface-sunk)" alt="">`).join('')}</div>` : ''}
    ${a.payments && a.payments.length ? `<div style="margin-top:6px">${payChips(a.payments, a.id)}</div>` : ''}
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${t('date_l')} ${new Date(a.finishedAt).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })} · ${t('wait_s')} ${fmtMin(a.waitMin)} · ${t('dur_l')} ${fmtMin(a.durationMin)}</div></div>
    <div style="display:flex;flex-direction:column;gap:6px">${a.remaining > 0 ? `<button type="button" class="btn-action btn-green" data-act="addPayment" data-id="${a.id}" data-rem="${a.remaining}" data-wallet="${a.wallet || 0}">${t('add_pay')}</button>` : ''}    <button type="button" class="btn-action btn-yellow" data-act="editArchive" data-id="${a.id}">${t('edit')}</button><button type="button" class="btn-action btn-red" data-act="delArchive" data-id="${a.id}">${t('del')}</button></div></li>`).join('')
    : `<li class="patient-card" style="justify-content:center;color:var(--text-muted)">${t('no_results')}</li>`;
  $('#archiveMore').style.display = S.archive.items.length < S.archive.total ? '' : 'none';
  hydrate(l);
}
/* وعاء المريض: إيداع أو استرجاع نقدي ثم تحديث الشاشة المفتوحة */
async function walMove(el, op) {
  const v = await appPrompt(t(op === 'out' ? 'wal_out_q' : 'wal_dep_q'), '', false, true); if (v == null) return;
  const n = parseFloat(String(v).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(',', '.'));
  if (!await run(() => api('POST', '/api/wallet', { name: el.dataset.name, year: el.dataset.year, amount: n, op }))) return;
  toast(t('wal_saved'), 'success');
  if (el.dataset.ctx === 'hist') showHistory(el.dataset.name, el.dataset.year); else { const a = S.patients.find(p => p.status === 'in'); if (a) loadAccount(a); }
}
/* أين دُفعت الدفعة؟ (رقم الحصة التي دُفعت فيها) */
const dShort = v => v ? new Date(v).toLocaleDateString(locale(), { dateStyle: 'medium' }) : '—', tShort = v => v ? new Date(v).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) : '';
/* شارات العلاج: لكل بند خطة «سن · علاج (الحصة n/m)»، وللسجلات القديمة أسماء العلاجات */
const lineBadges = (x, cls) => (x.lines && x.lines.length ? x.lines.map(l => `<span class="${cls}">${l.tooth ? esc(l.tooth) + ' · ' : ''}${esc(treatLabel(l.treatment))}${l.sessions > 1 ? ` (${l.no}/${l.sessions})` : ''}</span>`) : (x.treatments || [x.treatment]).map(n => `<span class="${cls}">${esc(n)}</span>`)).join(' ');
const payWhere = (p, recId) => p.vid && p.vid === recId ? t('pay_same') : p.vn ? t('pay_in_visit', { n: p.vn, d: dShort(p.vat) }) : t('pay_later');
const payLbl = p => p.m === 'w' ? t('pay_cut_wal') : t('pay_cash');
const payChips = (ps, recId) => `<div class="pay-chips">${ps.map(p => `<span class="pay-chip${p.m === 'w' ? ' w' : ''}"><b class="${p.m === 'w' ? 'wal-tag' : 'cash-tag'}">${payLbl(p)}</b>: <b>${money(p.amt)}</b> · ${dShort(p.t)} ${tShort(p.t)} · ${payWhere(p, recId)}</span>`).join('')}</div>`;

/* ألوان الأسنان: لكل علاج لونان يُضبطان من «الحصص والأسعار»: أثناء العلاج (حصص متبقية) وعند اكتماله.
   الحالة = آخر حصة مسجّلة لكل سن؛ والمقلوع نهائي. */
const NEUTRAL_TR = /استشارة|تبييض|أخرى|consult|whiten|other/i, EXT_TR = /قلع|extract/i;
const defCol = tr => EXT_TR.test(tr) ? { on: true, part: '#d64545', done: '#d64545' } : { on: !NEUTRAL_TR.test(tr), part: '#f2b705', done: '#2e9e6b' };
const colOf = tr => { const e = S.me && S.me.prices && S.me.prices.list && S.me.prices.list[tr]; return (e && e.col) || defCol(tr); };
const inkOn = hex => { const n = parseInt(hex.slice(1), 16), y = ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000; return y > 150 ? '#222' : '#fff'; };
const tcStyle = c => `--tc:${c};--ti:${inkOn(c)}`;
function statusFromItems(items) {
  const st = new Map();
  for (const it of items) {
    const n = String(it.tooth || ''); if (!ALL_TEETH.has(n)) continue; const col = colOf(it.treatment); if (!col.on) continue;
    const o = st.get(n); if (o && o.ext) continue; const full = it.no >= it.sessions;
    st.set(n, { color: full ? col.done : col.part, ext: EXT_TR.test(it.treatment), tr: it.treatment, full, label: it.treatment + (it.sessions > 1 ? ` (${it.no}/${it.sessions})` : '') + (it.at ? ' · ' + new Date(it.at).toLocaleDateString(locale(), { dateStyle: 'medium' }) : '') });
  }
  return st;
}
function teethStatus(records) {
  const items = [];
  records.forEach(x => {
    if (x.lines && x.lines.length) { x.lines.forEach(l => items.push({ tooth: l.tooth, treatment: l.treatment, no: l.no || 1, sessions: l.sessions || 1, at: x.finishedAt })); return; }
    const tl = x.treatments || String(x.treatment || '').split(' + ');
    (x.teeth || []).forEach(n => tl.forEach(tr => items.push({ tooth: String(n), treatment: tr, no: 1, sessions: 1, at: x.finishedAt })));
  });
  return statusFromItems(items);
}
const toothCls = (o) => o ? ' tc' : '', toothSty = o => o ? ` style="${tcStyle(o.color)}"` : '';
function colLegend(st) {
  const m = new Map(); for (const o of st.values()) { const k = o.tr + '|' + o.color; if (!m.has(k)) m.set(k, `<span class="col-leg"><i style="background:${o.color}"></i>${esc(treatLabel(o.tr))}${o.full ? '' : ' · ' + t('col_part_l')}</span>`); }
  return m.size ? `<div class="col-legs">${[...m.values()].join('')}</div>` : '';
}
function teethMapHTML(records) {
  const st = teethStatus(records), has = set => set.up.concat(set.lo).some(n => st.has(String(n)));
  if (!st.size) return '';
  const btn = n => { const o = st.get(String(n)); return `<span class="tooth-btn ro${n % 10 >= 6 && n < 50 ? ' molar' : ''}${toothCls(o)}"${o ? ` title="${esc(o.label)}"` : ''}${toothSty(o)}>${n}</span>`; };
  const half = arr => `<div class="arch-half">${arr.slice(0, arr.length / 2).map(btn).join('')}</div><div class="arch-half">${arr.slice(arr.length / 2).map(btn).join('')}</div>`;
  const chart = set => `<div class="teeth-chart"><div class="arch">${half(set.up)}</div><div class="arch-sep"></div><div class="arch">${half(set.lo)}</div></div>`;
  return `<div class="hist-teeth"><div class="ht-head"><b>${t('teeth_map')}</b></div>${colLegend(st)}${chart(TEETH.adult)}${has(TEETH.child) ? chart(TEETH.child) : ''}</div>`;
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
  const vis = new Map(r.records.map((x, i) => [x.id, { n: i + 1, at: x.finishedAt }]));
  const wlog = (r.wallet ? r.wallet.log : []).filter(e => e.k === 'dep' || e.k === 'out');
  const trName = x => esc(x.lines && x.lines.length ? x.lines.map(l => (l.tooth ? l.tooth + ' ' : '') + l.treatment).join(' + ') : (x.treatments ? x.treatments.join(' + ') : x.treatment));
  /* خط زمني واحد: كل حصة (العلاج بارز) ومعها مدفوعاتها، وبينها حركات الوعاء المستقلة */
  const visitHTML = (x, n) => {
    const own = x.payments && x.payments.length ? payChips(x.payments, x.id) : '';
    const recv = r.records.flatMap((y, j) => y.id !== x.id ? (y.payments || []).filter(q => q.vid === x.id).map(q => `<span class="pay-chip${q.m === 'w' ? ' w' : ''}"><b class="${q.m === 'w' ? 'wal-tag' : 'cash-tag'}">${payLbl(q)}</b>: <b>${money(q.amt)}</b> · ${t('pay_recv', { n: j + 1, tr: trName(y) })}</span>`) : []);
    const dep = wlog.filter(e => e.vid === x.id).map(e => `<span class="pay-chip dep"><b class="wal-tag">${t('pay_dep')}</b>: <b>${money(e.amt)}</b></span>`);
    const extra = recv.concat(dep).join('');
    return `<div class="hist-item"><div class="hi-date">${t('hist_visit_n', { n })} · ${dt(x.finishedAt)}${x.followUp ? ' · ' + t('follow_b') : ''}</div>
      <div class="hi-treat">${t('treat_l')} ${lineBadges(x, 'hi-tbadge')}</div>
      <div class="hi-line">${t('tooth')}: <strong>${esc(teethOf(x))}</strong> | ${t('reason_s')}: ${esc(reasonL(x.reason))}</div>
      ${x.price != null ? `<div class="hi-line hi-money">${t('due_l')} ${money(x.price)} · ${t('paid_l')} ${money(x.paid)}${x.remaining > 0 ? ` · <b style="color:var(--danger-soft,#e8607a)">${t('rem_l')} ${money(x.remaining)}</b>` : ` · <b style="color:var(--success,#2e9e6b)">${t('paid_full')}</b>`}</div>` : ''}
      ${own || extra ? `<div class="hi-line">${t('pays_l')}${own}${extra ? `<div class="pay-chips">${extra}</div>` : ''}</div>` : ''}
      ${x.notes ? `<div class="hi-notes">${t('notes_l')} ${esc(x.notes)}</div>` : ''}${imgs(x)}${window.rxRecHTML ? rxRecHTML(x, r) : ''}
      <div class="hi-line" style="font-size:11px">${t('wait_s')} ${fmtMin(x.waitMin)} · ${t('dur_l')} ${fmtMin(x.durationMin)}</div></div>`;
  };
  const walOnly = e => `<div class="hist-item hi-wal"><div class="hi-date">${dt(e.t)}</div><div class="hi-line hi-money">${e.k === 'out' ? t('pay_out') : t('pay_dep')}: ${e.k === 'out' ? '−' : ''}<b>${money(e.amt)}</b> · ${t('pay_dep_manual')}</div></div>`;
  const items = r.records.map((x, i) => ({ t: x.finishedAt, h: visitHTML(x, i + 1) })).concat(wlog.filter(e => !vis.has(e.vid)).map(e => ({ t: e.t, h: walOnly(e) }))).sort((p, q) => q.t - p.t).map(z => z.h).join('');
  const walBox = `<div class="hist-wallet"><div><b>${t('wal_title')}</b> <span class="hw-bal">${money(r.wallet ? r.wallet.bal : 0)}</span></div>
    <div class="hw-btns"><button type="button" class="btn-action btn-green" data-act="walDeposit" data-ctx="hist" data-name="${esc(r.name)}" data-year="${r.birthYear}">${t('wal_dep')}</button>${r.wallet && r.wallet.bal > 0 ? `<button type="button" class="btn-action btn-yellow" data-act="walOut" data-ctx="hist" data-name="${esc(r.name)}" data-year="${r.birthYear}">${t('wal_out')}</button>` : ''}</div></div>`;
  body.innerHTML = `<div class="hist-sum"><div class="hs-name">${esc(r.name)}</div>
      <div class="hs-meta">${t('sex')}: <strong>${esc(genderL(r.gender))}</strong> | ${t('birth')}: <strong>${r.birthYear}</strong> (${new Date().getFullYear() - r.birthYear} ${t('years_short')})${r.phone ? ` | ☎ <span dir="ltr">${esc(r.phone)}</span>` : ''}</div>
      <div class="hist-stats"><div>${t('hist_visits')}<b>${r.visits}</b></div><div>${t('hist_first')}<b>${dd(r.firstVisit)}</b></div><div>${t('hist_last')}<b>${dd(r.lastVisit)}</b></div>
      ${r.due ? `<div>${t('total_due')}<b>${money(r.due)}</b></div><div>${t('total_paid')}<b>${money(r.paid)}</b></div>` : ''}${r.balance ? `<div>${t('total_debt')}<b style="color:var(--danger-soft,#e8607a)">${money(r.balance)}</b></div>` : ''}</div></div>
    ${walBox}
    ${teethMapHTML(r.records)}
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
let clkFmt = null, clkLoc = '', clkMin = '', clkEls = null;
function tickClock() {
  if (document.hidden) return;
  const d = new Date(), loc = settings.lang === 'en' ? 'en-GB' : 'ar-u-nu-latn';
  if (loc !== clkLoc) { clkLoc = loc; clkMin = ''; clkFmt = { t: new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hour12: false }), d: new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }; clkEls = null; }
  if (!clkEls || !clkEls.length || !clkEls[0].c.isConnected) clkEls = $$('.clk').map(c => ({ c, hm: $('.clk-hm', c), s: $('.clk-s', c), d: $('.clk-date', c) }));
  const s = String(d.getSeconds()).padStart(2, '0'), min = d.getMinutes() + ':' + d.getHours();
  if (min !== clkMin) { clkMin = min; const hm = clkFmt.t.format(d), date = clkFmt.d.format(d); clkEls.forEach(o => { o.hm.textContent = hm; o.d.textContent = date; }); }
  clkEls.forEach(o => { o.s.textContent = s; });
}
setInterval(tickClock, 1000); tickClock(); document.addEventListener('visibilitychange', () => { clkMin = ''; tickClock(); });
function applySettings() {
  document.body.classList.toggle('light-mode', !settings.darkMode);
  applyPalette(); $$('.theme-color-btn[data-theme]').forEach(x => x.classList.toggle('sel', !settings.themeColor && x.dataset.theme === settings.theme)); $$('.themeCustom').forEach(x => { x.value = themeHex(); x.classList.toggle('sel', !!settings.themeColor); });
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
/* إعدادات الجهاز (اللون واللغة والصوت...) تُلحق بالنسخة الاحتياطية دون إعادة قراءتها: نستبدل القوس الأخير بحقل ui */
const withUi = blob => blob && blob.size > 2 ? new Blob([blob.slice(0, blob.size - 1), ',"ui":' + JSON.stringify({ darkMode: settings.darkMode, theme: settings.theme, themeColor: settings.themeColor, lang: settings.lang, sound: settings.sound, autoQr: settings.autoQr }) + '}'], { type: 'application/json' }) : blob;
function restoreUi(txt) { try { const i = txt.lastIndexOf(',"ui":{'); if (i < 0) return; const u = JSON.parse(txt.slice(i + 6, -1).trim()); if (!u || typeof u !== 'object') return; if (typeof u.darkMode === 'boolean') settings.darkMode = u.darkMode; if (typeof u.theme === 'string') settings.theme = u.theme; if (typeof u.themeColor === 'string') settings.themeColor = u.themeColor; if (u.lang === 'ar' || u.lang === 'en') settings.lang = u.lang; if (typeof u.sound === 'boolean') settings.sound = u.sound; if (typeof u.autoQr === 'boolean') settings.autoQr = u.autoQr; applySettings(); } catch (e) {} }
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
    if (m === 'set_backupModal') { protectUI(); if (window.abUI) abUI(); }
    if (m === 'set_scheduleModal') { S.schedSig = ''; syncSchedule(); }
    openModal(m);
  }, closeLightbox: () => $('#lightboxModal').classList.remove('active'),
  lightbox: async el => { try { LB.rec = el.dataset.rec; LB.img = el.dataset.img; $('#lightboxImg').src = await imgBlobUrl(el.dataset.rec, el.dataset.img); lbReset(); $('#lightboxModal').classList.add('active'); } catch (e) {} },
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
  tooth(el) { const n = el.dataset.n; if (S.teeth.has(n)) S.teeth.delete(n); else S.teeth.add(n); el.classList.toggle('on', S.teeth.has(n)); if (S.teeth.has(n)) unRemove(n, ''); $('#teethSum').innerHTML = teethSumText(); recalc(); },
  teethSet(el) { S.teethSet = el.dataset.v; const box = el.closest('.teeth-box'); box.outerHTML = teethHTML(); },
  soundTest(el) { const k = UISound.names, i = (S.sndI = ((S.sndI == null ? -1 : S.sndI) + 1) % k.length); UISound.play(k[i]); toast((i + 1) + '/' + k.length + ' · ' + (t('snd_names')[i] || k[i]), 'success'); },
  teethClear() { S.teeth.clear(); $$('.tooth-btn.on').forEach(x => x.classList.remove('on')); $('#teethSum').innerHTML = teethSumText(); recalc(); },
  useWal(el) { S.useWal = el.checked; recalc(); },
  lineDel(el) { S.removed.add(el.dataset.key); recalc(); },
  lineSess(el) { const l = consLines().find(x => x.key === el.dataset.key); if (!l) return; const o = S.lov[l.key] = S.lov[l.key] || {}; o.sessions = Math.min(MAXS, Math.max(1, l.sessions + (+el.dataset.v))); delete o.pay; recalc(); },
  /* إضافة حصة إلى علاج جارٍ أثناء المعاينة (مثلاً العلاج يحتاج حصة أخرى) */
  async sessAdd(el) {
    if (!await run(() => api('POST', `/api/plans/${el.dataset.id}/sessions`, { delta: 1 }))) return; toast(t('pl_sess_added'), 'success');
    const a = S.patients.find(p => p.status === 'in'); if (a) { for (const o of Object.values(S.lov)) delete o.pay; loadAccount(a); }
  },
  lpayQuick(el) {
    const l = consLines().find(x => x.key === el.dataset.key); if (!l) return; const cap = l.cont ? l.cap : l.tot, v = el.dataset.v;
    (S.lov[l.key] = S.lov[l.key] || {}).pay = v === 'all' ? String(cap) : v === 'half' ? String(r2c(cap / 2)) : '0'; recalc();
  },
  dpayAll(el) { const i = prevItems().find(x => String(x.id) === el.dataset.id); if (i) { S.dpay[i.id] = String(i.rem); recalc(); } },
  /* متابعة خطة جارية اليوم: نضيف سنّها وعلاجها للاختيار، ونخفي بنوداً جانبية لا يريدها الطبيب من تقاطع الاختيارين */
  planGo(el) {
    const p = ((S.account && S.account.plans) || []).find(x => x.id === el.dataset.id); if (!p) return;
    if (!treatList().includes(p.treatment)) return toast(t('pl_tr_missing', { n: p.treatment }), 'warning');
    const before = new Set(consLines().map(x => x.key)), pk = lineKey(p.tooth, p.treatment);
    if (!S.treatments.includes(p.treatment)) S.treatments.push(p.treatment);
    if (p.tooth) { S.teeth.add(p.tooth); S.teethSet = +p.tooth >= 51 && +p.tooth <= 85 ? 'child' : 'adult'; }
    S.removed.delete(pk); for (const x of consLines()) if (!before.has(x.key) && x.key !== pk) S.removed.add(x.key);
    const c = $('#consultationArea'); c.dataset.sig = ''; renderAll();
  },
  async planClose(el) {
    if (!await appConfirm(t('pl_close_q'))) return;
    if (await run(() => api('POST', `/api/plans/${el.dataset.id}/close`))) { toast(t('pl_closed_t'), 'info'); const a = S.patients.find(p => p.status === 'in'); if (a) loadAccount(a); }
  },
  async addPayment(el) {
    const rem = +el.dataset.rem, wal = +el.dataset.wallet || 0, v = await appPrompt(t('pay_prompt', { r: money(rem) }), rem, false, true); if (v == null) return;
    const fromW = wal > 0 ? await appDialog({ msg: t('pay_src_q', { a: money(Math.min(+v, rem)) }), okL: '🏺 ' + t('pay_wallet') + ' (' + money(wal) + ')', noL: '💵 ' + t('pay_cash'), cancelL: 1 }) : false; if (fromW === null) return;
    if (await run(() => api('POST', `/api/archive/${el.dataset.id}/payment`, { amount: v, wallet: fromW }))) { toast(t('t_paid'), 'success'); loadArchive(true); }
  },
  async walDeposit(el) { return walMove(el, 'dep'); },
  async walOut(el) { return walMove(el, 'out'); },
  treat(el) { const v = el.dataset.v, i = S.treatments.indexOf(v); if (i >= 0) { if (S.treatments.length <= 1) return toast(t('pick_treat_min'), 'warning'); S.treatments.splice(i, 1); } else S.treatments.push(v); el.classList.toggle('selected', i < 0); el.setAttribute('aria-checked', String(i < 0)); if (i < 0) unRemove('', v); recalc(); },
  async finish(el) {
    const m = moneyTotals(), r = await run(() => api('POST', `/api/patients/${el.dataset.id}/finish`, { lines: m.ls.map(l => l.cont ? { plan: l.plan.id, pay: l.pay } : { tooth: l.th, treatment: l.tr, total: l.tot, sessions: l.sessions, pay: l.pay }), debts: m.ps.filter(x => x.pay > 0).map(x => x.kind === 'rec' ? { rec: x.id, pay: x.pay } : { plan: x.id, pay: x.pay }), wallet: m.w, notes: ($('#consultNotes') || {}).value || '', rx: window.rxLines ? rxLines() : [], rxHead: window.rxHeadSnap ? rxHeadSnap() : undefined })); if (!r) return; if (window.rxDone) rxDone();
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
  setTheme: el => { settings.theme = el.dataset.theme; settings.themeColor = ''; applySettings(); }, askNotif,
  installApp: async () => {
    if (isStandalone()) return;
    if (!S.installEvt) { toast(t(IS_IOS ? 'install_ios' : 'install_manual'), 'info'); return; }
    const e = S.installEvt; S.installEvt = null; e.prompt(); try { await e.userChoice; } catch (x) {} updateInstallUI();
  },
  async exportData() { const b = await run(() => api('GET', '/api/backup', undefined, { blob: true })); if (b) download(withUi(b), `clinic_backup_${new Date().toISOString().slice(0, 10)}.json`); },
  importData() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = async () => {
      const f = i.files[0]; if (!f || !await appConfirm(t('c_restore'))) return;
      let txt = ''; const r = await run(async () => api('POST', '/api/restore', undefined, { text: (txt = await f.text()) })); if (r) { restoreUi(txt); toast(t('restored', { p: r.patients, a: r.archive }), 'success'); refresh(); loadArchive(true); }
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
  else if (el.dataset.input === 'ltotal') { (S.lov[el.dataset.key] = S.lov[el.dataset.key] || {}).total = el.value; moneyUpdate(); }
  else if (el.dataset.input === 'lpay') { (S.lov[el.dataset.key] = S.lov[el.dataset.key] || {}).pay = el.value; moneyUpdate(); }
  else if (el.dataset.input === 'dpay') { S.dpay[el.dataset.id] = el.value; moneyUpdate(); }
});
document.addEventListener('change', e => {
  const el = e.target, c = el.dataset.change;
  if (c === 'themeColor') { settings.themeColor = el.value; settings.theme = 'custom'; } else if (c === 'dark') settings.darkMode = el.checked; else if (c === 'lang') settings.lang = el.value; else if (c === 'sound') settings.sound = el.checked; else if (c === 'autoQr') settings.autoQr = el.checked; else if (el.dataset.input === 'archive') { loadArchive(true); return; } else return;
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
    try {
      const rr = await api('POST', '/api/register', { clinicName: $('#rClinic').value, doctorName: $('#rDoctor').value, username: $('#rUser').value, password: $('#rPass').value, registrationCode: $('#rCode').value }, { anon: true });
      if (rr && rr.pending) { $$('input[type=password]').forEach(i => { i.value = ''; }); authMode('doctor'); $('#lUser').value = $('#rUser').value; const ae = $('#authErr'); ae.textContent = t('reg_pending'); ae.classList.add('ok'); }
      else await afterLogin(rr);
    } catch (x) { authError(x); }
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
      treatments.push(key); (list[key] = list[key] || {}).sessions = Math.min(MAXS, Math.max(1, parseInt($('.treat-sess', row).value) || 1)); list[key].col = { on: $('.treat-col-on', row).checked, part: $('.treat-col-part', row).value, done: $('.treat-col-done', row).value }; $$('input[data-cat]', row).forEach(i => { if (i.value !== '') (list[key] = list[key] || {})[i.dataset.cat] = i.value; });
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
/* النوافذ لا تُغلق بالنقر على الخلفية إطلاقاً (كانت تختفي فجأة أثناء الكتابة): تُغلق بأزرار «إلغاء/×/حفظ» أو بمفتاح Esc فقط. */

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
    const show = () => { if (hero.classList.contains('hide')) hero.classList.remove('hide'); if (sc.classList.contains('hero-gone')) sc.classList.remove('hero-gone'); };   // بدون تعديل فارغ: classList.remove على صنف غير موجود يُطلق MutationObserver فيدور في حلقة لا نهائية
    sc.addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        tick = false; const y = sc.scrollTop, d = y - last; last = y;
        if (!mq.matches || y < 0) return show();           // مطاطية iOS أو شاشة كبيرة
        if (y <= 24) { acc = 0; return show(); }
        if (sc.scrollHeight - sc.clientHeight < 160) return show();   // محتوى قصير: لا داعي للإخفاء
        if ((d > 0) !== (acc > 0)) acc = 0; acc += d;       // تجميع الاتجاه لتجاهل الاهتزازات الصغيرة
        if (acc > 12 && y > 80) { hero.classList.add('hide'); sc.classList.add('hero-gone'); } else if (acc < -8) show();
      });
    }, { passive: true });
    mq.addEventListener && mq.addEventListener('change', show);
    new MutationObserver(show).observe(sc, { attributes: true, attributeFilter: ['class'] });   // عند فتح/إغلاق الشاشة
  });
  window.showHero = () => document.querySelectorAll('#doctorScreen>.hero,#nurseScreen>.hero').forEach(h => h.classList.remove('hide'));
})();

/* منع تغيير قيمة حقل الأرقام بعجلة الماوس (السكرول) */
document.addEventListener('wheel', ev => { const a = document.activeElement; if (a && a.tagName === 'INPUT' && a.type === 'number' && ev.target === a) a.blur(); }, { passive: true, capture: true });

/* معاينة الصور: تكبير (عجلة/قرص/نقرتان) + سحب + تدوير */
const LB = { z: 1, x: 0, y: 0, r: 0, rec: '', img: '', busy: false };
function lbApply() { const sv = $('#lbSave'); if (sv) sv.hidden = ((LB.r % 360) + 360) % 360 === 0; $('#lightboxImg').style.transform = `translate(${LB.x}px,${LB.y}px) rotate(${LB.r}deg) scale(${LB.z})`; }
async function lbSaveRot() {
  if (LB.busy) return; const deg = ((LB.r % 360) + 360) % 360; if (!deg || !LB.rec) return; LB.busy = true;
  const sv = $('#lbSave'); sv.disabled = true;
  try {
    const im = $('#lightboxImg'), w = im.naturalWidth, h = im.naturalHeight, sw = deg === 90 || deg === 270, cv = document.createElement('canvas');
    cv.width = sw ? h : w; cv.height = sw ? w : h; const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.translate(cv.width / 2, cv.height / 2); cx.rotate(deg * Math.PI / 180); cx.drawImage(im, -w / 2, -h / 2);
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92)); if (!blob) throw new Error('canvas');
    await api('PUT', `/api/records/${LB.rec}/images/${LB.img}`, undefined, { raw: blob });
    const k = LB.rec + '/' + LB.img, old = blobCache.get(k); blobCache.delete(k); if (old) old.then(u => setTimeout(() => URL.revokeObjectURL(u), 3000)).catch(() => {});
    const u = URL.createObjectURL(blob); blobCache.set(k, Promise.resolve(u));
    $$(`img[data-rec="${LB.rec}"][data-img="${LB.img}"]`).forEach(e => { e.src = u; }); im.src = u; lbReset();
    toast(settings.lang === 'en' ? 'Rotated image saved ✅' : 'تم حفظ الصورة بعد التدوير ✅', 'success');
  } catch (e) { if (e && e.code !== 'unauthorized' && e.code !== 'locked') toast(errMsg(e), 'danger'); }
  finally { LB.busy = false; sv.disabled = false; }
}
function lbReset() { LB.z = 1; LB.x = 0; LB.y = 0; LB.r = 0; lbApply(); }
function lbZoom(f) { LB.z = Math.min(8, Math.max(0.3, LB.z * f)); if (LB.z <= 1.02 && LB.z >= 0.98) { LB.z = 1; LB.x = LB.y = 0; } lbApply(); }
(function lbInit() {
  const m = $('#lightboxModal'), st = $('#lbStage'), pts = new Map(); let pd = 0, moved = false, lastTap = 0;
  m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('active'); return; } const b = e.target.closest('[data-lb]'); if (!b) return; const k = b.dataset.lb;
    if (k === 'in') lbZoom(1.4); else if (k === 'out') lbZoom(1 / 1.4); else if (k === 'rl') { LB.r -= 90; lbApply(); } else if (k === 'rr') { LB.r += 90; lbApply(); } else if (k === 'save') lbSaveRot(); else lbReset(); });
  st.addEventListener('wheel', e => { e.preventDefault(); lbZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  let downImg = false;
  st.addEventListener('pointerdown', e => { downImg = e.target.id === 'lightboxImg'; st.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = false; if (pts.size === 2) { const [p, q] = [...pts.values()]; pd = Math.hypot(p[0] - q[0], p[1] - q[1]); } });
  st.addEventListener('pointermove', e => { const o = pts.get(e.pointerId); if (!o) return; const n = [e.clientX, e.clientY];
    if (pts.size === 2) { pts.set(e.pointerId, n); const [p, q] = [...pts.values()], d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (pd) lbZoom(d / pd); pd = d; moved = true; }
    else if (pts.size === 1) { const dx = n[0] - o[0], dy = n[1] - o[1]; if (Math.abs(dx) + Math.abs(dy) > 0) { if (LB.z > 1 || moved) { LB.x += dx; LB.y += dy; lbApply(); } if (Math.abs(dx) + Math.abs(dy) > 2) moved = true; } pts.set(e.pointerId, n); } });
  const up = e => { pts.delete(e.pointerId); pd = 0; if (!pts.size && !moved && e.type === 'pointerup' && !downImg) { m.classList.remove('active'); return; } if (!pts.size && !moved && e.type === 'pointerup' && downImg) { const t = Date.now(); if (t - lastTap < 300) { LB.z > 1 ? lbReset() : (LB.z = 2.5, lbApply()); lastTap = 0; } else lastTap = t; } };
  st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  document.addEventListener('keydown', e => { if (!m.classList.contains('active')) return; if (e.key === '+' || e.key === '=') lbZoom(1.4); else if (e.key === '-') lbZoom(1 / 1.4); else if (e.key.toLowerCase() === 'r') { LB.r += 90; lbApply(); } });
})();
