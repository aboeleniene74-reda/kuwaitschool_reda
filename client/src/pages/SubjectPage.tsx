import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, FileText, ClipboardCheck, ArrowRight, PlayCircle, FileDown, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "wouter";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const subjectId = parseInt(id || "0");
  const { user } = useAuth();

  const { data: subject } = trpc.subjects.getById.useQuery({ id: subjectId });
  const { data: lessons } = trpc.lessons.listBySubject.useQuery({ subjectId });
  const { data: quizzes } = trpc.quizzes.listBySubject.useQuery({ subjectId });
  const { data: assignments } = trpc.assignments.listBySubject.useQuery({ subjectId });

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">المادة غير موجودة</h2>
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
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمواد
            </Button>
          </Link>
          
          <div className="flex items-start gap-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: subject.color || 'oklch(0.48 0.18 250 / 0.1)' }}
            >
              <BookOpen className="w-10 h-10" style={{ color: subject.color || 'oklch(0.48 0.18 250)' }} />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
              {subject.description && (
                <p className="text-xl text-muted-foreground">{subject.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lessons" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="lessons" className="text-lg">
              <BookOpen className="ml-2 w-5 h-5" />
              الدروس
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="text-lg">
              <ClipboardCheck className="ml-2 w-5 h-5" />
              الاختبارات
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-lg">
              <FileText className="ml-2 w-5 h-5" />
              الواجبات
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            {!lessons || lessons.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">لا توجد دروس متاحة</h3>
                <p className="text-muted-foreground">سيتم إضافة الدروس قريباً</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson, index) => (
                  <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="secondary" className="text-base px-3 py-1">
                                الدرس {index + 1}
                              </Badge>
                              {lesson.videoUrl && (
                                <Badge variant="outline" className="gap-1">
                                  <PlayCircle className="w-4 h-4" />
                                  فيديو
                                </Badge>
                              )}
                              {lesson.pdfUrl && (
                                <Badge variant="outline" className="gap-1">
                                  <FileDown className="w-4 h-4" />
                                  PDF
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                            {lesson.description && (
                              <CardDescription className="text-base">
                                {lesson.description}
                              </CardDescription>
                            )}
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            {!quizzes || quizzes.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">لا توجد اختبارات متاحة</h3>
                <p className="text-muted-foreground">سيتم إضافة الاختبارات قريباً</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardHeader>
                        <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                        {quiz.description && (
                          <CardDescription className="text-base mb-4">
                            {quiz.description}
                          </CardDescription>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {quiz.duration && (
                            <Badge variant="secondary">
                              المدة: {quiz.duration} دقيقة
                            </Badge>
                          )}
                          {quiz.passingScore && (
                            <Badge variant="secondary">
                              درجة النجاح: {quiz.passingScore}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <ClipboardCheck className="ml-2 w-5 h-5" />
                          ابدأ الاختبار
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {!assignments || assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">لا توجد واجبات متاحة</h3>
                <p className="text-muted-foreground">سيتم إضافة الواجبات قريباً</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                            {assignment.description && (
                              <CardDescription className="text-base mb-4">
                                {assignment.description}
                              </CardDescription>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary">
                                الموعد النهائي: {new Date(assignment.dueDate).toLocaleDateString('ar-SA')}
                              </Badge>
                              <Badge variant="secondary">
                                الدرجة الكاملة: {assignment.maxScore}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
