import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Video, 
  Calendar,
  Clock,
  Users,
  Copy,
  Trash2,
  Edit,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminSessions() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: sessions, isLoading, refetch } = trpc.sessions.listAll.useQuery();
  const deleteMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحصة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف الحصة");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>ليس لديك صلاحية الوصول لهذه الصفحة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copySessionLink = (slug: string) => {
    const link = `${window.location.origin}/session/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("تم نسخ رابط الحصة");
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحصة؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      scheduled: { variant: "default", label: "مجدولة" },
      live: { variant: "secondary", label: "مباشرة الآن" },
      completed: { variant: "outline", label: "منتهية" },
      cancelled: { variant: "destructive", label: "ملغاة" },
    };
    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">إدارة الحصص</h1>
            <p className="text-slate-600">إدارة الحصص الدراسية أونلاين</p>
          </div>
          <Link href="/admin/sessions/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              إضافة حصة جديدة
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              جميع الحصص
            </CardTitle>
            <CardDescription>
              {sessions?.length || 0} حصة مسجلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sessions || sessions.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد حصص مسجلة بعد</p>
                <Link href="/admin/sessions/new">
                  <Button>إضافة أول حصة</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>التاريخ والوقت</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الحجوزات</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.sessionDate), "PPP", { locale: ar })}
                            <Clock className="w-4 h-4 mr-2" />
                            {format(new Date(session.sessionDate), "p", { locale: ar })}
                          </div>
                        </TableCell>
                        <TableCell>{session.duration} دقيقة</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {session.maxStudents ? `0/${session.maxStudents}` : "0"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copySessionLink(session.uniqueSlug)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Link href={`/session/${session.uniqueSlug}`}>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(session.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link href="/admin">
            <Button variant="outline">العودة للوحة التحكم</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
