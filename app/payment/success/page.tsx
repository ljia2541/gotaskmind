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
  const { user, updateSubscription, isAuthenticated, loginWithGoogle, isLoading } = useAuth()
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

    // 如果用户已登录且有邮箱，立即开始验证
    if (user && user.email) {
      console.log('✅ 用户已登录，开始验证支付:', { userEmail: user.email, sessionId, planId })
      // 清除之前的错误状态
      setError(null)
      setIsVerifying(true)
      // 延迟执行验证，确保用户状态完全稳定
      setTimeout(() => {
        verifyPayment()
      }, 500)
      return
    }

    // 如果用户正在加载中，显示加载状态
    if (isLoading) {
      console.log('⏳ 用户认证状态加载中...');
      return
    }

    // 如果用户未登录，显示登录提示，但不完全关闭验证流程
    console.log('⚠️ 用户未登录，等待用户登录...');
    setError('需要登录以验证支付状态。请使用您的账户登录以完成支付验证。');
    setIsVerifying(false)
  }, [sessionId, planId, user, isLoading]) // 添加user和isLoading依赖，确保状态变化时重新执行

  // 监听用户状态变化，确保登录时立即触发验证
  useEffect(() => {
    // 如果之前显示需要登录，但现在用户已经登录了，立即开始验证
    if (error && error.includes('需要登录') && user && user.email && sessionId) {
      console.log('🔄 检测到用户已登录，立即开始验证支付...')
      setError(null)
      setIsVerifying(true)
      setTimeout(() => {
        verifyPayment()
      }, 500)
    }
  }, [user, error, sessionId])

  const verifyPayment = async () => {
    try {
      console.log('🚀 开始支付验证请求...');

      // 再次检查用户状态，确保用户仍然登录
      const currentUser = user;
      if (!currentUser || !currentUser.email) {
        console.error('❌ 用户已注销或信息不完整');
        setError('用户信息不完整，请重新登录');
        setIsVerifying(false);
        return;
      }

      const requestData = {
        sessionId,
        planId,
        userEmail: currentUser.email,
        userId: currentUser.id
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
        if (data.data.subscription && user && user.id) {
          console.log('💾 保存用户订阅状态:', data.data.subscription)
          updateSubscription(data.data.subscription)

          // 立即保存到localStorage作为备份
          try {
            const subscriptionKey = `subscription_${user.id}`;
            localStorage.setItem(subscriptionKey, JSON.stringify(data.data.subscription));
            console.log('💾 订阅状态已保存到localStorage');
          } catch (error) {
            console.error('❌ 保存到localStorage失败:', error);
          }

          // 确保状态同步到所有组件
          [100, 500, 1000, 2000, 5000].forEach(delay => {
            setTimeout(() => {
              console.log(`🔄 延迟 ${delay}ms 确保订阅状态同步...`)

              // 1. 触发全局刷新
              window.dispatchEvent(new Event('storage'))

              // 2. 触发自定义订阅更新事件
              window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
                detail: {
                  subscription: data.data.subscription,
                  userId: user.id
                }
              }))

              // 3. 强制刷新订阅状态事件
              window.dispatchEvent(new CustomEvent('forceRefreshSubscription', {
                detail: { userId: user.id }
              }))

              // 4. 内存存储更新事件
              window.dispatchEvent(new CustomEvent('memoryStoreUpdated', {
                detail: { subscription: data.data.subscription, userId: user.id }
              }))

              // 5. 如果是最后一次延迟，检查状态是否正确同步
              if (delay === 5000) {
                setTimeout(() => {
                  console.log('🔍 最终状态检查:')
                  const storedSubscription = localStorage.getItem(`subscription_${user.id}`);
                  console.log('localStorage中的订阅数据:', storedSubscription);

                  // 如果localStorage中没有数据，再次尝试保存
                  if (!storedSubscription) {
                    console.log('⚠️ localStorage中无数据，重新保存...')
                    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(data.data.subscription));
                  }
                }, 100)
              }
            }, delay)
          })
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
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  需要登录验证
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => {
                      console.log('🔗 点击Google登录，准备返回支付页面');
                      // 保存当前页面信息到cookie，确保登录后返回
                      const encodedUrl = encodeURIComponent(window.location.href);
                      document.cookie = `auth_return_to=${encodedUrl}; path=/; max-age=600; SameSite=Lax`;
                      console.log('💾 已保存返回URL到cookie:', window.location.href);
                      // 跳转到Google登录
                      loginWithGoogle();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    使用 Google 登录
                  </Button>
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href="/pricing">
                      返回定价页面
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
                  <h3 className="text-lg font-semibold text-accent mb-3">Pro功能已解锁：</h3>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li>• 创建500个项目和无限任务</li>
                    <li>• 增强型AI任务生成</li>
                    <li>• 多种项目视图（看板、日历、智能安排）</li>
                    <li>• 数据分析仪表板</li>
                    <li>• 24小时内邮件支持</li>
                    <li>• 智能任务调度功能</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg">
                    <Link href="/tasks">
                      <Home className="w-4 h-4 mr-2" />
                      开始使用
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      console.log('=== 点击管理订阅按钮 ===')
                      console.log('用户信息:', {
                        hasUser: !!user,
                        userEmail: user?.email,
                        userId: user?.id,
                        timestamp: new Date().toISOString()
                      })

                      // 直接跳转，不使用复杂逻辑
                      window.location.href = '/settings/subscription'
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    管理订阅
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      console.log('🔄 手动强制刷新页面状态')
                      // 强制刷新整个页面
                      window.location.reload()
                    }}
                  >
                    🔄 强制刷新
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
              © 2025 GoTaskMind. 智启未来，赋能工作
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}