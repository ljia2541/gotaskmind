"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Crown,
  CreditCard,
  Calendar,
  RefreshCw,
  Settings,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { DecorativeElements } from "@/components/decorative-elements"
import { useAuth } from "@/app/hooks/use-auth"

export default function SubscriptionManagementPage() {
  const { user, subscription, isPro, isLoading: authLoading, updateSubscription, login } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // 检查认证状态，如果未登录则重定向到登录页
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      console.log('用户未登录，重定向到首页登录...')
      window.location.href = '/?redirectTo=' + encodeURIComponent('/settings/subscription')
    }
  }, [mounted, authLoading, user])

  // 自动同步订阅信息
  useEffect(() => {
    if (mounted && !authLoading && user && user.email) {
      console.log('🔄 开始自动同步订阅信息...')

      // 延迟执行，确保页面完全加载
      const autoSyncTimer = setTimeout(() => {
        autoSyncSubscription()
      }, 1000)

      return () => clearTimeout(autoSyncTimer)
    }
  }, [mounted, authLoading, user])

  // 自动同步函数
  const autoSyncSubscription = async (showNotifications = false) => {
    try {
      console.log('🚀 开始自动同步...')

      const response = await fetch('/api/payment/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user?.email,
          userId: user?.id
        })
      })

      const data = await response.json()
      console.log('📡 自动同步响应:', data)

      if (data.success && data.subscription) {
        // 自动更新订阅状态
        updateSubscription(data.subscription)

        // 保存到localStorage
        const subscriptionKey = `subscription_${user?.id}`
        localStorage.setItem(subscriptionKey, JSON.stringify(data.subscription))

        console.log('✅ 自动同步成功:', data.subscription)

        // 只有在手动操作时才显示通知
        if (showNotifications && data.message && !data.message.includes('正常')) {
          setTimeout(() => {
            alert(`🎉 订阅已同步！\n\n${data.planName} 已激活`)
          }, 200)
        }
      } else {
        console.log('ℹ️ 自动同步结果:', data.message || '无待处理订阅')

        // 手动操作时显示友好提示
        if (showNotifications && data.message && data.message.includes('没有找到待处理的订阅')) {
          alert('✅ 订阅状态正常\n\n当前没有待处理的订阅更新。')
        }
      }
    } catch (error) {
      console.error('❌ 自动同步失败:', error)
      // 静默失败，不显示错误给用户
    }
  }

  // 调试函数：检查订阅数据
  const checkSubscriptionData = () => {
    const info = {
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name
      } : null,
      subscription: subscription,
      isPro: isPro,
      localStorageData: null
    }

    // 检查localStorage
    if (user) {
      const subscriptionKey = `subscription_${user.id}`
      const storedData = localStorage.getItem(subscriptionKey)
      if (storedData) {
        try {
          info.localStorageData = JSON.parse(storedData)
        } catch (e) {
          info.localStorageData = `解析失败: ${e.message}`
        }
      }
    }

    setDebugInfo(info)
    console.log('=== 订阅调试信息 ===', info)
    return info
  }

  // 手动同步Pro订阅 - 主要激活方式
  const handleSyncSubscription = async () => {
    if (user && user.email) {
      console.log('🔄 手动同步Pro订阅...')
      // 调用自动同步函数，并显示通知
      await autoSyncSubscription(true)
    } else {
      alert('请先登录您的账户！')
    }
  }

  // 手动激活Pro订阅（备用方案）
  const handleManualActivatePro = async () => {
    if (user && user.email) {
      console.log('🔧 手动激活Pro订阅（备用方案）...')

      try {
        const response = await fetch('/api/payment/manual-activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            planId: 'pro-monthly',
            orderId: `manual_${Date.now()}`
          })
        })

        const data = await response.json()
        console.log('🔧 手动激活API响应:', data)

        if (data.success) {
          const manualSubscription = {
            planId: 'pro-monthly',
            status: 'active',
            orderId: data.subscription.orderId || `manual_${Date.now()}`,
            activatedAt: data.subscription.activatedAt || new Date().toISOString(),
            expiresAt: data.subscription.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }

          updateSubscription(manualSubscription)
          const subscriptionKey = `subscription_${user.id}`
          localStorage.setItem(subscriptionKey, JSON.stringify(manualSubscription))

          console.log('✅ Pro订阅已手动激活:', manualSubscription)

          const successMessage = `Pro订阅已激活（手动模式）！\n\n计划: ${data.planName || 'Pro月度版'}\n激活时间: ${new Date(data.activationTime || manualSubscription.activatedAt).toLocaleString()}\n到期时间: ${new Date(data.expireTime || manualSubscription.expiresAt).toLocaleString()}`

          alert(successMessage)

          // 立即更新状态，不需要重载
          setTimeout(() => {
            checkSubscriptionData()
          }, 100)

        } else {
          console.error('❌ 手动激活失败:', data.error)
          alert(`激活失败: ${data.error || '未知错误'}`)
        }

      } catch (error) {
        console.error('❌ 手动激活请求失败:', error)
        alert(`激活失败: ${error.message}`)
      }
    } else {
      alert('请先登录您的账户！')
    }
  }

  // 清除订阅数据
  const handleClearSubscription = () => {
    if (user) {
      const subscriptionKey = `subscription_${user.id}`
      localStorage.removeItem(subscriptionKey)
      console.log('🗑️ 已清除订阅数据')
      alert('订阅数据已清除，请刷新页面。')
      setDebugInfo(null)
    }
  }

  const handleRefresh = () => {
    console.log('🔄 手动刷新订阅状态...')

    // 快速调用自动同步
    if (user && user.email) {
      autoSyncSubscription()
    }

    // 立即更新状态
    setTimeout(() => {
      checkSubscriptionData()
    }, 100)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold mb-2">加载中...</h1>
            <p className="text-muted-foreground">正在获取您的订阅信息</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">需要登录</h1>
            <p className="text-muted-foreground mb-6">
              请登录您的账户以管理订阅
            </p>
            <Button asChild>
              <Link href="/api/auth/google">使用 Google 登录</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getPlanInfo = (planId: string) => {
    switch (planId) {
      case 'pro-monthly':
        return {
          name: 'Pro 月度版',
          price: '$8/月',
          period: '月付',
          savings: '0%',
          features: [
            '无限任务创建',
            '高级AI任务分解',
            '团队协作功能',
            '数据分析报告',
            '优先客服支持',
            '无广告体验'
          ]
        }
      case 'pro-annual':
        return {
          name: 'Pro 年度版',
          price: '$88/年',
          period: '年付',
          savings: '节省17%',
          features: [
            '无限任务创建',
            '高级AI任务分解',
            '团队协作功能',
            '数据分析报告',
            '优先客服支持',
            '无广告体验',
            '年度专属功能',
            '专属客户经理'
          ]
        }
      default:
        return {
          name: '免费版',
          price: '免费',
          period: '永久',
          savings: '0%',
          features: [
            '每月50个任务',
            '基础AI功能',
            '个人使用',
            '社区支持'
          ]
        }
    }
  }

  const currentPlan = getPlanInfo(subscription?.planId || 'free')
  const isAnnualPlan = subscription?.planId === 'pro-annual'

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-foreground">订阅管理</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                自动同步
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              快速刷新
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* 自动同步状态卡片 */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  ✓
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  <h3 className="font-semibold mb-1">自动同步已启用</h3>
                  <p>系统正在自动检测和同步您的订阅状态：</p>
                  <ul className="mt-2 space-y-1 text-green-700 dark:text-green-300">
                    <li>• ✅ 页面加载时自动检查支付状态</li>
                    <li>• ✅ 订阅信息实时同步更新</li>
                    <li>• ✅ 如需手动操作，可使用下方功能按钮</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">当前订阅计划</CardTitle>
                    <p className="text-sm text-muted-foreground">GoTaskMind {currentPlan.name}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 ${
                    isPro
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                      : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {subscription?.status === 'active' ? '✅ 活跃' :
                   subscription?.status === 'canceled' ? '⚠️ 已取消' :
                   subscription?.status === 'expired' ? '❌ 已过期' :
                   isPro ? '✅ Pro' : '免费'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{currentPlan.price}</div>
                    <div className="text-sm text-muted-foreground">{currentPlan.period}</div>
                  </div>
                  {isAnnualPlan && (
                    <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      {currentPlan.savings}
                    </Badge>
                  )}
                </div>

                {subscription && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">订单号</div>
                        <div className="font-mono font-medium">{subscription.orderId || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">开始时间</div>
                        <div className="font-medium">{subscription.activatedAt ?
                          new Date(subscription.activatedAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">到期时间</div>
                        <div className="font-medium">{subscription.expiresAt ?
                          new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">支付方式</div>
                        <div className="font-medium">Creem</div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleRefresh} variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新状态
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/pricing">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      更改计划
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                订阅操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {!isPro && (
                  <>
                    <Button
                      onClick={handleSyncSubscription}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                      data-sync-button
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      立即同步订阅
                    </Button>
                    <Button
                      onClick={handleManualActivatePro}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      手动激活Pro
                    </Button>
                  </>
                )}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/pricing">
                    查看定价计划
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/contact">
                    联系支持
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}