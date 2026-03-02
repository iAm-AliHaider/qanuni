export type Locale = "en" | "ar";

const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.court_calendar": { en: "Court Calendar", ar: "تقويم المحكمة" },
  "nav.tasks": { en: "Tasks", ar: "المهام" },
  "nav.cases": { en: "Cases", ar: "القضايا" },
  "nav.clients": { en: "Clients", ar: "العملاء" },
  "nav.documents": { en: "Documents", ar: "المستندات" },
  "nav.poa": { en: "Power of Attorney", ar: "التوكيلات" },
  "nav.contracts": { en: "Contracts", ar: "العقود" },
  "nav.filings": { en: "Court Filings", ar: "الملفات القضائية" },
  "nav.time": { en: "Time Tracking", ar: "تتبع الوقت" },
  "nav.invoices": { en: "Invoicing", ar: "الفواتير" },
  "nav.expenses": { en: "Expenses", ar: "المصروفات" },
  "nav.trust": { en: "Trust Accounts", ar: "حسابات الأمانة" },
  "nav.retainers": { en: "Retainers", ar: "عقود التوكيل" },
  "nav.contacts": { en: "Contacts", ar: "جهات الاتصال" },
  "nav.communications": { en: "Communications", ar: "الاتصالات" },
  "nav.compliance": { en: "Compliance", ar: "الامتثال" },
  "nav.reports": { en: "Reports", ar: "التقارير" },
  "nav.research": { en: "Legal Research", ar: "البحث القانوني" },
  "nav.hr": { en: "Team & HR", ar: "الفريق والموارد البشرية" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },

  // Section titles
  "section.core": { en: "Core", ar: "الرئيسية" },
  "section.case_management": { en: "Case Management", ar: "إدارة القضايا" },
  "section.finance": { en: "Finance", ar: "المالية" },
  "section.operations": { en: "Operations", ar: "العمليات" },
  "section.insights": { en: "Insights", ar: "التحليلات" },

  // Common
  "common.new": { en: "New", ar: "جديد" },
  "common.create": { en: "Create", ar: "إنشاء" },
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.search": { en: "Search", ar: "بحث" },
  "common.filter": { en: "Filter", ar: "تصفية" },
  "common.all": { en: "All", ar: "الكل" },
  "common.status": { en: "Status", ar: "الحالة" },
  "common.total": { en: "Total", ar: "الإجمالي" },
  "common.active": { en: "Active", ar: "نشط" },
  "common.pending": { en: "Pending", ar: "قيد الانتظار" },
  "common.completed": { en: "Completed", ar: "مكتمل" },
  "common.overdue": { en: "Overdue", ar: "متأخر" },
  "common.sign_in": { en: "Sign In", ar: "تسجيل الدخول" },
  "common.sign_out": { en: "Sign Out", ar: "تسجيل الخروج" },
  "common.select_user": { en: "Select User", ar: "اختر المستخدم" },
  "common.enter_pin": { en: "Enter PIN", ar: "أدخل رمز PIN" },
  "common.choose_account": { en: "Choose your account...", ar: "اختر حسابك..." },
  "common.upload": { en: "Upload", ar: "رفع" },
  "common.download": { en: "Download", ar: "تحميل" },
  "common.export_pdf": { en: "Export PDF", ar: "تصدير PDF" },
  "common.no_data": { en: "No data found", ar: "لا توجد بيانات" },
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.signing_in": { en: "Signing in...", ar: "جاري تسجيل الدخول..." },
  "common.invalid_pin": { en: "Invalid PIN", ar: "رمز PIN غير صحيح" },

  // Dashboard
  "dash.active_cases": { en: "Active Cases", ar: "القضايا النشطة" },
  "dash.hearings": { en: "Hearings", ar: "الجلسات" },
  "dash.pending_tasks": { en: "Pending Tasks", ar: "المهام المعلقة" },
  "dash.deadlines": { en: "Deadlines", ar: "المواعيد النهائية" },
  "dash.recent_cases": { en: "Recent Cases", ar: "القضايا الأخيرة" },
  "dash.upcoming_hearings": { en: "Upcoming Hearings", ar: "الجلسات القادمة" },
  "dash.view_all": { en: "View All", ar: "عرض الكل" },
  "dash.overview": { en: "Overview", ar: "نظرة عامة" },
  "dash.time_entries": { en: "Time Entries", ar: "سجلات الوقت" },

  // Cases
  "case.title": { en: "Case Title", ar: "عنوان القضية" },
  "case.type": { en: "Case Type", ar: "نوع القضية" },
  "case.priority": { en: "Priority", ar: "الأولوية" },
  "case.client": { en: "Client", ar: "العميل" },
  "case.court": { en: "Court", ar: "المحكمة" },
  "case.judge": { en: "Judge", ar: "القاضي" },
  "case.opposing_party": { en: "Opposing Party", ar: "الطرف المقابل" },
  "case.najiz_ref": { en: "Najiz Reference", ar: "مرجع ناجز" },
  "case.new_case": { en: "New Case", ar: "قضية جديدة" },
  "case.criminal": { en: "Criminal", ar: "جنائي" },
  "case.civil": { en: "Civil", ar: "مدني" },
  "case.commercial": { en: "Commercial", ar: "تجاري" },
  "case.family": { en: "Family", ar: "أحوال شخصية" },
  "case.labor": { en: "Labor", ar: "عمالي" },
  "case.real_estate": { en: "Real Estate", ar: "عقاري" },

  // Clients
  "client.name": { en: "Client Name", ar: "اسم العميل" },
  "client.type": { en: "Client Type", ar: "نوع العميل" },
  "client.individual": { en: "Individual", ar: "فرد" },
  "client.company": { en: "Company", ar: "شركة" },
  "client.government": { en: "Government", ar: "جهة حكومية" },
  "client.kyc_status": { en: "KYC Status", ar: "حالة التحقق" },
  "client.risk_level": { en: "Risk Level", ar: "مستوى المخاطر" },

  // Finance
  "finance.amount": { en: "Amount", ar: "المبلغ" },
  "finance.sar": { en: "SAR", ar: "ريال" },
  "finance.vat": { en: "VAT", ar: "ضريبة القيمة المضافة" },
  "finance.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "finance.paid": { en: "Paid", ar: "مدفوع" },
  "finance.unpaid": { en: "Unpaid", ar: "غير مدفوع" },
  "finance.deposit": { en: "Deposit", ar: "إيداع" },
  "finance.withdrawal": { en: "Withdrawal", ar: "سحب" },
  "finance.balance": { en: "Balance", ar: "الرصيد" },
  "finance.billable": { en: "Billable", ar: "قابل للفوترة" },

  // Documents
  "doc.upload_file": { en: "Upload File", ar: "رفع ملف" },
  "doc.category": { en: "Category", ar: "الفئة" },
  "doc.pleadings": { en: "Pleadings", ar: "المرافعات" },
  "doc.contracts": { en: "Contracts", ar: "العقود" },
  "doc.evidence": { en: "Evidence", ar: "الأدلة" },
  "doc.correspondence": { en: "Correspondence", ar: "المراسلات" },
  "doc.court_filings": { en: "Court Filings", ar: "الملفات القضائية" },

  // Tasks
  "task.todo": { en: "To Do", ar: "قيد التنفيذ" },
  "task.in_progress": { en: "In Progress", ar: "جاري العمل" },
  "task.done": { en: "Done", ar: "مكتمل" },
  "task.critical": { en: "Critical", ar: "حرج" },
  "task.high": { en: "High", ar: "عالي" },
  "task.medium": { en: "Medium", ar: "متوسط" },
  "task.low": { en: "Low", ar: "منخفض" },
  "task.new_task": { en: "New Task", ar: "مهمة جديدة" },

  // Compliance
  "compliance.conflict_check": { en: "Conflict of Interest Check", ar: "فحص تضارب المصالح" },
  "compliance.run_check": { en: "Run Check", ar: "تشغيل الفحص" },
  "compliance.no_conflicts": { en: "No Conflicts Found", ar: "لم يتم العثور على تضارب" },
  "compliance.conflict_found": { en: "Conflict Found", ar: "تم العثور على تضارب" },
  "compliance.pending_kyc": { en: "Pending KYC", ar: "تحقق معلق" },
  "compliance.high_risk": { en: "High Risk", ar: "مخاطر عالية" },

  // Time
  "time.start_timer": { en: "Start Timer", ar: "بدء المؤقت" },
  "time.stop_timer": { en: "Stop Timer", ar: "إيقاف المؤقت" },
  "time.hours": { en: "Hours", ar: "ساعات" },
  "time.rate": { en: "Rate", ar: "السعر" },

  // Settings
  "settings.courts": { en: "Courts", ar: "المحاكم" },
  "settings.practice_areas": { en: "Practice Areas", ar: "مجالات الممارسة" },
  "settings.policies": { en: "Policies", ar: "السياسات" },
  "settings.templates": { en: "Templates", ar: "القوالب" },

  // Footer
  "footer.firm_name": { en: "Al-Rashid & Partners Law Firm", ar: "مكتب الراشد والشركاء للمحاماة" },
  "footer.powered_by": { en: "Powered by Qanuni", ar: "بدعم من قانوني" },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[key]?.[locale] || translations[key]?.en || key;
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getFont(locale: Locale): string {
  return locale === "ar" ? "'Noto Sans Arabic', 'Inter', system-ui, sans-serif" : "'Inter', 'Noto Sans Arabic', system-ui, sans-serif";
}
