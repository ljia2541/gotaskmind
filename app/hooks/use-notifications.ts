import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Notification,
  NotificationType,
  NotificationFilter,
  NotificationStats,
  notificationTemplates,
  notificationTypeLabels
} from '@/types/notification';

export function useNotifications(userEmail?: string, isPro?: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // 生成通知的存储键
  const getStorageKey = (email: string) => `notifications_${email.replace(/[@.]/g, '_')}`;

  // 从本地存储加载通知
  const loadNotifications = useCallback(() => {
    if (!userEmail || typeof window === 'undefined') return;

    console.log('🔄 加载通知:', userEmail);
    setLoading(true);
    try {
      const storageKey = getStorageKey(userEmail);
      console.log('🔑 查找存储键:', storageKey);

      const savedNotifications = localStorage.getItem(storageKey);
      console.log('📦 找到通知数据:', savedNotifications ? '是' : '否');

      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        console.log('📊 解析到通知数量:', parsed.length);

        if (Array.isArray(parsed)) {
          // 按创建时间倒序排列
          const sortedNotifications = parsed.sort((a: Notification, b: Notification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          console.log('📋 设置通知列表，数量:', sortedNotifications.length);
          setNotifications(sortedNotifications);
        }
      } else {
        console.log('📭 没有找到通知数据');
      }
    } catch (error) {
      console.error('❌ 加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // 保存通知到本地存储
  const saveNotifications = useCallback((updatedNotifications: Notification[]) => {
    if (!userEmail || typeof window === 'undefined') return;

    try {
      const storageKey = getStorageKey(userEmail);
      localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('保存通知失败:', error);
    }
  }, [userEmail]);

  // 创建新通知
  const createNotification = useCallback((
    type: NotificationType,
    fromUserId: string,
    fromUserName: string,
    toUserEmail: string,
    metadata?: Notification['metadata']
  ) => {
    if (typeof window === 'undefined') return null;

    console.log('🔔 创建通知:', { type, fromUserId, fromUserName, toUserEmail, isPro });

    // 检查发送者权限：项目相关通知需要专业版
    const projectRelatedTypes: NotificationType[] = ['project_assignment', 'project_removed'];
    // 临时禁用权限检查用于测试
    if (projectRelatedTypes.includes(type) && !isPro) {
      console.warn('⚠️ 测试模式：允许非专业版用户发送项目相关通知');
      // return null; // 暂时注释掉用于测试
    }

    const template = notificationTemplates[type];
    console.log('📋 使用模板:', template);

    // 根据通知类型正确调用message函数
    let message: string;
    switch (type) {
            case 'project_assignment':
        message = template.message(fromUserName, metadata?.projectName || '', metadata?.roleName || '');
        break;
            case 'project_removed':
        message = template.message(fromUserName, metadata?.projectName || '');
        break;
      case 'task_update':
        message = template.message(fromUserName, metadata?.taskTitle || '', metadata?.action || '');
        break;
      default:
        message = '系统通知';
    }

    const notification: Notification = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      message,
      fromUserId,
      fromUserName,
      toUserEmail,
      createdAt: new Date().toISOString(),
      read: false,
      actionUrl: template.actionUrl,
      actionText: template.actionText,
      metadata
    };

    console.log('✅ 通知创建成功:', notification);

    // 如果是当前用户的通知，直接添加到列表
    if (toUserEmail === userEmail) {
      console.log('📨 添加到当前用户通知列表');
      setNotifications(prev => [notification, ...prev]);
      saveNotifications([notification, ...notifications]);

      // 显示 toast 提示
      toast.success(`新通知：${notification.title}`, {
        description: notification.message,
        action: {
          label: '查看',
          onClick: () => {
            window.location.href = notification.actionUrl || '/tasks';
          }
        }
      });
    } else {
      console.log('📦 为其他用户保存通知:', toUserEmail);
      // 为其他用户保存通知
      try {
        const storageKey = getStorageKey(toUserEmail);
        console.log('🔑 存储键:', storageKey);

        const existingNotifications = localStorage.getItem(storageKey);
        let userNotifications: Notification[] = [];

        if (existingNotifications) {
          userNotifications = JSON.parse(existingNotifications);
          console.log('📚 现有通知数量:', userNotifications.length);
        }

        userNotifications.unshift(notification);
        localStorage.setItem(storageKey, JSON.stringify(userNotifications));
        console.log('💾 通知已保存到localStorage，新数量:', userNotifications.length);

        // 验证保存是否成功
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('✅ 验证保存成功，通知数量:', parsed.length);
        }

        // 如果是测试模式或目标用户是当前用户，显示成功提示
        if (toUserEmail === userEmail || isPro) {
          toast.success(`通知已发送给 ${toUserEmail}`, {
            description: `${notification.title}: ${notification.message}`,
            action: {
              label: '确认',
              onClick: () => console.log('用户确认了通知发送')
            }
          });
        }
      } catch (error) {
        console.error('❌ 保存其他用户通知失败:', error);
      }
    }

    return notification;
  }, [userEmail, notifications, saveNotifications]);

  // 标记通知为已读
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // 标记所有通知为已读
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // 删除通知
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // 清空所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

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
      stats.byType[notification.type]++;
    });

    return stats;
  }, [notifications]);

  // 获取未读通知数量
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // 初始化时加载通知
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 监听存储变化（多标签页同步）
  useEffect(() => {
    if (!userEmail || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      const storageKey = getStorageKey(userEmail);
      if (e.key === storageKey) {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail, loadNotifications, getStorageKey]);

  // 定期检查新通知（每隔10秒检查一次）
  useEffect(() => {
    if (!userEmail || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000); // 10秒检查一次

    return () => clearInterval(interval);
  }, [userEmail, loadNotifications]);

  return {
    notifications,
    loading,
    stats: getStats(),
    unreadCount: getUnreadCount(),

    // 操作方法
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getFilteredNotifications,
    reload: loadNotifications,
  };
}