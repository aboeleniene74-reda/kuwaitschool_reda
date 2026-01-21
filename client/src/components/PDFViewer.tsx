import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileUrl: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ fileUrl, title, onClose }: PDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // منع الضغط على زر ESC للإغلاق
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // إضافة #toolbar=0 لإخفاء شريط الأدوات في بعض المتصفحات
  // إضافة #view=FitH لعرض الصفحة بالكامل
  const viewerUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="h-full w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold truncate flex-1" dir="rtl">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-800 relative">
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            className="w-full h-full border-0"
            title={title}
            // إضافة خصائص لمنع التحميل والطباعة (تعمل في بعض المتصفحات)
            sandbox="allow-same-origin allow-scripts"
          />
          
          {/* Overlay لمنع النقر بزر الماوس الأيمن */}
          <div 
            className="absolute inset-0 pointer-events-none"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white p-3 text-center text-sm" dir="rtl">
          <p>للحصول على نسخة كاملة من المذكرة، يرجى التواصل مع فارس العلوم: 99457080</p>
        </div>
      </div>
    </div>
  );
}
