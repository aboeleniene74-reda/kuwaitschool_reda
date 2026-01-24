import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, GraduationCap, LogIn, User, Star, ShoppingCart, Eye, MessageCircle, Phone } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { PDFViewer } from "@/components/PDFViewer";
import { NotebookRating } from "@/components/NotebookRating";
import { useState } from "react";

export default function CategoryContentPage() {
  const { user, loading } = useAuth();
  const [previewNotebook, setPreviewNotebook] = useState<any>(null);
  const params = useParams();
  const gradeId = parseInt(params.gradeId || "0");
  const semesterId = parseInt(params.semesterId || "0");
  const subjectId = parseInt(params.subjectId || "0");
  const categoryId = parseInt(params.categoryId || "0");

  const { data: grade } = trpc.grades.getById.useQuery({ id: gradeId });
  const { data: subject } = trpc.subjects.getById.useQuery({ id: subjectId });
  const { data: semester } = trpc.semesters.list.useQuery();
  const { data: category } = trpc.contentCategories.list.useQuery();
  
  const { data: notebooks } = trpc.notebooks.listByFilters.useQuery({
    subjectId,
    semesterId,
    categoryId
  });

  const currentSemester = semester?.find(s => s.id === semesterId);
  const currentCategory = category?.find(c => c.id === categoryId);

  const handlePreview = (notebook: any) => {
    // استخدام previewUrl إذا كان متوفراً، وإلا fileUrl
    if (notebook.previewUrl || notebook.fileUrl) {
      setPreviewNotebook(notebook);
    } else {
      toast.error("رابط المعاينة غير متوفر");
    }
  };



  const handleCall = (notebook: any) => {
    // فتح تطبيق الهاتف للاتصال برقم المالك
    window.location.href = 'tel:99457080';
  };

  const handleWhatsApp = (notebook: any) => {
    // فتح واتساب مع رسالة جاهزة
    const message = `مرحبا، أريد شراء مذكرة: ${notebook.title}`;
    const whatsappUrl = `https://wa.me/96599457080?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!grade || !subject || !currentSemester || !currentCategory) {
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
          <Link href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}`}>
            <span className="hover:text-foreground cursor-pointer">{subject.name}</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{currentCategory.name}</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {currentCategory.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {subject.name} - {currentSemester.name}
          </p>
          {currentCategory.description && (
            <p className="text-muted-foreground">{currentCategory.description}</p>
          )}
        </div>

        {/* Notebooks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {notebooks && notebooks.length > 0 ? (
            notebooks.map((notebook) => (
              <Card key={notebook.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{notebook.title}</CardTitle>
                    {notebook.isFeatured && (
                      <Badge variant="default" className="mr-2">
                        <Star className="w-3 h-3 ml-1" />
                        مميزة
                      </Badge>
                    )}
                  </div>
                  {notebook.description && (
                    <CardDescription className="line-clamp-2">
                      {notebook.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {notebook.pages ? `${notebook.pages} صفحة` : 'غير محدد'}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {parseFloat(notebook.price) === 0 ? 'مجاني' : `${notebook.price} د.ك`}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {/* زر المعاينة */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePreview(notebook)}
                    disabled={!notebook.previewUrl && !notebook.fileUrl}
                  >
                    <Eye className="ml-2 w-5 h-5" />
                    معاينة المذكرة
                  </Button>
                  
                  {/* أزرار التواصل */}
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCall(notebook)}
                    >
                      <Phone className="ml-2 w-5 h-5" />
                      اتصال
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(notebook)}
                    >
                      <MessageCircle className="ml-2 w-5 h-5" />
                      واتساب
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">لا يوجد محتوى متاح حالياً</h3>
                <p className="text-muted-foreground mb-6">
                  سيتم إضافة المذكرات والمحتوى التعليمي قريباً
                </p>
              <Link href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}`}>
                <Button variant="outline">
                  <ArrowRight className="ml-2 w-5 h-5" />
                  العودة للمادة
                </Button>
              </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ratings Section */}
        {notebooks && notebooks.length > 0 && notebooks[0] && (
          <div className="max-w-3xl mx-auto mb-12">
            <NotebookRating notebookId={notebooks[0].id} />
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}`}>
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمادة
            </Button>
          </Link>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {previewNotebook && (
        <PDFViewer
          fileUrl={previewNotebook.previewUrl || previewNotebook.fileUrl}
          title={previewNotebook.title}
          onClose={() => setPreviewNotebook(null)}
        />
      )}
    </div>
  );
}
