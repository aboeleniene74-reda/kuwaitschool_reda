import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, ArrowRight, Trash2, FileText, Video, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminNotificationsManagement() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: allNotifications, refetch } = trpc.notifications.getAll.useQuery();
  const broadcastMutation = trpc.notifications.broadcast.useMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error" | "notebook" | "session",
    link: "",
  });

  // Redirect if not admin
  if (!loading && (!user || user.role !== 'admin')) {
    if (!user) {
      window.location.href = getLoginUrl();
    } else {
      setLocation('/');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await broadcastMutation.mutateAsync({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        link: formData.link || undefined,
      });
      
      toast.success("تم إرسال الإشعار لجميع المستخدمين بنجاح");
      setFormData({
        title: "",
        message: "",
        type: "info",
        link: "",
      });
      await refetch();
    } catch (error) {
      toast.error("فشل في إرسال الإشعار");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "notebook":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "session":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ar-KW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              <h1 className="text-3xl font-bold text-slate-900">إدارة الإشعارات</h1>
              <p className="text-slate-600 mt-1">إرسال إشعارات للمستخدمين</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* إرسال إشعار جديد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                إرسال إشعار جديد
              </CardTitle>
              <CardDescription>إرسال إشعار لجميع المستخدمين المسجلين</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الإشعار *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: مذكرة جديدة متاحة الآن"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">نص الإشعار *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="مثال: تم إضافة مذكرة جديدة للصف الثاني عشر - الفصل الثاني"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع الإشعار</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">معلومة</SelectItem>
                      <SelectItem value="success">نجاح</SelectItem>
                      <SelectItem value="warning">تحذير</SelectItem>
                      <SelectItem value="error">خطأ</SelectItem>
                      <SelectItem value="notebook">مذكرة جديدة</SelectItem>
                      <SelectItem value="session">حصة جديدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">رابط (اختياري)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/grade/1/semester/1"
                  />
                  <p className="text-xs text-slate-500">
                    رابط داخلي في الموقع (يبدأ بـ /)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={broadcastMutation.isPending}
                >
                  {broadcastMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      إرسال الإشعار
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* آخر الإشعارات المرسلة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                آخر الإشعارات المرسلة
              </CardTitle>
              <CardDescription>عرض آخر 50 إشعار تم إرساله</CardDescription>
            </CardHeader>
            <CardContent>
              {!allNotifications || allNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>لم يتم إرسال أي إشعارات بعد</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {allNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-slate-50 rounded-lg border"
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                          {notification.link && (
                            <p className="text-xs text-blue-600 mt-1">
                              🔗 {notification.link}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>{formatDate(notification.createdAt)}</span>
                            <span>
                              {notification.userId
                                ? `مستخدم #${notification.userId}`
                                : "جميع المستخدمين"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
