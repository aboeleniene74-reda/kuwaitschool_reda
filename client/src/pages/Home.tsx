import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, GraduationCap, LogIn, User, Phone, Video } from "lucide-react";
import { Link } from "wouter";
import { SiteRatingForm } from "@/components/SiteRatingForm";
import { SiteRatingsList } from "@/components/SiteRatingsList";
import { RatingsStatistics } from "@/components/RatingsStatistics";
import { SearchBox } from "@/components/SearchBox";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { useEffect } from "react";
import { updateSEO, defaultSEO } from "@/lib/seo";

export default function Home() {
  const { user, loading } = useAuth();
  const { data: grades } = trpc.grades.list.useQuery();
  const trackVisit = trpc.statistics.trackVisit.useMutation();

  useEffect(() => {
    updateSEO(defaultSEO);
    
    // تتبع زيارة الصفحة الرئيسية
    trackVisit.mutate({
      ipAddress: undefined,
      userAgent: navigator.userAgent,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">منصة K8 للعلوم</h1>
              <p className="text-xs text-muted-foreground">مذكرات علمية للمرحلة الثانوية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/about">
              <Button variant="ghost" size="sm">
                من نحن
              </Button>
            </Link>
            <Link href="/sessions">
              <Button variant="ghost" size="sm" className="gap-2">
                <Video className="w-4 h-4" />
                الحصص
              </Button>
            </Link>
            {loading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <NotificationsDropdown />
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </div>
            ) : (
              <a href={"/login"}>
                <Button>
                  <LogIn className="ml-2 w-5 h-5" />
                  تسجيل الدخول
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            مذكرات علمية شاملة
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            أفضل المذكرات الدراسية في الكيمياء والأحياء والفيزياء والجيولوجيا للمرحلة الثانوية بالكويت
          </p>
          
          {/* Search Box */}
          <SearchBox />
        </div>

        {/* Grades Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {!grades || grades.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">قريباً</h3>
              <p className="text-muted-foreground">سيتم إضافة المذكرات الدراسية قريباً</p>
            </div>
          ) : (
            grades.map((grade) => (
              <Link key={grade.id} href={`/grade/${grade.id}`}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden relative">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="text-center pb-4 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <GraduationCap className="w-12 h-12 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{grade.name}</CardTitle>
                    {grade.description && (
                      <CardDescription className="text-base mt-2">{grade.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Button className="w-full shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 text-lg" size="lg">
                      عرض المواد
                      <GraduationCap className="mr-2 w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">لماذا منصة ثانوي علمي؟</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>محتوى شامل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  مذكرات مفصلة تغطي جميع موضوعات المنهج بأسلوب واضح ومبسط
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>معلمون متخصصون</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  مذكرات معدة من قبل معلمين ذوي خبرة طويلة في التدريس
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>سهولة الوصول</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  تصفح واشترِ المذكرات بسهولة وحملها فوراً بصيغة PDF
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <SiteRatingForm />
          </div>
        </div>
      </section>
      {/* Ratings Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            <RatingsStatistics />
            <SiteRatingsList />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container">         <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">ماذا يقول طلابنا</h3>
            <p className="text-muted-foreground text-lg">
              شهادات حقيقية من طلاب استفادوا من مذكراتنا التعليمية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />  
                  </div>
                  <div>
                    <p className="font-bold">أحمد الكندري</p>
                    <p className="text-sm text-muted-foreground">الصف الثاني عشر</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "المذكرات ساعدتني كثيراً في فهم الكيمياء. الشرح واضح والأمثلة مفيدة جداً. حصلت على 95% في الاختبار النهائي!"
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">فاطمة العتيبي</p>
                    <p className="text-sm text-muted-foreground">الصف الحادي عشر</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "أفضل مذكرات جيولوجيا! المراجعات النهائية كانت شاملة وساعدتني أفهم المادة بسهولة. شكراً لكم!"
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">خالد المطيري</p>
                    <p className="text-sm text-muted-foreground">الصف العاشر</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "التوصيل كان سريع والمذكرات بجودة عالية. نماذج الاختبارات المحلولة ساعدتني أتدرب قبل الامتحان."
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">تواصل معنا</h3>
              <p className="text-muted-foreground text-lg">
                للاستفسارات أو الحصول على المذكرات، تواصل معنا مباشرة
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">الاسم</p>
                      <p className="text-xl font-bold">فارس العلوم</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-16 bg-border" />

                  {/* Phone */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                      <a href="tel:99457080" className="text-xl font-bold hover:text-primary transition-colors">
                        99457080
                      </a>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          التوصيل المجاني
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-8 text-center">
                  <a href="tel:99457080">
                    <Button size="lg" className="gap-2">
                      <Phone className="w-5 h-5" />
                      اتصل الآن
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground">© 2024 منصة ثانوي علمي - جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-4">
              <Link href="/faq">
                <Button variant="link" className="text-muted-foreground hover:text-primary">
                  الأسئلة الشائعة
                </Button>
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/privacy">
                <Button variant="link" className="text-muted-foreground hover:text-primary">
                  سياسة الخصوصية
                </Button>
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/terms">
                <Button variant="link" className="text-muted-foreground hover:text-primary">
                  شروط الاستخدام
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
