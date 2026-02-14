import { Link } from "wouter";
import { useEffect } from "react";
import { updateSEO, pageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Eye, Lock, Database, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    updateSEO(pageSEO.privacy);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-green-600 text-white py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">سياسة الخصوصية</h1>
          </div>
          <p className="text-xl text-blue-50">مذكرة و مدرس - مدرس كيمياء - أحياء - جيولوجيا</p>
          <p className="text-sm text-blue-100 mt-2">آخر تحديث: {new Date().toLocaleDateString("ar-KW")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-600" />
              مقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              نحن في **مذكرة و مدرس** نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا التعليمية.
            </p>
            <p>
              باستخدامك لهذه المنصة، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-green-600" />
              المعلومات التي نجمعها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">1. المعلومات الشخصية</h3>
              <p className="text-muted-foreground">
                عند التسجيل أو التواصل معنا، قد نجمع المعلومات التالية:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground mr-4">
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>رقم الهاتف (عند التواصل عبر واتساب)</li>
                <li>الصف الدراسي</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. معلومات الاستخدام</h3>
              <p className="text-muted-foreground">
                نجمع معلومات حول كيفية استخدامك للمنصة، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground mr-4">
                <li>الصفحات التي تزورها</li>
                <li>المذكرات التي تعاينها</li>
                <li>وقت وتاريخ الزيارة</li>
                <li>عنوان IP الخاص بك</li>
                <li>نوع المتصفح والجهاز المستخدم</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. ملفات تعريف الارتباط (Cookies)</h3>
              <p className="text-muted-foreground">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة، مثل تذكر تفضيلاتك وتسجيل دخولك.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-purple-600" />
              كيف نستخدم معلوماتك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>توفير وتحسين خدماتنا التعليمية</li>
              <li>التواصل معك بخصوص المذكرات والحصص الدراسية</li>
              <li>معالجة طلبات الشراء والحجوزات</li>
              <li>تحليل استخدام المنصة لتحسين المحتوى</li>
              <li>إرسال إشعارات حول المحتوى الجديد (بموافقتك)</li>
              <li>حماية المنصة من الاستخدام غير المصرح به</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-orange-600" />
              حماية بياناتك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو التدمير، بما في ذلك:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>تشفير البيانات الحساسة (SSL/TLS)</li>
              <li>تخزين البيانات على خوادم آمنة</li>
              <li>تقييد الوصول إلى المعلومات الشخصية</li>
              <li>مراجعة دورية للإجراءات الأمنية</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>مشاركة المعلومات مع أطراف ثالثة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              **نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة.** قد نشارك معلوماتك فقط في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>عند الحصول على موافقتك الصريحة</li>
              <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة (مثل خدمات الاستضافة)</li>
              <li>عند الامتثال للقوانين أو الأوامر القضائية</li>
              <li>لحماية حقوقنا أو سلامة المستخدمين</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle>حقوقك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
              <li>الوصول إلى معلوماتك الشخصية</li>
              <li>تصحيح أو تحديث معلوماتك</li>
              <li>طلب حذف معلوماتك</li>
              <li>الاعتراض على معالجة معلوماتك</li>
              <li>سحب موافقتك في أي وقت</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              للاستفسارات أو ممارسة حقوقك، يرجى التواصل معنا عبر:
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="font-bold">فارس العلوم: 99457080</span>
            </div>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card>
          <CardHeader>
            <CardTitle>التعديلات على السياسة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" في الأعلى.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">تواصل معنا</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا:
            </p>
            <div className="space-y-2">
              <p className="font-bold text-xl">فارس العلوم</p>
              <p className="text-blue-50">📞 99457080</p>
              <p className="text-blue-50">📧 متاح عبر واتساب</p>
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
