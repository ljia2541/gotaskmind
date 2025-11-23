import { NextRequest, NextResponse } from 'next/server'
import { getPendingSubscription, markSubscriptionProcessed } from '../../../lib/subscription-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const userId = searchParams.get('userId')

    if (!userEmail) {
      return NextResponse.json(
        { error: '缺少用户邮箱' },
        { status: 400 }
      )
    }

    console.log(`检查用户 ${userEmail} (ID: ${userId}) 的待处理订阅`)

    // 检查是否有待处理的订阅 - 支持用户ID精确查找
    const pendingSubscription = getPendingSubscription(userEmail, userId || undefined)

    if (pendingSubscription) {
      console.log(`发现待处理订阅: ${userEmail} (ID: ${userId})`, pendingSubscription)

      // 重要：不要立即标记为已处理，让前端有机会接收数据
      // 延迟标记为已处理，给前端时间处理
      setTimeout(() => {
        markSubscriptionProcessed(userEmail, userId || undefined)
        console.log(`延迟标记订阅为已处理: ${userEmail}`)
      }, 5000) // 5秒后标记为已处理

      return NextResponse.json({
        success: true,
        hasPendingSubscription: true,
        subscription: pendingSubscription,
        message: '发现待处理的订阅升级',
        processed: false // 明确告诉前端还未处理
      })
    }

    return NextResponse.json({
      success: true,
      hasPendingSubscription: false,
      message: '没有待处理的订阅'
    })

  } catch (error) {
    console.error('检查待处理订阅失败:', error)
    return NextResponse.json(
      { error: '检查订阅失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, subscriptionData } = body

    if (!userEmail || !subscriptionData) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log(`手动激活用户 ${userEmail} 的订阅:`, subscriptionData)

    // 在实际应用中，这里会：
    // 1. 验证支付凭证
    // 2. 更新数据库中的用户订阅
    // 3. 发送确认通知

    return NextResponse.json({
      success: true,
      message: '订阅激活成功',
      subscription: subscriptionData
    })

  } catch (error) {
    console.error('激活订阅失败:', error)
    return NextResponse.json(
      { error: '激活订阅失败' },
      { status: 500 }
    )
  }
}