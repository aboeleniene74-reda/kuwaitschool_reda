import { useEffect, useRef, useState } from "react";
import { X, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";

// تعيين worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ fileUrl, title, onClose }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب الملف
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, [fileUrl]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    renderPage();
  }, [pdf, currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="h-full w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 flex-1">
            <Lock className="h-5 w-5 text-yellow-400" />
            <div>
              <h2 className="text-lg font-bold" dir="rtl">
                {title}
              </h2>
              <p className="text-xs text-gray-300" dir="rtl">
                معاينة محدودة - أول صفحتين فقط
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-700 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* تحذير بارز */}
        <div className="bg-yellow-500/20 border-y border-yellow-500/50 px-4 py-2" dir="rtl">
          <p className="text-center text-sm text-yellow-100">
            <Lock className="inline h-4 w-4 ml-1" />
            هذه معاينة محدودة لأول صفحتين فقط. للحصول على المذكرة الكاملة، تواصل مع فارس العلوم
          </p>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-900 relative overflow-auto flex flex-col items-center justify-center p-4">
          {loading && (
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p>جاري تحميل المذكرة...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center">
              <p className="font-bold mb-2">خطأ في تحميل الملف</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && pdf && (
            <>
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[60vh] shadow-lg"
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Navigation */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center gap-4 text-white">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || currentPage > 2}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium min-w-[120px] text-center">
                    صفحة {currentPage} من {Math.min(totalPages, 2)}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
                    disabled={currentPage >= 2 || totalPages < 2}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* طبقة حماية شفافة */}
          <div
            className="absolute inset-0 pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          />
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4" dir="rtl">
          <div className="text-center">
            <p className="font-bold text-lg mb-1">للحصول على المذكرة الكاملة</p>
            <p className="text-sm flex items-center justify-center gap-2 flex-wrap">
              <span>تواصل مع فارس العلوم:</span>
              <a href="tel:99457080" className="font-bold hover:underline">
                99457080
              </a>
              <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                التوصيل المجاني
              </span>
              <span>أو عبر واتساب:</span>
              <a
                href="https://wa.me/96599457080"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:underline"
              >
                اضغط هنا
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
