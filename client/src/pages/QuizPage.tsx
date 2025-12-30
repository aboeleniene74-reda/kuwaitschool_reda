import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Clock, Trophy, XCircle } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const quizId = parseInt(id || "0");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [startTime] = useState(new Date());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: quiz } = trpc.quizzes.getById.useQuery({ id: quizId });
  const { data: questions } = trpc.questions.listByQuiz.useQuery({ quizId });
  
  const submitMutation = trpc.attempts.submit.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      toast.success("تم تسليم الاختبار بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تسليم الاختبار");
    },
  });

  const handleAnswerChange = (questionId: number, answer: "A" | "B" | "C" | "D") => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (questions && currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const confirmed = window.confirm(
        `لقد أجبت على ${answeredCount} من ${questions.length} سؤال. هل تريد التسليم؟`
      );
      if (!confirmed) return;
    }

    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId: parseInt(questionId),
      selectedAnswer,
    }));

    submitMutation.mutate({
      quizId,
      answers: formattedAnswers,
      startedAt: startTime,
    });
  };

  if (!quiz || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">الاختبار غير موجود</h2>
          <Link href="/">
            <Button variant="link">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    const percentage = (results.score / results.totalPoints) * 100;
    const isPassed = results.isPassed;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-8">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isPassed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isPassed ? (
                  <Trophy className="w-12 h-12 text-green-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
              </div>
              <CardTitle className="text-4xl mb-4">
                {isPassed ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح'}
              </CardTitle>
              <CardDescription className="text-xl">
                نتيجة اختبار: {quiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-muted-foreground">درجتك</span>
                  <span className="text-3xl font-bold text-primary">
                    {results.score.toFixed(1)} / {results.totalPoints.toFixed(1)}
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">النسبة المئوية</span>
                  <span className="text-2xl font-bold">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {Object.keys(answers).length}
                  </div>
                  <div className="text-sm text-muted-foreground">الأسئلة المجابة</div>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent-foreground mb-1">
                    {questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">إجمالي الأسئلة</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => setLocation(`/subject/${quiz.subjectId}`)}
                >
                  <ArrowRight className="ml-2 w-5 h-5" />
                  العودة للمادة
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/subject/${quiz.subjectId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة للمادة
            </Button>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">
                السؤال {currentQuestion + 1} من {questions.length}
              </p>
            </div>
            {quiz.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>المدة: {quiz.duration} دقيقة</span>
              </div>
            )}
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">
              {question.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value as "A" | "B" | "C" | "D")}
              className="space-y-4"
            >
              {["A", "B", "C", "D"].map((option) => {
                const optionText = question[`option${option}` as keyof typeof question] as string;
                return (
                  <div
                    key={option}
                    className={`flex items-center space-x-3 space-x-reverse border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      answers[question.id] === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${option}`} />
                    <Label
                      htmlFor={`option-${option}`}
                      className="flex-1 cursor-pointer text-lg"
                    >
                      <span className="font-semibold ml-2">{option}.</span>
                      {optionText}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowRight className="ml-2 w-5 h-5" />
                السابق
              </Button>

              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      index === currentQuestion
                        ? "bg-primary text-primary-foreground"
                        : answers[questions[index].id]
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  تسليم الاختبار
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  التالي
                  <ArrowRight className="mr-2 w-5 h-5 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
