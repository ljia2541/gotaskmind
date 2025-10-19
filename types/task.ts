// 任务状态类型
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

// 任务分类类型
export type TaskCategory = 'work' | 'personal' | 'learning' | 'other';

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high';

// 任务类型定义
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  projectId?: string;
  assigneeId?: string;
  assignedAt?: string;
  comments?: TaskComment[];
}

// 任务评论类型定义
export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
  content: string;
  createdAt: string;
}

// 任务评论类型
export type TaskComment = {
  id: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
  content: string;
  createdAt: string;
  attachments?: CommentAttachment[];
};

// 评论附件类型
export type CommentAttachment = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
};


// 分类标签配置
export const categoryLabels = {
  work: { label: 'Work', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  personal: { label: 'Personal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  learning: { label: 'Learning', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
};

// 优先级标签配置
export const priorityLabels = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  high: { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
};

// 状态标签配置
export const statusLabels = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
};