import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  GraduationCap, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  FileText,
  LayoutDashboard,
  Star
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function AdminNotebooks() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const { data: notebooks, refetch } = trpc.notebooks.listAll.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "teacher",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<number | null>(null);

  const deleteMutation = trpc.notebooks.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المذكرة بنجاح");
      refetch();
      setDeleteDialogOpen(false);
      setNotebookToDelete(null);
    },
    onError: (error) => {
      toast.error("فشل حذف المذكرة: " + error.message);
    },
  });

  const handleDeleteClick = (notebookId: number) => {
    setNotebookToDelete(notebookId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notebookToDelete) {
      deleteMutation.mutate({ id: notebookToDelete });
    }
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
              <a href={getLoginUrl()}>
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
    <>
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
                  <Button
                    variant={location === "/admin" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="ml-2 w-5 h-5" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Link href="/admin/notebooks">
                  <Button
                    variant={location === "/admin/notebooks" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
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
                <h2 className="text-3xl font-bold">إدارة المذكرات</h2>
                <p className="text-muted-foreground">عرض وإدارة جميع المذكرات الدراسية</p>
              </div>
              <Link href="/admin/notebooks/new">
                <Button>
                  <Plus className="ml-2 w-5 h-5" />
                  إضافة مذكرة جديدة
                </Button>
              </Link>
            </div>

            {/* Notebooks Table */}
            <Card>
              <CardContent className="p-0">
                {!notebooks || notebooks.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">لا توجد مذكرات</h3>
                    <p className="text-muted-foreground mb-4">ابدأ بإضافة مذكرة جديدة</p>
                    <Link href="/admin/notebooks/new">
                      <Button>
                        <Plus className="ml-2 w-5 h-5" />
                        إضافة مذكرة
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المادة</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>التقييم</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notebooks.map((notebook) => (
                        <TableRow key={notebook.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {notebook.coverImageUrl && (
                                <img
                                  src={notebook.coverImageUrl}
                                  alt={notebook.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-semibold">{notebook.title}</div>
                                {notebook.pages && (
                                  <div className="text-sm text-muted-foreground">
                                    {notebook.pages} صفحة
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{notebook.subjectId}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {parseFloat(notebook.price).toFixed(3)} د.ك
                          </TableCell>
                          <TableCell>
                            {notebook.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{notebook.rating}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {notebook.isFeatured ? (
                              <Badge>مميزة</Badge>
                            ) : (
                              <Badge variant="secondary">عادية</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/notebooks/${notebook.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(notebook.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذه المذكرة؟ لن تتمكن من التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
