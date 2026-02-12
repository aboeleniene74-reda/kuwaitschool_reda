import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar, GraduationCap, LogIn, User } from "lucide-react";
import { Link, useParams } from "wouter";

export default function GradePage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const gradeId = parseInt(params.id || "0");

  const { data: grade } = trpc.grades.getById.useQuery({ id: gradeId });
  const { data: semesters } = trpc.semesters.list.useQuery();

  if (!grade) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">الصف غير موجود</h2>
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
                <h1 className="text-xl font-bold">مذكرة و مدرس</h1>
                <p className="text-xs text-muted-foreground">مذكرات المرحلة الثانوية بالكويت</p>
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

      {/* Content */}
      <section className="container py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">
            <span className="hover:text-primary cursor-pointer">الرئيسية</span>
          </Link>
          <span>/</span>
          <span className="text-foreground">{grade.name}</span>
        </div>

        {/* Grade Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-4">{grade.name}</h2>
          {grade.description && (
            <p className="text-xl text-muted-foreground">{grade.description}</p>
          )}
        </div>

        {/* Semesters Grid */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">الفصول الدراسية</h3>
          
          {!semesters || semesters.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">لا توجد فصول متاحة حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة الفصول قريباً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {semesters.map((semester) => (
                <Link key={semester.id} href={`/grade/${gradeId}/semester/${semester.id}`}>
                  <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer group h-full hover:shadow-xl">
                    <CardHeader className="text-center pb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Calendar className="w-12 h-12 text-primary" />
                      </div>
                      <CardTitle className="text-3xl mb-2">{semester.name}</CardTitle>
                      {semester.nameEn && (
                        <CardDescription className="text-lg">{semester.nameEn}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full" size="lg">
                        <ArrowRight className="ml-2 w-5 h-5" />
                        عرض المواد الدراسية
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 مذكرة و مدرس - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
