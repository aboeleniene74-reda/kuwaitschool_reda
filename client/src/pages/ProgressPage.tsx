import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, ClipboardCheck, FileText, Trophy, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function ProgressPage() {
  const { user } = useAuth();

  const { data: stats } = trpc.progress.myStats.useQuery();
  const { data: attempts } = trpc.attempts.myAttempts.useQuery({});

  if (!user || (user.role !== 'student' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">هذه الصفحة متاحة للطلاب فقط</h2>
          <Link href="/">
            <Button variant="link">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  // تحضير بيانات الرسم البياني
  const chartData = attempts?.slice(0, 10).reverse().map((attempt, index) => ({
    name: `اختبار ${index + 1}`,
    score: parseFloat(attempt.score),
    total: parseFloat(attempt.totalPoints),
    percentage: (parseFloat(attempt.score) / parseFloat(attempt.totalPoints)) * 100,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">تتبع التقدم</h1>
              <p className="text-xl text-muted-foreground">متابعة أدائك الأكاديمي</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>الدروس المكتملة</CardDescription>
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {stats?.completedLessons || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>الاختبارات المنجزة</CardDescription>
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {stats?.quizzesTaken || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>المعدل العام</CardDescription>
                <Trophy className="w-5 h-5 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent-foreground">
                {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>الواجبات المسلمة</CardDescription>
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {stats?.assignmentsSubmitted || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>أداء الاختبارات الأخيرة</CardTitle>
              <CardDescription>النسبة المئوية لآخر 10 اختبارات</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelStyle={{ direction: 'rtl' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="oklch(0.48 0.18 250)" 
                      strokeWidth={3}
                      dot={{ fill: 'oklch(0.48 0.18 250)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات لعرضها
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scores Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الدرجات المحققة</CardTitle>
              <CardDescription>مقارنة الدرجات المحققة بالدرجات الكاملة</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip labelStyle={{ direction: 'rtl' }} />
                    <Bar dataKey="score" fill="oklch(0.48 0.18 250)" name="درجتك" />
                    <Bar dataKey="total" fill="oklch(0.90 0.01 240)" name="الدرجة الكاملة" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات لعرضها
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>آخر المحاولات</CardTitle>
            <CardDescription>تفاصيل آخر الاختبارات التي قمت بها</CardDescription>
          </CardHeader>
          <CardContent>
            {!attempts || attempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لم تقم بأي اختبارات بعد
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.slice(0, 5).map((attempt) => {
                  const score = parseFloat(attempt.score);
                  const total = parseFloat(attempt.totalPoints);
                  const percentage = (score / total) * 100;

                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-xl hover:border-primary/50 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        attempt.isPassed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {attempt.isPassed ? (
                          <Trophy className="w-6 h-6 text-green-600" />
                        ) : (
                          <ClipboardCheck className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">اختبار رقم {attempt.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(attempt.completedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-bold text-primary">
                              {score.toFixed(1)} / {total.toFixed(1)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
