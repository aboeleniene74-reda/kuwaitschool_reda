import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, GraduationCap, LogIn, User } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useParams } from "wouter";

export default function SemesterPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const gradeId = parseInt(params.gradeId || "0");
  const semesterId = parseInt(params.semesterId || "0");

  const { data: grade } = trpc.grades.getById.useQuery({ id: gradeId });
  const { data: semester } = trpc.semesters.list.useQuery();
  const { data: subjects } = trpc.subjects.listByGrade.useQuery({ gradeId });

  const currentSemester = semester?.find(s => s.id === semesterId);

  if (!grade || !currentSemester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
          <Link href="/">
            <Button>
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold">علوم ثانوي</h1>
                <p className="text-xs text-muted-foreground">مذكرات علمية للمرحلة الثانوية</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button>
                  <LogIn className="ml-2 w-5 h-5" />
                  تسجيل الدخول
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="container py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">
            <span className="hover:text-primary cursor-pointer">الرئيسية</span>
          </Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}`}>
            <span className="hover:text-primary cursor-pointer">{grade.name}</span>
          </Link>
          <span>/</span>
          <span className="text-foreground">{currentSemester.name}</span>
        </div>

        {/* Semester Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-2">{grade.name}</h2>
          <h3 className="text-3xl font-semibold text-primary mb-4">{currentSemester.name}</h3>
          {currentSemester.nameEn && (
            <p className="text-lg text-muted-foreground">{currentSemester.nameEn}</p>
          )}
        </div>

        {/* Subjects Grid */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">المواد الدراسية</h3>
          
          {!subjects || subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">لا توجد مواد متاحة حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة المواد قريباً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/grade/${gradeId}/semester/${semesterId}/subject/${subject.id}`}>
                  <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer group h-full">
                    <CardHeader className="text-center pb-4">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: subject.color
                            ? `color-mix(in oklch, ${subject.color}, transparent 85%)`
                            : "oklch(0.48 0.18 250 / 0.15)",
                        }}
                      >
                        <BookOpen
                          className="w-10 h-10"
                          style={{ color: subject.color || "oklch(0.48 0.18 250)" }}
                        />
                      </div>
                      <CardTitle className="text-2xl">{subject.name}</CardTitle>
                      {subject.description && (
                        <CardDescription className="text-base">{subject.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <ArrowRight className="ml-2 w-5 h-5" />
                        عرض الأقسام
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link href={`/grade/${gradeId}`}>
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للفصول
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 علوم ثانوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
