// 项目类型定义
export type Project = {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  color?: string; // 项目颜色标识
  keywords?: string[]; // 自动提取的关键词
};

// 项目状态标签配置
export const projectStatusLabels = {
  planning: { label: 'Planning', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
};