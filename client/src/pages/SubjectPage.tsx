import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, GraduationCap, LogIn, User, FileText } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useParams } from "wouter";

export default function SubjectPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const gradeId = parseInt(params.gradeId || "0");
  const semesterId = parseInt(params.semesterId || "0");
  const subjectId = parseInt(params.subjectId || "0");

  const { data: grade } = trpc.grades.getById.useQuery({ id: gradeId });
  const { data: semesters } = trpc.semesters.list.useQuery();
  const { data: subject } = trpc.subjects.getById.useQuery({ id: subjectId });
  const { data: categories } = trpc.contentCategories.list.useQuery();

  const currentSemester = semesters?.find(s => s.id === semesterId);

  if (!grade || !currentSemester || !subject) {
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
                <h1 className="text-xl font-bold">منصة ثانوي علمي</h1>
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/">
            <span className="hover:text-foreground cursor-pointer">الرئيسية</span>
          </Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}`}>
            <span className="hover:text-foreground cursor-pointer">{grade.name}</span>
          </Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}/semester/${semesterId}`}>
            <span className="hover:text-foreground cursor-pointer">{currentSemester.name}</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{subject.name}</span>
        </div>

        {/* Subject Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: subject.color
                ? `color-mix(in oklch, ${subject.color}, transparent 85%)`
                : "oklch(0.48 0.18 250 / 0.15)",
            }}
          >
            <BookOpen
              className="w-12 h-12"
              style={{ color: subject.color || "oklch(0.48 0.18 250)" }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{subject.name}</h1>
          <p className="text-lg text-muted-foreground mb-2">
            {grade.name} - {currentSemester.name}
          </p>
          {subject.description && (
            <p className="text-muted-foreground">{subject.description}</p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">أقسام المحتوى</h3>
          
          {!categories || categories.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">لا توجد أقسام متاحة حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة الأقسام قريباً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}/category/${category.id}`}
                >
                  <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer group h-full hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <Badge variant="secondary" className="mr-2">
                          {category.order}
                        </Badge>
                      </div>
                      {category.nameEn && (
                        <CardDescription className="text-sm">{category.nameEn}</CardDescription>
                      )}
                      {category.description && (
                        <CardDescription className="text-sm mt-2">
                          {category.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <ArrowRight className="ml-2 w-5 h-5" />
                        عرض المحتوى
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
          <Link href={`/grade/${gradeId}/semester/${semesterId}`}>
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمواد
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 منصة ثانوي علمي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
