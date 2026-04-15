'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BarChart3, RefreshCw, Menu, AlertCircle } from 'lucide-react';
import { Task } from '@/types/task';
import Link from 'next/link';
import { redirect } from 'next/navigation';
// 导入语言服务和翻译对象
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';
import { PersonalWorkStats } from '@/components/personal-work-stats';
import { useAuth } from '@/app/hooks/use-auth';
import { useFeatureAccess } from '@/app/hooks/use-feature-access';

export default function AnalyticsPage() {
  // 认证状态
  const { user, isAuthenticated, login, logout } = useAuth();
  const { canAccessAnalytics, renderFeatureGate } = useFeatureAccess();

  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState({
    tasks: true
  });
  const [error, setError] = useState<string>('');
  // 语言状态
  const [language, setLanguage] = useState<'zh' | 'en'>('en');
  const [translations, setTranslations] = useState(analyticsTranslations.en);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
  // 初始化加载数据
  useEffect(() => {
    loadUserLanguage();
    loadTasks();
  }, []);

  // 监听localStorage变化，实现数据同步
  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        console.log('检测到任务数据变化，重新加载数据分析');
        loadTasks();
      }
    };

    // 监听storage事件
    window.addEventListener('storage', handleStorageChange);

    // 同时监听自定义事件，用于同一页面的数据同步
    const handleTasksUpdate = () => {
      console.log('检测到任务更新事件，重新加载数据分析');
      loadTasks();
    };

    window.addEventListener('tasksUpdated', handleTasksUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleTasksUpdate);
    };
  }, []); // 移除tasks依赖，避免无限循环

  // 加载用户语言偏好
  const loadUserLanguage = () => {
    const savedLanguage = LanguageService.getUserLanguage();
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setTranslations(analyticsTranslations[savedLanguage]);
    }
  };

    
  // 从localStorage加载任务数据
  const loadTasks = async () => {
    setIsLoading(prev => ({ ...prev, tasks: true }));
    setError('');
    try {
      // 确保在客户端环境中运行
      if (typeof window === 'undefined') {
        console.log('服务端环境，跳过任务加载');
        setTasks([]);
        setIsLoading(prev => ({ ...prev, tasks: false }));
        return;
      }

      // 从localStorage读取任务数据
      const savedTasks = localStorage.getItem('tasks');
      let tasksData: Task[] = [];

      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          if (Array.isArray(parsedTasks)) {
            tasksData = parsedTasks;
            console.log('从localStorage加载任务数据成功，共', tasksData.length, '个任务');
          } else {
            console.log('localStorage中的任务数据格式错误，使用空数组');
            tasksData = [];
          }
        } catch (error) {
          console.error('解析任务数据失败:', error);
          tasksData = [];
        }
      } else {
        console.log('localStorage中没有任务数据，使用空数组');
        tasksData = [];
      }

      setTasks(tasksData);

      // 检测任务语言并设置界面语言
      const detectedLanguage = LanguageService.detectTasksLanguage(tasksData);
      setLanguage(detectedLanguage);
      setTranslations(analyticsTranslations[detectedLanguage]);
      LanguageService.saveUserLanguage(detectedLanguage);

    } catch (error: any) {
      console.error('加载任务数据失败:', error);
      setError(error.message || translations.errors.loadTasksError);
    } finally {
      setIsLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  
  // 刷新所有数据
  const refreshAllData = async () => {
    await loadTasks();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 未登录用户提示横幅 */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-b border-blue-200 py-3 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">Demo Mode</span>
              <span className="text-blue-600 text-sm">您正在使用演示版本，登录后可保存和管理您的真实数据</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.location.href = '/'}
              >
                返回首页登录
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 头部导航 */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>

  
          {/* 桌面导航 - 放在右侧 */}
          <nav className="hidden md:flex justify-end items-center gap-6">
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
             disabled={isLoading.tasks}
             className="ml-2 flex items-center gap-2"
           >
             {isLoading.tasks ? (
               <RefreshCw className="w-4 h-4 animate-spin" />
             ) : (
               <RefreshCw className="w-4 h-4" />
             )}
             {translations.navigation.refresh}
           </Button>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => logout()}>
                {translations.navigation.logout}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => login()}>
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
              disabled={isLoading.tasks}
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
        {!isAuthenticated && !isLoading.tasks && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{translations.errors.authRequired}</h3>
              <p className="text-muted-foreground mb-6">{translations.errors.loginToViewAnalytics}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline">
                  <Link href="/api/auth/google">{translations.navigation.loginWithGoogle}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 功能访问控制 */}
        {isAuthenticated && renderFeatureGate({
          feature: 'analytics',
          children: (
            <div className="space-y-8">
              {/* 个人工作统计 */}
              <PersonalWorkStats tasks={tasks} />
            </div>
          )
        })}
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
              {isAuthenticated ? (
                <Button
                  className="w-full"
                  onClick={() => logout()}
                >
                  {translations.navigation.logout}
                </Button>
              ) : (
                <Button className="w-full" onClick={() => login()}>
                  <Link href="/auth/login">{translations.navigation.login}</Link>
                </Button>
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