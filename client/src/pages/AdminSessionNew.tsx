import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Video, Calendar, Clock, Link as LinkIcon, Users, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminSessionNew() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [meetingLink, setMeetingLink] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [price, setPrice] = useState("0.00");

  const createMutation = trpc.sessions.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إضافة الحصة بنجاح");
      const link = `${window.location.origin}/session/${data.slug}`;
      navigator.clipboard.writeText(link);
      toast.info("تم نسخ رابط الحصة");
      setLocation("/admin/sessions");
    },
    onError: (error) => {
      toast.error(error.message || "فشل إضافة الحصة");
    },
  });

  if (authLoading) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !sessionDate || !sessionTime || !meetingLink) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // Combine date and time
    const dateTimeString = `${sessionDate}T${sessionTime}`;
    const sessionDateTime = new Date(dateTimeString);

    createMutation.mutate({
      title,
      description: description || undefined,
      sessionDate: sessionDateTime,
      duration: parseInt(duration),
      meetingLink,
      maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
      price: price || "0.00",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">إضافة حصة جديدة</h1>
          <p className="text-slate-600">أضف حصة دراسية أونلاين جديدة</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              معلومات الحصة
            </CardTitle>
            <CardDescription>
              أدخل تفاصيل الحصة الدراسية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الحصة *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شرح الفصل الأول - الكيمياء"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الحصة</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر عن محتوى الحصة..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ الحصة *
                  </Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    وقت الحصة *
                  </Label>
                  <Input
                    id="sessionTime"
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    مدة الحصة (دقيقة) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="15"
                    step="15"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudents" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    الحد الأقصى للطلاب
                  </Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    placeholder="غير محدود"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingLink" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  رابط الحصة (Zoom/Google Meet) *
                </Label>
                <Input
                  id="meetingLink"
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  required
                />
                <p className="text-sm text-muted-foreground">
                  أدخل رابط Zoom أو Google Meet أو أي منصة اجتماعات أخرى
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  السعر (دينار كويتي)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  اترك 0.00 إذا كانت الحصة مجانية
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "جاري الإضافة..." : "إضافة الحصة"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/sessions")}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
