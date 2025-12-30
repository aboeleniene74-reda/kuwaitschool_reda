import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Plus, Edit, ClipboardCheck, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Subject Dialog State
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    color: "oklch(0.48 0.18 250)",
  });

  // Lesson Dialog State
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    subjectId: 0,
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    pdfUrl: "",
    isPublished: false,
  });

  // Quiz Dialog State
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    subjectId: 0,
    title: "",
    description: "",
    duration: 30,
    passingScore: "50.00",
    isPublished: false,
  });

  const { data: subjects } = trpc.subjects.list.useQuery();
  const { data: lessons } = trpc.lessons.listForTeacher.useQuery({});
  const { data: quizzes } = trpc.quizzes.listForTeacher.useQuery({});
  const { data: assignments } = trpc.assignments.listForTeacher.useQuery({});

  // Mutations
  const createSubjectMutation = trpc.subjects.create.useMutation({
    onSuccess: () => {
      utils.subjects.list.invalidate();
      setSubjectDialogOpen(false);
      setSubjectForm({ name: "", description: "", color: "oklch(0.48 0.18 250)" });
      toast.success("تم إنشاء المادة بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء المادة");
    },
  });

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      utils.lessons.listForTeacher.invalidate();
      setLessonDialogOpen(false);
      setLessonForm({
        subjectId: 0,
        title: "",
        description: "",
        content: "",
        videoUrl: "",
        pdfUrl: "",
        isPublished: false,
      });
      toast.success("تم إنشاء الدرس بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء الدرس");
    },
  });

  const createQuizMutation = trpc.quizzes.create.useMutation({
    onSuccess: () => {
      utils.quizzes.listForTeacher.invalidate();
      setQuizDialogOpen(false);
      setQuizForm({
        subjectId: 0,
        title: "",
        description: "",
        duration: 30,
        passingScore: "50.00",
        isPublished: false,
      });
      toast.success("تم إنشاء الاختبار بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء الاختبار");
    },
  });

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">هذه الصفحة متاحة للمعلمين فقط</h2>
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
              العودة للرئيسية
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">لوحة تحكم المعلم</h1>
          <p className="text-xl text-muted-foreground">إدارة المحتوى التعليمي</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subjects" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="subjects">المواد</TabsTrigger>
            <TabsTrigger value="lessons">الدروس</TabsTrigger>
            <TabsTrigger value="quizzes">الاختبارات</TabsTrigger>
            <TabsTrigger value="assignments">الواجبات</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">المواد الدراسية</h2>
              <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 w-5 h-5" />
                    إضافة مادة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مادة دراسية جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل معلومات المادة الدراسية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject-name">اسم المادة</Label>
                      <Input
                        id="subject-name"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        placeholder="مثال: الرياضيات"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject-description">الوصف</Label>
                      <Textarea
                        id="subject-description"
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                        placeholder="وصف مختصر للمادة"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createSubjectMutation.mutate(subjectForm)}
                      disabled={!subjectForm.name || createSubjectMutation.isPending}
                    >
                      إنشاء المادة
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects?.map((subject) => (
                <Card key={subject.id} className="border-2">
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>
                    {subject.description && (
                      <CardDescription>{subject.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/subject/${subject.id}`}>
                      <Button variant="outline" className="w-full">
                        عرض المادة
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">الدروس</h2>
              <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 w-5 h-5" />
                    إضافة درس جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة درس جديد</DialogTitle>
                    <DialogDescription>
                      أدخل معلومات الدرس والمحتوى التعليمي
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson-subject">المادة</Label>
                      <Select
                        value={lessonForm.subjectId.toString()}
                        onValueChange={(value) => setLessonForm({ ...lessonForm, subjectId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lesson-title">عنوان الدرس</Label>
                      <Input
                        id="lesson-title"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="مثال: مقدمة في الجبر"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-description">الوصف</Label>
                      <Textarea
                        id="lesson-description"
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        placeholder="وصف مختصر للدرس"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-content">المحتوى</Label>
                      <Textarea
                        id="lesson-content"
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                        placeholder="محتوى الدرس النصي"
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-video">رابط الفيديو (اختياري)</Label>
                      <Input
                        id="lesson-video"
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-pdf">رابط ملف PDF (اختياري)</Label>
                      <Input
                        id="lesson-pdf"
                        value={lessonForm.pdfUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="lesson-published"
                        checked={lessonForm.isPublished}
                        onCheckedChange={(checked) => setLessonForm({ ...lessonForm, isPublished: checked })}
                      />
                      <Label htmlFor="lesson-published">نشر الدرس للطلاب</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createLessonMutation.mutate(lessonForm)}
                      disabled={!lessonForm.title || !lessonForm.subjectId || createLessonMutation.isPending}
                    >
                      إنشاء الدرس
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {lessons?.map((lesson) => (
                <Card key={lesson.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{lesson.title}</CardTitle>
                        {lesson.description && (
                          <CardDescription>{lesson.description}</CardDescription>
                        )}
                      </div>
                      <Link href={`/lesson/${lesson.id}`}>
                        <Button variant="outline" size="sm">
                          عرض
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">الاختبارات</h2>
              <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 w-5 h-5" />
                    إضافة اختبار جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة اختبار جديد</DialogTitle>
                    <DialogDescription>
                      أدخل معلومات الاختبار الأساسية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quiz-subject">المادة</Label>
                      <Select
                        value={quizForm.subjectId.toString()}
                        onValueChange={(value) => setQuizForm({ ...quizForm, subjectId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quiz-title">عنوان الاختبار</Label>
                      <Input
                        id="quiz-title"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        placeholder="مثال: اختبار الوحدة الأولى"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-description">الوصف</Label>
                      <Textarea
                        id="quiz-description"
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        placeholder="وصف مختصر للاختبار"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-duration">المدة (بالدقائق)</Label>
                      <Input
                        id="quiz-duration"
                        type="number"
                        value={quizForm.duration}
                        onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-passing">درجة النجاح</Label>
                      <Input
                        id="quiz-passing"
                        value={quizForm.passingScore}
                        onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="quiz-published"
                        checked={quizForm.isPublished}
                        onCheckedChange={(checked) => setQuizForm({ ...quizForm, isPublished: checked })}
                      />
                      <Label htmlFor="quiz-published">نشر الاختبار للطلاب</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createQuizMutation.mutate(quizForm)}
                      disabled={!quizForm.title || !quizForm.subjectId || createQuizMutation.isPending}
                    >
                      إنشاء الاختبار
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {quizzes?.map((quiz) => (
                <Card key={quiz.id} className="border-2">
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    {quiz.description && (
                      <CardDescription>{quiz.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/quiz/${quiz.id}`}>
                      <Button variant="outline" className="w-full">
                        عرض الاختبار
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">الواجبات</h2>
              <Button disabled>
                <Plus className="ml-2 w-5 h-5" />
                إضافة واجب (قريباً)
              </Button>
            </div>

            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">إدارة الواجبات</h3>
              <p className="text-muted-foreground">ستتوفر هذه الميزة قريباً</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
