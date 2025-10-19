"use client"

import { useState, useEffect, useRef } from 'react';
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
import { Search, Menu, PlusCircle, MoreHorizontal, Home, CheckSquare, PlusSquare, BarChart2, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Logo } from '@/components/logo';

// 导入任务和项目相关类型和配置
import { Task, categoryLabels, priorityLabels, statusLabels, TaskComment } from '@/types/task';
import { Project, projectStatusLabels } from '@/types/project';
import { TeamMember } from '@/types/team';
import { useAuth } from '@/app/hooks/use-auth';

export default function TaskManagementPage() {
  const { user, isAuthenticated } = useAuth();
  
  // 状态管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 项目状态管理
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // 默认选择'all'，在useEffect中获取URL参数
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  // 只在客户端运行时获取URL参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, []);
  // 控制任务显示状态 - 如果有projectId参数则立即显示任务
  const [showTasks, setShowTasks] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('projectId');
  });
  
  // 任务状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 任务编辑状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // 任务详情状态
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // 项目编辑状态
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
  
  // 项目表单状态
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as Project['status'],
    deadline: '',
    color: '#3b82f6',
  });



  // 初始化项目和团队成员数据
  useEffect(() => {
    // 从本地存储加载项目
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
      } catch (error) {
        console.error('解析项目数据失败:', error);
        setProjects([]);
      }
    } else {
      // 初始化模拟项目数据
      const mockProjects: Project[] = [
        {
          id: '1',
          title: '网站重构项目',
          description: '重新设计和开发公司官网',
          status: 'active',
          createdAt: '2024-12-01T08:00:00',
          updatedAt: '2024-12-05T10:30:00',
          deadline: '2025-01-15',
          color: '#3b82f6',
          keywords: ['网站', '设计', '开发']
        },
        {
          id: '2',
          title: '学习计划',
          description: 'React和Next.js学习计划',
          status: 'active',
          createdAt: '2024-12-02T09:15:00',
          updatedAt: '2024-12-03T16:45:00',
          deadline: '2025-03-31',
          color: '#8b5cf6',
          keywords: ['学习', 'React', 'Next.js']
        }
      ];
      setProjects(mockProjects);
      localStorage.setItem('projects', JSON.stringify(mockProjects));
    }
    
    // 从本地存储加载团队成员
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      try {
        const parsedMembers = JSON.parse(savedMembers);
        setTeamMembers(parsedMembers);
      } catch (error) {
        console.error('解析团队成员数据失败:', error);
        setTeamMembers([]);
      }
    } else {
      // 初始化模拟团队成员数据
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          email: user?.email || 'admin@example.com',
          name: user?.name || '管理员',
          picture: user?.picture,
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'member1@example.com',
          name: '张三',
          role: 'member',
          status: 'active',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          email: 'member2@example.com',
          name: '李四',
          role: 'member',
          status: 'active',
          joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTeamMembers(mockMembers);
      localStorage.setItem('teamMembers', JSON.stringify(mockMembers));
    }
  }, [user]);
  
  // 初始化模拟任务数据
  useEffect(() => {
    // 从本地存储加载任务，如果没有则使用模拟数据
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // 模拟数据 - 与项目关联
      const mockTasks: Task[] = [
        {
          id: '1',
          title: '完成项目提案',
          description: '准备下周会议的项目提案文档，包括预算和时间线',
          status: 'in-progress',
          category: 'work',
          priority: 'high',
          dueDate: '2024-12-15',
          createdAt: '2024-12-01T08:30:00',
          projectId: '1',
          assigneeId: '2', // 分配给张三
          assignedAt: '2024-12-01T09:00:00',
          comments: [
            {
              id: '101',
              authorId: '1',
              authorName: user?.name || '管理员',
              authorPicture: user?.picture,
              content: '请在周三前完成初稿',
              createdAt: '2024-12-01T09:15:00'
            },
            {
              id: '102',
              authorId: '2',
              authorName: '张三',
              content: '好的，我会按时完成',
              createdAt: '2024-12-01T10:30:00'
            }
          ]
        },
        {
          id: '2',
          title: '学习React Hooks',
          description: '完成React高级Hooks特性学习，包括自定义Hooks',
          status: 'todo',
          category: 'learning',
          priority: 'medium',
          dueDate: '2024-12-20',
          createdAt: '2024-12-02T10:15:00',
          projectId: '2',
          assigneeId: '3', // 分配给李四
          assignedAt: '2024-12-02T11:00:00',
        },
        {
          id: '3',
          title: '锻炼',
          description: '去健身房进行45分钟的有氧运动',
          status: 'completed',
          category: 'personal',
          priority: 'low',
          dueDate: '2024-12-05',
          createdAt: '2024-12-03T18:00:00',
          completedAt: '2024-12-05T19:30:00',
          assigneeId: '1', // 分配给管理员
          assignedAt: '2024-12-03T18:30:00',
          // 个人任务没有关联项目
        },
        {
          id: '4',
          title: '购买生日礼物',
          description: '为朋友准备生日礼物',
          status: 'todo',
          category: 'personal',
          priority: 'medium',
          dueDate: '2024-12-25',
          createdAt: '2024-12-04T14:20:00',
          assigneeId: '1', // 分配给管理员
          assignedAt: '2024-12-04T15:00:00',
          // 个人任务没有关联项目
        },
      ];
      setTasks(mockTasks);
      localStorage.setItem('tasks', JSON.stringify(mockTasks));
    }
  }, []);

  // 监听URL参数变化
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');
      
      if (projectId && projectId !== selectedProjectId) {
        setSelectedProjectId(projectId);
        setShowTasks(true);
      } else if (!projectId && selectedProjectId !== 'all') {
        setSelectedProjectId('all');
        setShowTasks(false);
      }
    }

    // 监听浏览器前进后退按钮事件
    window.addEventListener('popstate', handleUrlChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [selectedProjectId]);
  
  // 保存项目到本地存储
  useEffect(() => {
    console.log('项目状态更新，保存到本地存储:', projects);
    // 无论项目数组是否为空，都保存到本地存储
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
      console.log('项目保存成功');
    } catch (error) {
      console.error('保存项目到本地存储失败:', error);
    }
  }, [projects]);
  
  // 保存任务到本地存储
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);
  
  // 保存团队成员到本地存储
  useEffect(() => {
    if (teamMembers.length > 0) {
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    }
  }, [teamMembers]);
  
  // 获取项目名称
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '无项目';
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : '未知项目';
  };
  
  // 获取任务负责人信息
  const getTaskAssignee = (task: Task) => {
    if (!task.assigneeId) return null;
    return teamMembers.find(member => member.id === task.assigneeId);
  };
  
  // 获取项目颜色
  const getProjectColor = (projectId?: string) => {
    if (!projectId) return '#94a3b8';
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#94a3b8';
  };
  
  // 处理项目选择
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    // 当选择特定项目时显示任务
    setShowTasks(projectId !== 'all');
  };
  
  // 打开添加项目对话框
  const handleOpenAddProjectDialog = () => {
    setEditingProject(null);
    setProjectFormData({
      title: '',
      description: '',
      status: 'planning',
      deadline: '',
      color: '#3b82f6',
    });
    setIsAddProjectDialogOpen(true);
  };
  
  // 打开编辑项目对话框
  const handleOpenEditProjectDialog = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      status: project.status,
      deadline: project.deadline || '',
      color: project.color || '#3b82f6',
    });
    setIsAddProjectDialogOpen(true);
  };
  
  // 处理项目表单输入变化
  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 提取关键词函数
  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    
    // 常见停用词（可根据需要扩展）
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as',
      'what', 'when', 'where', 'how', 'who', 'which', 'this', 'that',
      'these', 'those', 'then', 'just', 'so', 'than', 'such', 'both',
      'through', 'about', 'for', 'is', 'are', 'was', 'were', 'be', 'been',
      'to', 'of', 'in', 'on', 'at', 'by', 'from', 'with', 'into', 'during',
      'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off',
      'over', 'under', 'again', 'further', 'then', 'once'
    ]);
    
    // 移除标点符号，转换为小写，分词
    const words = text.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // 统计词频
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    // 按词频排序，返回前5个关键词
    return Array.from(wordFreq.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  };
  
  // 处理项目表单提交
  const handleSubmitProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 确保表单数据有效
    if (!projectFormData.title.trim()) {
      alert('请输入项目标题');
      return;
    }
    
    // 提取关键词
    const combinedText = `${projectFormData.title} ${projectFormData.description}`;
    const keywords = extractKeywords(combinedText);
    const projectDataWithKeywords = {
      ...projectFormData,
      keywords
    };
    
    console.log('开始提交项目表单:', projectDataWithKeywords);
    
    if (editingProject) {
      // 编辑现有项目
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === editingProject.id
            ? {
                ...project,
                ...projectDataWithKeywords,
                updatedAt: new Date().toISOString(),
              }
            : project
        )
      );
    } else {
      // 添加新项目 - 确保包含所有必要字段
      const newProject: Project = {
        ...projectDataWithKeywords,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('创建新项目:', newProject);
      
      // 使用函数式更新确保获取最新的状态
      setProjects(prevProjects => {
        console.log('当前项目列表:', prevProjects);
        const updatedProjects = [...prevProjects, newProject];
        console.log('更新后的项目列表:', updatedProjects);
        // 立即保存到本地存储
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        console.log('已保存到本地存储');
        return updatedProjects;
      });
      
      // 重置表单
      setProjectFormData({
        title: '',
        description: '',
        status: 'planning',
        deadline: '',
        color: '#3b82f6',
      });
    }
    
    // 关闭对话框
    setIsAddProjectDialogOpen(false);
  };
  
  // 处理项目删除
  const handleDeleteProject = (projectId: string) => {
    // 确认删除
    if (confirm('确定要删除这个项目吗？这将会使所有关联的任务变成无项目状态。')) {
      // 删除项目
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      // 更新任务，移除项目关联
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.projectId === projectId
            ? { ...task, projectId: undefined }
            : task
        )
      );
      // 如果当前选中的是被删除的项目，切换到全部
      if (selectedProjectId === projectId) {
        setSelectedProjectId('all');
      }
    }
  };


  
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
  
  // 打开任务详情对话框
  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setNewComment('');
    setIsTaskDetailOpen(true);
  };
  
  // 添加任务评论
  const handleAddComment = () => {
    if (!selectedTask || !newComment.trim() || !user) return;
    
    const comment: TaskComment = {
      id: Date.now().toString(),
      authorId: user.email || '1', // 使用email作为ID
      authorName: user.name || '用户',
      authorPicture: user.picture,
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          comments: [...(task.comments || []), comment]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setSelectedTask({
      ...selectedTask,
      comments: [...(selectedTask.comments || []), comment]
    });
    setNewComment('');
  };
  
  // 打开编辑任务对话框
  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
    });
    setIsAddDialogOpen(true);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理选择变更
  const handleSelectChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // 处理表单提交
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingTask) {
      // 编辑现有任务
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === editingTask.id) {
            // 如果改变了负责人，更新分配时间
            const updatedTask = {
              ...task,
              ...formData,
              updatedAt: now,
            };
            
            if (formData.assigneeId !== task.assigneeId) {
              updatedTask.assignedAt = now;
            }
            
            return updatedTask;
          }
          return task;
        })
      );
    } else {
      // 添加新任务
      const newTask: Task = {
        ...formData,
        id: Date.now().toString(),
        createdAt: now,
        assignedAt: formData.assigneeId ? now : undefined,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    
    setIsAddDialogOpen(false);
  };
  
  // 处理任务状态变更
  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'todo' : 'completed',
              completedAt: task.status === 'completed' ? undefined : new Date().toISOString(),
            }
          : task
      )
    );
  };
  
  // 处理任务删除
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // 根据当前选择的项目过滤任务
  const filteredTasks = tasks.filter(task => {
    // 项目过滤
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
      return false;
    }
    
    // 状态过滤
    if (activeTab !== 'all' && task.status !== activeTab) {
      return false;
    }
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // 排序任务
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'dueDate') {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      comparison = isNaN(dateA) ? 1 : isNaN(dateB) ? -1 : dateA - dateB;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 打开添加任务对话框和编辑任务对话框函数已在上方声明
  // 处理表单输入变化和表单提交函数已在上方声明

  // 处理状态变更
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 头部导航 */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              首页
            </Link>
            <Link href="/tasks" className="text-sm text-foreground font-medium">
              任务管理
            </Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              团队管理
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              数据分析
            </Link>
            <Button variant="outline" size="sm" className="ml-2">
              登录
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
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">首页</Link>
            <Link href="/tasks" className="font-medium text-foreground border-l-4 border-primary pl-2">任务管理</Link>
            <Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">团队管理</Link>
            <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">数据分析</Link>
          </nav>
        )}
        {/* 头部 */}
        <header className="border-b border-border backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">任务管理</h1>
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
                
                {/* 测试按钮 - 直接添加一个测试项目 */}
                <Button variant="destructive" onClick={() => {
                  const testProject: Project = {
                    id: Date.now().toString(),
                    title: '测试项目 ' + Date.now(),
                    description: '这是一个测试项目',
                    status: 'planning',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    color: '#3b82f6'
                  };
                  console.log('直接添加测试项目:', testProject);
                  setProjects(prev => [...prev, testProject]);
                }}>
                  测试项目
                </Button>
              </div>
            </div>
          </div>
        </header>
        


        {/* 项目和任务过滤工具栏 */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 项目选择 */}
            <div className="w-full md:w-64">
              <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有项目</SelectItem>
                  {projects.map(project => (
                    <SelectItem value={project.id}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                            <span className="truncate">{project.title}</span>
                          </div>
                          {project.keywords && project.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-5">
                              {project.keywords.slice(0, 3).map((keyword, index) => (
                                <span key={index} className="text-xs text-muted-foreground">#{keyword}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 只有在选择了特定项目或所有项目时才显示任务标签 */}
            {showTasks && (
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">全部 ({filteredTasks.length})</TabsTrigger>
                    <TabsTrigger value="todo">待办 ({tasks.filter(t => t.status === 'todo' && (!selectedProjectId || selectedProjectId === 'all' || t.projectId === selectedProjectId)).length})</TabsTrigger>
                    <TabsTrigger value="in-progress">进行中 ({tasks.filter(t => t.status === 'in-progress' && (!selectedProjectId || selectedProjectId === 'all' || t.projectId === selectedProjectId)).length})</TabsTrigger>
                    <TabsTrigger value="completed">已完成 ({tasks.filter(t => t.status === 'completed' && (!selectedProjectId || selectedProjectId === 'all' || t.projectId === selectedProjectId)).length})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </div>
        </div>
        
        {/* 项目列表 */}
        <div className="container mx-auto px-4 py-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">我的项目</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map(project => (
              <Card key={project.id} className={`border overflow-hidden ${selectedProjectId === project.id ? 'ring-2 ring-primary' : ''}`}>
                <div className="p-4 flex justify-between items-start gap-3 cursor-pointer hover:bg-muted/30 rounded-md transition-colors" onClick={() => handleProjectSelect(project.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }}></div>
                      <h3 className="font-medium truncate min-w-0">{project.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-w-0">{project.description}</p>
                    {/* 显示关键词标签 */}
                    {project.keywords && project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs py-0 px-1.5">
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={projectStatusLabels[project.status].color}>
                        {projectStatusLabels[project.status].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tasks.filter(t => t.projectId === project.id).length} 个任务
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-1.5 rounded-full hover:bg-muted transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="项目操作菜单"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleOpenEditProjectDialog(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>编辑项目</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>删除项目</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-6">
        {showTasks ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-muted-foreground">
                显示 {sortedTasks.length} 个任务 - 项目: {getProjectName(selectedProjectId)}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSortBy('createdAt');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  创建时间 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSortBy('dueDate');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  截止日期 {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {sortedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">没有找到任务</p>
                  <Button variant="secondary" className="mt-4" onClick={handleOpenAddDialog}>
                    添加任务
                  </Button>
                </div>
              ) : (
                sortedTasks.map(task => (
                  <Card key={task.id} className={`border ${task.status === 'completed' ? 'opacity-70' : ''}`}>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id={`task-${task.id}`}
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          className="mt-1"
                        />
                          
                        <div className="flex-1 cursor-pointer" onClick={() => handleOpenTaskDetail(task)}>
                          <div className="flex items-center gap-2">
                            <label 
                              htmlFor={`task-${task.id}`}
                              className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {task.title}
                            </label>
                              
                            {/* 显示项目标签 */}
                            {task.projectId && (
                              <Badge style={{ backgroundColor: `${getProjectColor(task.projectId)}20`, color: getProjectColor(task.projectId) }} className="font-normal">
                                {getProjectName(task.projectId)}
                              </Badge>
                            )}
                          </div>
                            
                          {task.description && (
                            <p className="text-muted-foreground mt-1 line-clamp-2 truncate">{task.description}</p>
                          )}
                            
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge className={categoryLabels[task.category].color}>
                              {categoryLabels[task.category].label}
                            </Badge>
                            <Badge className={priorityLabels[task.priority].color}>
                              {priorityLabels[task.priority].label} 优先级
                            </Badge>
                            <Badge className={statusLabels[task.status].color}>
                              {statusLabels[task.status].label}
                            </Badge>
                          </div>
                        </div>
                          
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-muted-foreground">
                            {task.dueDate ? formatDate(task.dueDate) : '无截止日期'}
                          </div>
                          
                          {(() => {
                            const assignee = getTaskAssignee(task);
                            return assignee ? (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                  {assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium">{assignee.name}</span>
                              </div>
                            ) : null;
                          })()}
                            
                          <div className="flex gap-1 mt-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(task);
                              }}
                            >
                              编辑
                            </Button>
                              
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2">请选择一个项目来查看和管理任务</p>
            {selectedProjectId === 'all' ? (
              <p className="text-sm text-muted-foreground">从上方项目列表中点击项目卡片开始</p>
            ) : (
              <p className="text-sm text-muted-foreground">您已经选择了项目 "{getProjectName(selectedProjectId)}"，任务列表已准备就绪</p>
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-foreground">GoTaskMind</span>
            </div>
            <p className="text-sm text-muted-foreground">
                © 2025 GoTaskMind. AI-powered task management tool.
              </p>
          </div>
        </div>
      </footer>

      {/* 添加/编辑任务对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? '编辑任务' : '添加新任务'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="输入任务标题"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="输入任务描述（可选）"
                rows={3}
              />
            </div>
            
            {/* 添加项目选择 */}
            <div className="space-y-2">
              <Label htmlFor="projectId">项目</Label>
              <Select
                value={formData.projectId || 'none'}
                onValueChange={(value) => handleSelectChange('projectId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无项目</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                        {project.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 添加负责人选择 */}
            <div className="space-y-2">
              <Label htmlFor="assigneeId">负责人</Label>
              <Select
                value={formData.assigneeId || 'none'}
                onValueChange={(value) => handleSelectChange('assigneeId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择团队成员" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未分配</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Task['category']) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">工作</SelectItem>
                    <SelectItem value="personal">个人</SelectItem>
                    <SelectItem value="learning">学习</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task['priority']) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">截止日期</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task['status']) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">待办</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingTask ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 任务详情对话框 */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* 任务信息 */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={categoryLabels[selectedTask.category].color}>
                      {categoryLabels[selectedTask.category].label}
                    </Badge>
                    <Badge className={priorityLabels[selectedTask.priority].color}>
                      {priorityLabels[selectedTask.priority].label} 优先级
                    </Badge>
                    <Badge className={statusLabels[selectedTask.status].color}>
                      {statusLabels[selectedTask.status].label}
                    </Badge>
                  </div>
                  
                  {selectedTask.description && (
                    <div className="space-y-2">
                      <h4 className="font-medium">描述</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* 任务元信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">截止日期</span>
                    <p className="font-medium">{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '无截止日期'}</p>
                  </div>
                  
                  {selectedTask.assigneeId && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">负责人</span>
                      {(() => {
                        const assignee = getTaskAssignee(selectedTask);
                        return assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{assignee.name}</span>
                          </div>
                        ) : (
                          <p className="font-medium text-muted-foreground">未知</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* 评论区 */}
                <div className="space-y-4">
                  <h4 className="font-medium">评论 ({selectedTask.comments?.length || 0})</h4>
                  
                  {/* 评论输入框 */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="添加评论..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || !isAuthenticated}
                      >
                        发送评论
                      </Button>
                    </div>
                  </div>
                  
                  {/* 评论列表 */}
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTask.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium text-sm">{comment.authorName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4 text-center">
                      暂无评论，添加第一条评论吧
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsTaskDetailOpen(false)}>关闭</Button>
                {isAuthenticated && (
                  <Button onClick={() => {
                    setIsTaskDetailOpen(false);
                    handleOpenEditDialog(selectedTask);
                  }}>
                    编辑任务
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 项目编辑对话框 */}
      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitProjectForm} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input 
                id="projectTitle" 
                name="title"
                value={projectFormData.title} 
                onChange={handleProjectInputChange}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea 
                id="projectDescription" 
                name="description"
                value={projectFormData.description} 
                onChange={handleProjectInputChange}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectColor">Project Color</Label>
              <div className="flex flex-wrap gap-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProjectFormData({...projectFormData, color})}
                    className={`w-8 h-8 rounded-full transition-all ${projectFormData.color === color ? 'ring-2 ring-offset-2 ring-primary' : 'hover:ring-2'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectStatus">Project Status</Label>
              <select
                id="projectStatus"
                name="status"
                value={projectFormData.status}
                onChange={handleProjectInputChange}
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              >
                {Object.entries(projectStatusLabels).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDeadline">Deadline</Label>
              <Input 
                id="projectDeadline" 
                name="deadline"
                type="date" 
                value={projectFormData.deadline} 
                onChange={handleProjectInputChange}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 移动端导航对话框 */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-4">
            <DialogTitle>GoTaskMind</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>首页</span>
            </Link>
            <Link 
              href="/tasks" 
              className="flex items-center gap-2 py-3 px-4 rounded-md bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CheckSquare className="w-5 h-5" />
              <span>任务管理</span>
            </Link>
            <Button 
              variant="ghost" 
              className="flex items-center justify-start gap-2 py-3 px-4 rounded-md hover:bg-muted transition-colors"
              onClick={() => {
                handleOpenAddProjectDialog();
                setIsMobileMenuOpen(false);
              }}
            >
              <PlusSquare className="w-5 h-5" />
              <span>添加项目</span>
            </Button>
            <Link 
              href="/analytics" 
              className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart2 className="w-5 h-5" />
              <span>数据分析</span>
            </Link>
            
            {/* 最近项目快速访问 */}
            {projects.length > 0 && (
              <div className="mt-4">
                <div className="px-4 py-2 text-sm text-muted-foreground">最近项目</div>
                {projects.slice(0, 3).map(project => (
                  <button
                    key={project.id}
                    className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-muted transition-colors w-full text-left"
                    onClick={() => {
                      handleProjectSelect(project.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                    <span className="truncate">{project.title}</span>
                  </button>
                ))}
              </div>
            )}
            
            <div className="border-t border-border pt-4 mt-4">
              <Button className="w-full">登录</Button>
              <Button variant="secondary" className="w-full mt-2">
                <Link href="/team" className="w-full h-full flex items-center justify-center">
                  团队管理
                </Link>
              </Button>
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}