import { BookOpen, Users, Award, Phone, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { updateSEO, pageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  useEffect(() => {
    updateSEO(pageSEO.about);
  }, []);

  const handleCall = () => {
    window.location.href = "tel:99457080";
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("مرحباً، أود الاستفسار عن خدمات المنصة");
    window.open(`https://wa.me/96599457080?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-l from-blue-600 to-green-600 text-white py-16">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">من نحن</h1>
          <p className="text-xl text-center text-blue-50">منصة ثانوي علمي الكويت - studygeology.k8</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-12 space-y-8">
        {/* Introduction */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              نبذة عن المنصة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              **منصة ثانوي علمي الكويت** هي منصة تعليمية متخصصة تهدف إلى توفير محتوى تعليمي عالي الجودة لطلاب المرحلة الثانوية في دولة الكويت، مع التركيز بشكل خاص على مادة **الجيولوجيا** للصفوف العاشر والحادي عشر والثاني عشر.
            </p>
            <p>
              نسعى لتسهيل عملية التعلم من خلال توفير مواد دراسية منظمة ومصنفة بعناية، تشمل الكتب المدرسية، الملخصات، المراجعات، والنماذج الامتحانية المحلولة وغير المحلولة.
            </p>
          </CardContent>
        </Card>

        {/* Our Services */}
        <Card className="border-2 border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-green-600" />
              خدماتنا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-blue-600">📚 المحتوى التعليمي</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• الكتاب المدرسي الرسمي</li>
                  <li>• ملخصات الشرح المبسطة</li>
                  <li>• مراجعات الاختبارات القصيرة</li>
                  <li>• مراجعات الفاينل الشاملة</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-green-600">📝 النماذج الامتحانية</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• نماذج اختبارات سابقة محلولة</li>
                  <li>• نماذج اختبارات غير محلولة للتدريب</li>
                  <li>• تغطية شاملة لجميع الفصول الدراسية</li>
                  <li>• محتوى محدث باستمرار</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Get Materials */}
        <Card className="border-2 border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              كيفية الحصول على المواد الدراسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              جميع المواد الدراسية المتوفرة على المنصة يمكن **معاينتها مجاناً** من خلال قارئ PDF المدمج في الموقع. يمكنك تصفح المحتوى والتأكد من جودته قبل الحصول على النسخة الكاملة.
            </p>
            <p>
              للحصول على المواد الدراسية الكاملة، يرجى التواصل مع **فارس العلوم** مباشرة عبر:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleCall}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
              >
                <Phone className="ml-2 h-5 w-5" />
                الاتصال: 99457080
              </Button>
              <Button 
                onClick={handleWhatsApp}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                <MessageCircle className="ml-2 h-5 w-5" />
                واتساب: 99457080
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Our Vision */}
        <Card className="border-2 border-orange-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">رؤيتنا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              نؤمن بأن **التعليم الجيد** هو حق لكل طالب، ونسعى لتوفير مواد تعليمية عالية الجودة تساعد الطلاب على تحقيق التفوق الأكاديمي في مادة الجيولوجيا.
            </p>
            <p>
              نعمل باستمرار على تحديث المحتوى وإضافة مواد جديدة لتلبية احتياجات الطلاب ومواكبة المناهج الدراسية الحديثة في دولة الكويت.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">تواصل معنا</CardTitle>
            <CardDescription className="text-blue-50 text-lg">نحن هنا لمساعدتك في رحلتك التعليمية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">فارس العلوم</p>
              <p className="text-2xl font-bold">📞 99457080</p>
              <p className="text-blue-50">متاح للرد على استفساراتكم في أي وقت</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Spacer */}
      <div className="h-16"></div>
    </div>
  );
}
