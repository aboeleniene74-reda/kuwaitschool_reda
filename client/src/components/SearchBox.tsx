import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const { data: results, isLoading } = trpc.notebooks.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const handleClear = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="ابحث في المذكرات... (مثال: كيمياء، مراجعة، فاينل)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(e.target.value.length > 2);
          }}
          className="pr-10 pl-10 h-12 text-lg"
          dir="rtl"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-xl">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">جاري البحث...</p>
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  تم العثور على {results.length} نتيجة
                </p>
                {results.map((notebook) => (
                  <Link
                    key={notebook.id}
                    href={`/grade/${notebook.gradeId}/semester/${notebook.semesterId}/subject/${notebook.subjectId}/category/${notebook.categoryId}`}
                    onClick={() => setShowResults(false)}
                  >
                    <div className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{notebook.title}</h4>
                          {notebook.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {notebook.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {notebook.isFeatured && (
                              <Badge variant="default" className="text-xs">مميزة</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {notebook.pages} صفحة
                            </span>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="font-bold text-primary">
                            {parseFloat(notebook.price) === 0 ? "مجاني" : `${notebook.price} د.ك`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">لا توجد نتائج</p>
                <p className="text-xs text-muted-foreground mt-1">
                  جرب كلمات بحث أخرى
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
