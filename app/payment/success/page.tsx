"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Home, Settings } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { useAuth } from "@/app/hooks/use-auth"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const { user, updateSubscription } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationData, setVerificationData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Creem返回的实际会话ID在checkout_id参数中，session_id是模板字符串
  const sessionId = searchParams.get('checkout_id') || searchParams.get('session_id')
  const planId = searchParams.get('plan_id')

  useEffect(() => {
    console.log('=== 支付成功页面调试信息 ===');
    console.log('URL参数:', {
      sessionId,
      planId,
      allParams: Object.fromEntries(searchParams.entries())
    });
    console.log('用户信息:', {
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      isAuthenticated: !!user
    });

    if (!sessionId) {
      console.error('❌ 缺少支付会话信息');
      setError('缺少支付会话信息')
      setIsVerifying(false)
      return
    }

    // 等待用户信息加载完成
    if (!user || !user.email) {
      console.log('⏳ 等待用户信息加载...', {
        hasUser: !!user,
        hasEmail: !!user?.email,
        userId: user?.id
      });

      // 如果5秒后用户信息还是没有加载，显示错误
      const timeout = setTimeout(() => {
        if (!user || !user.email) {
          console.error('❌ 用户信息加载超时');
          setError('用户信息加载失败，请刷新页面重试');
          setIsVerifying(false);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }

    console.log('✅ 用户信息已加载，开始验证支付:', { userEmail: user.email, sessionId, planId })
    verifyPayment()
  }, [sessionId, user, searchParams])

  const verifyPayment = async () => {
    try {
      console.log('🚀 开始支付验证请求...');
      const requestData = {
        sessionId,
        planId,
        userEmail: user?.email
      };
      console.log('请求数据:', requestData);

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('📡 支付验证响应状态:', response.status);
      const data = await response.json()
      console.log('📡 支付验证响应数据:', data);

      if (data.success) {
        console.log('✅ 支付验证成功');
        setVerificationData(data.data)

        // 保存订阅状态
        if (data.data.subscription && user) {
          console.log('💾 保存用户订阅状态:', data.data.subscription)
          updateSubscription(data.data.subscription)

          // 确保状态同步到所有组件
          setTimeout(() => {
            console.log('🔄 确保订阅状态同步...')
            // 触发全局刷新
            window.dispatchEvent(new Event('storage'))
          }, 500)
        }
      } else {
        console.error('❌ 支付验证失败:', data);
        setError(data.error || '支付验证失败')
      }
    } catch (error) {
      console.error('❌ 支付验证错误:', error)
      setError('支付验证过程中发生错误')
    } finally {
      setIsVerifying(false)
    }
  }

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'pro-monthly':
        return 'Pro Monthly'
      case 'pro-annual':
        return 'Pro Annual'
      default:
        return 'Pro Plan'
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-background">
        <DecorativeElements />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl mx-auto text-center">

            {isVerifying ? (
              // 验证中状态
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-accent animate-spin" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  验证支付状态...
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  我们正在确认您的支付信息，请稍候。
                </p>

                {/* 手动重试按钮 */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    如果验证时间过长，您可以手动重试：
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('🔄 手动重试支付验证');
                      setError(null);
                      setIsVerifying(true);
                      verifyPayment();
                    }}
                    disabled={!user || !user.email}
                  >
                    手动重试验证
                  </Button>
                  {!user || !user.email ? (
                    <p className="text-xs text-red-500">
                      用户信息加载中，请稍后再试...
                    </p>
                  ) : null}
                </div>
              </div>
            ) : error ? (
              // 错误状态
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  支付验证失败
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild>
                    <Link href="/pricing">
                      返回定价页面
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">
                      联系支持
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              // 成功状态
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  支付成功！
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  恭喜您成功升级到 <span className="font-semibold text-accent">{getPlanName(planId || '')}</span>！
                </p>

                {/* 订阅激活成功提示 */}
                <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800 dark:text-green-200">订阅已激活</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        您的Pro功能已立即生效，可以返回首页查看更新状态。
                      </p>
                    </div>
                  </div>
                </div>

                {verificationData && (
                  <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
                    <h2 className="text-xl font-semibold text-foreground mb-4">订单详情</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">订单ID:</span>
                        <span className="font-mono">{verificationData.orderId || sessionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">计划:</span>
                        <span>{getPlanName(planId || '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">支付金额:</span>
                        <span>{verificationData.amount || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">支付时间:</span>
                        <span>{verificationData.createdAt || new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-accent mb-3">接下来您可以：</h3>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li>• 创建无限项目</li>
                    <li>• 添加无限团队成员</li>
                    <li>• 使用高级AI功能</li>
                    <li>• 享受优先支持服务</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg">
                    <Link href="/tasks">
                      <Home className="w-4 h-4 mr-2" />
                      开始使用
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/settings/billing">
                      <Settings className="w-4 h-4 mr-2" />
                      管理订阅
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-foreground">GoTaskMind</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 GoTaskMind. Empowering teams with AI for the future of work.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}