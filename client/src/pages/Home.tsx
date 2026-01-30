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
      <section className="container py-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            مذكرات علمية شاملة
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            أفضل المذكرات الدراسية في الكيمياء والأحياء والفيزياء والجيولوجيا للمرحلة الثانوية بالكويت
          </p>
          
          {/* Search Box */}
          <SearchBox />
        </div>

        {/* Grades Grid */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
          {!grades || grades.length === 0 ? (
            <div className="col-span-3 text-center py-6">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">قريباً</h3>
              <p className="text-sm text-muted-foreground">سيتم إضافة المذكرات الدراسية قريباً</p>
            </div>
          ) : (
            grades.map((grade) => (
              <Link key={grade.id} href={`/grade/${grade.id}`}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="text-center pb-2 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold">{grade.name}</CardTitle>
                    {grade.description && (
                      <CardDescription className="text-xs mt-1">{grade.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="relative z-10 pb-3">
                    <Button className="w-full shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 text-sm">
                      عرض المواد
                      <GraduationCap className="mr-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Contact Section - Compact */}
        <div className="max-w-2xl mx-auto mb-6">
          <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-amber-50">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-right">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">تواصل معنا</p>
                    <p className="text-sm font-bold">فارس العلوم</p>
                  </div>
                </div>
                <a href="tel:99457080" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  99457080
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section - Very Compact */}
      <section className="bg-muted/50 py-6">
        <div className="container">
          <h3 className="text-lg font-bold text-center mb-4">لماذا منصة K8 للعلوم؟</h3>
          <div className="grid md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-2 pt-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm">محتوى شامل</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">
                  مذكرات مفصلة تغطي جميع موضوعات المنهج
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2 pt-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm">معلمون متخصصون</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">
                  مذكرات معدة من قبل معلمين ذوي خبرة
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2 pt-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm">سهولة الوصول</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">
                  تصفح واشترِ المذكرات بسهولة
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Very Compact */}
      <section className="py-6 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold mb-1">ماذا يقول طلابنا</h3>
            <p className="text-xs text-muted-foreground">
              شهادات حقيقية من طلاب استفادوا من مذكراتنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border hover:shadow-md transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary" />  
                  </div>
                  <div>
                    <p className="font-bold text-xs">أحمد الكندري</p>
                    <p className="text-xs text-muted-foreground">الصف الثاني عشر</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "المذكرات ساعدتني كثيراً في فهم الكيمياء. حصلت على 95%!"
                </p>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xs">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border hover:shadow-md transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">فاطمة العتيبي</p>
                    <p className="text-xs text-muted-foreground">الصف الحادي عشر</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "أفضل مذكرات جيولوجيا! المراجعات النهائية كانت شاملة."
                </p>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xs">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border hover:shadow-md transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">خالد المطيري</p>
                    <p className="text-xs text-muted-foreground">الصف العاشر</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "نماذج الاختبارات المحلولة ساعدتني قبل الامتحان!"
                </p>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xs">★</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rating Section - Very Compact */}
      <section className="bg-muted/30 py-6">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <SiteRatingForm />
          </div>
        </div>
      </section>

      {/* Ratings List - Very Compact */}
      <section className="py-6 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto space-y-4">
            <RatingsStatistics />
            <SiteRatingsList />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2024 منصة K8 للعلوم - جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-2 text-xs">
              <Link href="/faq">
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary h-auto p-0 text-xs">
                  الأسئلة الشائعة
                </Button>
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/privacy">
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary h-auto p-0 text-xs">
                  سياسة الخصوصية
                </Button>
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/terms">
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary h-auto p-0 text-xs">
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
