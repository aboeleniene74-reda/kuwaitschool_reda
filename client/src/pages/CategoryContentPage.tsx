import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { updateSEO, getCategorySEO } from "@/lib/seo";
import { ArrowRight, GraduationCap, Star, Eye, Phone, MessageCircle, Download, TrendingUp, LogIn, User } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function CategoryContentPage() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const trackView = trpc.statistics.trackView.useMutation();
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

  useEffect(() => {
    if (currentCategory && subject && grade) {
      updateSEO(getCategorySEO(currentCategory.name, subject.name, grade.name));
    }
  }, [currentCategory, subject, grade]);

  // تحديد إذا كان القسم مجاني (الكتاب المدرسي أو بنك الأسئلة)
  const isFreeCategory = currentCategory?.nameEn === "Textbook" || 
                         currentCategory?.nameEn === "Question Bank";

  // تحديد الأقسام التي تحتاج واجهة مبسطة (معاينة وتحميل فقط)
  const isSimplifiedCategory = currentCategory?.name === "الكتاب المدرسي" || 
                               currentCategory?.name === "مراجعات قصير 1" ||
                               currentCategory?.name === "مراجعات قصير 2" ||
                               currentCategory?.name === "مراجعات الفاينل" ||
                               currentCategory?.name === "نماذج اختبارات سابقة";

  // قسم ملخصات الشرح: معاينة فقط بدون تحميل
  const isSummaryCategory = currentCategory?.name === "ملخصات الشرح";

  const incrementView = trpc.notebooks.incrementViewCount.useMutation();
  const incrementDownload = trpc.notebooks.incrementDownloadCount.useMutation();

  const handlePreviewAndDownload = async (notebook: any) => {
    try {
      // الحصول على presigned URL من الخادم
      const downloadData = await utils.notebooks.getDownloadUrl.fetch({ id: notebook.id });
      const pdfUrl = downloadData?.url || notebook.previewUrl || notebook.fileUrl;
      
      if (pdfUrl) {
        // فتح PDF في تبويب جديد (يمكن المعاينة والتحميل)
        window.open(pdfUrl, '_blank');
        
        // زيادة عداد المشاهدات
        incrementView.mutate({ notebookId: notebook.id });
      } else {
        toast.error("رابط المعاينة غير متوفر");
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      toast.error("خطأ في تحميل المعاينة");
    }
  };

  const handlePreview = async (notebook: any) => {
    try {
      // الحصول على presigned URL من الخادم
      const downloadData = await utils.notebooks.getDownloadUrl.fetch({ id: notebook.id });
      const pdfUrl = downloadData?.url || notebook.previewUrl || notebook.fileUrl;
      
      if (pdfUrl) {
        // فتح PDF في تبويب جديد
        window.open(pdfUrl, '_blank');
        
        // زيادة عداد المشاهدات
        incrementView.mutate({ notebookId: notebook.id });
      } else {
        toast.error("رابط المعاينة غير متوفر");
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      toast.error("خطأ في تحميل المعاينة");
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:99457080';
  };

  const handleWhatsApp = (notebook: any) => {
    const message = `مرحبا، أريد شراء مذكرة: ${notebook.title}`;
    const whatsappUrl = `https://wa.me/96599457080?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = async (notebook: any) => {
    try {
      const downloadUrlData = await utils.notebooks.getDownloadUrl.fetch({ id: notebook.id });
      const downloadUrl = downloadUrlData?.url || notebook.fileUrl || notebook.previewUrl;
      
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = notebook.title || 'notebook.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        incrementDownload.mutate({ notebookId: notebook.id });
        
        toast.success("جاري تحميل الملف...");
      } else {
        toast.error("رابط التحميل غير متوفر");
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("خطأ في تحميل الملف");
    }
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
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-2">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663268166641/tHLPNnKQWHaTsRgR.png" alt="مذكرة و مدرس" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold truncate">مذكرة و مدرس</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">مدرس كيمياء - أحياء - جيولوجيا</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="ml-2 w-5 h-5" />
                  {user.name || "حسابي"}
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">
                  <LogIn className="ml-2 w-5 h-5" />
                  تسجيل الدخول
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}`} className="hover:text-foreground">{grade.name}</Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}/semester/${semesterId}`} className="hover:text-foreground">{currentSemester.name}</Link>
          <span>/</span>
          <Link href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}`} className="hover:text-foreground">{subject.name}</Link>
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

        {/* Notebooks List */}
        {notebooks && notebooks.length > 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y">
                {notebooks.map((notebook) => (
                  <div
                    key={notebook.id}
                    className="p-6 hover:bg-muted/30 transition-colors"
                  >
                    {/* اسم المذكرة مع Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{notebook.title}</h3>
                        {notebook.description && (
                          <p className="text-sm text-muted-foreground">{notebook.description}</p>
                        )}
                      </div>
                      {notebook.isFeatured && (
                        <Badge variant="default" className="mr-3">
                          <Star className="w-3 h-3 ml-1" />
                          مميزة
                        </Badge>
                      )}
                    </div>

                    {/* معلومات المذكرة في سطر واحد */}
                    <div className="flex flex-wrap items-center gap-6 text-base mb-4">
                      {/* عدد الصفحات */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">عدد الصفحات:</span>
                        <span className="text-muted-foreground">
                          {notebook.pages || 'غير محدد'}
                        </span>
                      </div>

                      {/* عدد التحميلات */}
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">التحميلات:</span>
                        <span className="text-muted-foreground">{notebook.downloadCount || 0}</span>
                      </div>

                      {/* عدد المشاهدات */}
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">المشاهدات:</span>
                        <span className="text-muted-foreground">{notebook.viewCount || 0}</span>
                      </div>

                      {/* للأقسام المبسطة: فقط زر معاينة وتحميل */}
                      {isSimplifiedCategory ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handlePreviewAndDownload(notebook)}
                            disabled={!notebook.previewUrl && !notebook.fileUrl}
                          >
                            <Eye className="ml-2 w-4 h-4" />
                            معاينة وتحميل
                          </Button>
                        </div>
                      ) : isSummaryCategory ? (
                        /* قسم ملخصات الشرح: معاينة فقط بدون تحميل */
                        <>
                          {/* التقييم */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">التقييم:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-muted-foreground">
                                {notebook.rating ? Number(notebook.rating).toFixed(1) : 'لا يوجد'}
                              </span>
                            </div>
                          </div>

                          {/* رقم التواصل (فقط للمذكرات المدفوعة) */}
                          {notebook.price && notebook.price !== "0" && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">للحصول على المذكرة:</span>
                              <span className="text-primary font-bold">
                                {notebook.contactPhone || "99457080"}
                              </span>
                            </div>
                          )}

                          {/* زر المعاينة فقط */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(notebook)}
                              disabled={!notebook.previewUrl && !notebook.fileUrl}
                            >
                              <Eye className="ml-2 w-4 h-4" />
                              معاينة
                            </Button>
                            
                            <Badge variant="secondary" className="text-xs px-3 py-1">
                              مذكرة مجانية - عليك التوصيل
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* نوع التحميل - للأقسام الأخرى فقط */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">التحميل:</span>
                            <Badge variant={(notebook.price === "0" || !notebook.price) ? "default" : "secondary"}>
                              {(notebook.price === "0" || !notebook.price) ? "مجاني" : "معاينة فقط"}
                            </Badge>
                          </div>

                          {/* التقييم */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">التقييم:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-muted-foreground">
                                {notebook.rating ? Number(notebook.rating).toFixed(1) : 'لا يوجد'}
                              </span>
                            </div>
                          </div>

                          {/* رقم التواصل (فقط للمذكرات المدفوعة) */}
                          {notebook.price && notebook.price !== "0" && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">للحصول على المذكرة:</span>
                              <span className="text-primary font-bold">
                                {notebook.contactPhone || "99457080"}
                              </span>
                            </div>
                          )}

                          {/* زر المعاينة */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(notebook)}
                              disabled={!notebook.previewUrl && !notebook.fileUrl}
                            >
                              <Eye className="ml-2 w-4 h-4" />
                              معاينة
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* أزرار الإجراءات - للأقسام غير المبسطة وغير ملخصات الشرح */}
                    {!isSimplifiedCategory && !isSummaryCategory && (
                      <div className="flex gap-3">
                        {/* زر التحميل المجاني (للمذكرات بدون سعر) */}
                        {(notebook.price === "0" || !notebook.price) && (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleDownload(notebook)}
                            disabled={!notebook.fileUrl && !notebook.previewUrl}
                          >
                            <Download className="ml-2 w-4 h-4" />
                            تحميل مجاني
                          </Button>
                        )}

                        {/* أزرار التواصل (للمذكرات المدفوعة فقط) */}
                        {notebook.price && notebook.price !== "0" && (
                          <>
                            <Button
                              variant="outline"
                              onClick={handleCall}
                            >
                              <Phone className="ml-2 w-4 h-4" />
                              اتصال
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleWhatsApp(notebook)}
                            >
                              <MessageCircle className="ml-2 w-4 h-4" />
                              واتساب
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link href={`/grade/${gradeId}/semester/${semesterId}/subject/${subjectId}`}>
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمادة
            </Button>
          </Link>
        </div>
      </main>

    </div>
  );
}
