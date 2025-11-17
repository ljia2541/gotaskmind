import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import {
  Notification,
  NotificationFilter,
  NotificationStats,
} from '@/types/notification';

interface ServerNotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  hasMore: boolean;
}

export function useServerNotifications(userEmail?: string, isPro?: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 从服务器加载通知
  const loadNotifications = useCallback(async (options: {
    type?: string;
    read?: boolean;
    limit?: number;
    offset?: number;
  } = {}) => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userEmail,
        ...options
      });

      const response = await fetch(`/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error('获取通知失败');
      }

      const data: ServerNotificationsResponse = await response.json();

      console.log('📋 从服务器加载通知:', {
        userEmail,
        count: data.notifications.length,
        unread: data.unread
      });

      if (options.offset === 0) {
        // 初始加载或刷新
        setNotifications(data.notifications);
      } else {
        // 加载更多
        setNotifications(prev => [...prev, ...data.notifications]);
      }

    } catch (error) {
      console.error('❌ 加载通知失败:', error);
      setError(error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // 创建新通知
  const createNotification = useCallback(async (
    type: string,
    fromUserId: string,
    fromUserName: string,
    toUserEmail: string,
    metadata?: any
  ) => {
    if (!userEmail) return null;

    try {
      console.log('🔔 发送通知到服务器:', {
        type,
        fromUserId,
        fromUserName,
        toUserEmail
      });

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          fromUserId,
          fromUserName,
          toUserEmail,
          metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '发送通知失败');
      }

      const data = await response.json();

      console.log('✅ 通知发送成功:', data.notification);

      // 显示成功提示
      toast.success(`通知已发送给 ${toUserEmail}`, {
        description: `${data.notification.title}: ${data.notification.message}`,
        duration: 3000
      });

      // 如果是发给当前用户的，立即刷新通知列表
      if (toUserEmail === userEmail) {
        await loadNotifications();
      }

      return data.notification;

    } catch (error) {
      console.error('❌ 发送通知失败:', error);
      toast.error('发送通知失败', {
        description: error instanceof Error ? error.message : '未知错误'
      });
      return null;
    }
  }, [userEmail, loadNotifications]);

  // 标记通知为已读
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userEmail) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'mark_read',
          userEmail
        })
      });

      if (!response.ok) {
        throw new Error('标记已读失败');
      }

      // 更新本地状态
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

    } catch (error) {
      console.error('❌ 标记已读失败:', error);
      toast.error('操作失败');
    }
  }, [userEmail]);

  // 标记所有通知为已读
  const markAllAsRead = useCallback(async () => {
    if (!userEmail) return;

    const unreadNotifications = notifications.filter(n => !n.read);

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  }, [userEmail, notifications, markAsRead]);

  // 删除通知
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userEmail) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'delete',
          userEmail
        })
      });

      if (!response.ok) {
        throw new Error('删除通知失败');
      }

      // 更新本地状态
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

    } catch (error) {
      console.error('❌ 删除通知失败:', error);
      toast.error('删除失败');
    }
  }, [userEmail]);

  // 清空所有通知
  const clearAllNotifications = useCallback(async () => {
    if (!userEmail) return;

    for (const notification of notifications) {
      await deleteNotification(notification.id);
    }
  }, [userEmail, notifications, deleteNotification]);

  // 建立SSE连接以接收实时通知
  useEffect(() => {
    if (!userEmail) {
      console.log('❌ 无法建立SSE连接：缺少用户邮箱');
      return;
    }

    console.log('🔗 开始建立SSE连接...', userEmail);

    const streamUrl = `/api/notifications/stream?userEmail=${encodeURIComponent(userEmail)}`;
    console.log('📡 SSE URL:', streamUrl);

    let eventSource: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3秒

    const connectSSE = () => {
      try {
        console.log(`🔄 尝试建立SSE连接 (尝试 ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

        eventSource = new EventSource(streamUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('✅ SSE连接已建立');
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0; // 重置重连计数
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 收到SSE消息:', data);

            if (data.type === 'new_notification') {
              const newNotification = data.notification;

              // 检查是否是发给当前用户的通知
              if (newNotification.toUserEmail === userEmail) {
                console.log('🔔 收到新通知:', newNotification);

                // 添加到通知列表
                setNotifications(prev => [newNotification, ...prev]);

                // 显示toast提示
                toast.success(`新通知：${newNotification.title}`, {
                  description: newNotification.message,
                  action: {
                    label: '查看',
                    onClick: () => {
                      window.location.href = newNotification.actionUrl || '/tasks';
                    }
                  }
                });
              }
            } else if (data.type === 'connected') {
              console.log('✅ 通知流已建立:', data.message);
              setIsConnected(true);
            } else if (data.type === 'heartbeat') {
              console.log('💓 收到心跳包');
              // 心跳包，但确认连接状态
              setIsConnected(true);
            }
          } catch (error) {
            console.error('❌ 解析SSE消息失败:', error, 'Raw data:', event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ SSE连接错误:', error);
          console.log('📊 EventSource readyState:', eventSource?.readyState);

          setIsConnected(false);

          // 如果连接已关闭，尝试重连
          if (eventSource?.readyState === EventSource.CLOSED) {
            reconnectAttempts++;

            if (reconnectAttempts < maxReconnectAttempts) {
              console.log(`🔄 ${reconnectDelay}ms后尝试重新连接SSE...`);
              setTimeout(() => {
                if (eventSourceRef.current) {
                  eventSourceRef.current.close();
                }
                connectSSE();
              }, reconnectDelay);
            } else {
              console.error('❌ 已达到最大重连次数，停止重连');
              setError('连接失败，请刷新页面重试');
            }
          }
        };

      } catch (error) {
        console.error('❌ 创建EventSource失败:', error);
        setError('无法建立连接');
        setIsConnected(false);
      }
    };

    // 开始连接
    connectSSE();

    // 清理函数
    return () => {
      console.log('🔌 关闭SSE连接');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userEmail]);

  // 初始化时加载通知
  useEffect(() => {
    if (userEmail) {
      loadNotifications();
    }
  }, [userEmail, loadNotifications]);

  // 过滤通知
  const getFilteredNotifications = useCallback((filter: NotificationFilter = {}) => {
    let filtered = [...notifications];

    if (filter.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    if (filter.read !== undefined) {
      filtered = filtered.filter(n => n.read === filter.read);
    }

    if (filter.offset) {
      filtered = filtered.slice(filter.offset);
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }, [notifications]);

  // 获取通知统计
  const getStats = useCallback((): NotificationStats => {
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        project_assignment: 0,
        task_update: 0,
        project_removed: 0,
      }
    };

    notifications.forEach(notification => {
      if (stats.byType[notification.type as keyof typeof stats.byType] !== undefined) {
        stats.byType[notification.type as keyof typeof stats.byType]++;
      }
    });

    return stats;
  }, [notifications]);

  // 获取未读通知数量
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    isConnected,
    stats: getStats(),
    unreadCount: getUnreadCount(),

    // 操作方法
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getFilteredNotifications,
    reload: () => loadNotifications(),
  };
}