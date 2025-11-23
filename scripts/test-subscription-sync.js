/**
 * 订阅同步功能测试脚本
 * 用于验证自动订阅同步功能是否正常工作
 */

// 测试用户数据（模拟已支付用户）
const testUser = {
  email: 'test@example.com',
  id: 'test-user-id',
  name: 'Test User'
}

// 测试订阅数据（模拟从Creem返回的支付成功数据）
const testSubscription = {
  userEmail: 'test@example.com',
  userId: 'test-user-id',
  planId: 'pro-monthly',
  status: 'active',
  orderId: 'creem_test_order_123456',
  activatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
  createdAt: new Date().toISOString(),
  processed: false
}

/**
 * 测试订阅存储功能
 */
async function testSubscriptionStorage() {
  console.log('=== 测试订阅存储功能 ===')

  try {
    // 动态导入subscription-store模块
    const { addPendingSubscription, getPendingSubscription, markSubscriptionProcessed } = await import('../app/lib/subscription-store')

    // 添加测试订阅
    console.log('添加测试订阅...')
    addPendingSubscription(testSubscription)

    // 获取订阅
    console.log('获取待处理订阅...')
    const retrievedSubscription = getPendingSubscription(testUser.email, testUser.id)

    if (retrievedSubscription) {
      console.log('✅ 订阅存储测试成功:', {
        planId: retrievedSubscription.planId,
        status: retrievedSubscription.status,
        orderId: retrievedSubscription.orderId
      })
    } else {
      console.error('❌ 订阅存储测试失败：无法获取刚添加的订阅')
    }

    return true
  } catch (error) {
    console.error('❌ 订阅存储测试失败:', error)
    return false
  }
}

/**
 * 测试同步API端点
 */
async function testSyncAPI() {
  console.log('=== 测试同步API端点 ===')

  try {
    const response = await fetch('http://localhost:3000/api/payment/sync-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: testUser.email,
        userId: testUser.id
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      console.log('✅ 同步API测试成功:', {
        message: data.message,
        planName: data.planName,
        subscription: data.subscription
      })
      return true
    } else {
      console.error('❌ 同步API测试失败:', {
        status: response.status,
        error: data.error || data.message
      })
      return false
    }
  } catch (error) {
    console.error('❌ 同步API测试失败:', error)
    return false
  }
}

/**
 * 测试手动激活API端点
 */
async function testManualActivateAPI() {
  console.log('=== 测试手动激活API端点 ===')

  try {
    const response = await fetch('http://localhost:3000/api/payment/manual-activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: testUser.email,
        planId: 'pro-monthly',
        orderId: `manual_test_${Date.now()}`
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      console.log('✅ 手动激活API测试成功:', {
        message: data.message,
        planName: data.planName,
        activationTime: data.activationTime
      })
      return true
    } else {
      console.error('❌ 手动激活API测试失败:', {
        status: response.status,
        error: data.error || data.message
      })
      return false
    }
  } catch (error) {
    console.error('❌ 手动激活API测试失败:', error)
    return false
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行订阅同步功能测试...')
  console.log('测试用户:', testUser)
  console.log('测试订阅:', testSubscription)
  console.log('')

  const results = {
    storageTest: await testSubscriptionStorage(),
    syncAPITest: await testSyncAPI(),
    manualActivateAPITest: await testManualActivateAPI()
  }

  console.log('')
  console.log('=== 测试结果汇总 ===')
  console.log('订阅存储测试:', results.storageTest ? '✅ 通过' : '❌ 失败')
  console.log('同步API测试:', results.syncAPITest ? '✅ 通过' : '❌ 失败')
  console.log('手动激活API测试:', results.manualActivateAPITest ? '✅ 通过' : '❌ 失败')

  const allPassed = Object.values(results).every(result => result === true)
  console.log('')
  console.log('总测试结果:', allPassed ? '✅ 全部通过' : '❌ 存在失败的测试')

  return allPassed
}

// 导出测试函数
export {
  testSubscriptionStorage,
  testSyncAPI,
  testManualActivateAPI,
  runAllTests,
  testUser,
  testSubscription
}

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  // Node.js环境
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}