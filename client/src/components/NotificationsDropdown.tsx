import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, CheckCheck, Trash2, FileText, Video, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications, refetch } = trpc.notifications.getMyNotifications.useQuery(
    { limit: 20 },
    { refetchInterval: 30000 } // تحديث كل 30 ثانية
  );
  
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    },
  });
  
  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم حذف الإشعار");
    },
  });

  const handleNotificationClick = (id: number, link?: string | null) => {
    markAsReadMutation.mutate({ id });
    if (link) {
      window.location.href = link;
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "notebook":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "session":
        return <Video className="h-4 w-4 text-purple-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(date).toLocaleDateString("ar-KW");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 ? (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>الإشعارات</span>
          {notifications && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-auto py-1 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 ml-1" />
              تحديد الكل كمقروء
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!notifications || notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <DropdownMenuItem
                  className="cursor-pointer p-3 flex-col items-start gap-2"
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  <div className="flex items-start gap-2 w-full">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate({ id: notification.id });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
