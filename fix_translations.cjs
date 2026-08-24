const fs = require('fs');

let content = fs.readFileSync('src/translations.ts', 'utf8');

// Fix the French q1-q4 titles
const frenchReplace = [
  { eng: "q4_title: 'Want to start a digital product side hustle?'", fr: "q4_title: 'Envie de lancer un business de produits digitaux ?'" },
  { eng: "q3_title: 'Looking for secret web productivity tools?'", fr: "q3_title: 'À la recherche d\\'outils de productivité web secrets ?'" },
  { eng: "q2_title: 'Need ready-to-use Python & JS source code?'", fr: "q2_title: 'Besoin de code source Python & JS prêt à l\\'emploi ?'" },
  { eng: "q1_title: 'Want to speed up your sluggish smartphone?'", fr: "q1_title: 'Envie d\\'accélérer votre smartphone lent ?'" }
];

// In the fr: {} block, we have the english strings.
// A safe way is to find the index of "fr: {" and replace within that block, or just global replace if we know they are duplicated identically.
// Wait, they ARE duplicated identically in both fr and ar because of my sed commands.
// Let's replace the Arabic ones properly and the French ones properly.

// Read the file as an object (eval it? No, just regex or string split).
let enStart = content.indexOf("en: {");
let frStart = content.indexOf("fr: {");
let arStart = content.indexOf("ar: {");

let enPart = content.substring(enStart, frStart);
let frPart = content.substring(frStart, arStart);
let arPart = content.substring(arStart);

// French replacements
frPart = frPart.replace("q4_title: 'Want to start a digital product side hustle?'", "q4_title: 'Envie de lancer un business de produits digitaux ?'");
frPart = frPart.replace("q3_title: 'Looking for secret web productivity tools?'", "q3_title: 'À la recherche d\\'outils de productivité web secrets ?'");
frPart = frPart.replace("q2_title: 'Need ready-to-use Python & JS source code?'", "q2_title: 'Besoin de code source Python & JS prêt à l\\'emploi ?'");
frPart = frPart.replace("q1_title: 'Want to speed up your sluggish smartphone?'", "q1_title: 'Envie d\\'accélérer votre smartphone lent ?'");

// Arabic replacements for swipe cards
arPart = arPart.replace("q4_title: 'Want to start a digital product side hustle?'", "q4_title: 'هل ترغب في بدء عمل جانبي للمنتجات الرقمية؟'");
arPart = arPart.replace("q3_title: 'Looking for secret web productivity tools?'", "q3_title: 'هل تبحث عن أدوات سرية لزيادة إنتاجية الويب؟'");
arPart = arPart.replace("q2_title: 'Need ready-to-use Python & JS source code?'", "q2_title: 'هل تحتاج إلى شيفرة مصدرية بايثون وجافا سكريبت جاهزة؟'");
arPart = arPart.replace("q1_title: 'Want to speed up your sluggish smartphone?'", "q1_title: 'هل ترغب في تسريع هاتفك الذكي البطيء؟'");

// Arabic RTL fixes (Arrow)
// ➔ is U+2794. In Arabic, it should be inverted or we just use CSS. But user said "remove the one attached to the text" or "a lot of elements are not inverted, like arrows in the downlaod now buttons etc... fix that."
// Actually, earlier I removed the `<ArrowRight>` from the button in `App.tsx` and kept `➔` in the text.
// Now the user says: "a lot of elements are not inverted, like arrows in the downlaod now buttons etc, as u know arabic goes from right to left. fix that."
// Let's replace '➔' with '🡄' or just use CSS. 
arPart = arPart.replace(/➔/g, "🡄"); 
// Let's check other Darija that might have been missed.
arPart = arPart.replace(/شنو كاين فـ الخزنة؟/g, 'ماذا يوجد في الخزنة؟');
arPart = arPart.replace(/اكتشف شنو كاين/g, 'استكشف المحتوى');
arPart = arPart.replace(/هادشي كامل فابور/g, 'كل هذا مجاني');
arPart = arPart.replace(/غير بـ/g, 'فقط بـ');
arPart = arPart.replace(/واجدة للاستخدام/g, 'جاهزة للاستخدام');
arPart = arPart.replace(/كولشي هنا فابور/g, 'كل شيء هنا مجاني');
arPart = arPart.replace(/دوز لليمين للأدوات المفيدة، ولليسر للقديمة/g, 'اسحب لليمين للأدوات المفيدة، ولليسار للقديمة');
arPart = arPart.replace(/زيد للتحميلات/g, 'إضافة للتنزيلات');
arPart = arPart.replace(/السمية والكنية/g, 'الاسم الكامل');
arPart = arPart.replace(/رقم التليفون/g, 'رقم الهاتف');
arPart = arPart.replace(/واش بغيتي تشوف/g, 'هل ترغب في رؤية');

// Reconstruct
content = enPart + frPart + arPart;

fs.writeFileSync('src/translations.ts', content);
