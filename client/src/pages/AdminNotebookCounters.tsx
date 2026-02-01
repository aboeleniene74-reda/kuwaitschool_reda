import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  GraduationCap, 
  LogOut, 
  Eye, 
  Download, 
  RefreshCw,
  Plus,
  Edit2,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminNotebookCounters() {
  const { user, loading } = useAuth();
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null);
  const [viewCount, setViewCount] = useState<string>("");
  const [downloadCount, setDownloadCount] = useState<string>("");
  const [viewsToAdd, setViewsToAdd] = useState<string>("");
  const [downloadsToAdd, setDownloadsToAdd] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const { data: notebooks } = (trpc.admin as any).getNotebooksWithCounters.useQuery({});
  
  const updateCountersMutation = (trpc.admin as any).updateNotebookCounters.useMutation({
    onSuccess: () => {
      setSuccessMessage("تم تحديث العدادات بنجاح!");
      setViewCount("");
      setDownloadCount("");
      setSelectedNotebook(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  const addToCountersMutation = (trpc.admin as any).addToNotebookCounters.useMutation({
    onSuccess: () => {
      setSuccessMessage("تم إضافة القيم بنجاح!");
      setViewsToAdd("");
      setDownloadsToAdd("");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  const weeklyUpdateMutation = (trpc.admin as any).weeklyUpdateCounters?.useMutation?.({
    onSuccess: () => {
      setSuccessMessage("تم التحديث الأسبوعي بنجاح! (+700 مشاهدة، +30 تحميل)");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  // Redirect if not admin
  if (!loading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>
              ليس لديك صلاحيات للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">العودة للرئيسية</Button>
            </Link>
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

  const handleUpdateCounters = () => {
    if (!selectedNotebook) return;
    
    const updates: any = {};
    if (viewCount) updates.viewCount = parseInt(viewCount);
    if (downloadCount) updates.downloadCount = parseInt(downloadCount);

    if (Object.keys(updates).length === 0) {
      alert("يرجى إدخال قيمة واحدة على الأقل");
      return;
    }

    updateCountersMutation.mutate({
      notebookId: selectedNotebook,
      ...updates,
    });
  };

  const handleAddToCounters = () => {
    if (!selectedNotebook) return;

    const updates: any = {};
    if (viewsToAdd) updates.viewsToAdd = parseInt(viewsToAdd);
    if (downloadsToAdd) updates.downloadsToAdd = parseInt(downloadsToAdd);

    if (Object.keys(updates).length === 0) {
      alert("يرجى إدخال قيمة واحدة على الأقل");
      return;
    }

    addToCountersMutation.mutate({
      notebookId: selectedNotebook,
      ...updates,
    });
  };

  const handleWeeklyUpdate = () => {
    if (confirm("هل أنت متأكد من تحديث جميع المذكرات بـ +700 مشاهدة و +30 تحميل؟")) {
      weeklyUpdateMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/admin">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إدارة عدادات المذكرات</h1>
                <p className="text-xs text-muted-foreground">تحديث المشاهدات والتحميلات</p>
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
        {/* Success Message */}
        {successMessage && (
          <Card className="mb-6 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-700">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-6">
            {/* Weekly Update Button */}
            <Card className="border-blue-500 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  التحديث الأسبوعي التلقائي
                </CardTitle>
                <CardDescription>
                  إضافة 700 مشاهدة و 30 تحميل لجميع المذكرات المنشورة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleWeeklyUpdate}
                  disabled={weeklyUpdateMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="ml-2 w-4 h-4" />
                  {weeklyUpdateMutation.isPending ? "جاري التحديث..." : "تحديث الآن"}
                </Button>
              </CardContent>
            </Card>

            {/* Update Specific Notebook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  تحديث عدادات مذكرة معينة
                </CardTitle>
                <CardDescription>
                  اختر مذكرة وحدّث أرقام المشاهدات والتحميلات مباشرة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notebook Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">اختر المذكرة:</label>
                  <select
                    value={selectedNotebook || ""}
                    onChange={(e) => setSelectedNotebook(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">-- اختر مذكرة --</option>
                    {notebooks?.map((notebook: any) => (
                      <option key={notebook.id} value={notebook.id}>
                        {notebook.title} (المشاهدات: {notebook.viewCount}, التحميلات: {notebook.downloadCount})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedNotebook && (
                  <>
                    {/* Update Values */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          عدد المشاهدات الجديد
                        </label>
                        <Input
                          type="number"
                          value={viewCount}
                          onChange={(e) => setViewCount(e.target.value)}
                          placeholder="أدخل الرقم الجديد"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          عدد التحميلات الجديد
                        </label>
                        <Input
                          type="number"
                          value={downloadCount}
                          onChange={(e) => setDownloadCount(e.target.value)}
                          placeholder="أدخل الرقم الجديد"
                          min="0"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleUpdateCounters}
                      disabled={updateCountersMutation.isPending}
                      className="w-full"
                    >
                      {updateCountersMutation.isPending ? "جاري التحديث..." : "تحديث العدادات"}
                    </Button>

                    {/* Add to Values */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-4">أو أضف قيم إلى العدادات الحالية:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            أضف مشاهدات
                          </label>
                          <Input
                            type="number"
                            value={viewsToAdd}
                            onChange={(e) => setViewsToAdd(e.target.value)}
                            placeholder="عدد المشاهدات المراد إضافتها"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            أضف تحميلات
                          </label>
                          <Input
                            type="number"
                            value={downloadsToAdd}
                            onChange={(e) => setDownloadsToAdd(e.target.value)}
                            placeholder="عدد التحميلات المراد إضافتها"
                            min="0"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddToCounters}
                        disabled={addToCountersMutation.isPending}
                        variant="outline"
                        className="w-full mt-4"
                      >
                        {addToCountersMutation.isPending ? "جاري الإضافة..." : "إضافة القيم"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Current Stats */}
            {selectedNotebook && notebooks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الإحصائيات الحالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notebooks
                    .filter((n: any) => n.id === selectedNotebook)
                    .map((notebook: any) => (
                      <div key={notebook.id} className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">المشاهدات</p>
                          <p className="text-2xl font-bold text-blue-600">{notebook.viewCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">التحميلات</p>
                          <p className="text-2xl font-bold text-green-600">{notebook.downloadCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">العنوان</p>
                          <p className="font-medium">{notebook.title}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملاحظات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✅ يمكنك تحديث الأرقام يدويًا لأي مذكرة</p>
                <p>✅ يمكنك إضافة قيم تدريجية</p>
                <p>✅ التحديث الأسبوعي يضيف 700 مشاهدة و 30 تحميل</p>
                <p>✅ جميع التحديثات فورية</p>
              </CardContent>
            </Card>

            {/* Back Button */}
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="ml-2 w-4 h-4" />
                العودة إلى لوحة التحكم
              </Button>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
