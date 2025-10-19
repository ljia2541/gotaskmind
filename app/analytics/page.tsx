'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BarChart3, Sparkles, RefreshCw, ChevronDown, Calendar, Menu, AlertCircle } from 'lucide-react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';
// 导入语言服务和翻译对象
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';

// 导入Recharts图表库组件
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    analytics: true,
    aiInsights: false
  });
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [authenticated, setAuthenticated] = useState(false);
  // 语言状态
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [translations, setTranslations] = useState(analyticsTranslations.zh);
  
  // 初始化加载数据
  useEffect(() => {
    checkAuthentication();
    loadUserLanguage();
  }, []);

  // 加载用户语言偏好
  const loadUserLanguage = () => {
    const savedLanguage = LanguageService.getUserLanguage();
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setTranslations(analyticsTranslations[savedLanguage]);
    }
  };
  
  // 检查用户认证状态
  const checkAuthentication = async () => {
    try {
      // 检查是否有会话cookie
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        setAuthenticated(true);
        // 认证成功后加载数据
        await loadTasks();
        await loadAnalyticsData();
      } else {
        setAuthenticated(false);
        setError(translations.errors.notAuthenticated);
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      setError(translations.errors.authCheckFailed);
      setAuthenticated(false);
    }
  };
  
  // 从API加载任务数据
  const loadTasks = async () => {
    setIsLoading(prev => ({ ...prev, tasks: true }));
    setError('');
    try {
      const response = await fetch('/api/tasks', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(translations.errors.unauthorized);
        }
        throw new Error(translations.errors.loadTasksFailed);
      }
      
      const tasksData = await response.json();
      // 确保tasksData是数组类型
      const safeTasksData = Array.isArray(tasksData) ? tasksData : [];
      setTasks(safeTasksData);
      
      // 检测任务语言并设置界面语言 - 使用安全的tasks数组
      const detectedLanguage = LanguageService.detectTasksLanguage(safeTasksData);
      setLanguage(detectedLanguage);
      setTranslations(analyticsTranslations[detectedLanguage]);
      LanguageService.saveUserLanguage(detectedLanguage);
      
      // 获取AI洞察，直接传递检测到的语言而不是依赖状态更新
      fetchAiInsightsWithLanguage(safeTasksData, detectedLanguage);
    } catch (error: any) {
      console.error('加载任务数据失败:', error);
      setError(error.message || translations.errors.loadTasksError);
    } finally {
      setIsLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // 从API加载分析数据
  const loadAnalyticsData = async () => {
    setIsLoading(prev => ({ ...prev, analytics: true }));
    try {
      // 设置超时以避免长时间挂起
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch('/api/analytics', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(translations.errors.unauthorized);
        }
        throw new Error(translations.errors.loadAnalyticsFailed);
      }
      
      const analyticsData = await response.json();
      console.log('分析数据已加载:', analyticsData);
      // 分析数据将直接用于图表展示
    } catch (error: any) {
      console.error('加载分析数据失败:', error);
      // 即使分析数据加载失败，也会使用任务数据计算分析结果
      // 不显示错误消息，因为这不会影响页面的基本功能
    } finally {
      setIsLoading(prev => ({ ...prev, analytics: false }));
    }
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    await Promise.all([loadTasks(), loadAnalyticsData()]);
  };
  
  // 调用AI分析API获取真实洞察（带语言参数）
  const fetchAiInsightsWithLanguage = async (tasksData: Task[], currentLanguage: 'zh' | 'en') => {
    try {
      // 设置加载状态
      setIsLoading(prev => ({ ...prev, aiInsights: true }));
      
      // 调用AI分析API
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          tasks: tasksData,
          language: currentLanguage 
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(translations.errors.unauthorized);
        }
        throw new Error(translations.errors.aiAnalysisFailed);
      }
      
      const data = await response.json();
      
      if (data.analysis || data.summary) {
        // 使用AI生成的分析结果
        const aiContent = data.summary || data.analysis;
        setAiInsights(aiContent);
        
        // 如果是模拟数据，记录日志
        if (data.isMockData) {
          console.log('使用模拟AI分析数据');
        }
      } else {
        // 如果API返回的数据不完整，使用备份的模拟分析
        generateBackupInsights(tasksData, currentLanguage);
      }
    } catch (error) {
      // 捕获网络错误等异常
      console.error('获取AI洞察失败:', error);
      // 确保即使发生异常，也使用模拟数据和正确的语言
      generateBackupInsights(tasksData, currentLanguage);
    } finally {
      setIsLoading(prev => ({ ...prev, aiInsights: false }));
    }
  };
  
  // 原fetchAiInsights函数（兼容现有调用）
  const fetchAiInsights = async (tasksData: Task[]) => {
    await fetchAiInsightsWithLanguage(tasksData, language);
  };
  
  // 备份的模拟洞察生成（当API调用失败时使用）
  /**
   * 生成模拟的AI洞察内容
   * @param tasksData 任务数据数组
   * @param lang 当前语言代码 ('zh' | 'en')
   */
  const generateBackupInsights = (tasksData: Task[], lang: 'zh' | 'en') => {
    // 获取指定语言的翻译
    const langTranslations = analyticsTranslations[lang];
    
    // 简单的分析逻辑
    const completedTasks = tasksData.filter(task => task.status === 'completed').length;
    const totalTasks = tasksData.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const highPriorityTasks = tasksData.filter(task => task.priority === 'high').length;
    const urgentTasks = tasksData.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && task.status !== 'completed';
    }).length;
    
    // 使用指定语言的翻译对象生成多语言洞察
    const insights = `
# ${langTranslations.backupInsights.title}

## ${langTranslations.backupInsights.completionSection}
${langTranslations.backupInsights.completionText(completedTasks, completionRate)}

## ${langTranslations.backupInsights.prioritySection}
${langTranslations.backupInsights.priorityText(highPriorityTasks)}

## ${langTranslations.backupInsights.timeManagementSection}
${langTranslations.backupInsights.timeManagementText(urgentTasks)}

## ${langTranslations.backupInsights.suggestionsSection}
1. ${langTranslations.backupInsights.suggestion1}
2. ${langTranslations.backupInsights.suggestion2}
3. ${langTranslations.backupInsights.suggestion3}
    `.trim();
    
    setAiInsights(insights);
  };
  
  // 计算完成百分比
  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // 生成状态分布数据
  const getStatusDistribution = () => {
    const statusMap: Record<string, number> = {};
    tasks.forEach(task => {
      statusMap[task.status] = (statusMap[task.status] || 0) + 1;
    });
    
    return Object.entries(statusMap).map(([status, count]) => ({
      name: status,
      value: count,
      label: getStatusLabel(status)
    }));
  };
  
  // 生成优先级分布数据
  const getPriorityDistribution = () => {
    const priorityMap: Record<string, number> = {};
    tasks.forEach(task => {
      priorityMap[task.priority] = (priorityMap[task.priority] || 0) + 1;
    });
    
    return Object.entries(priorityMap).map(([priority, count]) => ({
      name: priority,
      value: count,
      label: getPriorityLabel(priority)
    }));
  };
  
  // 生成类别分布数据
  const getCategoryDistribution = () => {
    const categoryMap: Record<string, number> = {};
    tasks.forEach(task => {
      categoryMap[task.category] = (categoryMap[task.category] || 0) + 1;
    });
    
    return Object.entries(categoryMap).map(([category, count]) => ({
      name: category,
      value: count,
      label: getCategoryLabel(category)
    }));
  };
  
  // 获取状态标签
  const getStatusLabel = (status: string): string => {
    return translations.statusLabels[status] || status;
  };
  
  // 获取优先级标签
  const getPriorityLabel = (priority: string): string => {
    return translations.priorityLabels[priority] || priority;
  };
  
  // 获取类别标签
  const getCategoryLabel = (category: string): string => {
    return translations.categoryLabels[category] || category;
  };
  
  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      todo: '#6366f1',
      'in-progress': '#f59e0b',
      completed: '#10b981'
    };
    return statusColors[status] || '#9ca3af';
  };
  
  // 获取优先级颜色
  const getPriorityColor = (priority: string): string => {
    const priorityColors: Record<string, string> = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return priorityColors[priority] || '#9ca3af';
  };
  
  // 获取类别颜色
  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      work: '#6366f1',
      personal: '#f472b6',
      learning: '#10b981',
      other: '#9ca3af'
    };
    return categoryColors[category] || '#9ca3af';
  };
  
  // 获取即将到期的任务
  const getUpcomingTasks = () => {
    const today = new Date();
    return tasks
      .filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today;
      })
      .sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())
      .slice(0, showAllTasks ? undefined : 5);
  };
  
  // 获取最近完成的任务
  const getRecentlyCompletedTasks = () => {
    return tasks
      .filter(task => task.status === 'completed' && task.completedAt)
      .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
      .slice(0, 5);
  };
  
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // 计算剩余天数
  const getDaysRemaining = (dueDateString?: string): string => {
    if (!dueDateString) return translations.timeRelated.noDueDate;
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return translations.timeRelated.expired;
    if (diffDays === 0) return translations.timeRelated.dueToday;
    if (diffDays === 1) return translations.timeRelated.dueTomorrow;
    return translations.timeRelated.daysRemaining(diffDays);
  };
  
  // 获取任务完成趋势数据
  const getTaskCompletionTrend = () => {
    // 生成最近7天的数据
    const days = 7;
    const trendData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 格式化日期为YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      const dateLabel = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      
      // 计算当天完成的任务数量
      const completedOnDate = tasks.filter(task => {
        if (task.status !== 'completed' || !task.completedAt) return false;
        const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;
      
      // 计算当天创建的任务数量
      const createdOnDate = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;
      
      trendData.push({
        date: dateLabel,
        completed: completedOnDate,
        created: createdOnDate
      });
    }
    
    return trendData;
  };
  
  // 获取各类别任务的平均完成时间（天）
  const getAverageCompletionTimeByCategory = () => {
    interface CategoryStat {
      total: number;
      count: number;
    }
    
    const categoryData: Record<string, CategoryStat> = {};
    
    tasks.forEach(task => {
      if (task.status === 'completed' && task.createdAt && task.completedAt) {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt).getTime();
        const daysToComplete = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        
        if (!categoryData[task.category]) {
          categoryData[task.category] = { total: 0, count: 0 };
        }
        
        categoryData[task.category].total += daysToComplete;
        categoryData[task.category].count += 1;
      }
    });
    
    // 转换为图表数据格式
    return Object.entries(categoryData).map(([category, data]) => ({
      category: getCategoryLabel(category),
      averageDays: data.count > 0 ? Math.round(data.total / data.count) : 0
    }));
  };
  
  // 获取任务创建时间分布（按时间段）
  const getTaskCreationTimeDistribution = () => {
    // 定义时间段类型
    interface TimeRange {
      start: number;
      end: number;
      count: number;
      wrapAround?: boolean;
      wrapStart?: number;
      wrapEnd?: number;
    }
    
    // 定义时间段（使用翻译对象中的时间段标签）
    const timeRanges: Record<string, TimeRange> = {
      [translations.timeRelated.morning]: { start: 6, end: 10, count: 0 },
      [translations.timeRelated.lateMorning]: { start: 10, end: 12, count: 0 },
      [translations.timeRelated.afternoon]: { start: 12, end: 18, count: 0 },
      [translations.timeRelated.evening]: { start: 18, end: 22, count: 0 },
      [translations.timeRelated.night]: { start: 22, end: 24, count: 0, wrapAround: true, wrapStart: 0, wrapEnd: 6 }
    };
    
    // 统计各时间段创建的任务
    tasks.forEach(task => {
      if (task.createdAt) {
        const hour = new Date(task.createdAt).getHours();
        
        for (const [range, { start, end, wrapAround, wrapStart, wrapEnd }] of Object.entries(timeRanges)) {
          if (wrapAround && wrapStart !== undefined && wrapEnd !== undefined) {
            // 处理跨天时间段（深夜）
            if ((hour >= start && hour < end) || (hour >= wrapStart && hour < wrapEnd)) {
              timeRanges[range].count++;
              break;
            }
          } else if (hour >= start && hour < end) {
            timeRanges[range].count++;
            break;
          }
        }
      }
    });
    
    // 转换为图表数据格式
    return Object.entries(timeRanges).map(([label, data]) => ({
      label,
      value: data.count
    }));
  };
  
  // 获取截止日期预警分析
  const getDeadlineWarningAnalysis = () => {
    const today = new Date();
    const warningLevels = {
      [translations.deadlineLevels.expired]: { count: 0, color: '#ef4444' }, // 已过期
      [translations.deadlineLevels.urgent]: { count: 0, color: '#f59e0b' }, // 1-3天内
      [translations.deadlineLevels.upcoming]: { count: 0, color: '#3b82f6' }, // 4-7天内
      [translations.deadlineLevels.safe]: { count: 0, color: '#10b981' }, // 7天以上
      [translations.deadlineLevels.noDueDate]: { count: 0, color: '#6b7280' } // 无截止日期
    };
    
    // 统计各预警级别的任务
    tasks.forEach(task => {
      if (task.status === 'completed') return; // 已完成任务不计入预警
      
      if (!task.dueDate) {
        warningLevels[translations.deadlineLevels.noDueDate].count++;
        return;
      }
      
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        warningLevels[translations.deadlineLevels.expired].count++;
      } else if (diffDays <= 3) {
        warningLevels[translations.deadlineLevels.urgent].count++;
      } else if (diffDays <= 7) {
        warningLevels[translations.deadlineLevels.upcoming].count++;
      } else {
        warningLevels[translations.deadlineLevels.safe].count++;
      }
    });
    
    // 转换为图表数据格式
    return Object.entries(warningLevels).map(([label, data]) => ({
      label,
      value: data.count,
      color: data.color
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {translations.navigation.home}
            </Link>
            <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {translations.navigation.tasks}
            </Link>
            <Link href="/analytics" className="text-sm text-foreground font-medium">
              {translations.navigation.analytics}
            </Link>
            <Button
             variant="ghost"
             size="sm"
             onClick={refreshAllData}
             disabled={isLoading.tasks || isLoading.analytics}
             className="ml-2 flex items-center gap-2"
           >
             {(isLoading.tasks || isLoading.analytics) ? (
               <RefreshCw className="w-4 h-4 animate-spin" />
             ) : (
               <RefreshCw className="w-4 h-4" />
             )}
             {translations.navigation.refresh}
           </Button>
            {authenticated ? (
              <Button variant="outline" size="sm" onClick={() => {
                // 登出逻辑
                document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                window.location.href = '/';
              }}>
                {translations.navigation.logout}
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                {translations.navigation.login}
              </Button>
            )}
          </nav>
          
          {/* 移动端导航触发器 */}
          <div className="md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAllData}
              disabled={isLoading.tasks || isLoading.analytics}
              className="md:hidden flex items-center gap-2"
            >
              {isLoading.tasks ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" className="p-2 md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-8 px-2" 
              onClick={() => setError('')}
            >
              关闭
            </Button>
          </div>
        )}
        
        {/* 未认证提示 */}
        {!authenticated && !isLoading.tasks && !isLoading.analytics && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{translations.errors.authRequired}</h3>
              <p className="text-muted-foreground mb-6">{translations.errors.loginToViewAnalytics}</p>
              <Button>
                <Link href="/api/auth/google">{translations.navigation.loginWithGoogle}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* 主要内容 */}
        {authenticated && (
          <div className="space-y-8">
          {/* 摘要卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{translations.summary.totalTasks}</h3>
                  <Badge variant="outline" className="bg-background">{translations.summary.total}</Badge>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{tasks.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{translations.summary.completedTasks}</h3>
                  <Badge variant="outline" className="bg-background text-green-500">{translations.summary.success}</Badge>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {tasks.filter(task => task.status === 'completed').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{translations.summary.completionRate}</h3>
                  <Badge variant="outline" className="bg-background">{translations.summary.progress}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{getCompletionPercentage()}%</p>
                  <Progress value={getCompletionPercentage()} className="w-full sm:w-1/2 h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 完成率环形图 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translations.charts.completionOverview.title}</CardTitle>
                <CardDescription>{translations.charts.completionOverview.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getStatusDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getStatusDistribution().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getStatusColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${value} ${translations.tooltip.tasks}`, translations.tooltip.quantity]}
                        labelFormatter={(label) => getStatusLabel(label)}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {getStatusDistribution().map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(item.name) }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.label}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 优先级分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translations.charts.priorityDistribution.title}</CardTitle>
                <CardDescription>{translations.charts.priorityDistribution.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getPriorityDistribution()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <RechartsTooltip
                        formatter={(value) => [`${value} ${translations.tooltip.tasks}`, translations.tooltip.quantity]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {getPriorityDistribution().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getPriorityColor(entry.name)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 时间趋势分析 */}
          <div className="grid grid-cols-1 gap-6">
            {/* 任务完成趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translations.charts.taskCompletionTrend.title}</CardTitle>
                <CardDescription>{translations.charts.taskCompletionTrend.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getTaskCompletionTrend()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        formatter={(value, name) => [`${value}`, name === 'completed' ? translations.tooltip.completed : translations.tooltip.created]}
                      />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#6366f1"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-muted-foreground">{translations.tooltip.created}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">{translations.tooltip.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 类别平均完成时间 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translations.charts.averageCompletionTime.title}</CardTitle>
                <CardDescription>{translations.charts.averageCompletionTime.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getAverageCompletionTimeByCategory()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        allowDecimals={false}
                        label={{ value: translations.charts.averageCompletionTime.days, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <RechartsTooltip
                        formatter={(value) => [`${value} ${translations.tooltip.days}`, translations.tooltip.averageTime]}
                      />
                      <Bar dataKey="averageDays" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 类别分布和截止日期预警 */}
            <div className="grid grid-cols-1 gap-6">
              {/* 截止日期预警分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{translations.charts.deadlineWarning.title}</CardTitle>
                  <CardDescription>{translations.charts.deadlineWarning.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getDeadlineWarningAnalysis()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          allowDecimals={false}
                        />
                        <RechartsTooltip
                        formatter={(value) => [`${value} ${translations.tooltip.tasks}`, translations.tooltip.quantity]}
                      />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {getDeadlineWarningAnalysis().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* 任务创建时间分布 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{translations.charts.creationTimeDistribution.title}</CardTitle>
                  <CardDescription>{translations.charts.creationTimeDistribution.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getTaskCreationTimeDistribution()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getTaskCreationTimeDistribution().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'][index % 5]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => [`${value} ${translations.tooltip.tasks}`, translations.tooltip.quantity]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 类别分布和即将到期任务 */}
            <div className="grid grid-cols-1 gap-6">
            {/* 类别分布 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translations.charts.categoryDistribution.title}</CardTitle>
                <CardDescription>{translations.charts.categoryDistribution.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getCategoryDistribution()}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getCategoryDistribution().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCategoryColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${value} ${translations.tooltip.tasks}`, translations.tooltip.quantity]}
                        labelFormatter={(label) => getCategoryLabel(label)}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {getCategoryDistribution().map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(item.name) }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 即将到期任务 */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{translations.charts.upcomingTasks.title}</CardTitle>
                  <CardDescription>{translations.charts.upcomingTasks.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="flex items-center gap-1"
                >
                  {showAllTasks ? translations.charts.upcomingTasks.collapse : translations.charts.upcomingTasks.viewAll}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAllTasks ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] rounded-md border border-border">
                  {getUpcomingTasks().length > 0 ? (
                    <div className="divide-y divide-border">
                      {getUpcomingTasks().map((task) => (
                        <div
                          key={task.id}
                          className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-3"
                        >
                          <div
                            className="w-2 h-2 mt-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground truncate">
                                {task.title}
                              </h4>
                              <Badge variant="outline" className="ml-2">
                                {getCategoryLabel(task.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge
                                variant="outline"
                                className={cn('text-xs', {
                                  'text-red-500': task.priority === 'high',
                                  'text-amber-500': task.priority === 'medium',
                                  'text-green-500': task.priority === 'low'
                                })}
                              >
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {getDaysRemaining(task.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mb-2" />
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {translations.emptyState.noUpcomingTasks}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {translations.emptyState.allTasksScheduled}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI洞察 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg font-semibold">{analyticsTranslations[language].aiInsights.title}</CardTitle>
                </div>
                <CardDescription>{analyticsTranslations[language].aiInsights.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading.aiInsights ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {aiInsights.split('\n').map((line, index) => (
                    <div key={index} className="mb-1">
                      {line.startsWith('#') ? (
                        <h3 className="text-base font-semibold text-foreground mt-4 mb-2">
                          {line.replace(/^#+/, '').trim()}
                        </h3>
                      ) : line.startsWith('##') ? (
                        <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">
                          {line.replace(/^##+/, '').trim()}
                        </h4>
                      ) : line.trim() ? (
                        <p className="text-sm">{line.trim()}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
           </Card>
        </div>
        )}
      </main>
      
      {/* 移动端导航对话框 */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="w-[280px] sm:w-[350px] max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col gap-4 mt-6">
            <Link 
              href="/" 
              className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.navigation.home}
            </Link>
            <Link 
              href="/tasks" 
              className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.navigation.tasks}
            </Link>
            <Link 
              href="/analytics" 
              className="py-2 px-4 rounded-md bg-accent text-foreground font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.navigation.analytics}
            </Link>
            <div className="border-t border-border pt-4 mt-4">
              {authenticated ? (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    // 登出逻辑
                    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                    window.location.href = '/';
                  }}
                >
                  {translations.navigation.logout}
                </Button>
              ) : (
                <Button className="w-full">{translations.navigation.login}</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 需要添加的Check组件
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}