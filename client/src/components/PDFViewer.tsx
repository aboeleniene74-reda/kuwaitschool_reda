import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileUrl: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ fileUrl, title, onClose }: PDFViewerProps) {
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

  // استخدام Google Docs Viewer لعرض PDF
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

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
              <p className="text-xs text-gray-300" dir="rtl">معاينة محدودة - أول صفحتين فقط</p>
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
          className="flex-1 bg-gray-900 relative" 
          onContextMenu={(e) => e.preventDefault()}
        >
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-same-origin allow-scripts"
            onContextMenu={(e) => e.preventDefault()}
          />
          
          {/* طبقة حماية شفافة */}
          <div 
            className="absolute inset-0 pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          />
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
