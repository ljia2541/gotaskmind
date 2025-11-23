import { NextRequest, NextResponse } from 'next/server'
import { getPendingSubscription, markSubscriptionProcessed } from '../../../lib/subscription-store'
import { getServerPendingSubscription, markServerSubscriptionProcessed, syncClientSubscriptions } from '../../../lib/server-subscription-store'
import { createClient } from '@/app/utils/supabase/server'

/**
 * 强制同步订阅API - 立即将订阅状态同步到前端
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, userId, clientData } = body

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: '缺少用户邮箱' },
        { status: 400 }
      )
    }

    console.log(`🔄 强制同步订阅: ${userEmail} (ID: ${userId})`)

    // 验证用户身份
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('❌ 用户未认证:', authError)
      return NextResponse.json(
        { success: false, error: '用户未认证' },
        { status: 401 }
      )
    }

    if (user.email !== userEmail) {
      console.log('❌ 邮箱不匹配')
      return NextResponse.json(
        { success: false, error: '邮箱不匹配' },
        { status: 403 }
      )
    }

    console.log('✅ 用户验证通过:', { userId: user.id, userEmail: user.email })

    // 如果客户端发送了数据，同步到服务端
    if (clientData) {
      console.log('📥 接收到客户端数据，开始同步...')
      try {
        const syncResult = await syncClientSubscriptions(request)
        console.log('🔄 客户端数据同步结果:', syncResult)

        // 同步完成后重新检查订阅
        if (syncResult.success && syncResult.count > 0) {
          pendingSubscription = getServerPendingSubscription(userEmail, userId)
          console.log('🔄 同步后重新检查，找到订阅:', pendingSubscription)
        }
      } catch (syncError) {
        console.error('❌ 客户端数据同步失败:', syncError)
      }
    }

    // 先尝试从服务端获取
    let pendingSubscription = getServerPendingSubscription(userEmail, userId)

    // 如果服务端没有，再从客户端获取
    if (!pendingSubscription) {
      console.log('🔍 服务端未找到订阅，尝试从客户端获取')
      pendingSubscription = getPendingSubscription(userEmail, userId)
    }

    if (pendingSubscription) {
      console.log('📋 找到待处理订阅:', pendingSubscription)

      // 构建响应订阅数据
      const subscriptionData = {
        planId: pendingSubscription.planId,
        status: pendingSubscription.status,
        orderId: pendingSubscription.orderId,
        activatedAt: pendingSubscription.activatedAt,
        expiresAt: pendingSubscription.expiresAt
      }

      console.log('💾 即将同步订阅数据:', subscriptionData)

      // 同时标记服务端和客户端的订阅为已处理
      markSubscriptionProcessed(userEmail, userId)
      markServerSubscriptionProcessed(userEmail, userId)

      console.log(`✅ 订阅已标记为处理: ${userEmail} (服务端+客户端)`)

      return NextResponse.json({
        success: true,
        message: '订阅同步成功',
        subscription: subscriptionData,
        planName: pendingSubscription.planId === 'pro-annual' ? 'Pro年度版' : 'Pro月度版',
        syncTime: new Date().toISOString()
      })

    } else {
      // 没有待处理订阅，检查用户是否已经激活了订阅
      console.log('ℹ️ 没有待处理订阅，检查是否需要创建激活状态')

      // 检查是否是用户首次激活
      const hasPaymentHistory = false // 这里可以添加支付历史检查

      if (!hasPaymentHistory) {
        console.log('📋 用户没有支付历史，无法自动激活')
        return NextResponse.json({
          success: false,
          message: '没有找到待处理的订阅，请先完成支付'
        })
      }

      return NextResponse.json({
        success: false,
        message: '没有待处理的订阅'
      })
    }

  } catch (error) {
    console.error('❌ 同步订阅失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '同步订阅失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}