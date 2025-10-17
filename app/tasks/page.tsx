"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

// 导入任务相关类型和配置
import { Task, categoryLabels, priorityLabels, statusLabels } from '@/types/task';

export default function TaskManagementPage() {
  // 状态管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 任务状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 任务编辑状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    category: 'work' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  // 初始化模拟数据
  useEffect(() => {
    // 从本地存储加载任务，如果没有则使用模拟数据
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // 模拟数据
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Complete Project Proposal',
          description: 'Prepare project proposal document for next week\'s meeting, including budget and timeline',
          status: 'in-progress',
          category: 'work',
          priority: 'high',
          dueDate: '2024-12-15',
          createdAt: '2024-12-01T08:30:00',
        },
        {
          id: '2',
          title: 'Learn React Hooks',
          description: 'Complete learning advanced React Hooks features, including custom Hooks',
          status: 'todo',
          category: 'learning',
          priority: 'medium',
          dueDate: '2024-12-20',
          createdAt: '2024-12-02T10:15:00',
        },
        {
          id: '3',
          title: 'Workout',
          description: 'Go to the gym for 45 minutes of cardio exercise',
          status: 'completed',
          category: 'personal',
          priority: 'low',
          dueDate: '2024-12-05',
          createdAt: '2024-12-03T18:00:00',
          completedAt: '2024-12-05T19:30:00',
        },
        {
          id: '4',
          title: 'Buy Birthday Gift',
          description: 'Prepare a birthday gift for a friend',
          status: 'todo',
          category: 'personal',
          priority: 'medium',
          dueDate: '2024-12-25',
          createdAt: '2024-12-04T14:20:00',
        },
      ];
      setTasks(mockTasks);
      localStorage.setItem('tasks', JSON.stringify(mockTasks));
    }
  }, []);

  // 保存任务到本地存储
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // 过滤和排序任务
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // 搜索过滤
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 标签过滤
      const matchesTab = activeTab === 'all' || task.status === activeTab;
      
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      // 排序
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // 处理任务完成状态切换
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
    });
    setIsAddDialogOpen(true);
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
    });
    setIsAddDialogOpen(true);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理表单提交
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      // 编辑现有任务
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTask.id
            ? { ...task, ...formData }
            : task
        )
      );
    } else {
      // 添加新任务
      const newTask: Task = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    
    setIsAddDialogOpen(false);
  };

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
      {/* 头部 */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/tasks" className="text-sm font-medium text-foreground transition-colors">
              Tasks
            </Link>
          </nav>
          <Button variant="default" size="sm">
            Login
          </Button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题和操作区 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
                <p className="text-muted-foreground mt-1">Manage and track all your tasks</p>
            </div>
            <Button 
              onClick={handleOpenAddDialog}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              + Add Task
            </Button>
          </div>

          {/* 筛选和搜索 */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'dueDate')}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm"
                >
                  <option value="createdAt">By creation date</option>
                  <option value="dueDate">By due date</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>

          {/* 状态标签页 */}
          <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All Tasks</TabsTrigger>
              <TabsTrigger value="todo" className="flex-1">To Do</TabsTrigger>
              <TabsTrigger value="in-progress" className="flex-1">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 任务列表 */}
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No tasks available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedTasks.map(task => (
                <Card 
                  key={task.id} 
                  className={`p-4 transition-all hover:shadow-md ${task.status === 'completed' ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={categoryLabels[task.category].color}>
                              {categoryLabels[task.category].label}
                            </Badge>
                            <Badge className={priorityLabels[task.priority].color}>
                              {priorityLabels[task.priority].label} Priority
                            </Badge>
                            <Badge className={statusLabels[task.status].color}>
                              {statusLabels[task.status].label}
                            </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          <span>Due date: {formatDate(task.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                            className="bg-background border border-border rounded-md px-2 py-1 text-xs"
                          >
                            <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                          </select>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenEditDialog(task)}
                            className="h-8 px-2"
                          >
                            Edit
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
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
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
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
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-md px-3 py-2"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="learning">Learning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-md px-3 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingTask ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 移动端导航对话框 */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="w-[280px] sm:w-[350px] max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col gap-4 mt-6">
            <Link 
              href="/" 
              className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              href="/tasks" 
              className="py-2 px-4 rounded-md bg-accent text-foreground font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              任务管理
            </Link>
            <Link 
              href="/analytics" 
              className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              数据分析
            </Link>
            <div className="border-t border-border pt-4 mt-4">
              <Button className="w-full">登录</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}