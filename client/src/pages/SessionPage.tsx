import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  ExternalLink,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SessionRatingForm } from "@/components/SessionRatingForm";
import { LiveChatBox } from "@/components/LiveChatBox";

export default function SessionPage() {
  const [, params] = useRoute("/session/:slug");
  const { user } = useAuth();
  const slug = params?.slug || "";

  const { data: sessionData, isLoading } = trpc.sessions.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  const bookMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("تم حجز الحصة بنجاح!");
      setIsBooked(true);
    },
    onError: (error) => {
      toast.error(error.message || "فشل حجز الحصة");
    },
  });

  useEffect(() => {
    if (user) {
      setStudentName(user.name || "");
      setStudentEmail(user.email || "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>الحصة غير موجودة</CardTitle>
            <CardDescription>لم يتم العثور على الحصة المطلوبة</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sessions">
              <Button className="w-full">عرض جميع الحصص</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = sessionData;
  const sessionDate = new Date(session.sessionDate);
  const now = new Date();
  const isUpcoming = sessionDate > now;
  const isFree = parseFloat(session.price || "0") === 0;
  const isFull = session.maxStudents && session.bookingCount >= session.maxStudents;
  
  // Calculate time until session
  const timeUntil = sessionDate.getTime() - now.getTime();
  const daysUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && (!studentName || !studentEmail)) {
      toast.error("الرجاء ملء الاسم والبريد الإلكتروني");
      return;
    }

    bookMutation.mutate({
      sessionId: session.id,
      studentName: user ? undefined : studentName,
      studentEmail: user ? undefined : studentEmail,
      studentPhone: studentPhone || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/sessions">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة للحصص
              </Button>
            </Link>
            <h1 className="text-sm sm:text-2xl font-bold text-slate-900 truncate">مذكرة و مدرس</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={isUpcoming ? "default" : "secondary"} className="text-sm">
                      {isUpcoming ? "حصة قادمة" : "حصة منتهية"}
                    </Badge>
                    {isFree && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        مجانية
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl">{session.title}</CardTitle>
                  {session.description && (
                    <CardDescription className="text-base mt-4">
                      {session.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">التاريخ</p>
                        <p className="font-semibold">{format(sessionDate, "PPP", { locale: ar })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">الوقت</p>
                        <p className="font-semibold">{format(sessionDate, "p", { locale: ar })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">المدة</p>
                        <p className="font-semibold">{session.duration} دقيقة</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">المقاعد المتاحة</p>
                        <p className="font-semibold">
                          {session.maxStudents 
                            ? `${session.bookingCount}/${session.maxStudents}` 
                            : "غير محدود"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isUpcoming && timeUntil > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">تبدأ الحصة بعد</p>
                      <div className="flex items-center justify-center gap-4 text-2xl font-bold text-primary">
                        {daysUntil > 0 && <span>{daysUntil} يوم</span>}
                        {hoursUntil > 0 && <span>{hoursUntil} ساعة</span>}
                        <span>{minutesUntil} دقيقة</span>
                      </div>
                    </div>
                  )}

                  {!isUpcoming && (
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-center">
                      <p className="text-slate-600">هذه الحصة قد انتهت</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Join Button (if already booked) */}
              {isBooked && isUpcoming && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <p className="font-semibold text-green-900">تم حجز الحصة بنجاح!</p>
                    </div>
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gap-2" size="lg">
                        <ExternalLink className="w-5 h-5" />
                        الانضمام للحصة
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              {isUpcoming && !isBooked && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      حجز الحصة
                    </CardTitle>
                    {!isFree && (
                      <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <DollarSign className="w-6 h-6" />
                        {session.price} د.ك
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isFull ? (
                      <div className="text-center py-6">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">الحصة مكتملة</p>
                      </div>
                    ) : (
                      <form onSubmit={handleBooking} className="space-y-4">
                        {!user && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="name">الاسم *</Label>
                              <Input
                                id="name"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="أدخل اسمك"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">البريد الإلكتروني *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                              />
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={studentPhone}
                            onChange={(e) => setStudentPhone(e.target.value)}
                            placeholder="99457080"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          disabled={bookMutation.isPending}
                        >
                          {bookMutation.isPending ? "جاري الحجز..." : "احجز الآن"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Live Chat (during session) */}
              {isUpcoming && isBooked && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <LiveChatBox sessionId={session.id} sessionTitle={session.title} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Session Rating (after session ends) */}
            {!isUpcoming && (
              <div className="lg:col-span-3 mt-8">
                <SessionRatingForm sessionId={session.id} sessionTitle={session.title} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
