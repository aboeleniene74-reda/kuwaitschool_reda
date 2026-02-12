import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, GraduationCap, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function FAQPage() {
  const faqs = [
    {
      question: "ما هي مذكرة و مدرس؟",
      answer: "مذكرة و مدرس هي منصة تعليمية كويتية متخصصة في توفير المذكرات العلمية الشاملة للمرحلة الثانوية (الصف العاشر، الحادي عشر، والثاني عشر) في مواد الكيمياء، الأحياء، الفيزياء، والجيولوجيا. نوفر ملخصات الشرح، مراجعات، نماذج اختبارات، والكتب المدرسية مع بنك أسئلة التوجيه الفني."
    },
    {
      question: "هل الكتب المدرسية مجانية؟",
      answer: "نعم! جميع الكتب المدرسية وبنك أسئلة التوجيه الفني متاحة للمعاينة الكاملة والتحميل المجاني لجميع الطلاب. نؤمن بأن الكتب المدرسية حق لكل طالب."
    },
    {
      question: "كيف يمكنني الحصول على المذكرات؟",
      answer: "يمكنك تصفح المذكرات حسب الصف الدراسي والمادة، ثم معاينة المذكرة قبل الشراء. بعد الشراء، يمكنك تحميل المذكرة بصيغة PDF والاحتفاظ بها للدراسة في أي وقت."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نوفر عدة طرق دفع آمنة ومريحة: الدفع عند الاستلام (التوصيل المجاني في الكويت)، الدفع الإلكتروني، أو التحويل البنكي. يمكنك اختيار الطريقة الأنسب لك."
    },
    {
      question: "هل يوجد توصيل مجاني؟",
      answer: "نعم! نوفر خدمة التوصيل المجاني لجميع المذكرات المطبوعة داخل دولة الكويت. يمكنك التواصل معنا عبر الهاتف أو واتساب لترتيب التوصيل."
    },
    {
      question: "ما الفرق بين الأقسام المختلفة؟",
      answer: "نوفر 6 أقسام لكل مادة: (1) الكتاب المدرسي + بنك أسئلة التوجيه الفني (مجاني)، (2) ملخصات الشرح، (3) مراجعات قصير 1، (4) مراجعات قصير 2، (5) مراجعات الفاينل، (6) نماذج اختبارات سابقة."
    },
    {
      question: "هل المذكرات متوافقة مع منهج الكويت؟",
      answer: "نعم، جميع المذكرات معدة خصيصاً لمنهج وزارة التربية الكويتية وتتبع معايير التوجيه الفني للعلوم. المحتوى محدث ويغطي جميع متطلبات المنهج الدراسي."
    },
    {
      question: "هل يمكنني معاينة المذكرة قبل الشراء؟",
      answer: "بالتأكيد! نوفر معاينة مجانية لأول 3 صفحات من كل مذكرة لتتمكن من تقييم جودة المحتوى قبل اتخاذ قرار الشراء."
    },
    {
      question: "ماذا لو لم تعجبني المذكرة؟",
      answer: "نحن واثقون من جودة مذكراتنا، ولكن إذا لم تكن راضياً عن المحتوى، يمكنك التواصل معنا خلال 7 أيام من الشراء وسنعمل على حل المشكلة أو استرداد المبلغ."
    },
    {
      question: "هل تتوفر مذكرات لجميع الصفوف؟",
      answer: "نعم، نوفر مذكرات شاملة للصف العاشر، الحادي عشر، والثاني عشر في جميع المواد العلمية (الكيمياء، الأحياء، الفيزياء، والجيولوجيا للصف الحادي عشر)."
    },
    {
      question: "كيف يمكنني التواصل معكم؟",
      answer: "يمكنك التواصل معنا عبر الهاتف/واتساب على رقم 99887766، أو عبر البريد الإلكتروني، أو من خلال نموذج التواصل في صفحة 'من نحن'. نحن متواجدون للرد على استفساراتكم."
    },
    {
      question: "هل المذكرات محدثة للعام الدراسي الحالي؟",
      answer: "نعم، نحرص على تحديث جميع المذكرات بشكل دوري لتتماشى مع أي تغييرات في المنهج الدراسي. تاريخ آخر تحديث موضح في صفحة كل مذكرة."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">مذكرة و مدرس</h1>
                <p className="text-xs text-muted-foreground">مذكرات المرحلة الثانوية بالكويت</p>
              </div>
            </div>
          </Link>

          <Link href="/">
            <Button variant="outline">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="container py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-lg text-muted-foreground">
            إجابات على أكثر الأسئلة شيوعاً حول مذكرة و مدرس والمذكرات التعليمية
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">كل ما تحتاج معرفته</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-right text-lg font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-right text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">لم تجد إجابة لسؤالك؟</h3>
            <p className="text-muted-foreground mb-6">
              تواصل معنا عبر الهاتف أو واتساب وسنكون سعداء بمساعدتك
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/about">
                <Button size="lg">
                  <ArrowRight className="ml-2 w-5 h-5" />
                  تواصل معنا
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  <ArrowRight className="ml-2 w-5 h-5" />
                  تصفح المذكرات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 مذكرة و مدرس - جميع الحقوق محفوظة</p>
          <p className="text-sm mt-2">
            هاتف/واتساب: 99887766 | التوصيل المجاني في الكويت
          </p>
        </div>
      </footer>
    </div>
  );
}
