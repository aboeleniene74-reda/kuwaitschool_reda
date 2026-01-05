import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Check, Trash2, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminComments() {
  const { data: comments, isLoading, refetch } = trpc.comments.listPending.useQuery();
  const approveMutation = trpc.comments.approve.useMutation();
  const deleteMutation = trpc.comments.delete.useMutation();

  const handleApprove = async (commentId: number) => {
    try {
      await approveMutation.mutateAsync({ commentId });
      toast.success("تمت الموافقة على التعليق");
      refetch();
    } catch (error) {
      toast.error("فشل في الموافقة على التعليق");
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    
    try {
      await deleteMutation.mutateAsync({ commentId });
      toast.success("تم حذف التعليق");
      refetch();
    } catch (error) {
      toast.error("فشل في حذف التعليق");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التعليقات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost">← العودة للوحة التحكم</Button>
            </Link>
            <h1 className="text-xl font-bold">إدارة التعليقات</h1>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              التعليقات المعلقة ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {comment.authorName || "زائر"}
                          </span>
                          {comment.authorEmail && (
                            <span className="text-sm text-muted-foreground">
                              ({comment.authorEmail})
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), "PPp", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(comment.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد تعليقات معلقة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
