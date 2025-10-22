"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Menu, PlusCircle, MoreHorizontal, CheckSquare, PlusSquare, Home, Users, BarChart2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/logo';
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';
import { toast } from 'sonner';

// 导入任务和项目相关类型和配置
import { Task, categoryLabels, priorityLabels, statusLabels } from '@/types/task';
import { Project, projectStatusLabels } from '@/types/project';
import { TeamMember } from '@/types/team';
import { useAuth } from '@/app/hooks/use-auth';

export default function TaskManagementPage() {
  // 认证状态
  const { user, isAuthenticated } = useAuth();
  
  // 使用固定语言避免hydration问题
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端进行语言检测
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取对应的翻译文本
  const translations = isClient ? analyticsTranslations[LanguageService.getUserLanguage() || 'zh'] || analyticsTranslations['zh'] : analyticsTranslations['zh'];
  
  // 状态管理 - 基础状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 项目相关状态
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [showTasks, setShowTasks] = useState(false);
  
  // 任务相关状态
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    category: 'work' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    projectId: '' as string | undefined,
    assigneeId: '' as string | undefined,
  });
  
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as Project['status'],
    deadline: '',
    color: '#64748b',
  });

  // 获取默认项目数据
  function getDefaultProjects(): Project[] {
    // 使用固定日期避免hydration问题
    const baseDate = new Date('2024-01-01T00:00:00.000Z');
    return [
      {
        id: 'project-1',
        title: '个人任务',
        description: '管理个人日常任务',
        status: 'active',
        deadline: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: baseDate.toISOString(),
        color: '#3b82f6',
      },
      {
        id: 'project-2',
        title: '工作项目',
        description: '公司相关任务和项目',
        status: 'active',
        deadline: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: baseDate.toISOString(),
        color: '#10b981',
      },
    ];
  }

  // 获取默认团队成员数据
  function getDefaultTeamMembers(): TeamMember[] {
    return [
      {
        id: 'user-1',
        name: '张三',
        avatar: '/placeholder-user.jpg',
        role: '成员',
        status: 'active',
      },
      {
        id: 'user-2',
        name: '李四',
        avatar: '/placeholder-user.jpg',
        role: '管理员',
        status: 'active',
      },
    ];
  }

  // 获取默认任务数据
  function getDefaultTasks(): Task[] {
    // 使用固定日期避免hydration问题
    const baseDate = new Date('2024-01-01T00:00:00.000Z');
    const tomorrow = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'task-1',
        title: '完成项目提案',
        description: '准备下周的项目提案文档',
        status: 'todo',
        category: 'work',
        priority: 'high',
        dueDate: tomorrow.toISOString(),
        createdAt: baseDate.toISOString(),
        projectId: 'project-2',
        assigneeId: 'user-1',
        comments: [],
      },
      {
        id: 'task-2',
        title: '健身锻炼',
        description: '去健身房进行1小时有氧运动',
        status: 'in-progress',
        category: 'personal',
        priority: 'medium',
        dueDate: baseDate.toISOString(),
        createdAt: baseDate.toISOString(),
        projectId: 'project-1',
        assigneeId: undefined,
        comments: [],
      },
      {
        id: 'task-3',
        title: '学习React',
        description: '完成React官方文档的基础教程',
        status: 'todo',
        category: 'learning',
        priority: 'medium',
        dueDate: nextWeek.toISOString(),
        createdAt: baseDate.toISOString(),
        projectId: 'project-1',
        assigneeId: undefined,
        comments: [],
      },
    ];
  }

  // 统一的数据初始化 - 包括项目、团队成员和任务
  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window !== 'undefined' && !isInitialized) {
      // 获取URL参数
      const urlParams = new URLSearchParams(window.location.search);
      const projectIdFromUrl = urlParams.get('projectId');

      // 1. 加载项目数据 - 优先使用本地存储的数据
      let finalProjects: Project[] = [];
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            finalProjects = parsedProjects;
          } else {
            finalProjects = getDefaultProjects();
          }
        } catch {
          finalProjects = getDefaultProjects();
        }
      } else {
        finalProjects = getDefaultProjects();
      }
      setProjects(finalProjects);

      // 2. 加载团队成员数据 - 优先使用本地存储的数据
      let finalTeamMembers: TeamMember[] = [];
      const savedTeamMembers = localStorage.getItem('teamMembers');
      if (savedTeamMembers) {
        try {
          const parsedTeamMembers = JSON.parse(savedTeamMembers);
          if (Array.isArray(parsedTeamMembers) && parsedTeamMembers.length > 0) {
            finalTeamMembers = parsedTeamMembers;
          } else {
            finalTeamMembers = getDefaultTeamMembers();
          }
        } catch {
          finalTeamMembers = getDefaultTeamMembers();
        }
      } else {
        finalTeamMembers = getDefaultTeamMembers();
      }
      setTeamMembers(finalTeamMembers);

      // 3. 加载任务数据 - 优先使用本地存储的数据
      let finalTasks: Task[] = [];
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            finalTasks = parsedTasks;
          } else {
            finalTasks = getDefaultTasks();
          }
        } catch {
          finalTasks = getDefaultTasks();
        }
      } else {
        finalTasks = getDefaultTasks();
      }
      setTasks(finalTasks);

      // 4. 处理URL参数 - 项目筛选
      if (projectIdFromUrl) {
        setSelectedProjectId(projectIdFromUrl);
        // 检查项目是否存在，如果存在则设置表单的projectId
        const projectExists = finalProjects.some(p => p.id === projectIdFromUrl);
        if (projectExists) {
          setFormData(prev => ({ ...prev, projectId: projectIdFromUrl }));
        }
      }

      // 保存到本地存储
      localStorage.setItem('projects', JSON.stringify(finalProjects));
      localStorage.setItem('teamMembers', JSON.stringify(finalTeamMembers));
      localStorage.setItem('tasks', JSON.stringify(finalTasks));

      // 设置初始化完成标志
      setIsInitialized(true);
      setShowTasks(true);
    }
  }, [isInitialized]);

  // 处理搜索和过滤任务
  const filteredTasks = tasks.filter(task => {
    // 项目筛选
    const projectMatch = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    
    // 状态筛选
    const statusMatch = activeTab === 'all' || task.status === activeTab;
    
    // 搜索筛选
    const searchMatch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return projectMatch && statusMatch && searchMatch;
  });

  // 处理任务排序
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else { // dueDate
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  // 处理任务状态变更
  function handleStatusChange(taskId: string, newStatus: Task['status']) {
    // 创建更新后的任务列表
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return task;
    });

    // 更新状态
    setTasks(updatedTasks);
    
    // 尝试保存到localStorage
    try {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      // 静默错误处理
    }
  }

  // 格式化日期显示函数
  function formatDate(dateString: string) {
    if (!dateString) return '无效日期';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 打开添加任务对话框
  const handleOpenAddDialog = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      category: 'work',
      priority: 'medium',
      dueDate: '',
      projectId: selectedProjectId === 'all' ? undefined : selectedProjectId,
      assigneeId: undefined,
    });
    setIsAddDialogOpen(true);
  };

  // 打开编辑任务对话框
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate || '',
      projectId: task.projectId,
      assigneeId: task.assigneeId,
    });
    setIsAddDialogOpen(true);
  };

  // 处理表单提交 - 添加或编辑任务
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    let updatedTasks;
    
    if (editingTask) {
      // 编辑现有任务
      updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              ...formData,
              updatedAt: now,
            }
          : task
      );
    } else {
      // 添加新任务
      const newTask: Task = {
        id: `task-${now}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        createdAt: now,
        comments: [],
      };
      updatedTasks = [...tasks, newTask];
    }
    
    // 更新状态和本地存储
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // 关闭对话框
    setIsAddDialogOpen(false);
  };

  // 打开任务详情
  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // 处理添加项目
  const handleOpenAddProjectDialog = () => {
    setEditingProject(null);
    setProjectFormData({
      title: '',
      description: '',
      status: 'planning',
      deadline: '',
      color: '#64748b',
    });
    setIsAddProjectDialogOpen(true);
  };

  // 处理项目表单提交
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    let updatedProjects;
    
    if (editingProject) {
      // 编辑现有项目
      updatedProjects = projects.map(project =>
        project.id === editingProject.id
          ? {
              ...project,
              ...projectFormData,
              updatedAt: now,
            }
          : project
      );
    } else {
      // 添加新项目
      const newProject: Project = {
        id: `project-${now}-${Math.random().toString(36).substr(2, 9)}`,
        ...projectFormData,
        createdAt: now,
      };
      updatedProjects = [...projects, newProject];
    }
    
    // 更新状态和本地存储
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // 关闭对话框
    setIsAddProjectDialogOpen(false);
  };
  
  // 处理项目删除
  const handleDeleteProject = async (projectId: string) => {
    console.log('开始删除项目:', projectId);
    setIsDeleting(true);

    try {
      // 1. 计算要删除的数据
      const projectToDelete = projects.find(p => p.id === projectId);
      const associatedTasks = tasks.filter(task => task.projectId === projectId);

      console.log('删除项目:', projectToDelete?.title);
      console.log('关联任务数量:', associatedTasks.length);

      // 2. 更新项目列表（过滤掉要删除的项目）
      const updatedProjects = projects.filter(project => project.id !== projectId);

      // 3. 更新任务列表（移除关联任务或重置它们的projectId）
      const updatedTasks = tasks.filter(task => task.projectId !== projectId);

      // 4. 更新本地存储
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('本地存储已更新');

      // 5. 更新React状态
      setProjects(updatedProjects);
      setTasks(updatedTasks);

      // 6. 如果删除的是当前选中的项目，重置为"所有任务"
      if (selectedProjectId === projectId) {
        setSelectedProjectId('all');
      }

      // 7. 关闭对话框
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);

      // 8. 显示成功提示
      toast.success(`项目"${projectToDelete?.title}"已删除，同时删除了${associatedTasks.length}个关联任务`);

      console.log('删除操作完成');

    } catch (error) {
      console.error('删除项目失败:', error);
      toast.error('删除项目失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 设置要删除的项目ID
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 打开删除确认对话框
  const handleOpenDeleteDialog = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const associatedTasks = tasks.filter(task => task.projectId === projectId);

    console.log('打开删除对话框:', {
      projectId,
      projectName: project?.title,
      associatedTasksCount: associatedTasks.length
    });

    setProjectToDelete(projectId);
    setIsDeleteDialogOpen(true);
  };
  
  // 处理项目编辑
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      status: project.status,
      deadline: project.deadline,
      color: project.color,
    });
    setIsAddProjectDialogOpen(true);
  };

  // 组件的JSX渲染部分
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 头部导航 */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          
          {/* 桌面导航 - 放在右侧 */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {translations.navigation.home}
            </Link>
            <Link href="/tasks" className="text-sm text-foreground font-medium">
              {translations.navigation.tasks}
            </Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {translations.navigation.team}
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {translations.navigation.analytics}
            </Link>
            <Button variant="outline" size="sm" className="ml-2">
              {translations.navigation.login}
            </Button>
          </nav>
          
          {/* 移动端导航触发器 */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* 移动端导航菜单 */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-card border-b border-border py-4 px-4 flex flex-col gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">{translations.navigation.home}</Link>
              <Link href="/tasks" className="font-medium text-foreground border-l-4 border-primary pl-2">{translations.navigation.tasks}</Link>
              <Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">{translations.navigation.team}</Link>
              <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">{translations.navigation.analytics}</Link>
        </nav>
      )}
      
      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {/* 页面标题和操作区 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{translations.navigation.tasks}</h1>
            <p className="text-muted-foreground">管理和跟踪您的项目与任务</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                type="text" 
                placeholder="搜索任务..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="default" onClick={handleOpenAddDialog}>
              添加任务
            </Button>
            
            <Button variant="secondary" onClick={handleOpenAddProjectDialog}>
              <PlusCircle className="w-4 h-4 mr-2" />
              添加项目
            </Button>
          </div>
        </div>
        
        {/* 项目和任务展示区 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧项目列表 */}
          <div className="md:col-span-1">
            <Card className="p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">项目列表</h2>
              <div className="flex flex-col gap-2">
                <button 
                  className={`px-3 py-2 rounded-md text-left transition-colors ${selectedProjectId === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                  onClick={() => setSelectedProjectId('all')}
                >
                  所有任务
                </button>
                {projects.map((project) => (
                  <div key={project.id} className="relative">
                    <button
                      className={`w-full px-3 py-2 rounded-md text-left transition-colors ${selectedProjectId === project.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                        <span className="truncate">{project.title}</span>
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeleteDialog(project.id)}>
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              
              {/* 排序控制 */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">排序方式</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'createdAt' | 'dueDate')}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="选择排序字段" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">创建时间</SelectItem>
                        <SelectItem value="dueDate">截止日期</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* 右侧任务列表 */}
          <div className="md:col-span-3">
            {/* 状态标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">
                  全部
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">{filteredTasks.length}</span>
                </TabsTrigger>
                <TabsTrigger value="todo">
                  待办
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">{filteredTasks.filter(task => task.status === 'todo').length}</span>
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  进行中
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">{filteredTasks.filter(task => task.status === 'in-progress').length}</span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  已完成
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">{filteredTasks.filter(task => task.status === 'completed').length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* 任务卡片列表 */}
            {showTasks && sortedTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sortedTasks.map((task) => (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryLabels[task.category]?.color || "bg-muted"}>
                          {categoryLabels[task.category]?.label || task.category}
                        </Badge>
                        <Badge className={priorityLabels[task.priority]?.color || "bg-muted"}>
                          {priorityLabels[task.priority]?.label || task.priority}
                        </Badge>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenTaskDetail(task)}>
                            详情
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-1" onClick={() => handleOpenTaskDetail(task)}>
                      {task.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {task.dueDate && `截止: ${formatDate(task.dueDate)}`}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={task.status} 
                          onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="状态" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {task.assigneeId && (
                          <div className="flex -space-x-2">
                            {teamMembers
                              .filter(member => member.id === task.assigneeId)
                              .map((member) => (
                                <img
                                  key={member.id}
                                  src={member.avatar || '/placeholder-user.jpg'}
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full border border-background"
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无任务</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedProjectId !== 'all' ? `当前项目没有${activeTab !== 'all' ? `"${statusLabels[activeTab as keyof typeof statusLabels]}"` : ''}任务` : `暂无${activeTab !== 'all' ? `"${statusLabels[activeTab as keyof typeof statusLabels]}"` : ''}任务`}
                </p>
                <Button variant="default" onClick={handleOpenAddDialog}>
                  <PlusSquare className="h-4 w-4 mr-2" />
                  添加任务
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* 添加/编辑任务对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? '编辑任务' : '添加任务'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">任务标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">任务描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Task['status'] }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Task['category'] }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">截止日期</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">项目</Label>
                <Select
                  value={formData.projectId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无项目</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeId">指派给</Label>
                <Select
                  value={formData.assigneeId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger id="assigneeId">
                    <SelectValue placeholder="选择成员" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未指派</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingTask ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 添加/编辑项目对话框 */}
      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? '编辑项目' : '添加项目'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleProjectSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">项目名称</Label>
              <Input
                id="project-title"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">项目描述</Label>
              <Textarea
                id="project-description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-status">状态</Label>
                <Select
                  value={projectFormData.status}
                  onValueChange={(value) => setProjectFormData(prev => ({ ...prev, status: value as Project['status'] }))}
                >
                  <SelectTrigger id="project-status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(projectStatusLabels).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-deadline">截止日期</Label>
                <Input
                  id="project-deadline"
                  type="date"
                  value={projectFormData.deadline}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-color">项目颜色</Label>
              <Input
                id="project-color"
                type="color"
                value={projectFormData.color}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddProjectDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingProject ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 任务详情对话框 */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
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
                    {statusLabels[selectedTask.status] || selectedTask.status}
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
                    {priorityLabels[selectedTask.priority] || selectedTask.priority}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">截止日期</h3>
                  <p>{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '无'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">项目</h3>
                  <p>
                    {selectedTask.projectId
                      ? projects.find(p => p.id === selectedTask.projectId)?.title || '未知项目'
                      : '无项目'
                    }
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">指派给</h3>
                  <p>
                    {selectedTask.assigneeId
                      ? teamMembers.find(m => m.id === selectedTask.assigneeId)?.name || '未知用户'
                      : '未指派'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">创建时间</h3>
                <p className="text-sm">{formatDate(selectedTask.createdAt)}</p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
                  关闭
                </Button>
                <Button onClick={() => {
                  setIsTaskDetailOpen(false);
                  handleEditTask(selectedTask);
                }}>
                  编辑
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 项目删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.432-3L13.216 7H8.784c-.773 1.333-1.892 2-3.432 2H4.5c-1.548 0-2.5-1.452-2.5-3V4.5C2 3.052 3.052 2 4.5 2h1.938l1.5 1.5H8c.646 0 1.258.125 1.736.328l4.06 2.928c.37.266.688.598 1.066.598.773 0 1.48-.276 2.032-.633 2.032-1.668 0-2.896-2.132-3.032l-4.06-2.928c-.378-.266-.724-.598-1.066-.598H4.5z" />
              </svg>
              确认删除项目
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {projectToDelete && (() => {
              const project = projects.find(p => p.id === projectToDelete);
              const associatedTasks = tasks.filter(task => task.projectId === projectToDelete);

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project?.color || '#64748b' }}
                      ></div>
                      <span className="font-medium">{project?.title}</span>
                    </div>
                    {project?.description && (
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {associatedTasks.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            此项目有 <span className="font-bold">{associatedTasks.length}</span> 个关联任务
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            删除项目将同时删除这些任务，此操作无法撤销！
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>确定要删除这个项目吗？</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              disabled={isDeleting || !projectToDelete}
              className="w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    删除中...
                  </>
                ) : (
                  <>
                    删除项目
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m0-6l1 1m0 0l1-1m-6-6h6" />
                    </svg>
                  </>
                )}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 移动端菜单对话框 */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-sm">GoTaskMind</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsMobileMenuOpen(false)}>
              ✕
            </Button>
          </div>
          
          <nav className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-md hover:bg-muted">
              <Home className="h-4 w-4" />
              <span>首页</span>
            </Link>
            <Link href="/tasks" className="flex items-center gap-3 text-foreground font-medium py-2 px-3 rounded-md bg-primary/10">
              <CheckSquare className="h-4 w-4" />
              <span>任务管理</span>
            </Link>
            <Link href="/team" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-md hover:bg-muted">
              <Users className="h-4 w-4" />
              <span>团队管理</span>
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-md hover:bg-muted">
              <BarChart2 className="h-4 w-4" />
              <span>数据分析</span>
            </Link>
          </nav>
          
          <div className="border-t border-border mt-6 pt-6">
            <h3 className="text-sm font-medium mb-3">我的项目</h3>
            <div className="flex flex-col gap-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="flex items-center gap-2 text-left py-2 px-3 rounded-md text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                  <span className="truncate">{project.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border mt-6 pt-6">
            <Button className="w-full">登录</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}