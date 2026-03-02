# Task: Wire Arabic i18n translations across ALL Qanuni pages

## Context
This is a Next.js 15 law firm management app (Qanuni) for Saudi Arabia.
i18n system: `src/lib/i18n.ts` has 366 translation keys with both `en` and `ar` values.
Hook: `useLocale()` from `src/components/LocaleContext.tsx` returns `{ t, locale, dir }`
Usage pattern: `const { t, locale, dir } = useLocale();` then `t('nav.cases')` etc.
RTL: Add `dir={dir}` to root div of each page when locale is 'ar'.

## Pages to wire (add useLocale + replace hardcoded English with t() calls):
1. src/app/time/page.tsx
2. src/app/zatca/page.tsx
3. src/app/portal/page.tsx
4. src/app/invoices/page.tsx
5. src/app/audit/page.tsx
6. src/app/templates/page.tsx
7. src/app/hr/page.tsx
8. src/app/retainers/page.tsx
9. src/app/tasks/page.tsx
10. src/app/contacts/page.tsx
11. src/app/compliance/page.tsx
12. src/app/reports/page.tsx
13. src/app/settings/page.tsx
14. src/app/trust/page.tsx
15. src/app/page.tsx (Dashboard)
16. src/app/cases/page.tsx
17. src/app/clients/page.tsx
18. src/app/documents/page.tsx
19. src/app/poa/page.tsx
20. src/app/contracts/page.tsx
21. src/app/filings/page.tsx
22. src/app/expenses/page.tsx
23. src/app/communications/page.tsx
24. src/app/research/page.tsx
25. src/app/analytics/page.tsx

## For EACH page do:
1. Add import: `import { useLocale } from '@/components/LocaleContext';`
2. Add inside component function: `const { t, locale, dir } = useLocale();`
3. Add `dir={dir}` to the outermost JSX div
4. Replace ALL hardcoded English UI strings in JSX with t() calls

## Common key mappings (already in i18n.ts):
- 'Loading...' -> t('common.loading')
- 'Save' -> t('common.save')
- 'Cancel' -> t('common.cancel')
- 'Search' -> t('common.search')
- 'Filter' -> t('common.filter')
- 'New' / 'Create' -> t('common.new') / t('common.create')
- 'Edit' -> t('common.edit')
- 'Delete' -> t('common.delete')
- 'Status' -> t('common.status')
- 'Amount' -> t('common.amount')
- 'Date' -> t('common.date')
- 'Notes' -> t('common.notes')
- 'Description' -> t('common.description')
- 'Total' -> t('common.total')
- 'Active' -> t('common.active')
- 'Pending' -> t('common.pending')
- 'Completed' -> t('common.completed')
- 'Overdue' -> t('common.overdue')
- 'Upload' -> t('common.upload')
- 'Download' -> t('common.download')
- 'View' -> t('common.view')
- 'Approve' -> t('common.approve')
- 'Reject' -> t('common.reject')
- 'No data found' -> t('common.no_data')
- Page title 'Dashboard' -> t('nav.dashboard')
- Page title 'Cases' -> t('nav.cases')
- Page title 'Clients' -> t('nav.clients')
- Page title 'Documents' -> t('nav.documents')
- Page title 'Time Tracking' -> t('nav.time')
- Page title 'Invoicing' -> t('nav.invoices')
- Page title 'Expenses' -> t('nav.expenses')
- Page title 'Trust Accounts' -> t('nav.trust')
- Page title 'Retainers' -> t('nav.retainers')
- Page title 'Contacts' -> t('nav.contacts')
- Page title 'Communications' -> t('nav.communications')
- Page title 'Compliance' -> t('nav.compliance')
- Page title 'Reports' -> t('nav.reports')
- Page title 'Legal Research' -> t('nav.research')
- Page title 'Team & HR' -> t('nav.hr')
- Page title 'Settings' -> t('nav.settings')
- Page title 'Court Filings' -> t('nav.filings')
- Page title 'Power of Attorney' -> t('nav.poa')
- Page title 'Contracts' -> t('nav.contracts')
- Page title 'Court Calendar' -> t('nav.court_calendar')
- Page title 'Tasks' -> t('nav.tasks')
- Page title 'ZATCA' -> t('nav.zatca') if exists, else add it

