# دليل تنفيذ شروط الاستخدام لقانوني

## نظرة عامة
هذا الدليل يوضح كيفية تنفيذ صفحة شروط الاستخدام لقانوني باستخدام Next.js 15 App Router. الصفحة ستكون متوفرة باللغة العربية مع دعم RTL، مع التركيز على الامتثال لقوانين المحاماة السعودية.

## الخطوات

### 1. إنشاء الملفات
أنشئ الملفات التالية في مجلد `app/` (أو `frontend/src/app/` إذا كان المشروع يستخدم مجلد frontend):

```
app/
├── terms-of-service/
│   ├── page.tsx
│   └── layout.tsx (اختياري)
```

### 2. صفحة شروط الاستخدام (app/terms-of-service/page.tsx)
```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | قانوني',
  description: 'شروط استخدام المنصة القانونية الذكية قانوني',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          شروط الاستخدام
        </h1>
        
        <div className="prose prose-lg max-w-none text-right" dir="rtl">
          <p className="text-sm text-gray-600 mb-8">
            <strong>تاريخ السريان:</strong> 25 مارس 2026
          </p>
          
          <p className="mb-6">
            مرحباً بك في <strong>قانوني (Qanuni)</strong>، المنصة القانونية الذكية من MiddleMind. هذه الشروط والأحكام ("الشروط") تحكم استخدامك لمنصة قانوني وخدماتها. باستخدام قانوني، أنت توافق على الالتزام بهذه الشروط.
          </p>

          {/* باقي المحتوى من ملف terms-of-service.md */}
          
          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold mb-4">الاتصال بنا</h2>
            <p>لأي استفسارات، اتصل بنا:</p>
            <ul className="list-disc list-inside mt-2">
              <li>البريد الإلكتروني: support@qanuni.middlemind.ai</li>
              <li>العنوان: الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
          
          <p className="mt-8 text-center text-gray-600">
            شكراً لاستخدام قانوني!
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 3. تحديث التخطيط الرئيسي (app/layout.tsx)
أضف دعم الخط العربي إذا لم يكن موجوداً:

```tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
```

### 4. ملف CSS العام (app/globals.css)
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* خط عربي */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Noto Sans Arabic', sans-serif;
}

/* تخصيص prose للعربية */
.prose {
  font-family: 'Noto Sans Arabic', sans-serif;
}

.prose h1, .prose h2, .prose h3 {
  font-weight: 600;
  color: #1f2937;
}

.prose p {
  line-height: 1.7;
  margin-bottom: 1rem;
}

.prose strong {
  font-weight: 600;
}
```

### 5. إضافة رابط في التذييل
في مكون التذييل:

```tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center space-x-6 rtl:space-x-reverse">
          <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
            سياسة الخصوصية
          </Link>
          <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900">
            شروط الاستخدام
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

### 6. اختبار الصفحة
- تأكد من عرض الصفحة على `/terms-of-service`
- تحقق من دعم RTL
- اختبر على الأجهزة المحمولة

### 7. النشر
```bash
git add .
git commit -m "feat: add PDPL-compliant Terms of Service page for Qanuni"
git push origin master
```

## ملاحظات قانونية
- هذه الشروط مكتوبة باللغة العربية للتوافق مع PDPL وقوانين المحاماة
- تأكد من مراجعة المحتوى مع محامٍ سعودي مرخص قبل النشر
- أضف تاريخ السريان وإشعارات التعديل كما هو مطلوب
- نظراً لطبيعة المنصة القانونية، تأكد من الامتثال لجميع متطلبات نقابة المحامين السعودية

## توافق PDPL وقوانين المحاماة
هذه التنفيذ تضمن الامتثال للمتطلبات القانونية السعودية من خلال:
- اللغة العربية
- الإشارة إلى القوانين السعودية وقوانين المحاماة
- حقوق المستخدمين والمسؤوليات
- السرية والخصوصية القانونية