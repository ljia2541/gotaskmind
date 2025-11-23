import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

/**
 * 手动激活Pro订阅API端点
 * 用于紧急修复用户的订阅状态同步问题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔧 手动激活Pro订阅请求:', body)

    const { userEmail, planId, orderId } = body

    // 验证请求参数
    if (!userEmail) {
      console.log('❌ 缺少用户邮箱')
      return NextResponse.json(
        { success: false, error: '缺少用户邮箱' },
        { status: 400 }
      )
    }

    if (!planId || !['pro-monthly', 'pro-annual'].includes(planId)) {
      console.log('❌ 无效的计划ID:', planId)
      return NextResponse.json(
        { success: false, error: '无效的计划ID' },
        { status: 400 }
      )
    }

    // 验证用户身份（通过Supabase）
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('❌ 用户未认证:', authError)
      return NextResponse.json(
        { success: false, error: '用户未认证，请先登录' },
        { status: 401 }
      )
    }

    // 验证邮箱匹配
    if (user.email !== userEmail) {
      console.log('❌ 邮箱不匹配:', { userEmail, currentUserEmail: user.email })
      return NextResponse.json(
        { success: false, error: '邮箱不匹配' },
        { status: 403 }
      )
    }

    console.log('✅ 用户验证通过:', { userId: user.id, userEmail: user.email })

    // 创建订阅数据
    const now = new Date()
    const activatedAt = now.toISOString()
    const expiresAt = planId === 'pro-annual'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()  // 1月

    const subscription = {
      planId,
      status: 'active' as const,
      orderId: orderId || `manual_activate_${Date.now()}`,
      activatedAt,
      expiresAt,
      userId: user.id,
      userEmail: user.email
    }

    console.log('📝 创建订阅数据:', subscription)

    // 将订阅数据存储到pending subscriptions中，让自动升级系统处理
    try {
      const { addPendingSubscription } = await import('../../../lib/subscription-store')
      addPendingSubscription(userEmail, subscription)
      console.log('✅ 订阅已添加到待处理队列')
    } catch (storeError) {
      console.warn('⚠️ 无法存储到subscription-store，但继续处理:', storeError)
      // 即使存储失败也继续，因为主要逻辑在客户端
    }

    // 记录激活日志（用于审计）
    console.log('🎯 手动激活成功:', {
      userId: user.id,
      userEmail: user.email,
      planId,
      orderId: subscription.orderId,
      activatedAt,
      expiresAt,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Pro订阅手动激活成功',
      subscription,
      activationTime: activatedAt,
      expireTime: expiresAt,
      planName: planId === 'pro-annual' ? 'Pro年度版' : 'Pro月度版',
      nextStep: '请刷新页面查看效果，如果仍未显示，请点击页面上的"调试"按钮'
    })

  } catch (error) {
    console.error('❌ 手动激活Pro订阅失败:', error)

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