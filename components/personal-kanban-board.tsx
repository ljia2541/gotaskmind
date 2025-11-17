"use client"

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DroppableContainer,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types/task';
import { Project, projectStatusLabels } from '@/types/project';
import { categoryLabels, priorityLabels, statusLabels, energyLevelLabels } from '@/types/task';
import { Clock, Zap, Battery, Moon, MoreHorizontal, Edit, Eye, ChevronDown, ChevronRight, Folder, Calendar, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// 看板列定义 - 基于项目状态
const KANBAN_COLUMNS = [
  { id: 'planning', title: '规划中', statusFilter: 'planning' },
  { id: 'active', title: '活跃项目', statusFilter: 'active' },
  { id: 'completed', title: '已完成', statusFilter: 'completed' },
  { id: 'on-hold', title: '暂停', statusFilter: 'on-hold' }
] as const;

// 创建一个默认的"个人任务"项目
const DEFAULT_PERSONAL_PROJECT: Project = {
  id: 'personal-tasks',
  title: '个人任务',
  description: '未分配到具体项目的个人任务',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  color: '#6b7280'
};

// 拖拽排序的任务卡片组件
interface SortableTaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

function SortableTaskCard({ task, isOverlay, onEdit, onView }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getEnergyIcon = (level?: Task['energyLevel']) => {
    switch (level) {
      case 'high':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Battery className="w-4 h-4 text-teal-500" />;
      case 'low':
        return <Moon className="w-4 h-4 text-cyan-500" />;
      default:
        return <Battery className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-amber-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const cardContent = (
    <Card className={`p-4 mb-3 cursor-move hover:shadow-md transition-all border-l-4 ${getPriorityColor(task.priority)} ${
      isOverlay ? 'rotate-2 shadow-lg' : ''
    }`}>
      {/* 任务标题 */}
      <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">
        {task.title}
      </h3>

      {/* 任务描述 */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* 标签区域 */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge className={categoryLabels[task.category]?.color || "bg-muted"} variant="secondary">
          {categoryLabels[task.category]?.label || task.category}
        </Badge>

        {task.priority !== 'medium' && (
          <Badge className={priorityLabels[task.priority]?.color || "bg-muted"} variant="outline">
            {priorityLabels[task.priority]?.label || task.priority}
          </Badge>
        )}
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {/* 左侧：时间和能量 */}
        <div className="flex items-center gap-2">
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
          {getEnergyIcon(task.energyLevel)}
        </div>

        {/* 右侧：操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(task); }}>
              <Eye className="h-3 w-3 mr-2" />
              详情
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
              <Edit className="h-3 w-3 mr-2" />
              编辑
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 截止日期提示 */}
      {task.dueDate && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            截止: {new Date(task.dueDate).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      )}
    </Card>
  );

  if (isOverlay) {
    return (
      <div className="rotate-2 transform">
        {cardContent}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  );
}


// 简化的任务卡片组件
interface CompactTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  showProject?: boolean;
  projects?: Project[];
}

function CompactTaskCard({ task, onEdit, onView, onStatusChange, showProject = false, projects = [] }: CompactTaskCardProps) {
  const getEnergyIcon = (level?: Task['energyLevel']) => {
    switch (level) {
      case 'high':
        return <Zap className="w-3 h-3 text-orange-500" />;
      case 'medium':
        return <Battery className="w-3 h-3 text-teal-500" />;
      case 'low':
        return <Moon className="w-3 h-3 text-cyan-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-amber-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const project = projects.find(p => p.id === task.projectId);

  return (
    <Card className={`p-3 mb-2 hover:shadow-sm transition-all border-l-4 ${getPriorityColor(task.priority)} cursor-move`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showProject && project && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || '#6b7280' }}
                />
                <span className="text-xs text-muted-foreground truncate">{project.title}</span>
              </div>
            )}
            <h4 className="font-medium text-sm truncate">{task.title}</h4>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge className={categoryLabels[task.category]?.color || "bg-muted"} variant="secondary" className="text-xs">
              {categoryLabels[task.category]?.label || task.category}
            </Badge>
            {task.priority !== 'medium' && (
              <Badge className={priorityLabels[task.priority]?.color || "bg-muted"} variant="outline" className="text-xs">
                {priorityLabels[task.priority]?.label || task.priority}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {task.estimatedHours && (
                <span>{task.estimatedHours}h</span>
              )}
              {getEnergyIcon(task.energyLevel)}
              {task.dueDate && (
                <span>{new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value as Task['status'])}
          >
            <SelectTrigger className="h-6 w-[80px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(task); }}>
                <Eye className="h-3 w-3 mr-2" />
                详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                <Edit className="h-3 w-3 mr-2" />
                编辑
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}


// 项目列表项组件
interface ProjectListItemProps {
  project: Project;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

function ProjectListItem({ project, tasks, isExpanded, onToggle, onEditTask, onViewTask, onStatusChange }: ProjectListItemProps) {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 检查项目是否已完成（所有任务都完成）
  const isProjectFullyCompleted = totalTasks > 0 && completedTasks === totalTasks;
  const displayColor = isProjectFullyCompleted ? '#10b981' : (project.color || '#6b7280');

  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length;
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue >= 0;
  }).length;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden mb-3 bg-background">
      {/* 项目头部 - 列表形式 */}
      <div
        className="p-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="relative">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: displayColor }}
                />
                {isProjectFullyCompleted && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-background" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground truncate">{project.title}</h3>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-medium">{completedTasks}/{totalTasks}</div>
              <div className="text-xs text-muted-foreground">已完成</div>
            </div>

            {/* 快速统计 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {highPriorityTasks > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full" title={`高优先级: ${highPriorityTasks}`} />
              )}
              {dueSoonTasks > 0 && (
                <Calendar className="w-3 h-3" title={`即将到期: ${dueSoonTasks}`} />
              )}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        {totalTasks > 0 && (
          <div className="mt-2">
            <Progress value={progressPercentage} className="h-1" />
          </div>
        )}
      </div>

      {/* 任务列表 - 仅在展开时显示 */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20">
          {tasks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              暂无任务
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {tasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onView={onViewTask}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 任务列表项组件 - 简洁的列表形式
interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

function TaskListItem({ task, onEdit, onView, onStatusChange }: TaskListItemProps) {
  const getEnergyIcon = (level?: Task['energyLevel']) => {
    switch (level) {
      case 'high':
        return <Zap className="w-3 h-3 text-orange-500" />;
      case 'medium':
        return <Battery className="w-3 h-3 text-teal-500" />;
      case 'low':
        return <Moon className="w-3 h-3 text-cyan-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-amber-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div className={`p-3 hover:bg-muted/30 transition-colors border-l-2 ${getPriorityColor(task.priority)} ${
      isCompleted ? 'opacity-60' : ''
    }`}>
      {/* 顶部：标题和状态操作 */}
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-sm font-medium truncate flex-1 mr-2 ${isCompleted ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select
            value={task.status}
            onValueChange={(value) => onStatusChange(task.id, value as Task['status'])}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(task); }}>
                <Eye className="h-3 w-3 mr-2" />
                详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                <Edit className="h-3 w-3 mr-2" />
                编辑
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 中部：关键词标签区域 */}
      <div className="flex items-center gap-1.5 mb-2">
        <Badge className={`${categoryLabels[task.category]?.color || "bg-muted"} text-xs px-2 py-0.5`} variant="secondary">
          {categoryLabels[task.category]?.label || task.category}
        </Badge>
        {task.priority !== 'medium' && (
          <Badge className={`${priorityLabels[task.priority]?.color || "bg-muted"} text-xs px-2 py-0.5`} variant="outline">
            {priorityLabels[task.priority]?.label || task.priority}
          </Badge>
        )}
        {task.energyLevel && (
          <div className="flex items-center gap-1 text-xs">
            {getEnergyIcon(task.energyLevel)}
            <span className="text-muted-foreground">
              {task.energyLevel === 'high' ? '高' :
               task.energyLevel === 'medium' ? '中' : '低'}
            </span>
          </div>
        )}
      </div>

      {/* 底部：基础信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.estimatedHours && (
            <span className="font-medium">{task.estimatedHours}h</span>
          )}
          {task.dueDate && (
            <span>{new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
          )}
        </div>
        {task.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px] line-clamp-1">
            {task.description}
          </span>
        )}
      </div>
    </div>
  );
}

// 看板列组件
interface KanbanColumnProps {
  id: string;
  title: string;
  projects: (Project & { tasks: Task[] })[];
  expandedProjects: Set<string>;
  onToggleProject: (projectId: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

function KanbanColumn({ id, title, projects, expandedProjects, onToggleProject, onEditTask, onViewTask, onStatusChange }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-foreground flex items-center justify-between">
          <span>{title}</span>
          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
            {projects.length}
          </span>
        </h3>
      </div>

      <div className="min-h-[200px] bg-muted/10 rounded-lg border border-border/50 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            暂无项目
          </div>
        ) : (
          <div className="p-3 space-y-0 max-h-[600px] overflow-y-auto">
            {projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                tasks={project.tasks}
                isExpanded={expandedProjects.has(project.id)}
                onToggle={() => onToggleProject(project.id)}
                onEditTask={onEditTask}
                onViewTask={onViewTask}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 主要的看板组件
interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

export function PersonalKanbanBoard({
  tasks,
  projects = [],
  onEditTask,
  onViewTask,
  onStatusChange
}: KanbanBoardProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 将任务按项目分组
  const tasksByProject = useMemo(() => {
    const projectMap = new Map<string, Task[]>();

    // 添加默认个人任务项目
    projectMap.set(DEFAULT_PERSONAL_PROJECT.id, []);

    // 初始化所有项目
    projects.forEach(project => {
      projectMap.set(project.id, []);
    });

    // 将任务分配到对应项目
    tasks.forEach(task => {
      const projectId = task.projectId || DEFAULT_PERSONAL_PROJECT.id;
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, []);
      }
      projectMap.get(projectId)?.push(task);
    });

    return projectMap;
  }, [tasks, projects]);

  // 检查项目是否所有任务都已完成
  const isProjectCompleted = (projectTasks: Task[]) => {
    if (projectTasks.length === 0) return false;
    return projectTasks.every(task => task.status === 'completed');
  };

  // 按项目状态分组项目
  const columnsData = useMemo(() => {
    const columns = KANBAN_COLUMNS.map(column => ({
      ...column,
      projects: [] as (Project & { tasks: Task[] })[]
    }));

    // 添加个人任务项目到活跃项目列
    const personalTasksForProject = tasksByProject.get(DEFAULT_PERSONAL_PROJECT.id) || [];
    if (personalTasksForProject.length > 0) {
      const activeColumn = columns.find(col => col.id === 'active');
      if (activeColumn) {
        activeColumn.projects.push({
          ...DEFAULT_PERSONAL_PROJECT,
          tasks: personalTasksForProject
        });
      }
    }

    // 添加测试数据 - 已完成项目
    const testCompletedProject: Project & { tasks: Task[] } = {
      id: 'test-completed-project',
      title: 'GoTaskMind 项目开发',
      description: '完成GoTaskMind平台的开发和部署',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      deadline: '2024-01-10T00:00:00.000Z',
      color: '#10b981',
      tasks: [
        {
          id: 'completed-task-1',
          title: '前端界面开发',
          description: '完成用户界面和交互功能',
          status: 'completed',
          category: 'work',
          priority: 'high',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-05T00:00:00.000Z',
          completedAt: '2024-01-05T00:00:00.000Z',
          projectId: 'test-completed-project',
          estimatedHours: 20,
          energyLevel: 'high',
          comments: []
        }
      ]
    };

    // 将测试项目分配到对应状态列
    const testColumn = columns.find(col => col.statusFilter === testCompletedProject.status);
    if (testColumn) {
      testColumn.projects.push(testCompletedProject);
    }

    // 将其他项目分配到对应状态列
    projects.forEach(project => {
      const projectTasks = tasksByProject.get(project.id) || [];

      // 自动检测项目完成状态
      let projectStatus = project.status;
      if (isProjectCompleted(projectTasks) && project.status !== 'completed') {
        projectStatus = 'completed'; // 自动标记为已完成
      }

      const column = columns.find(col => col.statusFilter === projectStatus);
      if (column) {
        column.projects.push({
          ...project,
          status: projectStatus, // 使用可能已更新的状态
          tasks: projectTasks
        });
      } else {
        // 如果找不到对应状态列，默认放到活跃项目列
        const activeColumn = columns.find(col => col.id === 'active');
        if (activeColumn) {
          activeColumn.projects.push({
            ...project,
            status: projectStatus,
            tasks: projectTasks
          });
        }
      }
    });

    return columns;
  }, [projects, tasksByProject]);

  // 计算总体进度
  const overallProgress = useMemo(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [tasks]);

  // 切换项目展开状态
  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // 处理查看任务详情
  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 整体进度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">项目看板</h3>
          <span className="text-sm text-muted-foreground">{overallProgress}% 完成</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{tasks.filter(t => t.status === 'completed').length} 已完成任务</span>
          <span>{tasks.length} 总任务数</span>
        </div>
      </div>

      {/* 项目看板区域 - 按项目状态组织 */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-4 h-full">
          {columnsData.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              projects={column.projects}
              expandedProjects={expandedProjects}
              onToggleProject={toggleProjectExpanded}
              onEditTask={onEditTask}
              onViewTask={handleViewTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>

      {/* 任务详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">描述</h3>
                <p className="text-sm">{selectedTask.description || '无描述'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">状态</h3>
                  <Badge variant="secondary">
                    {statusLabels[selectedTask.status]?.label || selectedTask.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">分类</h3>
                  <Badge variant="outline">
                    {categoryLabels[selectedTask.category]?.label || selectedTask.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">优先级</h3>
                  <Badge
                    variant={selectedTask.priority === 'high' ? 'destructive' : selectedTask.priority === 'medium' ? 'default' : 'secondary'}
                    className={
                      selectedTask.priority === 'high' ? 'bg-red-500' :
                      selectedTask.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }
                  >
                    {priorityLabels[selectedTask.priority]?.label || selectedTask.priority}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">截止日期</h3>
                  <p>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('zh-CN') : '无'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">预估时间</h3>
                  <p>{selectedTask.estimatedHours ? `${selectedTask.estimatedHours} 小时` : '未设置'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">能量级别</h3>
                  <div className="flex items-center gap-1">
                    <span>
                      {selectedTask.energyLevel === 'high' ? '⚡ 高能量' :
                       selectedTask.energyLevel === 'medium' ? '🔋 中等能量' :
                       selectedTask.energyLevel === 'low' ? '🌙 低能量' : '未设置'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">创建时间</h3>
                <p className="text-sm">{new Date(selectedTask.createdAt).toLocaleDateString('zh-CN')}</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  关闭
                </Button>
                <Button onClick={() => {
                  setIsDetailDialogOpen(false);
                  onEditTask(selectedTask);
                }}>
                  编辑
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}