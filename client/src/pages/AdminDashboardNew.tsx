import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Eye, 
  Star, 
  TrendingUp,
  Activity,
  Megaphone,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function AdminDashboardNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: detailedStats } = trpc.admin.getDetailedStats.useQuery();
  const { data: users } = trpc.admin.getAllUsers.useQuery();
  const { data: announcements } = trpc.admin.getAllAnnouncements.useQuery();

  // Redirect if not admin
  if (!loading && (!user || user.role !== 'admin')) {
    if (!user) {
      window.location.href = getLoginUrl();
    } else {
      setLocation('/');
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">لوحة القيادة</h1>
              <p className="text-slate-600 mt-1">إحصائيات وإدارة شاملة للمنصة</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                العودة للموقع
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Visits */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                إجمالي الزيارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {detailedStats?.totalVisits.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">زيارة للمنصة</p>
            </CardContent>
          </Card>

          {/* Total Views */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                إجمالي المشاهدات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {detailedStats?.totalViews.toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">مشاهدة للمذكرات</p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                المستخدمون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {users?.length || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">مستخدم مسجل</p>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Star className="h-4 w-4" />
                التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {detailedStats?.totalReviews || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                متوسط {detailedStats?.averageRating || 0} ⭐
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/dashboard/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  إدارة المستخدمين
                </CardTitle>
                <CardDescription>
                  عرض قائمة المستخدمين ونشاطهم
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/dashboard/announcements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Megaphone className="h-6 w-6 text-green-600" />
                  </div>
                  إدارة الإعلانات
                </CardTitle>
                <CardDescription>
                  إنشاء وتعديل الإعلانات في الموقع
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/dashboard/content">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  إدارة المحتوى
                </CardTitle>
                <CardDescription>
                  تعديل محتوى الصفحات والإعدادات
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                  لوحة التحكم القديمة
                </CardTitle>
                <CardDescription>
                  إدارة المذكرات والحصص والإحصائيات
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Top Notebooks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أكثر المذكرات مشاهدة
            </CardTitle>
            <CardDescription>المذكرات الأكثر شعبية بين الطلاب</CardDescription>
          </CardHeader>
          <CardContent>
            {detailedStats?.topNotebooks && detailedStats.topNotebooks.length > 0 ? (
              <div className="space-y-3">
                {detailedStats.topNotebooks.slice(0, 5).map((item, index) => (
                  <div
                    key={item.notebookId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">مذكرة #{item.notebookId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Eye className="h-4 w-4" />
                      <span className="font-bold">{item.views}</span>
                      <span className="text-sm">مشاهدة</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  الإعلانات الأخيرة
                </CardTitle>
                <CardDescription>آخر الإعلانات المنشورة</CardDescription>
              </div>
              <Link href="/admin/dashboard/announcements">
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-slate-50 rounded-lg border-r-4 border-r-blue-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{announcement.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{announcement.message}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          announcement.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {announcement.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">لا توجد إعلانات</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
