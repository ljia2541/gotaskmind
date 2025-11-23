import { NextRequest, NextResponse } from 'next/server'

// Creem API配置
const CREEM_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.creem.io/v1/checkouts'
  : 'https://test-api.creem.io/v1/checkouts'

const CREEM_API_KEY = process.env.CREEM_API_KEY || 'creem_33WTOGfUg1IMQoQPFIvMTP'

// 产品ID映射 - 生产环境硬编码回退值，确保配置问题不影响使用
const PRODUCT_IDS = {
  'pro-monthly': process.env.CREEM_PRO_MONTHLY_PRODUCT_ID || 'prod_2fiELTk7VFJsNWOFXfJQfN',
  'pro-annual': process.env.CREEM_PRO_ANNUAL_PRODUCT_ID || 'prod_2Fz0Z1lWPSXICGhhY6Hh23'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('收到支付请求:', body)

    const { planId, userId, userEmail } = body

    // 验证请求参数 - 详细检查每个参数
    if (!planId) {
      console.log('缺少 planId:', { planId, userId, userEmail })
      return NextResponse.json(
        { success: false, error: '缺少计划ID (planId)' },
        { status: 400 }
      )
    }

    if (!userId) {
      console.log('缺少 userId:', { planId, userId, userEmail })
      return NextResponse.json(
        { success: false, error: '缺少用户ID (userId)' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      console.log('缺少 userEmail:', { planId, userId, userEmail })
      return NextResponse.json(
        { success: false, error: '缺少用户邮箱 (userEmail)' },
        { status: 400 }
      )
    }

    // 验证计划ID
    const productId = PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS]
    if (!productId) {
      console.error('产品ID未配置:', { planId, availableProducts: Object.keys(PRODUCT_IDS) })
      return NextResponse.json(
        {
          success: false,
          error: '计划配置错误：产品ID未设置',
          details: `计划 ${planId} 的产品ID未在环境变量中配置`
        },
        { status: 500 }
      )
    }

    // 验证Creem API密钥
    if (!CREEM_API_KEY) {
      console.error('Creem API密钥未配置')
      return NextResponse.json(
        { success: false, error: '支付服务配置错误：缺少API密钥' },
        { status: 500 }
      )
    }

    // 获取基础URL用于回调 - 确保开发环境使用localhost
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://www.gotaskmind.com')
      : 'http://localhost:3000'

    console.log('Creem配置检查:', {
      hasApiKey: !!CREEM_API_KEY,
      apiKeyPrefix: CREEM_API_KEY?.substring(0, 10) + '...',
      envProductIds: {
        'pro-monthly': process.env.CREEM_PRO_MONTHLY_PRODUCT_ID,
        'pro-annual': process.env.CREEM_PRO_ANNUAL_PRODUCT_ID
      },
      finalProductIds: PRODUCT_IDS,
      planId,
      productId: PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS],
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL
    })

    // 创建Creem支付会话
    // 注意：Creem API的限制：
    // 1. customer对象只能包含email或id中的一个
    // 2. 不支持cancel_url参数
    const checkoutData = {
      product_id: productId,
      customer: {
        email: userEmail // 只使用email，不使用id
      },
      success_url: `${baseUrl}/payment/success?session_id={session_id}&plan_id=${planId}`,
      metadata: {
        userId, // 将userId保存在metadata中
        planId,
        source: 'gotaskmind_web'
      }
    }

    console.log('创建Creem支付会话:', {
      url: CREEM_API_BASE_URL,
      productId,
      userEmail,
      userId: userId // 保留在metadata中
    })

    console.log('发送到Creem的请求:', {
      url: CREEM_API_BASE_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY?.substring(0, 10) + '...'
      },
      body: checkoutData
    })

    const response = await fetch(CREEM_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY
      },
      body: JSON.stringify(checkoutData)
    })

    const responseText = await response.text()
    console.log('Creem API原始响应:', {
      status: response.status,
      statusText: response.statusText,
      responseText: responseText
    })

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error('解析Creem响应失败:', responseText)
      responseData = { rawResponse: responseText }
    }

    if (!response.ok) {
      console.error('Creem API错误:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      })

      return NextResponse.json(
        {
          success: false,
          error: '支付会话创建失败',
          details: responseData.error || responseData.message || responseData.rawResponse || '未知错误',
          creemResponse: responseData,
          httpStatus: response.status,
          requestData: checkoutData
        },
        { status: response.status }
      )
    }

    console.log('Creem支付会话创建成功:', {
      sessionId: responseData.id,
      checkoutUrl: responseData.checkout_url
    })

    return NextResponse.json({
      success: true,
      sessionId: responseData.id,
      checkoutUrl: responseData.checkout_url,
      planId
    })

  } catch (error) {
    console.error('创建支付会话时发生错误:', error)

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