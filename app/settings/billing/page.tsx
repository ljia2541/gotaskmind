"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  CreditCard,
  Calendar,
  RefreshCw,
  Settings,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { useAuth } from "@/app/hooks/use-auth"

export default function BillingSettingsPage() {
  const { user, subscription, isPro, updateSubscription, isLoading: authLoading, forceRefreshSubscription } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUpgrade, setIsCheckingUpgrade] = useState(false)

  // 检查待处理的订阅升级 - 必须在所有条件返回之前定义
  const checkPendingUpgrade = async () => {
    if (!user || !user.email) return

    setIsCheckingUpgrade(true)
    try {
      console.log('🔍 检查待处理的订阅升级...')
      const response = await fetch(`/api/payment/auto-upgrade?userEmail=${encodeURIComponent(user.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📡 自动升级API响应:', data)

        if (data.success && data.hasPendingSubscription && data.subscription) {
          console.log('🎉 发现待处理订阅，自动应用升级:', data.subscription)

          // 自动应用订阅升级
          const newSubscription = {
            planId: data.subscription.planId,
            status: data.subscription.status,
            orderId: data.subscription.orderId,
            activatedAt: data.subscription.activatedAt,
            expiresAt: data.subscription.expiresAt
          }

          updateSubscription(newSubscription)
          console.log(`✅ 用户已自动升级到 ${data.subscription.planId}`)

          // 显示成功消息
          alert(`恭喜！您的订阅已自动升级到 ${data.subscription.planId === 'pro-annual' ? '年度' : '月度'} Pro 计划！`)
        } else {
          console.log('ℹ️ 无待处理订阅升级')
        }
      }
    } catch (error) {
      console.error('❌ 检查待处理订阅失败:', error)
    } finally {
      setIsCheckingUpgrade(false)
    }
  }

  // 页面加载时检查待处理的订阅升级
  useEffect(() => {
    if (user && user.email && !authLoading) {
      // 延迟检查，确保认证状态已稳定
      const timer = setTimeout(() => {
        checkPendingUpgrade()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user, authLoading])

  // 显示加载状态，避免认证状态不一致导致的访问问题
  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold mb-2">验证身份中...</h1>
            <p className="text-muted-foreground">请稍候，正在确认您的登录状态</p>
          </div>
        </div>
      </div>
    )
  }

  // 显示未登录状态，提供清晰的登录指引
  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">需要登录</h1>
            <p className="text-muted-foreground mb-6">
              请登录您的账户以访问账单和订阅管理
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/api/auth/google">使用 Google 登录</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'pro-monthly':
        return 'Pro Monthly'
      case 'pro-annual':
        return 'Pro Annual'
      default:
        return 'Free Plan'
    }
  }

  const getPlanPrice = (planId: string) => {
    switch (planId) {
      case 'pro-monthly':
        return '$8/month'
      case 'pro-annual':
        return '$88/year'
      default:
        return 'Free'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'canceled':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'expired':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setIsLoading(true)
    try {
      // 这里应该调用API取消订阅
      // 目前只是模拟取消操作
      const canceledSubscription = {
        ...subscription,
        status: 'canceled' as const
      }
      updateSubscription(canceledSubscription)

      // 显示成功消息
      alert('订阅已取消，您将在当前计费周期结束后失去Pro功能')
    } catch (error) {
      console.error('取消订阅失败:', error)
      alert('取消订阅失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return

    setIsLoading(true)
    try {
      // 这里应该调用API重新激活订阅
      // 目前只是模拟重新激活操作
      const reactivatedSubscription = {
        ...subscription,
        status: 'active' as const
      }
      updateSubscription(reactivatedSubscription)

      // 显示成功消息
      alert('订阅已重新激活！')
    } catch (error) {
      console.error('重新激活订阅失败:', error)
      alert('重新激活订阅失败，请稍后重试')
    } finally {
      setIsLoading(false)
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
          <Button variant="outline" asChild>
            <Link href="/tasks">
              返回应用
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-background">
        <DecorativeElements />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto">

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                账单与订阅管理
              </h1>
              <p className="text-lg text-muted-foreground">
                管理您的GoTaskMind订阅和支付信息
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* 当前订阅状态 */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      当前订阅
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {getPlanName(subscription.planId)}
                            </h3>
                            <p className="text-muted-foreground">
                              {getPlanPrice(subscription.planId)}
                            </p>
                          </div>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status === 'active' ? '活跃' :
                             subscription.status === 'canceled' ? '已取消' :
                             subscription.status === 'expired' ? '已过期' : subscription.status}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">订单ID</div>
                            <div className="font-mono">{subscription.orderId || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">激活时间</div>
                            <div>{subscription.activatedAt ?
                              new Date(subscription.activatedAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">下次续费</div>
                            <div>{subscription.expiresAt ?
                              new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">支付方式</div>
                            <div>Creem 支付</div>
                          </div>
                        </div>

                        <Separator />

                        {/* 订阅操作 */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            {subscription.status === 'active' ? (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelSubscription}
                                  disabled={isLoading || subscription.planId === 'free'}
                                  className="flex-1"
                                >
                                  {isLoading ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      处理中...
                                    </>
                                  ) : (
                                    <>
                                      <Settings className="w-4 h-4 mr-2" />
                                      取消订阅
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" asChild className="flex-1">
                                  <Link href="/pricing">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    更改计划
                                  </Link>
                                </Button>
                              </>
                            ) : subscription.status === 'canceled' ? (
                              <Button
                                onClick={handleReactivateSubscription}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                {isLoading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    处理中...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    重新激活
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button asChild className="flex-1">
                                <Link href="/pricing">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  升级订阅
                                </Link>
                              </Button>
                            )}
                          </div>

                          {/* 刷新订阅状态按钮 */}
                          <Button
                            variant="ghost"
                            onClick={checkPendingUpgrade}
                            disabled={isCheckingUpgrade}
                            className="w-full"
                            size="sm"
                          >
                            {isCheckingUpgrade ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                检查订阅更新中...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                刷新订阅状态
                              </>
                            )}
                          </Button>
                        </div>

                        {subscription.status === 'canceled' && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                              <div>
                                <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                  订阅已取消
                                </div>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                  您仍可在 {subscription.expiresAt ?
                                    new Date(subscription.expiresAt).toLocaleDateString() : '计费周期结束前'}
                                  使用Pro功能，之后将自动降级为Free计划。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground mb-4">
                          您当前使用的是免费计划
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button asChild>
                            <Link href="/pricing">
                              <CreditCard className="w-4 h-4 mr-2" />
                              升级到Pro
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={checkPendingUpgrade}
                            disabled={isCheckingUpgrade}
                          >
                            {isCheckingUpgrade ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                检查中...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                检查订阅状态
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 账单历史 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      账单历史
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>暂无账单历史记录</p>
                      <p className="text-sm mt-2">您的支付历史将在这里显示</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 侧边栏 */}
              <div className="space-y-6">
                {/* 账单信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>账单信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">邮箱</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">用户名</div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">用户ID</div>
                      <div className="font-mono text-xs">{user.id}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 快速操作 */}
                <Card>
                  <CardHeader>
                    <CardTitle>快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/pricing">
                        <CreditCard className="w-4 h-4 mr-2" />
                        查看定价
                      </Link>
                    </Button>
                                        <Button variant="outline" asChild className="w-full justify-start">
                      <a href="mailto:ljia2541@gmail.com">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        联系支持
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                
                {/* Pro功能预览 */}
                {isPro && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pro功能</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>无限项目</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>无限任务</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>无限团队成员</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>高级AI功能</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>优先支持</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* 底部链接 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                服务条款
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                隐私政策
              </Link>
              <span>•</span>
              <a href="mailto:ljia2541@gmail.com" className="hover:text-foreground transition-colors">
                联系支持
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}