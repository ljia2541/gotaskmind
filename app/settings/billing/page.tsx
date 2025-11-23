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
  const { user, subscription, isPro, updateSubscription, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 简单的挂载检查
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // 简单的刷新函数，不调用复杂的API
  const handleRefresh = () => {
    window.location.reload()
  }

  // 如果还没挂载，显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 显示加载状态
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

  // 显示未登录状态
  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">需要登录</h1>
            <p className="text-muted-foreground mb-6">
              请登录您的账户以访问账单和订阅管理
            </p>
            <div className="space-y-4">
              <div className="text-sm text-orange-600 bg-orange-50 p-4 rounded-lg max-w-md mx-auto">
                <strong>提示：</strong> 如果您刚刚完成支付，请等待几秒钟让系统同步您的订阅状态，然后重新登录。
              </div>
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

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg text-foreground">GoTaskMind</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新页面
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks">
                返回应用
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-background">
        <DecorativeElements />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto">

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                订阅管理
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                管理您的 GoTaskMind 订阅和付费功能
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* 当前订阅状态 */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      当前订阅状态
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

                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" onClick={handleRefresh} className="flex-1">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              刷新状态
                            </Button>
                            <Button variant="outline" asChild className="flex-1">
                              <Link href="/pricing">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                更改计划
                              </Link>
                            </Button>
                          </div>
                        </div>
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
                            onClick={handleRefresh}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新状态
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 简化的帮助信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      帮助与支持
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <p>
                        如果您刚刚完成支付，请等待几分钟让系统同步您的订阅状态，然后点击"刷新状态"按钮。
                      </p>
                      <p>
                        如果长时间未显示正确的订阅状态，请联系我们的客服团队。
                      </p>
                      <div className="pt-3">
                        <Button variant="outline" asChild>
                          <a href="mailto:ljia2541@gmail.com">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            联系客服
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>账户信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">邮箱地址</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">姓名</div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">账户ID</div>
                      <div className="font-mono text-xs">{user.id}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/pricing">
                        <CreditCard className="w-4 h-4 mr-2" />
                        查看定价方案
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/tasks">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        返回应用
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}