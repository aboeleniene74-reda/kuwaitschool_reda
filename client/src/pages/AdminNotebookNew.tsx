import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { 
  GraduationCap, 
  LogOut, 
  FileText,
  LayoutDashboard,
  Upload,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminNotebookNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    semesterId: "",
    categoryId: "",
    price: "",
    pages: "",
    isFeatured: false,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const getUploadUrlMutation = trpc.notebooks.getUploadUrl.useMutation();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const { data: grades } = trpc.grades.list.useQuery();
  const { data: semesters } = trpc.semesters.list.useQuery();
  const { data: categories } = trpc.contentCategories.list.useQuery();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const { data: subjects } = trpc.subjects.listByGrade.useQuery(
    { gradeId: selectedGrade! },
    { enabled: !!selectedGrade }
  );

  const createNotebookMutation = trpc.notebooks.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المذكرة بنجاح");
      setLocation("/admin/notebooks");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subjectId || !formData.semesterId || !formData.categoryId || !formData.price) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // فحص حجم الملفات (حد أعلى 500MB)
    const maxPdfSize = 500 * 1024 * 1024; // 500MB
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    
    if (pdfFile && pdfFile.size > maxPdfSize) {
      toast.error("حجم ملف PDF يتجاوز الحد المسموح (500MB)");
      return;
    }
    
    if (previewFile && previewFile.size > maxPdfSize) {
      toast.error("حجم ملف المعاينة يتجاوز الحد المسموح (500MB)");
      return;
    }
    
    if (coverImage && coverImage.size > maxImageSize) {
      toast.error("حجم صورة الغلاف يتجاوز الحد المسموح (10MB)");
      return;
    }

    setUploading(true);
    let fileUrl: string | undefined;
    let previewUrl: string | undefined;
    let coverImageUrl: string | undefined;

    try {
      // رفع ملف PDF الكامل مباشرة إلى S3
      if (pdfFile) {
        toast.info("جاري رفع ملف PDF...");
        const uploadData = await getUploadUrlMutation.mutateAsync({
          fileName: pdfFile.name,
          contentType: pdfFile.type,
        });
        
        const formData = new FormData();
        formData.append('file', pdfFile);
        
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'POST',
          headers: uploadData.headers,
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`فشل رفع PDF: ${uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        fileUrl = result.url;
        toast.success("تم رفع ملف PDF بنجاح");
      }

      // رفع نسخة المعاينة مباشرة
      if (previewFile) {
        toast.info("جاري رفع ملف المعاينة...");
        const uploadData = await getUploadUrlMutation.mutateAsync({
          fileName: previewFile.name,
          contentType: previewFile.type,
        });
        
        const formData = new FormData();
        formData.append('file', previewFile);
        
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'POST',
          headers: uploadData.headers,
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`فشل رفع ملف المعاينة: ${uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        previewUrl = result.url;
        toast.success("تم رفع ملف المعاينة بنجاح");
      }

      // رفع صورة الغلاف مباشرة
      if (coverImage) {
        toast.info("جاري رفع صورة الغلاف...");
        const uploadData = await getUploadUrlMutation.mutateAsync({
          fileName: coverImage.name,
          contentType: coverImage.type,
        });
        
        const formData = new FormData();
        formData.append('file', coverImage);
        
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'POST',
          headers: uploadData.headers,
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`فشل رفع صورة الغلاف: ${uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        coverImageUrl = result.url;
        toast.success("تم رفع صورة الغلاف بنجاح");
      }

      createNotebookMutation.mutate({
        title: formData.title,
        description: formData.description || undefined,
        gradeId: selectedGrade!,
        subjectId: parseInt(formData.subjectId),
        semesterId: parseInt(formData.semesterId),
        categoryId: parseInt(formData.categoryId),
        price: formData.price,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        fileUrl,
        previewUrl,
        coverImageUrl,
        isFeatured: formData.isFeatured,
        isPublished: true,
      });
    } catch (error: any) {
      console.error("خطأ في رفع الملفات:", error);
      const errorMessage = error?.message || error?.toString() || "خطأ غير معروف";
      toast.error(`فشل رفع الملفات: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // Redirect if not admin
  if (!loading && (!user || (user.role !== "admin" && user.role !== "teacher"))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>
              ليس لديك صلاحيات للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!user ? (
              <a href={"/login"}>
                <Button className="w-full">تسجيل الدخول</Button>
              </a>
            ) : (
              <Link href="/">
                <Button className="w-full">العودة للرئيسية</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                <h1 className="text-sm sm:text-xl font-bold truncate">مذكرة و مدرس</h1>
                <p className="text-xs text-muted-foreground">لوحة تحكم الأدمن</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="ml-2 w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">القائمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="ml-2 w-5 h-5" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Link href="/admin/notebooks">
                  <Button variant="default" className="w-full justify-start">
                    <FileText className="ml-2 w-5 h-5" />
                    إدارة المذكرات
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start">
                    <GraduationCap className="ml-2 w-5 h-5" />
                    عرض الموقع
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">إضافة مذكرة جديدة</h2>
                <p className="text-muted-foreground">أدخل معلومات المذكرة الدراسية</p>
              </div>
              <Link href="/admin/notebooks">
                <Button variant="outline">
                  <ArrowRight className="ml-2 w-5 h-5" />
                  رجوع
                </Button>
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>معلومات المذكرة</CardTitle>
                  <CardDescription>
                    الحقول المميزة بـ * إلزامية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المذكرة *</Label>
                    <Input
                      id="title"
                      placeholder="مثال: مذكرة الكيمياء الشاملة"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      placeholder="وصف مختصر للمذكرة ومحتواها"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Grade Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="grade">الصف الدراسي *</Label>
                    <Select
                      value={selectedGrade?.toString() || ""}
                      onValueChange={(value) => {
                        setSelectedGrade(parseInt(value));
                        setFormData({ ...formData, subjectId: "" });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف الدراسي" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades?.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id.toString()}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="semester">الفصل الدراسي *</Label>
                    <Select
                      value={formData.semesterId}
                      onValueChange={(value) => setFormData({ ...formData, semesterId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفصل الدراسي" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters?.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id.toString()}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">المادة الدراسية *</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                      disabled={!selectedGrade}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة الدراسية" />
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

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category">قسم المحتوى *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر قسم المحتوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price">السعر (د.ك) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.001"
                        placeholder="5.000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    {/* Pages */}
                    <div className="space-y-2">
                      <Label htmlFor="pages">عدد الصفحات</Label>
                      <Input
                        id="pages"
                        type="number"
                        placeholder="50"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="featured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isFeatured: checked as boolean })
                      }
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      مذكرة مميزة (ستظهر في المقدمة)
                    </Label>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">رفع الملفات</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Cover Image */}
                      <div className="space-y-2">
                        <Label htmlFor="coverImage">صورة الغلاف</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                          onClick={() => document.getElementById('coverImage')?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {coverImage ? coverImage.name : 'اضغط لرفع صورة الغلاف'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG (أقصى 10MB)</p>
                        </div>
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        />
                      </div>

                      {/* PDF File */}
                      <div className="space-y-2">
                        <Label htmlFor="pdfFile">ملف PDF الكامل (للمشترين فقط)</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                          onClick={() => document.getElementById('pdfFile')?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {pdfFile ? pdfFile.name : 'اضغط لرفع ملف PDF الكامل'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PDF (أقصى 500MB)</p>
                        </div>
                        <Input
                          id="pdfFile"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        />
                      </div>

                      {/* Preview PDF File */}
                      <div className="space-y-2">
                        <Label htmlFor="previewFile">نسخة المعاينة (أول صفحتين فقط) *</Label>
                        <div className="border-2 border-dashed border-yellow-500 rounded-lg p-6 text-center hover:border-yellow-600 transition-colors cursor-pointer bg-yellow-50/50"
                          onClick={() => document.getElementById('previewFile')?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                          <p className="text-sm text-muted-foreground">
                            {previewFile ? previewFile.name : 'اضغط لرفع نسخة المعاينة'}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1 font-medium">ملف PDF يحتوي على أول صفحتين فقط</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF (أقصى 10MB)</p>
                        </div>
                        <Input
                          id="previewFile"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createNotebookMutation.isPending || uploading}
                      className="flex-1"
                    >
                      {uploading ? "جاري رفع الملفات..." : createNotebookMutation.isPending ? "جاري الحفظ..." : "حفظ المذكرة"}
                    </Button>
                    <Link href="/admin/notebooks">
                      <Button type="button" variant="outline">
                        إلغاء
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
