"use client"

import { Button } from "@/components/ui/button"
import { Check, Sparkles, Star, Zap, Shield, Headphones } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { AuthNavigation } from "@/app/components/auth-navigation"
import { useAuth } from "@/app/hooks/use-auth"
import { useState, useEffect } from "react"

export default function PricingPage() {
  const { loginWithGoogle, isAuthenticated, user, isPro, subscription } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // 处理支付逻辑的函数，提取出来以便重用
  const processPayment = async (planId: string, userId: string, userEmail: string) => {
    setLoadingPlan(planId)

    try {
      console.log('处理支付:', { planId, userId, userEmail })

      // 准备支付数据
      const paymentData = {
        planId,
        userId,
        userEmail
      }

      // 调用我们的API端点创建Creem支付会话
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // 重定向到Creem支付页面
        window.location.href = data.checkoutUrl
      } else {
        alert('支付初始化失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('支付错误:', error)
      alert('支付过程中出现错误，请重试。')
    } finally {
      setLoadingPlan(null)
    }
  }

  // 监听自动触发支付的事件
  useEffect(() => {
    const handleTriggerPurchase = async (event: CustomEvent) => {
      const { planId, user: userData } = event.detail
      console.log('收到自动支付触发事件:', { planId, userData })

      if (userData.id && userData.email) {
        await processPayment(planId, userData.id, userData.email)
      }
    }

    // 添加事件监听器
    window.addEventListener('triggerPurchase', handleTriggerPurchase as EventListener)

    // 清理事件监听器
    return () => {
      window.removeEventListener('triggerPurchase', handleTriggerPurchase as EventListener)
    }
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      // 保存购买意图到localStorage
      localStorage.setItem('pending_purchase', JSON.stringify({
        planId,
        timestamp: Date.now(),
        returnTo: '/pricing'
      }))

      loginWithGoogle()
      return
    }

    // 检查用户信息
    if (!user?.id || !user?.email) {
      console.error('用户信息不完整:', { id: user?.id, email: user?.email })
      alert('用户信息不完整，请重新登录')
      return
    }

    // 使用提取的支付处理函数
    await processPayment(planId, user.id, user.email)
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for individuals and small teams getting started',
      features: [
        'Up to 3 projects',
        '10 tasks per project',
        'Basic AI task generation',
        'Kanban view',
        'Email support',
      ],
      button: {
        text: subscription?.planId === 'free' ? 'Current Plan - Free' : 'Get Started - Free',
        variant: subscription?.planId === 'free' ? 'default' as const : 'outline' as const,
        action: () => window.location.href = '/',
        disabled: subscription?.planId === 'free'
      },
      popular: false
    },
    {
      id: 'pro-monthly',
      name: 'Pro',
      price: '$8',
      period: 'month',
      description: '500 projects with unlimited tasks and advanced AI features for professionals',
      features: [
        '500 projects',
        'Unlimited tasks',
        'Advanced AI deep insights',
        'Multiple views (Kanban, Timeline, Calendar)',
        'Priority support',
        'Custom integrations',
        'Advanced analytics',
      ],
      annualDiscount: null,
      button: {
        text: subscription?.planId === 'pro-monthly' ? 'Current Plan - Monthly' :
              subscription?.planId === 'pro-annual' ? 'Switch to Monthly' :
              isAuthenticated ? 'Upgrade to Pro' : 'Sign Up & Upgrade',
        variant: subscription?.planId === 'pro-monthly' ? 'default' as const : 'default' as const,
        action: () => subscription?.planId === 'pro-monthly' ? () => {} : handleUpgrade('pro-monthly'),
        disabled: subscription?.planId === 'pro-monthly'
      },
      popular: true
    },
    {
      id: 'pro-annual',
      name: 'Pro',
      price: '$88',
      period: 'year',
      description: 'Save 8% with annual billing - all Pro features included for teams',
      features: [
        'Everything in Pro monthly',
        'Annual billing discount',
        'Dedicated account manager',
        'Priority feature requests',
        'Custom onboarding',
        'Advanced security features',
      ],
      annualDiscount: 'Save $8/year',
      button: {
        text: subscription?.planId === 'pro-annual' ? 'Current Plan - Annual' :
              subscription?.planId === 'pro-monthly' ? 'Switch to Annual' :
              isAuthenticated ? 'Upgrade Annually' : 'Sign Up & Save',
        variant: subscription?.planId === 'pro-annual' ? 'default' as const : 'default' as const,
        action: () => subscription?.planId === 'pro-annual' ? () => {} : handleUpgrade('pro-annual'),
        disabled: subscription?.planId === 'pro-annual'
      },
      popular: false
    }
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Intelligent task generation and project breakdown powered by advanced AI'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee'
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: 'Get help when you need it with our dedicated support team'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth project management experience'
    }
  ]

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and various digital payment methods through our secure payment partner Creem.'
    },
    {
      question: 'Is there a free trial for Pro plans?',
      answer: 'While we don\'t offer a traditional free trial, our Free plan is fully functional and lets you explore all core features before upgrading.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time. Your Pro features will remain active until the end of your billing period.'
    },
    {
      question: 'Do you offer discounts for nonprofits or educational institutions?',
      answer: 'Yes, we offer special discounts for qualified nonprofits and educational institutions. Please contact our sales team for more information.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'All Pro plan purchases are final and non-refundable. However, we offer a 14-day evaluation period for new customers to assess our platform. During this period, customers may request a credit toward future services if they demonstrate comprehensive platform usage and provide detailed feedback. Credits are issued at our sole discretion and require meeting all evaluation criteria.'
    },
    {
      question: 'How do I request a service credit?',
      answer: 'Service credit requests require submission of a comprehensive evaluation report including: complete project documentation (minimum 15 projects with detailed task breakdowns), AI feature utilization analysis (minimum 20 AI generations with effectiveness metrics), integration implementation proof, and a 500-word detailed analysis of platform limitations. Email your complete evaluation report to 915715442@qq.com. Final determination within 10 business days.'
    }
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>

          {/* 认证导航 */}
          <AuthNavigation />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <DecorativeElements />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6">
              <Star className="w-4 h-4" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Start for free, upgrade as your team grows. No hidden fees, cancel anytime.
            </p>

            {isAuthenticated && subscription && (
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 ${
                isPro
                  ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                <Check className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-semibold">
                    Current Plan: {isPro ? 'Pro' : 'Free'}
                    {isPro && ` (${subscription.planId === 'pro-annual' ? 'Annual' : 'Monthly'})`}
                  </div>
                  <div className="text-xs opacity-75">
                    {isPro ? 'All Pro features active' : 'Upgrade to unlock premium features'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required for Free plan</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>All sales final</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card border rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] ${
                  plan.popular
                    ? 'border-2 border-accent shadow-xl'
                    : 'border-border hover:border-primary/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.annualDiscount && (
                    <div className="text-accent font-medium text-sm">{plan.annualDiscount}</div>
                  )}
                  <p className="text-muted-foreground mt-4">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.button.variant}
                  className="w-full"
                  onClick={plan.button.action}
                  disabled={loadingPlan === plan.id || plan.button.disabled}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    plan.button.text
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Why Choose GoTaskMind Pro?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Unlock powerful features that help your team achieve more, faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Got questions? We've got answers.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Join thousands of teams already using GoTaskMind to streamline their project management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
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
              </div>
              <p>
                © 2025 GoTaskMind. Empowering teams with AI for the future of work.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}