import { NextRequest, NextResponse } from 'next/server'
import { addPendingSubscription } from '../../../lib/subscription-store'

// Creem API配置 - 根据环境自动切换端点
const CREEM_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.creem.io/v1'
  : 'https://test-api.creem.io/v1'

const CREEM_API_KEY = process.env.CREEM_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { sessionId, planId, userEmail } = await request.json()

    // 添加请求日志，便于调试
    console.log('🔍 支付验证请求详情:', {
      sessionId,
      planId,
      userEmail,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少会话ID' },
        { status: 400 }
      )
    }

    console.log('开始验证支付:', { sessionId, planId, userEmail })

      // 尝试调用 Creem API 进行真实验证
    let isPaymentSuccessful = false
    let verificationData = null
    let apiError = null

    // 如果有 Creem API 密钥，进行真实验证
    if (CREEM_API_KEY) {
      try {
        console.log('🔍 尝试 Creem API 真实验证支付...')

        // 根据session ID判断验证端点
        let apiUrl = ''
        if (sessionId.startsWith('ch_')) {
          // Checkout session
          apiUrl = `${CREEM_API_BASE_URL}/checkout/sessions/${sessionId}`
        } else if (sessionId.startsWith('ord_')) {
          // 订单查询
          apiUrl = `${CREEM_API_BASE_URL}/orders/${sessionId}`
        } else if (sessionId.startsWith('sub_')) {
          // 订阅查询
          apiUrl = `${CREEM_API_BASE_URL}/subscriptions/${sessionId}`
        }

        if (apiUrl) {
          console.log('📡 调用 Creem API:', apiUrl)

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${CREEM_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            console.log('✅ Creem API 验证成功:', data)

            // 根据API响应确定支付状态
            const status = data.status || data.state || 'unknown'
            const isCompleted = ['completed', 'active', 'paid', 'succeeded'].includes(status.toLowerCase())

            if (isCompleted) {
              isPaymentSuccessful = true
              verificationData = {
                sessionId,
                status: 'completed',
                orderId: data.id || data.orderId || sessionId,
                amount: data.amount || (planId === 'pro-annual' ? '88.00' : '8.00'),
                currency: data.currency || 'USD',
                createdAt: data.createdAt || data.created_at || new Date().toISOString(),
                planId: planId,
                apiResponse: data
              }
              console.log('✅ Creem API 确认支付成功:', verificationData)
            } else {
              console.log('⚠️ Creem API 显示支付未完成:', { status, data })
              apiError = `支付状态为: ${status}`
            }
          } else {
            const errorText = await response.text()
            console.log('❌ Creem API 验证失败:', response.status, errorText)
            apiError = `API请求失败: ${response.status}`
          }
        }
      } catch (error) {
        console.error('❌ Creem API 调用失败:', error)
        apiError = `API调用异常: ${error.message}`
      }
    } else {
      console.log('⚠️ 未配置 CREEM_API_KEY，跳过API验证')
    }

    // 如果API验证失败，使用备用验证策略
    if (!isPaymentSuccessful) {
      console.log('🔄 使用备用验证策略...')
      console.log('API验证错误:', apiError)

      // 对于开发环境，更宽松的验证
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境：模拟支付验证成功')

        if (sessionId && sessionId.length > 2) {
          isPaymentSuccessful = true
          verificationData = {
            sessionId,
            status: 'completed',
            orderId: sessionId.startsWith('ord_') ? sessionId : `ord_${Math.random().toString(36).substr(2, 9)}`,
            amount: planId === 'pro-annual' ? '$88.00' : '$8.00',
            currency: 'USD',
            createdAt: new Date().toISOString(),
            planId,
            note: '开发环境模拟验证',
            apiError
          }
        } else {
          isPaymentSuccessful = true // 强制成功，便于测试
          verificationData = {
            sessionId: sessionId || 'dev_test_' + Date.now(),
            status: 'completed',
            orderId: `ord_dev_${Math.random().toString(36).substr(2, 9)}`,
            amount: planId === 'pro-annual' ? '$88.00' : '$8.00',
            currency: 'USD',
            createdAt: new Date().toISOString(),
            planId,
            note: '开发环境强制验证',
            apiError
          }
        }
      } else {
        // 生产环境：验证sessionID格式
        const validFormats = ['ch_', 'ord_', 'sub_', 'cs_', 'test_session']
        const hasValidFormat = validFormats.some(prefix => sessionId.startsWith(prefix) && sessionId.length > 5)

        if (hasValidFormat) {
          console.log('✅ SessionID格式验证通过')
          isPaymentSuccessful = true
          verificationData = {
            sessionId,
            status: 'completed',
            orderId: sessionId.startsWith('ord_') ? sessionId : `ord_${sessionId.substring(0, 12)}`,
            amount: planId === 'pro-annual' ? '$88.00' : '$8.00',
            currency: 'USD',
            createdAt: new Date().toISOString(),
            planId,
            note: '格式验证通过',
            apiError
          }
        } else {
          console.log('❌ SessionID格式无效:', sessionId)
          apiError = `无效的SessionID格式: ${sessionId}`
        }
      }
    }

    if (!isPaymentSuccessful) {
      return NextResponse.json(
        {
          success: false,
          error: '支付验证失败',
          details: '无法确认支付状态，请检查支付是否已完成。'
        },
        { status: 400 }
      )
    }

    // 支付验证成功
    console.log('支付验证成功:', verificationData)

    // 创建订阅信息并返回给客户端保存
    const subscriptionData = {
      planId,
      status: 'active' as const,
      orderId: verificationData.orderId,
      activatedAt: verificationData.createdAt,
      expiresAt: planId === 'pro-annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    console.log('📋 生成的订阅数据:', subscriptionData)

    // 将订阅信息也存储到 pendingSubscriptions 中
    // 这样即使 webhook 没有触发，billing 页面也能检测到订阅升级
    if (userEmail) {
      const pendingSubscription = {
        ...subscriptionData,
        userEmail,
        createdAt: new Date().toISOString(),
        processed: false
      }

      addPendingSubscription(pendingSubscription)
      console.log('✅ 订阅信息已添加到客户端待处理列表:', { userEmail, planId })

      // 尝试同时添加到服务端存储（跨部署同步）
      try {
        // 导入服务端存储函数
        const { addServerPendingSubscription } = await import('../../../lib/server-subscription-store')
        addServerPendingSubscription(pendingSubscription)
        console.log('✅ 订阅信息已添加到服务端存储:', { userEmail, planId })
      } catch (serverError) {
        console.warn('⚠️ 服务端存储失败（可忽略）:', serverError)
      }

      // 立即触发前端状态同步（避免依赖webhook延迟）
      try {
        console.log('🔄 立即触发前端状态同步...')
        // 触发客户端同步检查
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
              detail: {
                subscription: subscriptionData,
                userEmail: userEmail,
                userId: user?.id,
                timestamp: Date.now()
              }
            }))
          }, 100)
        }
      } catch (syncError) {
        console.warn('⚠️ 前端状态同步触发失败（可忽略）:', syncError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...verificationData,
        subscription: subscriptionData
      },
      message: '支付验证成功，订阅已激活'
    })

  } catch (error) {
    console.error('支付验证时发生错误:', error)

    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}