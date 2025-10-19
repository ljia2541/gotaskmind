// 团队成员类型定义
export type TeamMember = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: 'admin' | 'member' | 'viewer'; // 团队角色
  status?: 'active' | 'invited' | 'inactive'; // 成员状态
  joinedAt?: string; // 加入时间
};

// 团队项目成员关系
export type ProjectMember = {
  projectId: string;
  memberId: string;
  role: 'admin' | 'editor' | 'viewer'; // 在项目中的角色
  assignedTasksCount?: number; // 已分配任务数量
  completedTasksCount?: number; // 已完成任务数量
};

// 任务分配类型
export type TaskAssignment = {
  taskId: string;
  memberId: string;
  assignedAt: string;
  completedAt?: string; // 完成时间
};

// 团队角色标签配置
export const roleLabels = {
  admin: { label: '管理员', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  member: { label: '成员', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  viewer: { label: '查看者', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
};

// 项目角色标签配置
export const projectRoleLabels = {
  admin: { label: '项目管理员', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  editor: { label: '编辑者', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  viewer: { label: '查看者', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
};

// 成员状态标签配置
export const memberStatusLabels = {
  active: { label: '活跃', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  invited: { label: '已邀请', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  inactive: { label: '非活跃', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
};