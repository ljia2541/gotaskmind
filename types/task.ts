// 任务状态类型
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

// 任务分类类型
export type TaskCategory = 'work' | 'personal' | 'learning' | 'other';

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high';

// 任务能量级别类型
export type TaskEnergyLevel = 'high' | 'medium' | 'low';

// 任务时间安排相关类型
export type TimeSlot = {
  id: string;
  taskId: string;
  startTime: string; // ISO 8601 格式
  endTime: string;   // ISO 8601 格式
  date: string;      // YYYY-MM-DD 格式
  isScheduled: boolean;
  isCompleted: boolean;
  notes?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'appointment' | 'personal' | 'work' | 'other';
  isBlocking: boolean; // 是否阻止安排任务
  description?: string;
};

export type WorkPreferences = {
  workDays: number[]; // 0-6 (周日到周六)
  workHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  breakTimes: Array<{
    start: string;
    end: string;
  }>;
  peakEnergyHours: Array<{
    start: string;
    end: string;
  }>;
  minTaskDuration: number; // 最小任务时长（分钟）
  maxTasksPerDay: number;
  preferredTaskTimes: {
    [key in TaskEnergyLevel]: Array<{
      start: string;
      end: string;
    }>;
  };
};

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
  // 新增字段
  estimatedHours?: number; // 预估完成时间（小时）
  dependencies?: string[]; // 任务依赖关系（依赖的任务ID列表）
  energyLevel?: TaskEnergyLevel; // 任务所需能量级别
  // 智能时间安排字段
  scheduledSlots?: TimeSlot[]; // 已安排的时间段
  isTimeScheduled?: boolean;   // 是否已安排时间
  preferredDate?: string;      // 偏好执行日期 (YYYY-MM-DD)
  timeConstraints?: {
    earliestStartTime?: string; // 最早开始时间
    latestEndTime?: string;     // 最晚结束时间
    flexibleDates?: boolean;    // 是否允许调整日期
  };
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

// 能量级别标签配置
export const energyLevelLabels = {
  high: {
    label: 'High Energy',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    icon: '⚡'
  },
  medium: {
    label: 'Medium Energy',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
    icon: '🔋'
  },
  low: {
    label: 'Low Energy',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    icon: '🌙'
  },
};