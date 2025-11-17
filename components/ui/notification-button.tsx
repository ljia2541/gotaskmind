"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, CheckCircle, Trash2, UserPlus, FolderOpen, CheckSquare, Shield, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useServerNotifications } from '@/app/hooks/use-server-notifications';
import { notificationTypeLabels } from '@/types/notification';
import { formatDistanceToNow } from '@/lib/utils';

interface NotificationButtonProps {
  userEmail?: string;
  isPro?: boolean;
}

export function NotificationButton({ userEmail, isPro }: NotificationButtonProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loading,
    error,
    isConnected,
  } = useServerNotifications(userEmail, isPro);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开下拉菜单时标记所有通知为已读
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    const Icon = notificationTypeLabels[type as keyof typeof notificationTypeLabels]?.icon || 'Bell';
    switch (Icon) {
      case 'UserPlus':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-blue-600" />
        </div>;
      case 'FolderOpen':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <FolderOpen className="w-4 h-4 text-green-600" />
        </div>;
      case 'CheckSquare':
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-purple-600" />
        </div>;
      case 'Shield':
        return <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Shield className="w-4 h-4 text-orange-600" />
        </div>;
      case 'UserX':
        return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <UserX className="w-4 h-4 text-red-600" />
        </div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell className="w-4 h-4 text-gray-600" />
        </div>;
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '刚刚';
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/50 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            {/* 连接状态指示器 */}
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} title={isConnected ? '通知已连接' : '通知未连接'} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
          {/* 通知头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="text-base font-semibold m-0 p-0">
                通知中心
              </DropdownMenuLabel>
              {/* 连接状态指示 */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="h-8 px-2 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  全部已读
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllNotifications();
                  }}
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空
                </Button>
              )}
            </div>
          </div>

          {/* 通知列表 */}
          <ScrollArea className="h-96">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md m-2">
                <p className="text-sm text-red-800">加载通知失败: {error}</p>
              </div>
            )}

            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-sm">加载中...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">暂无通知</p>
                <p className="text-xs mt-1">收到的新通知会显示在这里</p>
                {!isConnected && (
                  <p className="text-xs mt-2 text-orange-600">通知连接已断开，可能无法接收新通知</p>
                )}
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* 通知图标 */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* 通知内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatTime(notification.createdAt)}</span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  新
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        {notification.actionText && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* 通知底部 */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>共 {notifications.length} 条通知</span>
                {unreadCount > 0 && (
                  <span>{unreadCount} 条未读</span>
                )}
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}