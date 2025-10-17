"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Users, BarChart3, Clock, Calendar, CheckCircle2, Settings, FileText, Database, Shield, Share2, Layers, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
// 暂时移除这些组件引用，避免可能的导入错误
// import { Logo } from "@/components/logo"
// import { DecorativeElements } from "@/components/decorative-elements"
import { Sparkles as SparklesIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X } from "lucide-react"

// 功能数据
const features = [
  {
    id: 1,
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: "Smart Task Breakdown",
    description: "AI analyzes your project description and generates comprehensive task lists with dependencies, priorities, and time estimates.",
    details: [
      "Natural language processing for intuitive input",
      "Automated dependency mapping between tasks",
      "Intelligent priority assignment based on project goals",
      "Realistic time estimates using historical data"
    ],
    image: "/ai-neural-network-visualization-with-glowing-nodes.jpg"
  },
  {
    id: 2,
    icon: <Users className="w-6 h-6 text-accent" />,
    title: "Team Collaboration",
    description: "Seamlessly assign tasks, track progress, and communicate with your team in real-time through built-in collaboration tools.",
    details: [
      "Real-time task assignment and reassignment",
      "Team member availability tracking",
      "In-app comments and discussions on tasks",
      "Notifications for task updates and deadlines"
    ],
    image: "/modern-project-management-dashboard-with-ai-featur.jpg"
  },
  {
    id: 3,
    icon: <BarChart3 className="w-6 h-6 text-accent" />,
    title: "Smart Insights",
    description: "Get AI-driven recommendations to optimize workflows, identify bottlenecks, and improve team productivity over time.",
    details: [
      "Performance analytics and visualization",
      "Predictive bottleneck identification",
      "Resource allocation optimization",
      "Productivity trend analysis"
    ],
    image: "/modern-project-management-dashboard-with-ai-featur.jpg"
  },
  {
    id: 4,
    icon: <Clock className="w-6 h-6 text-accent" />,
    title: "Smart Scheduling",
    description: "Automatically schedule tasks based on team availability, dependencies, and priority levels.",
    details: [
      "Intelligent calendar integration",
      "Time conflict detection and resolution",
      "Dynamic schedule adjustments",
      "Workload balancing across team members"
    ],
    image: "/modern-project-management-dashboard-with-ai-featur.jpg"
  },
  {
    id: 5,
    icon: <Database className="w-6 h-6 text-accent" />,
    title: "Data-Driven Decisions",
    description: "Leverage historical project data to make informed decisions about future projects and resource allocation.",
    details: [
      "Project performance benchmarking",
      "Resource utilization analysis",
      "Risk prediction and mitigation",
      "Customizable reporting dashboards"
    ],
    image: "/modern-project-management-dashboard-with-ai-featur.jpg"
  },
  {
    id: 6,
    icon: <Shield className="w-6 h-6 text-accent" />,
    title: "Enterprise Security",
    description: "Enterprise-grade security features to protect your project data and ensure compliance with industry standards.",
    details: [
      "Role-based access control",
      "Data encryption at rest and in transit",
      "Audit logging and activity tracking",
      "Compliance with GDPR, CCPA, and SOC2"
    ],
    image: "/modern-project-management-dashboard-with-ai-featur.jpg"
  }
]

export default function FeaturesPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 监听滚动事件，用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header 
        className={`bg-background transition-all duration-300 ${isScrolled ? 'py-2 shadow-sm' : 'py-4'}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tasks
            </Link>
            <Link href="/features" className="text-sm text-foreground font-medium transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Button variant="outline" size="sm" className="ml-2">
              Login
            </Button>
          </nav>
          
          {/* 移动端导航 */}
          <div className="md:hidden">
            <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[280px] sm:w-[350px] max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col gap-4 mt-6">
                  <Link 
                    href="/" 
                    className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/tasks" 
                    className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <Link 
                    href="/features" 
                    className="py-2 px-4 rounded-md bg-accent transition-colors text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    href="/#pricing" 
                    className="py-2 px-4 rounded-md hover:bg-accent transition-colors text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <div className="border-t border-border pt-4 mt-4">
                    <Button className="w-full">Login</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* 装饰性元素将在后续添加 */}
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Everything You Need to Succeed
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 text-pretty max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900">
              Discover how GoTaskMind's AI-powered features transform project management into a seamless, efficient experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transition-all hover:scale-105 hover:shadow-lg">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent transition-all hover:bg-accent/50">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Features Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {features.slice(0, 3).map((feature) => (
              <div 
                key={feature.id}
                className="feature-card bg-card border border-border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:translate-y-[-4px]"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all w-full sm:w-auto"
                >
                  Learn More
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {features.map((feature, index) => (
            <div key={feature.id} className={`mb-24 last:mb-0`}>
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className={index % 2 === 0 ? 'order-2 md:order-1' : 'order-1 md:order-1'}>
                  <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{feature.title}</h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    Learn More
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className={index % 2 === 0 ? 'order-1 md:order-2' : 'order-2 md:order-2'}>
                  <div className="rounded-xl overflow-hidden border border-border shadow-2xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              More Great Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Additional tools to enhance your project management experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Additional feature items */}
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Timeline View</h3>
              <p className="text-sm text-muted-foreground">Visualize your project schedule with interactive timelines.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Document Integration</h3>
              <p className="text-sm text-muted-foreground">Attach and collaborate on documents directly within tasks.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Share2 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Seamless Sharing</h3>
              <p className="text-sm text-muted-foreground">Share projects and reports with stakeholders easily.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Custom Templates</h3>
              <p className="text-sm text-muted-foreground">Create and reuse project templates for consistent workflows.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Customizable Workflows</h3>
              <p className="text-sm text-muted-foreground">Tailor workflows to match your team's specific processes.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Chat</h3>
              <p className="text-sm text-muted-foreground">Integrated chat for quick team communication and collaboration.</p>
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
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                Start Free
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent transform hover:scale-105 transition-all duration-300 hover:bg-accent/50">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-primary-foreground" />
              </div>
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