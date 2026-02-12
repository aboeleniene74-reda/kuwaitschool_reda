import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Video, Calendar, Clock, Users, DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Sessions() {
  const { data: sessions, isLoading } = trpc.sessions.list.useQuery();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">مذكرة و مدرس</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              الحصص الدراسية أونلاين
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              انضم إلى حصص الشرح المباشرة مع فارس العلوم واستفد من الشرح التفاعلي
            </p>
          </div>

          {!sessions || sessions.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد حصص متاحة حالياً</h3>
                <p className="text-muted-foreground mb-6">
                  تابعنا للحصول على آخر التحديثات عن الحصص القادمة
                </p>
                <Link href="/">
                  <Button>العودة للرئيسية</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => {
                const sessionDate = new Date(session.sessionDate);
                const isUpcoming = sessionDate > new Date();
                const isFree = parseFloat(session.price || "0") === 0;

                return (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={isUpcoming ? "default" : "secondary"}>
                          {isUpcoming ? "قادمة" : "منتهية"}
                        </Badge>
                        {isFree && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            مجانية
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{session.title}</CardTitle>
                      {session.description && (
                        <CardDescription className="line-clamp-2">
                          {session.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(sessionDate, "PPP", { locale: ar })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{format(sessionDate, "p", { locale: ar })} • {session.duration} دقيقة</span>
                        </div>
                        {session.maxStudents && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>متاح {session.maxStudents} مقعد</span>
                          </div>
                        )}
                        {!isFree && (
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <DollarSign className="w-4 h-4" />
                            <span>{session.price} د.ك</span>
                          </div>
                        )}
                      </div>

                      <Link href={`/session/${session.uniqueSlug}`}>
                        <Button className="w-full" disabled={!isUpcoming}>
                          {isUpcoming ? "التفاصيل والحجز" : "عرض التفاصيل"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
