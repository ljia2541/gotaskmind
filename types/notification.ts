export type NotificationType = 'project_assignment' | 'task_update' | 'project_removed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  fromUserId: string;
  fromUserName: string;
  toUserEmail: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    roleName?: string;
    [key: string]: any;
  };
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export const notificationTypeLabels = {
  project_assignment: {
    label: '项目分配',
    icon: 'FolderOpen',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  },
  task_update: {
    label: '任务更新',
    icon: 'CheckSquare',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  },
  project_removed: {
    label: '项目移除',
    icon: 'UserX',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  },
} as const;

export const notificationTemplates = {
  project_assignment: {
    title: '项目分配',
    message: (fromUserName: string, projectName: string, role: string) =>
      `${fromUserName} 将您添加到项目 "${projectName}"，角色：${role}`,
    actionText: '查看项目',
    actionUrl: '/tasks',
  },
  task_update: {
    title: '任务更新',
    message: (fromUserName: string, taskTitle: string, action: string) =>
      `${fromUserName} ${action}了任务：${taskTitle}`,
    actionText: '查看任务',
    actionUrl: '/tasks',
  },
  project_removed: {
    title: '项目移除',
    message: (fromUserName: string, projectName: string) =>
      `${fromUserName} 将您从项目 "${projectName}" 中移除`,
    actionText: '查看详情',
    actionUrl: '/tasks',
  },
} as const;