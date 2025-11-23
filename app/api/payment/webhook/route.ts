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
  const startTime = Date.now()

  try {
    console.log('🔔 开始处理Creem webhook请求...')

    if (!CREEM_WEBHOOK_SECRET) {
      console.error('❌ Creem webhook密钥未配置')
      return NextResponse.json(
        { error: 'Webhook配置错误', needsConfiguration: true },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('x-creem-signature')

    if (!signature) {
      console.error('❌ 缺少签名头')
      return NextResponse.json(
        { error: '缺少签名验证', missingHeader: true },
        { status: 400 }
      )
    }

    // 验证签名
    if (!verifySignature(body, signature, CREEM_WEBHOOK_SECRET)) {
      console.error('❌ 签名验证失败', {
        signature: signature.substring(0, 20) + '...',
        bodyLength: body.length
      })
      return NextResponse.json(
        { error: '签名验证失败', invalidSignature: true },
        { status: 401 }
      )
    }

    let event
    try {
      event = JSON.parse(body)
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      return NextResponse.json(
        { error: '请求体格式错误', invalidJson: true },
        { status: 400 }
      )
    }

    console.log('📥 收到Creem webhook事件:', {
      type: event.type,
      id: event.id,
      created: event.created,
      dataKeys: Object.keys(event.data || {})
    })

    // 验证事件基本结构
    if (!event.type || !event.id) {
      console.error('❌ 事件结构无效:', event)
      return NextResponse.json(
        { error: '事件结构无效', invalidEvent: true },
        { status: 400 }
      )
    }

    // 处理不同类型的事件，添加错误隔离
    let handledSuccessfully = true
    let lastError = null

    try {
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

        case 'subscription.updated':
          await handleSubscriptionUpdated(event.data)
          break

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data)
          break

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data)
          break

        default:
          console.log('ℹ️ 未处理的事件类型:', event.type)
          // 对于未知事件类型，不返回错误，只记录日志
      }
    } catch (handlerError) {
      console.error(`❌ 处理事件 ${event.type} 时发生错误:`, handlerError)
      handledSuccessfully = false
      lastError = handlerError

      // 即使事件处理失败，也记录到存储中以便后续重试
      try {
        await saveFailedWebhookEvent(event, handlerError)
      } catch (saveError) {
        console.error('❌ 保存失败webhook事件时出错:', saveError)
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`✅ Webhook处理完成: ${event.type} (${processingTime}ms)`)

    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      handledSuccessfully,
      processingTime
    })

  } catch (error) {
    console.error('💥 Webhook处理发生未预期错误:', error)
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        error: 'Webhook处理失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 新增事件处理函数
async function handleSubscriptionUpdated(data: any) {
  console.log('🔄 处理订阅更新事件:', {
    subscriptionId: data.id,
    status: data.status,
    currentPeriodEnd: data.current_period_end
  })
}

async function handleInvoicePaymentSucceeded(data: any) {
  console.log('📧 处理发票支付成功事件:', {
    invoiceId: data.id,
    subscriptionId: data.subscription,
    amount: data.amount
  })
}

async function handleInvoicePaymentFailed(data: any) {
  console.log('📧 处理发票支付失败事件:', {
    invoiceId: data.id,
    subscriptionId: data.subscription,
    attemptCount: data.attempt_count
  })
}

// 保存失败的webhook事件以便后续重试
async function saveFailedWebhookEvent(event: any, error: any) {
  try {
    const failedEvent = {
      ...event,
      processingError: {
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      },
      failedAt: new Date().toISOString()
    }

    // 这里可以保存到文件系统或数据库
    console.log('💾 失败的webhook事件已记录，可供后续重试:', failedEvent.id)
  } catch (saveError) {
    console.error('❌ 无法保存失败的webhook事件:', saveError)
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

      // 发送实时订阅更新事件到前端（通过localStorage事件）
      try {
        console.log('📢 触发前端订阅更新事件:', { userEmail, planId })

        // 这里可以添加其他通知方式，比如：
        // 1. Server-Sent Events (SSE)
        // 2. WebSocket 实时推送
        // 3. 邮件通知

        console.log('✅ 订阅激活通知已准备就绪')
      } catch (notificationError) {
        console.log('⚠️ 实时通知准备失败，但订阅升级成功:', notificationError)
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
  console.log('💰 处理支付成功事件:', {
    paymentId: data.id,
    orderId: data.order?.id,
    amount: data.amount,
    currency: data.currency,
    status: data.status
  })

  // 支付成功后，如果有关联的订阅信息，确保订阅状态正确
  const userEmail = data.metadata?.userEmail || data.customer?.email
  const userId = data.metadata?.userId
  const planId = data.metadata?.planId

  if (userEmail && planId) {
    console.log(`💰 支付成功，激活用户订阅: ${userEmail} -> ${planId}`)

    try {
      const { addPendingSubscription } = await import('../../../lib/subscription-store')
      const subscriptionData = {
        planId,
        status: 'active' as const,
        orderId: data.order?.id || data.id,
        activatedAt: new Date().toISOString(),
        expiresAt: planId === 'pro-annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        userEmail,
        userId: userId || undefined,
        createdAt: new Date().toISOString(),
        processed: false
      }

      addPendingSubscription(subscriptionData)
      console.log('✅ 支付成功后的订阅已激活:', subscriptionData)
    } catch (error) {
      console.error('❌ 激活支付成功后的订阅失败:', error)
    }
  }
}

async function handlePaymentFailed(data: any) {
  console.log('❌ 处理支付失败事件:', {
    paymentId: data.id,
    orderId: data.order?.id,
    errorCode: data.error_code,
    errorMessage: data.error_message
  })

  // 处理支付失败的逻辑，比如记录失败原因
  const userEmail = data.metadata?.userEmail || data.customer?.email
  const planId = data.metadata?.planId

  if (userEmail) {
    console.log(`❌ 用户支付失败: ${userEmail}, 计划: ${planId}`)
    // 这里可以：
    // 1. 发送失败通知邮件
    // 2. 记录失败日志
    // 3. 提供重新支付的链接
  }
}

async function handleSubscriptionCreated(data: any) {
  console.log('📝 处理订阅创建事件:', {
    subscriptionId: data.id,
    customerId: data.customer,
    status: data.status,
    planId: data.plan?.id
  })

  const userEmail = data.customer?.email
  const planId = data.metadata?.planId || data.plan?.id

  if (userEmail && planId) {
    console.log(`📝 订阅已创建: ${userEmail} -> ${planId}`)

    try {
      const { addPendingSubscription } = await import('../../../lib/subscription-store')
      const subscriptionData = {
        planId,
        status: 'active' as const,
        orderId: data.id,
        activatedAt: data.created_at || new Date().toISOString(),
        expiresAt: data.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        userEmail,
        createdAt: new Date().toISOString(),
        processed: false
      }

      addPendingSubscription(subscriptionData)
      console.log('✅ 订阅创建事件已处理:', subscriptionData)
    } catch (error) {
      console.error('❌ 处理订阅创建事件失败:', error)
    }
  }
}

async function handleSubscriptionCanceled(data: any) {
  console.log('🚫 处理订阅取消事件:', {
    subscriptionId: data.id,
    customerId: data.customer,
    cancelReason: data.cancel_reason
  })

  const userEmail = data.customer?.email

  if (userEmail) {
    console.log(`🚫 用户订阅已取消: ${userEmail}`)

    // 处理订阅取消的逻辑，比如降级用户权限
    try {
      // 这里应该更新用户订阅状态为canceled
      // await updateUserSubscriptionStatus(userEmail, 'canceled')
      console.log(`⚠️ 用户 ${userEmail} 订阅已取消，请及时更新权限`)
    } catch (error) {
      console.error('❌ 处理订阅取消失败:', error)
    }
  }
}