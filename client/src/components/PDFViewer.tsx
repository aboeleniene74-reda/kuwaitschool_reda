import { useEffect } from "react";
import { X, ExternalLink, Download } from "lucide-react";
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
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // فتح PDF في تبويب جديد
  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  // استخدام Google Docs Viewer كبديل آمن
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

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
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold truncate flex-1" dir="rtl">{title}</h2>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInNewTab}
              className="text-white hover:bg-gray-800"
              title="فتح في تبويب جديد"
            >
              <ExternalLink className="h-4 w-4 ml-2" />
              <span className="text-sm">فتح في تبويب جديد</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-800 relative flex items-center justify-center">
          {/* محاولة عرض PDF مباشرة */}
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0"
            title={title}
            onError={() => {
              // في حالة فشل Google Viewer، نعرض رسالة
              console.error('Failed to load PDF viewer');
            }}
          />
          
          {/* رسالة بديلة في حالة فشل التحميل */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm pointer-events-none">
            <div className="bg-white rounded-lg p-8 max-w-md text-center pointer-events-auto" dir="rtl">
              <div className="mb-4">
                <Download className="h-16 w-16 mx-auto text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">معاينة المذكرة</h3>
              <p className="text-gray-600 mb-4">
                إذا لم تظهر المعاينة، يمكنك فتح الملف في تبويب جديد
              </p>
              <Button
                onClick={handleOpenInNewTab}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                فتح الملف
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white p-3 text-center text-sm" dir="rtl">
          <p>للحصول على نسخة كاملة من المذكرة، يرجى التواصل مع فارس العلوم: 99457080</p>
        </div>
      </div>
    </div>
  );
}
