import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  GraduationCap, 
  LogOut, 
  FileText, 
  ShoppingCart,
  Plus,
  LayoutDashboard,
  Settings,
  BarChart3,
  MessageSquare,
  Video
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Redirect if not admin
  if (!loading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>
              ليس لديك صلاحيات للوصول إلى لوحة التحكم
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
                <Link href="/admin/dashboard">
                  <Button
                    variant={location.startsWith("/admin/dashboard") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Settings className="ml-2 w-5 h-5" />
                    لوحة القيادة الجديدة
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
                <Link href="/admin/statistics">
                  <Button
                    variant={location === "/admin/statistics" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <BarChart3 className="ml-2 w-5 h-5" />
                    الإحصائيات
                  </Button>
                </Link>
                <Link href="/admin/comments">
                  <Button
                    variant={location === "/admin/comments" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <MessageSquare className="ml-2 w-5 h-5" />
                    إدارة التعليقات
                  </Button>
                </Link>
                <Link href="/admin/sessions">
                  <Button
                    variant={location === "/admin/sessions" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Video className="ml-2 w-5 h-5" />
                    إدارة الحصص
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
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">مرحباً، {user?.name}!</CardTitle>
                <CardDescription>
                  إليك نظرة عامة على موقع علوم ثانوي
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المذكرات</CardTitle>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalNotebooks || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    المذكرات المتاحة للبيع
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">المواد الدراسية</CardTitle>
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalSubjects || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    عبر جميع الصفوف الدراسية
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">المشتريات</CardTitle>
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalPurchases || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    إجمالي عمليات الشراء
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
                <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Link href="/admin/notebooks/new">
                  <Button className="w-full h-24 text-lg">
                    <Plus className="ml-2 w-6 h-6" />
                    إضافة مذكرة جديدة
                  </Button>
                </Link>
                <Link href="/admin/notebooks">
                  <Button variant="outline" className="w-full h-24 text-lg">
                    <FileText className="ml-2 w-6 h-6" />
                    عرض جميع المذكرات
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
