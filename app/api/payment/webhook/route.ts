import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { addPendingSubscription } from '../../../lib/subscription-store'

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET

// 验证Creem签名
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!CREEM_WEBHOOK_SECRET) {
      console.error('Creem webhook密钥未配置')
      return NextResponse.json(
        { error: 'Webhook配置错误' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('x-creem-signature')

    if (!signature) {
      console.error('缺少签名头')
      return NextResponse.json(
        { error: '缺少签名验证' },
        { status: 400 }
      )
    }

    // 验证签名
    if (!verifySignature(body, signature, CREEM_WEBHOOK_SECRET)) {
      console.error('签名验证失败')
      return NextResponse.json(
        { error: '签名验证失败' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    console.log('收到Creem webhook事件:', {
      type: event.type,
      id: event.id,
      created: event.created
    })

    // 处理不同类型的事件
    switch (event.type) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data)
        break

      default:
        console.log('未处理的事件类型:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook处理错误:', error)

    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(data: any) {
  console.log('处理支付完成事件:', {
    checkoutId: data.id,
    orderId: data.order?.id,
    customerId: data.customer,
    productId: data.product,
    metadata: data.metadata
  })

  // 更新用户订阅状态
  const userEmail = data.metadata?.userEmail || data.customer?.email || data.customer
  const userId = data.metadata?.userId
  const planId = data.metadata?.planId

  if ((userEmail || userId) && planId) {
    console.log(`开始自动升级用户订阅: ${userEmail || userId} -> ${planId}`)

    try {
      // 创建订阅信息
      const subscriptionData = {
        planId,
        status: 'active' as const,
        orderId: data.order?.id,
        activatedAt: new Date().toISOString(),
        expiresAt: planId === 'pro-annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      // 如果有userId，直接更新localStorage中的订阅信息
      if (userId) {
        console.log(`为用户ID ${userId} 更新订阅状态`)
        // 在实际应用中，这里会更新数据库
        // await updateUserSubscriptionInDatabase(userId, subscriptionData)
      }

      // 如果有userEmail，通过用户邮箱识别用户并更新订阅
      if (userEmail) {
        console.log(`为用户邮箱 ${userEmail} 更新订阅状态`)

        // 将订阅信息存储在待处理订阅存储中
        const pendingSubscription = {
          ...subscriptionData,
          userEmail,
          userId: userId || undefined,
          createdAt: new Date().toISOString(),
          processed: false
        }

        // 添加到待处理订阅存储
        addPendingSubscription(pendingSubscription)
        console.log('✅ 订阅信息已存储，等待用户访问时自动激活:', pendingSubscription)
      }

      console.log(`✅ 用户 ${userEmail || userId} 已自动升级到 ${planId}`)

      // 发送通知给用户（如果有SSE连接）
      try {
        const { broadcastNotification } = await import('./stream/route')
        const notificationData = {
          type: 'subscription_upgraded',
          title: '订阅升级成功',
          message: `恭喜您成功升级到${planId === 'pro-annual' ? '年度' : '月度'}Pro计划！`,
          fromUserId: 'system',
          fromUserName: 'GoTaskMind',
          toUserEmail: userEmail,
          metadata: {
            planId,
            orderId: data.order?.id,
            activatedAt: subscriptionData.activatedAt
          }
        }

        if (userEmail) {
          broadcastNotification(userEmail, notificationData)
        }
      } catch (notificationError) {
        console.log('通知发送失败，但订阅升级成功:', notificationError)
      }

    } catch (error) {
      console.error('自动升级订阅失败:', error)
      // 在实际应用中，这里应该记录错误并可能需要手动处理
    }
  } else {
    console.warn('支付完成事件缺少必要信息:', { userEmail, userId, planId, metadata: data.metadata })
  }
}

async function handlePaymentSucceeded(data: any) {
  console.log('处理支付成功事件:', data)
  // 处理支付成功的逻辑
}

async function handlePaymentFailed(data: any) {
  console.log('处理支付失败事件:', data)
  // 处理支付失败的逻辑，比如通知用户
}

async function handleSubscriptionCreated(data: any) {
  console.log('处理订阅创建事件:', data)
  // 处理订阅创建的逻辑
}

async function handleSubscriptionCanceled(data: any) {
  console.log('处理订阅取消事件:', data)
  // 处理订阅取消的逻辑，比如降级用户权限
}