# مركز 7 أكتوبر الطبي

الموقع الرسمي العربي لمركز **7 أكتوبر الطبي — October 7 Medical Center**، بهوية بصرية تركوازية وذهبية وشعار يرتكز على الرقم 7 وخط النبض.

## الروابط

- [فتح الموقع عبر GitHub Pages](https://alferasayman-pixel.github.io/7October-medicalcenter/)
- [تعديل التصميم في Canva](https://www.canva.com/d/rvyebaFNp-JCMTq)
- [معاينة التصميم في Canva](https://www.canva.com/d/sekwEIwQwN9jze7)

## المزايا

- تصميم عربي RTL متجاوب مع الهاتف والكمبيوتر.
- أقسام المركز والتخصصات والأطباء والجودة والأسئلة الشائعة والتواصل.
- نموذج حجز يجهّز رسالة واتساب تلقائيًا.
- دعم التثبيت كتطبيق ويب PWA والعمل الجزئي دون اتصال.
- تحسينات الوصول وSEO وملفات Sitemap وRobots.
- نشر آلي من الفرع `main` عبر GitHub Actions.
- فرع `gh-pages` جاهز كخيار نشر بديل.

## تفعيل GitHub Pages لأول مرة

### الطريقة الموصى بها: GitHub Actions

1. افتح **Settings → Pages**.
2. من **Build and deployment** اختر **GitHub Actions**.
3. افتح تبويب **Actions** وانتظر اكتمال مهمة `Deploy website to GitHub Pages`.
4. افتح رابط الموقع الموجود أعلى هذا الملف.

### الطريقة البديلة: فرع gh-pages

اختر **Deploy from a branch** ثم الفرع `gh-pages` والمجلد `/(root)`.

## بيانات يجب تحديثها قبل الإطلاق الرسمي

- رقم الهاتف ورقم واتساب.
- العنوان ورابط الخريطة.
- البريد الإلكتروني.
- أسماء الأطباء وصورهم ومواعيدهم.
- روابط حسابات التواصل الاجتماعي.

## ملفات المشروع

- `index.html`: هيكل الموقع ومحتواه.
- `styles.css`: التصميم المتجاوب.
- `app.js`: التفاعلات والحجز عبر واتساب.
- `manifest.webmanifest`: إعدادات تطبيق الويب.
- `service-worker.js`: التخزين المؤقت والعمل دون اتصال.
- `.github/workflows/pages.yml`: النشر الآلي إلى GitHub Pages.