## For strings NOT yet in i18n.ts, ADD them to src/lib/i18n.ts with both en+ar:
Examples of strings to add:
- "time.billable_hours": { en: "Billable Hours", ar: "الساعات القابلة للفوترة" }
- "time.hours": { en: "Hours", ar: "الساعات" }
- "time.rate": { en: "Rate", ar: "السعر" }
- "time.activity": { en: "Activity Type", ar: "نوع النشاط" }
- "invoice.issue_date": { en: "Issue Date", ar: "تاريخ الإصدار" }
- "invoice.due_date": { en: "Due Date", ar: "تاريخ الاستحقاق" }
- "invoice.vat": { en: "VAT", ar: "ضريبة القيمة المضافة" }
- "invoice.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" }
- "invoice.paid": { en: "Paid", ar: "مدفوع" }
- "invoice.unpaid": { en: "Unpaid", ar: "غير مدفوع" }
- "invoice.draft": { en: "Draft", ar: "مسودة" }
- "trust.balance": { en: "Balance", ar: "الرصيد" }
- "trust.ledger": { en: "Ledger", ar: "دفتر الأستاذ" }
- "audit.action": { en: "Action", ar: "الإجراء" }
- "audit.actor": { en: "User", ar: "المستخدم" }
- "template.preview": { en: "Preview", ar: "معاينة" }
- "template.render": { en: "Render", ar: "عرض" }
- "compliance.conflict_check": { en: "Conflict Check", ar: "فحص التعارض" }
- "nav.zatca": { en: "ZATCA", ar: "هيئة الزكاة والضريبة" }
- "nav.analytics": { en: "Analytics", ar: "التحليلات" }
- "common.billable": { en: "Billable", ar: "قابل للفوترة" }
- "common.role": { en: "Role", ar: "الدور" }
- "common.department": { en: "Department", ar: "القسم" }
- "common.actions": { en: "Actions", ar: "الإجراءات" }
- "common.name": { en: "Name", ar: "الاسم" }
- "common.email": { en: "Email", ar: "البريد الإلكتروني" }
- "common.phone": { en: "Phone", ar: "الهاتف" }
- "common.address": { en: "Address", ar: "العنوان" }
- "common.type": { en: "Type", ar: "النوع" }
- "common.priority": { en: "Priority", ar: "الأولوية" }
- "common.assigned_to": { en: "Assigned To", ar: "مسند إلى" }
- "common.due_date": { en: "Due Date", ar: "تاريخ الاستحقاق" }
- "common.created_at": { en: "Created", ar: "تاريخ الإنشاء" }
- "common.updated_at": { en: "Updated", ar: "تاريخ التحديث" }
- "common.submit": { en: "Submit", ar: "إرسال" }
- "common.close": { en: "Close", ar: "إغلاق" }
- "common.back": { en: "Back", ar: "رجوع" }
- "common.next": { en: "Next", ar: "التالي" }
- "common.previous": { en: "Previous", ar: "السابق" }
- "common.refresh": { en: "Refresh", ar: "تحديث" }
- "common.export": { en: "Export", ar: "تصدير" }
- "common.import": { en: "Import", ar: "استيراد" }
- "common.print": { en: "Print", ar: "طباعة" }
- "common.yes": { en: "Yes", ar: "نعم" }
- "common.no": { en: "No", ar: "لا" }
- "common.confirm": { en: "Confirm", ar: "تأكيد" }
- "common.success": { en: "Success", ar: "تم بنجاح" }
- "common.error": { en: "Error", ar: "خطأ" }
- "common.warning": { en: "Warning", ar: "تحذير" }
- "common.case": { en: "Case", ar: "القضية" }
- "common.client": { en: "Client", ar: "العميل" }
- "common.lawyer": { en: "Lawyer", ar: "المحامي" }
- "common.judge": { en: "القاضي", ar: "القاضي" }
- "common.court": { en: "Court", ar: "المحكمة" }
- "common.hearing": { en: "Hearing", ar: "جلسة الاستماع" }
- "common.deadline": { en: "Deadline", ar: "الموعد النهائي" }
- "common.value": { en: "Value", ar: "القيمة" }
- "common.category": { en: "Category", ar: "الفئة" }
- "common.title": { en: "Title", ar: "العنوان" }
- "common.subject": { en: "Subject", ar: "الموضوع" }
- "common.content": { en: "Content", ar: "المحتوى" }
- "common.file": { en: "File", ar: "الملف" }
- "common.size": { en: "Size", ar: "الحجم" }
- "common.format": { en: "Format", ar: "التنسيق" }
- "common.language": { en: "Language", ar: "اللغة" }
- "common.currency": { en: "Currency", ar: "العملة" }
- "common.country": { en: "Country", ar: "الدولة" }
- "common.city": { en: "City", ar: "المدينة" }

## IMPORTANT rules:
- Do NOT break any existing functionality
- Keep all existing imports, state, API calls, and logic intact
- Only ADD useLocale import+hook, and replace JSX string literals
- Strings inside fetch() calls, JSON bodies, variable values = DO NOT translate
- Only translate user-visible UI text: button labels, headings, table column headers, placeholder attributes, aria-labels
- Do NOT modify src/components/AppShell.tsx (already done)
- Do NOT modify src/components/LocaleContext.tsx
- Do NOT modify src/lib/i18n.ts structure, only ADD new keys at the end of each section
- Process pages one at a time, read each file fully before editing

When all pages are done, run: openclaw system event --text "Done: Qanuni i18n wired across all pages" --mode now
