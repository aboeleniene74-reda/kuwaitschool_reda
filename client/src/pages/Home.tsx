import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, GraduationCap, Trophy, Users, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: subjects, isLoading: subjectsLoading } = trpc.subjects.list.useQuery();

  if (loading || subjectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Hero Section */}
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>منصة التعليم الإلكتروني الأولى في الكويت</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
              منصة التعليم الثانوي
              <br />
              بالكويت
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              تجربة تعليمية متكاملة وحديثة للطلاب والمعلمين مع دروس تفاعلية واختبارات ذكية
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <GraduationCap className="ml-2 w-6 h-6" />
                ابدأ التعلم الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 rounded-xl"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                استكشف المميزات
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="container py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">لماذا تختار منصتنا؟</h2>
            <p className="text-xl text-muted-foreground">مميزات تجعل التعلم أسهل وأكثر متعة</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">دروس تفاعلية</CardTitle>
                <CardDescription className="text-base">
                  محتوى تعليمي غني بالفيديوهات والملفات التفاعلية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-7 h-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">اختبارات ذكية</CardTitle>
                <CardDescription className="text-base">
                  تصحيح تلقائي ونتائج فورية مع تحليل الأداء
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">تواصل مباشر</CardTitle>
                <CardDescription className="text-base">
                  تفاعل مستمر بين الطلاب والمعلمين
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-7 h-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">تتبع التقدم</CardTitle>
                <CardDescription className="text-base">
                  رسوم بيانية توضح مستوى تقدمك الدراسي
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container py-20">
          <Card className="bg-gradient-to-l from-primary to-primary/80 border-0 text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">هل أنت مستعد للبدء؟</h2>
              <p className="text-xl mb-8 opacity-90">انضم إلى آلاف الطلاب والمعلمين على منصتنا</p>
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 rounded-xl"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <GraduationCap className="ml-2 w-6 h-6" />
                سجل دخولك الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Logged in view - show subjects
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">مرحباً، {user?.name || 'طالب'}</h1>
              <p className="text-xl text-muted-foreground">
                {user?.role === 'teacher' || user?.role === 'admin' 
                  ? 'لوحة تحكم المعلم' 
                  : 'استمر في رحلتك التعليمية'}
              </p>
            </div>
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <Link href="/teacher">
                <Button size="lg" className="rounded-xl">
                  <Users className="ml-2 w-5 h-5" />
                  لوحة التحكم
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-8">المواد الدراسية</h2>
          
          {!subjects || subjects.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">لا توجد مواد متاحة حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة المواد الدراسية قريباً</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/subject/${subject.id}`}>
                  <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer group">
                    <CardHeader>
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: subject.color || 'oklch(0.48 0.18 250 / 0.1)' }}
                      >
                        <BookOpen className="w-8 h-8" style={{ color: subject.color || 'oklch(0.48 0.18 250)' }} />
                      </div>
                      <CardTitle className="text-2xl">{subject.name}</CardTitle>
                      {subject.description && (
                        <CardDescription className="text-base mt-2">
                          {subject.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
                        <span>استعراض المادة</span>
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
