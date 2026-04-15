"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Zap, Users, BarChart3, Check, Loader2, Menu, X, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { AuthNavigation } from "@/app/components/auth-navigation"
import { useAuth } from "@/app/hooks/use-auth"
import { LanguageService, analyticsTranslations } from "@/app/lib/language-service"

const examplePrompts = [
  "Build a fitness tracking mobile app with social features",
  "Organize a cross-regional industry summit conference",
  "Develop a multilingual e-commerce application",
  "Create an internal customer relationship management system",
  "Launch a SaaS product with subscription billing",
  "Design and implement company website redesign project",
]

export default function LandingPage() {
  const { loginWithGoogle, isAuthenticated, isPro, subscription, user, debugSubscriptionStatus, manualActivatePro, useMemoryStore, updateSubscription } = useAuth()
  // 获取用户语言偏好，确保服务器端和客户端渲染一致性
  const defaultLanguage = 'zh'; // 默认使用中文
  const [userLanguage, setUserLanguage] = useState(defaultLanguage);
  const [translations, setTranslations] = useState(analyticsTranslations[defaultLanguage]);

  // 在客户端加载后更新语言偏好
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientLanguage = LanguageService.getUserLanguage() || defaultLanguage;
      setUserLanguage(clientLanguage);
      setTranslations(analyticsTranslations[clientLanguage] || analyticsTranslations[defaultLanguage]);
    }
  }, []);
  const [currentExample, setCurrentExample] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  // AI功能相关状态
  const [projectPrompt, setProjectPrompt] = useState('')
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([])
  const [projectTitle, setProjectTitle] = useState('')
  const [showTaskPreview, setShowTaskPreview] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // 监听滚动事件，用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 浏览器检测工具函数
  const detectBrowser = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return { name: 'Chrome', type: 'standard', isChinese: false }
    } else if (userAgent.includes('firefox')) {
      return { name: 'Firefox', type: 'standard', isChinese: false }
    } else if (userAgent.includes('edg')) {
      return { name: 'Edge', type: 'standard', isChinese: false }
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return { name: 'Safari', type: 'standard', isChinese: false }
    } else if (userAgent.includes('qihoo') || userAgent.includes('360se')) {
      return { name: '360浏览器', type: 'chinese', isChinese: true }
    } else if (userAgent.includes('qqbrowser')) {
      return { name: 'QQ浏览器', type: 'chinese', isChinese: true }
    } else if (userAgent.includes('se 2.x') || userAgent.includes('sogou')) {
      return { name: '搜狗浏览器', type: 'chinese', isChinese: true }
    } else if (userAgent.includes('ucbrowser')) {
      return { name: 'UC浏览器', type: 'chinese', isChinese: true }
    } else if (userAgent.includes('baidu')) {
      return { name: '百度浏览器', type: 'chinese', isChinese: true }
    } else {
      return { name: '未知浏览器', type: 'unknown', isChinese: false }
    }
  }, [])

  // 组件挂载后延迟刷新订阅状态，避免Hydration错误
  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        const browserInfo = detectBrowser()
        console.log('🌐 浏览器检测:', browserInfo)

        if (browserInfo.type === 'chinese') {
          console.log('🇨🇳 检测到中国本土浏览器，使用增强的订阅同步机制')

          // 针对中国本土浏览器，延迟执行状态同步
          setTimeout(() => {
            console.log('🔄 中国浏览器专用同步')
            // 订阅状态会在useAuth hook中自动同步
          }, 1000)
        }
      }
    }, 2000) // 增加延迟时间确保页面完全加载

    return () => clearTimeout(timer)
  }, [isAuthenticated, user])

  // 调试功能 - 键盘快捷键 (Shift+Ctrl+D)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Shift + Ctrl + D
      if (event.shiftKey && event.ctrlKey && event.key === 'D') {
        event.preventDefault()
        console.log('🔍 调试：检查订阅状态')
        debugSubscriptionStatus()
      }
    }

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [debugSubscriptionStatus])

  /**
   * 处理AI任务生成
   * 调用API端点生成任务列表，并准备显示预览
   */
  const handleGenerate = async () => {
    if (!projectPrompt.trim()) {
      setProjectPrompt(examplePrompts[currentExample]);
      return;
    }
    
    setIsGenerating(true);
    try {
      // 更新API调用路径为新创建的端点
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectDescription: projectPrompt }),
      });
      
      const data = await response.json();
      if (data.success) {
        // 设置项目标题
        setProjectTitle(data.project_title || projectPrompt.trim());

        // 为任务添加必要属性，但不立即保存
        const tasksWithIds = data.tasks.map((task: any, index: number) => ({
          ...task,
          // 保留原有的AI生成的ID，如果不存在则创建一个
          id: task.id || `ai-generated-${Date.now()}-${index}`,
          status: 'todo',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 默认7天后
          // 确保estimatedHours是数字
          estimatedHours: task.estimated_hours || task.estimatedHours || 2,
          // 确保dependencies是数组
          dependencies: task.dependencies || [],
          // 保留原有的energy_level
          energyLevel: task.energy_level || task.energyLevel || 'medium'
        }));

        // 设置生成的任务
        setGeneratedTasks(tasksWithIds);
        // 默认选中所有任务
        setSelectedTasks(tasksWithIds.map((task: any) => task.id));
        // 显示任务预览对话框
        setShowTaskPreview(true);
      } else {
        alert('任务生成失败: ' + data.error);
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成过程中出现错误，请重试。可能需要配置DeepSeek API密钥。');
    } finally {
      setIsGenerating(false);
    }
  }
  // 处理任务选择
  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  }
  
  // 处理保存选中的任务
  const handleSaveSelectedTasks = () => {
    // 筛选出选中的任务
    const tasksToSave = generatedTasks.filter(task => selectedTasks.includes(task.id));
    
    if (tasksToSave.length === 0) {
      alert('请至少选择一个任务进行保存');
      return;
    }
    
    // 创建新项目 - 使用AI生成的项目标题
    const newProject = {
      id: `project-${Date.now()}`,
      title: projectTitle.trim() || projectPrompt.trim() || 'AI生成项目',
      description: `这是由AI根据描述"${projectPrompt.trim()}"生成的项目，包含${tasksToSave.length}个任务`,
      status: 'planning',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 默认14天后
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // 随机颜色
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [], // 空的成员数组
      taskCount: tasksToSave.length // 设置正确的任务计数
    };

    console.log('=== 主页创建新项目 ===');
    console.log('项目详情:', newProject);
    console.log('任务数量:', tasksToSave.length);
    
    // 将任务关联到新项目
    const tasksWithProject = tasksToSave.map(task => ({
      ...task,
      projectId: newProject.id
    }));
    
    // 获取现有数据
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');

    console.log('保存前的现有数据:');
    console.log('- 现有任务数量:', existingTasks.length);
    console.log('- 现有项目数量:', existingProjects.length);

    // 合并数据
    const updatedTasks = [...existingTasks, ...tasksWithProject];
    const updatedProjects = [...existingProjects, newProject];

    console.log('保存后的更新数据:');
    console.log('- 更新后任务数量:', updatedTasks.length);
    console.log('- 更新后项目数量:', updatedProjects.length);
    console.log('- 新项目ID:', newProject.id);

    // 保存到本地存储
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    console.log('数据已保存到本地存储');
    
    // 关闭预览对话框
    setShowTaskPreview(false);
    
    // 显示成功消息
    alert(`成功创建项目"${newProject.title}"并保存 ${tasksToSave.length} 个任务！`);
    
    // 跳转到任务页面，带上项目ID参数以便直接显示该项目
    window.location.href = `/tasks?projectId=${newProject.id}`;
  }
  
  // 选择/取消选择所有任务
  const handleSelectAllTasks = () => {
    if (selectedTasks.length === generatedTasks.length) {
      // 全部已选中，取消所有选择
      setSelectedTasks([]);
    } else {
      // 选择所有任务
      setSelectedTasks(generatedTasks.map(task => task.id));
    }
  }

  const cycleExample = () => {
    setCurrentExample((prev) => (prev + 1) % examplePrompts.length)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header 
        className={`bg-background transition-all duration-300 ${isScrolled ? 'py-2 shadow-sm' : 'py-4'}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className={`w-8 h-8 transition-transform ${isScrolled ? 'scale-90' : 'scale-100'}`} />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          
          {/* 认证导航 */}
          <AuthNavigation />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <DecorativeElements />
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Project Planning</span>
              </div>

              {isAuthenticated && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm animate-in fade-in slide-in-from-bottom-3 duration-700 group ${
                  isPro
                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  <Check className="w-4 h-4" />
                  <span>
                    {isPro ? 'Pro Plan Active' : 'Free Plan'}
                    {isPro && subscription && ` • ${subscription.planId === 'pro-annual' ? 'Annual' : 'Monthly'}`}
                    {useMemoryStore && (
                      <span className="ml-1 text-xs opacity-70">🧠</span>
                    )}
                  </span>
                  {/* 开发环境下的调试按钮 */}
                  </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Transform Ideas into Actionable Plans
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 text-pretty max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900">
              An AI-powered project management tool that helps you organize tasks and create structured plans from natural language descriptions.
            </p>

            {/* AI Input Demo */}
            <div className="max-w-3xl mx-auto mb-8 animate-in fade-in zoom-in-95 duration-1000">
              <div className="bg-card border border-border rounded-xl p-6 shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={examplePrompts[currentExample]}
                      value={projectPrompt}
                      onChange={(e) => setProjectPrompt(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground text-base cursor-text transition-all hover:border-primary/50 resize-none min-h-[80px]"
                      aria-label="项目描述输入"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Enter your project description or use the placeholder examples</span>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                    aria-label={isGenerating ? "Generating..." : "Generate plan"}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Plan
                        <Zap className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transition-all hover:scale-105 hover:shadow-lg"
                onClick={() => {
                  // 滚动到AI输入区域
                  const aiInputSection = document.querySelector('.max-w-3xl.mx-auto.mb-8');
                  if (aiInputSection) {
                    aiInputSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Get Started
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Free plan includes Generate Plan • No login required • Upgrade for advanced features
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">AI-Powered Task Generation</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Our AI assistant helps break down your projects into manageable tasks using natural language processing. Simply describe your project, and we'll suggest a structured task list to get you started.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Natural language project descriptions</span>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Task breakdown with priority suggestions</span>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Project organization and categorization</span>
                    </li>
                  </ul>
              </div>
              <div className="relative order-1 md:order-2">
                <div className="rounded-xl overflow-hidden border border-border shadow-2xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                  <Image
                    src="/ai-neural-network-visualization-with-glowing-nodes.jpg"
                    alt="AI Technology Visualization"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Your AI Project Management Assistant
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Stop wasting time on planning. Let AI handle the heavy lifting while you focus on execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="feature-card bg-card border border-border rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Task Breakdown</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI analyzes your project description and generates comprehensive task lists with dependencies, priorities, and time estimates.
              </p>
            </div>

            <div className="feature-card bg-card border border-border rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Personalized Workflow Adaptation</h3>
              <p className="text-muted-foreground leading-relaxed">
                The system continuously learns your work rhythm and habits, intelligently adjusting task scheduling to match your personal energy cycles and time preferences.
              </p>
            </div>

            <div className="feature-card bg-card border border-border rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get AI-driven recommendations to optimize workflows, identify bottlenecks, and improve team productivity over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Watch Your Projects Come to Life
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Visualize every step of your project journey from concept to completion with AI-driven insights.
            </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <Image
                src="/modern-project-management-dashboard-with-ai-featur.jpg"
                alt="AI Project Management Dashboard"
                width={1200}
                height={600}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Start for free, upgrade as needed. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">3 projects</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">10 tasks per project</span>
                  </li>

                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Basic AI task generation</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Kanban view</span>
                  </li>
                </ul>
              <Button
                variant="outline"
                className="w-full bg-transparent hover:bg-card/20 transition-colors"
                onClick={() => {
                  // 滚动到AI输入区域
                  const aiInputSection = document.querySelector('.max-w-3xl.mx-auto.mb-8');
                  if (aiInputSection) {
                    aiInputSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Get Started - Free
              </Button>
            </div>

            <div className="bg-card border-2 border-accent rounded-xl p-8 relative transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$8</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="mt-1 text-accent font-medium">Annual Discount: $88/year</div>
              </div>
              <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">500 Projects & Unlimited Tasks</span>
                      <div className="text-xs text-muted-foreground ml-6">Create up to 500 projects and unlimited tasks</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Enhanced AI Task Generation</span>
                      <div className="text-xs text-muted-foreground ml-6">More detailed and comprehensive task breakdowns</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Advanced Project Views</span>
                      <div className="text-xs text-muted-foreground ml-6">Kanban boards, calendar views, and progress tracking</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Data Export & Backup</span>
                      <div className="text-xs text-muted-foreground ml-6">Export your projects and data for safekeeping</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Analytics Dashboard</span>
                      <div className="text-xs text-muted-foreground ml-6">Track your productivity and project progress</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Email Support</span>
                      <div className="text-xs text-muted-foreground ml-6">Get help with any questions within 24 hours</div>
                    </div>
                  </li>
                </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                asChild
              >
                <Link href="/pricing">
                  View All Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Perfect for Various Project Types
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Our AI-powered platform adapts to different industries and project management needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-accent">💻</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Software Development</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ideal for developers managing feature releases, bug tracking, sprint planning, and technical documentation with structured task breakdown.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Feature development tracking</li>
                <li>• Code review organization</li>
                <li>• Deployment timeline management</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-accent">✍️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Content Creation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Perfect for content creators managing editorial calendars, blog posts, video production schedules, and social media campaigns with deadline tracking.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Editorial calendar planning</li>
                <li>• Multi-platform content scheduling</li>
                <li>• Publication deadline management</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-accent">🎓</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Academic Research</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Designed for students and researchers organizing thesis work, literature reviews, experiment timelines, and collaborative academic projects.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Research milestone tracking</li>
                <li>• Literature review organization</li>
                <li>• Academic deadline management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
              🎯 Start your intelligent planning journey today
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900">
              Experience how AI-driven intelligent planning with GoTaskMind can transform your work and life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-1000">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                onClick={() => {
                  // 滚动到AI输入区域
                  const aiInputSection = document.querySelector('.max-w-3xl.mx-auto.mb-8');
                  if (aiInputSection) {
                    aiInputSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 任务预览对话框 */}
      <Dialog open={showTaskPreview} onOpenChange={setShowTaskPreview}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Task Preview</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-between px-1 py-2 mb-2">
            <button 
              onClick={handleSelectAllTasks}
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              {selectedTasks.length === generatedTasks.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-muted-foreground">
              已选择 {selectedTasks.length} / {generatedTasks.length} 个任务
            </span>
          </div>
          
          <div className="flex-1 overflow-auto p-1">
            {generatedTasks.map((task, index) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg mb-2 border ${selectedTasks.includes(task.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'}
                  transition-all cursor-pointer`}
                onClick={() => handleTaskSelect(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {selectedTasks.includes(task.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <span className="text-xs text-muted-foreground ml-2 font-mono bg-muted px-1 rounded">
                        {task.id}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* 优先级标签 */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                        {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                      {/* 分类标签 */}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.category === 'work'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : task.category === 'personal'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : task.category === 'learning'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                        {task.category === 'work' ? '工作' : task.category === 'personal' ? '个人' : task.category === 'learning' ? '学习' : '其他'}
                      </span>
                      {/* 时间预估标签 */}
                      {task.estimatedHours && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                          {task.estimatedHours}h
                        </span>
                      )}
                      {/* 能量级别标签 */}
                      {task.energyLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.energyLevel === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                            : task.energyLevel === 'medium'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
                            : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100'
                        }`}>
                          {task.energyLevel === 'high' ? '⚡ 高能量' : task.energyLevel === 'medium' ? '🔋 中能量' : '🌙 低能量'}
                        </span>
                      )}
                    </div>
                    {/* 依赖关系显示 */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">依赖: </span>
                        <span className="text-xs font-mono bg-muted px-1 rounded">
                          {task.dependencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter className="mt-auto border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setShowTaskPreview(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSelectedTasks} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              保存选中的任务
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-foreground">GoTaskMind</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </div>
              <p>
                © 2025 GoTaskMind. Focus on creation, and let AI handle the planning.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

