import { useEffect, useRef, useState } from "react";
import { X, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from 'pdfjs-dist';

// تكوين PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ fileUrl, title, onClose }: PDFViewerProps) {
  const canvasRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // منع الضغط على زر ESC للإغلاق
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // منع Ctrl+P (طباعة)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      // منع Ctrl+S (حفظ)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // منع النقر بزر الماوس الأيمن
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onClose]);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // تحميل PDF
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        setTotalPages(pdf.numPages);

        // عرض أول صفحتين فقط
        const pagesToRender = Math.min(2, pdf.numPages);
        
        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = canvasRefs[pageNum - 1].current;
          
          if (!canvas) continue;

          const context = canvas.getContext('2d');
          if (!context) continue;

          // حساب المقياس لملء العرض
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            (canvas.parentElement?.clientWidth || 800) / viewport.width,
            1.5 // حد أقصى للمقياس
          );
          
          const scaledViewport = page.getViewport({ scale });

          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          // رسم الصفحة
          const renderContext: any = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          await page.render(renderContext).promise;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('فشل تحميل المعاينة. يرجى المحاولة لاحقاً.');
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadPDF();
    }
  }, [fileUrl]);

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
              <h2 className="text-lg font-bold" dir="rtl">{title}</h2>
              <p className="text-xs text-gray-300" dir="rtl">
                معاينة محدودة - أول صفحتين فقط {totalPages > 0 && `(من أصل ${totalPages} صفحة)`}
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
        <div 
          className="flex-1 bg-gray-900 overflow-y-auto p-4" 
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>جاري تحميل المعاينة...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center text-white max-w-md">
                <p className="font-bold mb-2">حدث خطأ</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="max-w-4xl mx-auto space-y-6">
              {canvasRefs.map((ref, index) => (
                <div key={index} className="bg-white shadow-2xl">
                  <canvas
                    ref={ref}
                    className="w-full h-auto"
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  />
                  <div className="bg-gray-800 text-white text-center py-2 text-sm" dir="rtl">
                    صفحة {index + 1} من 2 (معاينة)
                  </div>
                </div>
              ))}
              
              {/* رسالة نهاية المعاينة */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8 text-center shadow-xl" dir="rtl">
                <Lock className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">انتهت المعاينة المجانية</h3>
                <p className="mb-4">
                  هذه معاينة محدودة لأول صفحتين فقط.
                  {totalPages > 2 && ` المذكرة الكاملة تحتوي على ${totalPages} صفحة.`}
                </p>
                <p className="text-lg font-bold mb-2">للحصول على المذكرة الكاملة</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a 
                    href="tel:99457080"
                    className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
                  >
                    📞 اتصل: 99457080
                  </a>
                  <a 
                    href="https://wa.me/96599457080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    💬 واتساب: 99457080
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4" dir="rtl">
          <div className="text-center">
            <p className="font-bold text-lg mb-1">للحصول على المذكرة الكاملة</p>
            <p className="text-sm">
              تواصل مع فارس العلوم: 
              <a href="tel:99457080" className="font-bold mx-2 hover:underline">99457080</a>
              أو عبر واتساب:
              <a 
                href="https://wa.me/96599457080" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold mr-2 hover:underline"
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
