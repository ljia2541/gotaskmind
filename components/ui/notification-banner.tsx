"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Bell, UserPlus, FolderOpen, CheckSquare, Shield, UserX } from 'lucide-react';
import { useAuth } from '@/app/hooks/use-auth';
import { useServerNotifications } from '@/app/hooks/use-server-notifications';
import { notificationTypeLabels } from '@/types/notification';

export function NotificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, reload, isConnected } = useServerNotifications(user?.email);
  const [isVisible, setIsVisible] = useState(false);
  const [newNotifications, setNewNotifications] = useState(0);

  // 检查新通知
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setIsVisible(false);
      return;
    }

    // 检查是否有新的未读通知
    const checkNewNotifications = () => {
      const hasUnread = unreadCount > 0;
      const wasVisible = isVisible;

      if (hasUnread && !wasVisible) {
        // 有新的未读通知，显示横幅
        setNewNotifications(unreadCount);
        setIsVisible(true);

        // 5秒后自动隐藏
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    checkNewNotifications();
  }, [unreadCount, isAuthenticated, user?.email]);

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    const Icon = notificationTypeLabels[type as keyof typeof notificationTypeLabels]?.icon || 'Bell';
    switch (Icon) {
      case 'UserPlus': return <UserPlus className="w-4 h-4" />;
      case 'FolderOpen': return <FolderOpen className="w-4 h-4" />;
      case 'CheckSquare': return <CheckSquare className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'UserX': return <UserX className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // 获取最新通知
  const latestNotification = notifications.find(n => !n.read);

  if (!isVisible || !latestNotification) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">新通知</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {newNotifications}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {getNotificationIcon(latestNotification.type)}
              <span className="text-sm">{latestNotification.title}</span>
              <span className="text-sm opacity-90">: {latestNotification.message}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (latestNotification.actionUrl) {
                  window.location.href = latestNotification.actionUrl;
                } else {
                  window.location.href = '/tasks';
                }
              }}
              className="text-white hover:bg-white/20"
            >
              查看
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                markAsRead(latestNotification.id);
                setIsVisible(false);
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}