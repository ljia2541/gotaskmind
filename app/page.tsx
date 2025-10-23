"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Zap, Users, BarChart3, Check, Loader2, Menu, X, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { useState, useEffect } from "react"
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
  const { login, isAuthenticated } = useAuth()
  // 获取用户语言偏好或使用默认语言（确保服务器端和客户端渲染一致性）
  const defaultLanguage = 'zh'; // 默认使用中文
  const userLanguage = typeof window !== 'undefined' ? (LanguageService.getUserLanguage() || defaultLanguage) : defaultLanguage;
  // 获取对应的翻译文本
  const translations = analyticsTranslations[userLanguage] || analyticsTranslations[defaultLanguage];
  const [isLoading, setIsLoading] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  // AI功能相关状态
  const [projectPrompt, setProjectPrompt] = useState('')
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([])
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
        // 为任务添加ID和必要属性，但不立即保存
        const tasksWithIds = data.tasks.map((task: any, index: number) => ({
          ...task,
          id: `ai-generated-${Date.now()}-${index}`,
          status: 'todo',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 默认7天后
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
    
    // 创建新项目 - 确保包含所有必要字段
    const projectTitle = projectPrompt.trim() || 'AI生成项目';
    const newProject = {
      id: `project-${Date.now()}`,
      title: projectTitle,
      description: `这是由AI根据描述"${projectTitle}"生成的项目`,
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Project Planning</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Transform Ideas into Actionable Plans
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 text-pretty max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900">
              Describe your project in natural language. Our AI instantly generates detailed task breakdowns, timelines, and team workflows.
            </p>

            {/* AI Input Demo */}
            <div className="max-w-3xl mx-auto mb-8 animate-in fade-in zoom-in-95 duration-1000">
              <div className="bg-card border border-border rounded-xl p-6 shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={examplePrompts[currentExample]}
                      value={projectPrompt}
                      onChange={(e) => setProjectPrompt(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground text-base h-12 cursor-text transition-all hover:border-primary/50"
                      aria-label="项目描述输入"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Enter your project description or use the placeholder examples</span>
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                    aria-label={isLoading ? "Generating..." : "Generate plan"}
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
              <Link href="/" passHref>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transition-all hover:scale-105 hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
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
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">AI Understands Your Vision</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Our advanced AI models analyze your project requirements to generate intelligent, context-aware plans that adapt to your team's workflow.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Natural language processing, intuitive input</span>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Intelligent task dependencies and timeline estimation</span>
                    </li>
                    <li className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/30 transition-colors">
                        <Sparkles className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Continuous learning of team work patterns</span>
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
              <h3 className="text-xl font-semibold text-foreground mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamlessly assign tasks, track progress, and communicate with your team in real-time through built-in collaboration tools.
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

      <section id="pricing" className="py-20 md:py-24">
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
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Up to 3 projects</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">20 tasks per project</span>
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
              <Button variant="outline" className="w-full bg-transparent hover:bg-card/20 transition-colors">
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
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">500 projects</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">500 tasks</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">500 team members</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Advanced AI deep insights</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Multiple views (Kanban, Timeline, Calendar)</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Custom integrations</span>
                  </li>
                </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={() => {
                  if (!isAuthenticated) {
                    login()
                  } else {
                    alert('恭喜！您已成功升级到专业版！')
                  }
                }}
              >
                {isAuthenticated ? 'Manage Subscription' : 'Upgrade to Pro'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              See how teams transform their workflows with AI-driven planning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-lg font-bold text-accent">Tech</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Tech Startup</div>
                    <div className="text-sm text-muted-foreground">San Francisco</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "GoTaskMind reduced our project planning time by 40% and improved team collaboration by 35%. 
                  The AI recommendations are remarkably accurate."
                </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-lg font-bold text-accent">Mktg</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Marketing Agency</div>
                    <div className="text-sm text-muted-foreground">New York</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "Managing multiple client projects has become effortless. The AI understands our workflow patterns and 
                  suggests optimal task sequences. Game-changer!"
                </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-lg font-bold text-accent">Prod</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Product Team</div>
                    <div className="text-sm text-muted-foreground">London</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "From concept to launch in record time. The smart task breakdown helped us identify dependencies 
                  we would have otherwise missed. Highly recommended!"
                </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
              Ready to Transform How You Work?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900">
              Join thousands of teams already using GoTaskMind's AI-driven platform for smarter planning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-1000">
              <Link href="/" passHref>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 任务预览对话框 */}
      <Dialog open={showTaskPreview} onOpenChange={setShowTaskPreview}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>任务预览</DialogTitle>
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
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
                        : task.priority === 'medium' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                        {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.category === 'work' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                        : task.category === 'personal' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : task.category === 'learning' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                        {task.category === 'work' ? '工作' : task.category === 'personal' ? '个人' : task.category === 'learning' ? '学习' : '其他'}
                      </span>
                    </div>
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
      <footer className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-foreground">GoTaskMind</span>
            </div>
            <p className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
              © 2025 GoTaskMind. Empowering teams with AI for the future of work.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

