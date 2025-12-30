import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, FileDown, PlayCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || "0");
  const { user } = useAuth();

  const { data: lesson } = trpc.lessons.getById.useQuery({ id: lessonId });
  const markCompleteMutation = trpc.lessons.markComplete.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل إكمال الدرس بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تسجيل الإكمال");
    },
  });

  const handleMarkComplete = () => {
    if (user?.role === 'student') {
      markCompleteMutation.mutate({ lessonId });
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">الدرس غير موجود</h2>
          <Link href="/">
            <Button variant="link">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/subject/${lesson.subjectId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمادة
            </Button>
          </Link>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-xl text-muted-foreground">{lesson.description}</p>
              )}
            </div>
            {user?.role === 'student' && (
              <Button 
                size="lg" 
                onClick={handleMarkComplete}
                disabled={markCompleteMutation.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                تسجيل الإكمال
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            {lesson.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-primary" />
                    الفيديو التعليمي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full"
                      src={lesson.videoUrl}
                    >
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Section */}
            {lesson.content && (
              <Card>
                <CardHeader>
                  <CardTitle>محتوى الدرس</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-lg">
                      {lesson.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PDF Download */}
            {lesson.pdfUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="w-6 h-6 text-primary" />
                    الملفات المرفقة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={lesson.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2" variant="outline">
                      <FileDown className="w-5 h-5" />
                      تحميل ملف PDF
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>معلومات الدرس</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">تاريخ النشر</span>
                  <span className="font-medium">
                    {new Date(lesson.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">آخر تحديث</span>
                  <span className="font-medium">
                    {new Date(lesson.updatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">الحالة</span>
                  <span className="font-medium text-primary">منشور</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-accent/10 border-accent/30">
              <CardHeader>
                <CardTitle>نصائح للدراسة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <span>شاهد الفيديو بتركيز كامل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <span>دوّن الملاحظات المهمة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <span>راجع ملف PDF المرفق</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <span>حل الاختبارات المتعلقة بالدرس</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
