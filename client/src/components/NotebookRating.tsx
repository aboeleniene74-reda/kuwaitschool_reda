import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface NotebookRatingProps {
  notebookId: number;
}

export function NotebookRating({ notebookId }: NotebookRatingProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const { data: ratingStats } = trpc.notebooks.getRatingStats.useQuery({ notebookId });
  const { data: reviews } = trpc.notebooks.getReviews.useQuery({ notebookId });
  const addReviewMutation = trpc.notebooks.addReview.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    try {
      await addReviewMutation.mutateAsync({
        notebookId,
        rating,
        comment: comment.trim() || undefined,
        userId: user?.id,
      });
      
      toast.success("تم إضافة تقييمك بنجاح!");
      setRating(0);
      setComment("");
      
      // Refresh data
      utils.notebooks.getRatingStats.invalidate({ notebookId });
      utils.notebooks.getReviews.invalidate({ notebookId });
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة التقييم");
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>تقييم المذكرة</span>
            {ratingStats && ratingStats.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(ratingStats.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold">{ratingStats.average.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({ratingStats.count} تقييم)
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Review Form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">تقييمك:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">تعليقك (اختياري):</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شاركنا رأيك في هذه المذكرة..."
                rows={3}
                dir="rtl"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || addReviewMutation.isPending}
              className="w-full"
            >
              {addReviewMutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>التقييمات السابقة ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("ar-KW")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground" dir="rtl">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
