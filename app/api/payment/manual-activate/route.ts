import { NextRequest, NextResponse } from 'next/server'

/**
 * 手动激活订阅API - 用于修复订阅状态不同步问题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, planId, orderId } = body

    if (!userEmail || !planId) {
      return NextResponse.json(
        { error: '缺少必要参数: userEmail, planId' },
        { status: 400 }
      )
    }

    console.log('🔧 手动激活订阅请求:', { userEmail, planId, orderId })

    // 创建订阅数据
    const subscriptionData = {
      planId: planId,
      status: 'active',
      orderId: orderId || `manual_${Date.now()}`,
      activatedAt: new Date().toISOString(),
      expiresAt: planId === 'pro-annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // 将订阅数据存储到pending subscriptions中，让自动升级系统处理
    const { getPendingSubscription, addPendingSubscription, markSubscriptionProcessed } = await import('../../../lib/subscription-store')

    // 添加到待处理订阅队列
    addPendingSubscription(userEmail, subscriptionData)

    console.log('✅ 订阅已添加到待处理队列:', subscriptionData)

    return NextResponse.json({
      success: true,
      message: '订阅激活请求已提交，请刷新页面查看效果',
      subscription: subscriptionData
    })

  } catch (error) {
    console.error('❌ 手动激活订阅失败:', error)
    return NextResponse.json(
      { error: '激活订阅失败: ' + error.message },
      { status: 500 }
    )
  }
}