import { Link } from "wouter";
import { useEffect } from "react";
import { updateSEO, pageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    updateSEO(pageSEO.terms);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-blue-600 text-white py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">شروط الاستخدام</h1>
          </div>
          <p className="text-xl text-purple-50">مذكرة و مدرس - مذكرات المرحلة الثانوية بالكويت</p>
          <p className="text-sm text-purple-100 mt-2">آخر تحديث: {new Date().toLocaleDateString("ar-KW")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>مرحباً بك في منصتنا التعليمية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              باستخدامك لمنصة **ثانوي علمي الكويت**، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام المنصة.
            </p>
            <p>
              إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              الاستخدام المقبول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">يُسمح لك باستخدام المنصة للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>تصفح ومعاينة المذكرات التعليمية المجانية</li>
              <li>التواصل معنا للحصول على النسخ الكاملة من المذكرات</li>
              <li>حجز الحصص الدراسية أونلاين</li>
              <li>التفاعل مع المحتوى التعليمي بشكل قانوني</li>
              <li>تقييم المذكرات والحصص بشكل صادق</li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              الاستخدام المحظور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">يُحظر عليك القيام بالأنشطة التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>نسخ أو توزيع أو نشر المحتوى التعليمي بدون إذن</li>
              <li>محاولة تحميل المذكرات الكاملة بطرق غير مصرح بها</li>
              <li>استخدام برامج آلية (bots) للوصول إلى المنصة</li>
              <li>اختراق أو محاولة الوصول غير المصرح به للنظام</li>
              <li>نشر محتوى مسيء أو غير قانوني</li>
              <li>انتحال شخصية الآخرين</li>
              <li>إساءة استخدام نظام التقييمات أو التعليقات</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>الملكية الفكرية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              جميع المحتويات المتاحة على المنصة، بما في ذلك المذكرات والمراجعات والنماذج الامتحانية والتصاميم والشعارات، محمية بموجب قوانين حقوق النشر والملكية الفكرية.
            </p>
            <p className="text-muted-foreground font-bold">
              يحظر نسخ أو توزيع أو نشر أي محتوى من المنصة بدون الحصول على إذن كتابي مسبق من المالك.
            </p>
          </CardContent>
        </Card>

        {/* Content Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle>دقة المحتوى</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              نبذل قصارى جهدنا لضمان دقة وجودة المحتوى التعليمي المقدم، لكننا لا نضمن أن المحتوى خالٍ تماماً من الأخطاء.
            </p>
            <p className="text-muted-foreground">
              يُنصح الطلاب بالرجوع إلى المصادر الرسمية (الكتب المدرسية والمعلمين) للتأكد من المعلومات.
            </p>
          </CardContent>
        </Card>

        {/* Pricing & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>الأسعار والدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>جميع الأسعار معروضة بالدينار الكويتي (KWD)</li>
              <li>نحتفظ بالحق في تغيير الأسعار في أي وقت</li>
              <li>الدفع يتم عبر التواصل المباشر مع فارس العلوم</li>
              <li>لا يمكن استرداد المبالغ بعد استلام المذكرات الكاملة</li>
              <li>يمكن إلغاء حجز الحصص قبل 24 ساعة من موعدها</li>
            </ul>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              تحديد المسؤولية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              المنصة مقدمة "كما هي" و "حسب التوفر". نحن لا نتحمل المسؤولية عن:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>أي أخطاء أو سهو في المحتوى التعليمي</li>
              <li>انقطاع الخدمة أو الأخطاء التقنية</li>
              <li>فقدان البيانات أو الأضرار الناتجة عن استخدام المنصة</li>
              <li>نتائج الامتحانات أو الأداء الأكاديمي للطلاب</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>حسابات المستخدمين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              عند إنشاء حساب على المنصة، فإنك توافق على:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>تقديم معلومات صحيحة ودقيقة</li>
              <li>الحفاظ على سرية كلمة المرور الخاصة بك</li>
              <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
              <li>تحمل المسؤولية عن جميع الأنشطة التي تتم من خلال حسابك</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>إنهاء الخدمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              نحتفظ بالحق في تعليق أو إنهاء وصولك إلى المنصة في أي وقت، دون إشعار مسبق، في حالة:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>انتهاك أي من شروط الاستخدام</li>
              <li>استخدام المنصة بطريقة غير قانونية أو ضارة</li>
              <li>تقديم معلومات كاذبة أو مضللة</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>التعديلات على الشروط</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>القانون الحاكم</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              تخضع هذه الشروط وتفسر وفقاً لقوانين دولة الكويت. أي نزاع ينشأ عن استخدام المنصة يخضع للاختصاص القضائي الحصري لمحاكم الكويت.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">تواصل معنا</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              إذا كان لديك أي أسئلة حول شروط الاستخدام، يرجى التواصل معنا:
            </p>
            <div className="space-y-2">
              <p className="font-bold text-xl">فارس العلوم</p>
              <p className="text-purple-50">📞 99457080</p>
              <p className="text-purple-50">📧 متاح عبر واتساب</p>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center pt-6">
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 h-5 w-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
