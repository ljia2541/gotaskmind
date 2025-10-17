// 任务类型定义
export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  category: 'work' | 'personal' | 'learning' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
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