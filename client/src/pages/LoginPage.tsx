import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import { Loader2, GraduationCap } from "lucide-react";

export default function LoginPage() {
  useEffect(() => {
    // توجيه المستخدم مباشرة إلى Manus OAuth
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">جاري تحويلك لتسجيل الدخول...</span>
        </div>
      </div>
    </div>
  );
}
