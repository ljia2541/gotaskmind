// 服务端订阅存储 - 支持从客户端localStorage读取数据
interface PendingSubscription {
  userEmail: string
  userId?: string
  planId: string
  status: 'active' | 'canceled' | 'expired'
  orderId?: string
  activatedAt: string
  expiresAt: string
  createdAt: string
  processed: boolean
}

// 服务端存储 - 使用文件系统持久化（Next.js环境）
import fs from 'fs'
import path from 'path'

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json')

// 确保数据目录存在
function ensureDataDirectory() {
  const dataDir = path.dirname(SUBSCRIPTIONS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 从文件加载订阅数据
function loadServerSubscriptions(): Map<string, PendingSubscription> {
  try {
    ensureDataDirectory()
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8')
      const subscriptions = JSON.parse(data)
      console.log('📦 从文件加载服务端订阅数据:', Object.keys(subscriptions).length, '个订阅')
      return new Map(Object.entries(subscriptions))
    }
  } catch (error) {
    console.error('❌ 加载服务端订阅数据失败:', error)
  }
  return new Map()
}

// 保存订阅数据到文件
function saveServerSubscriptions(subscriptions: Map<string, PendingSubscription>) {
  try {
    ensureDataDirectory()
    const data = Object.fromEntries(subscriptions)
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2))
    console.log('💾 服务端订阅数据已保存到文件:', Object.keys(data).length, '个订阅')
  } catch (error) {
    console.error('❌ 保存服务端订阅数据失败:', error)
  }
}

// 服务端存储 - 用于API端点（从文件加载）
let serverSubscriptions: Map<string, PendingSubscription> = loadServerSubscriptions()

// 从客户端请求数据同步到服务端
export async function syncClientSubscriptions(request: Request): Promise<{success: boolean, count: number}> {
  try {
    // 尝试从客户端获取localStorage数据
    const clientData = await getClientLocalStorageData(request)

    if (clientData && clientData.pendingSubscriptions) {
      // 同步到服务端存储
      serverSubscriptions = new Map(clientData.pendingSubscriptions)
      saveServerSubscriptions(serverSubscriptions) // 立即保存到文件
      console.log('🔄 从客户端同步订阅数据到服务端:', serverSubscriptions.size, '个订阅')
      return { success: true, count: serverSubscriptions.size }
    }

    return { success: false, count: 0 }
  } catch (error) {
    console.error('❌ 同步客户端订阅数据失败:', error)
    return { success: false, count: 0 }
  }
}

// 模拟从客户端获取localStorage数据
// 在实际应用中，这应该通过特定的API端点或认证机制来实现
async function getClientLocalStorageData(request: Request): Promise<any> {
  try {
    // 尝试从请求头或body中获取客户端数据
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      if (body.clientSubscriptions) {
        return body.clientSubscriptions
      }
    }

    // 从URL参数中获取（用于GET请求）
    const url = new URL(request.url)
    const clientDataParam = url.searchParams.get('clientData')
    if (clientDataParam) {
      return JSON.parse(decodeURIComponent(clientDataParam))
    }

    return null
  } catch (error) {
    console.error('❌ 获取客户端localStorage数据失败:', error)
    return null
  }
}

// 服务端获取待处理订阅
export function getServerPendingSubscription(userEmail: string, userId?: string): PendingSubscription | null {
  const emailKey = userEmail.toLowerCase()

  for (const [key, subscription] of serverSubscriptions.entries()) {
    if (subscription.userEmail.toLowerCase() === emailKey &&
        (!userId || subscription.userId === userId) &&
        !subscription.processed) {
      console.log(`服务端找到待处理订阅: ${key} for user ${emailKey} (ID: ${userId})`)
      return subscription
    }
  }

  return null
}

// 服务端标记订阅为已处理
export function markServerSubscriptionProcessed(userEmail: string, userId?: string): void {
  const emailKey = userEmail.toLowerCase()

  for (const [key, subscription] of serverSubscriptions.entries()) {
    if (subscription.userEmail.toLowerCase() === emailKey &&
        (!userId || subscription.userId === userId)) {
      subscription.processed = true
      serverSubscriptions.set(key, subscription)
      saveServerSubscriptions(serverSubscriptions) // 立即保存到文件
      console.log(`服务端订阅已标记为处理: ${key} for user ${emailKey} (ID: ${userId})`)
      return
    }
  }
}

// 服务端添加订阅
export function addServerPendingSubscription(subscription: PendingSubscription): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${subscription.userEmail.toLowerCase()}_${subscription.userId || 'no-id'}_${timestamp}_${randomSuffix}`;

  serverSubscriptions.set(key, subscription)
  saveServerSubscriptions(serverSubscriptions) // 立即保存到文件
  console.log(`服务端添加订阅: ${key}`, subscription)
}

// 获取所有服务端订阅（调试用）
export function getAllServerPendingSubscriptions(): Map<string, PendingSubscription> {
  return new Map(serverSubscriptions)
}

// 清理过期的服务端订阅
export function cleanupExpiredServerSubscriptions(): void {
  const now = new Date()
  const keysToDelete: string[] = []

  for (const [key, subscription] of serverSubscriptions.entries()) {
    const isOld = (now.getTime() - new Date(subscription.createdAt).getTime()) > 7 * 24 * 60 * 60 * 1000
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now

    if (isOld || (isExpired && subscription.processed)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => {
    serverSubscriptions.delete(key)
    console.log(`服务端清理过期订阅: ${key}`)
  })

  if (keysToDelete.length > 0) {
    saveServerSubscriptions(serverSubscriptions) // 立即保存到文件
    console.log(`服务端已清理 ${keysToDelete.length} 个过期订阅`)
  }
}