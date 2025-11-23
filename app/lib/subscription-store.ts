// 临时订阅存储 - 在实际应用中应该使用真实数据库
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

// 持久化存储 - 使用 localStorage + 内存备份
let pendingSubscriptions: Map<string, PendingSubscription> = new Map()

// 从localStorage恢复订阅数据
function loadSubscriptionsFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('pendingSubscriptions')
      if (stored) {
        const data = JSON.parse(stored)
        pendingSubscriptions = new Map(data)
        console.log('📦 从localStorage恢复订阅数据:', pendingSubscriptions.size, '个订阅')
      }
    } catch (error) {
      console.error('❌ 从localStorage恢复订阅数据失败:', error)
    }
  }
}

// 保存订阅数据到localStorage
function saveSubscriptionsToStorage() {
  if (typeof window !== 'undefined') {
    try {
      const data = Array.from(pendingSubscriptions.entries())
      localStorage.setItem('pendingSubscriptions', JSON.stringify(data))
    } catch (error) {
      console.error('❌ 保存订阅数据到localStorage失败:', error)
    }
  }
}

// 初始化时加载数据
loadSubscriptionsFromStorage()

// 生成更精确的订阅键，避免冲突
function generateSubscriptionKey(userEmail: string, userId?: string): string {
  const timestamp = new Date().toISOString().slice(0, 10); // 按日期隔离
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${userEmail.toLowerCase()}_${userId || 'no-id'}_${timestamp}_${randomSuffix}`;
  return key;
}

// 添加待处理的订阅
export function addPendingSubscription(subscription: PendingSubscription): void {
  // 生成唯一的键，包含用户ID和随机后缀避免冲突
  const uniqueKey = generateSubscriptionKey(subscription.userEmail, subscription.userId);

  // 先检查是否已存在该用户的订阅，如果存在则更新而不是添加新的
  for (const [existingKey, existingSub] of pendingSubscriptions.entries()) {
    if (existingSub.userEmail.toLowerCase() === subscription.userEmail.toLowerCase() &&
        existingSub.userId === subscription.userId) {
      // 更新现有订阅而不是创建新的
      pendingSubscriptions.set(existingKey, subscription);
      console.log(`更新现有订阅: ${existingKey}`, subscription);
      saveSubscriptionsToStorage(); // 立即保存到localStorage
      triggerServerSync(subscription); // 自动同步到服务端
      return;
    }
  }

  // 添加新订阅
  pendingSubscriptions.set(uniqueKey, subscription);
  console.log(`添加新待处理订阅: ${uniqueKey}`, subscription);
  saveSubscriptionsToStorage(); // 立即保存到localStorage
  triggerServerSync(subscription); // 自动同步到服务端
}

// 获取待处理的订阅 - 支持按用户ID精确查找
export function getPendingSubscription(userEmail: string, userId?: string): PendingSubscription | null {
  const emailKey = userEmail.toLowerCase();

  // 按用户ID精确查找，避免跨用户冲突
  for (const [key, subscription] of pendingSubscriptions.entries()) {
    if (subscription.userEmail.toLowerCase() === emailKey &&
        (!userId || subscription.userId === userId) &&
        !subscription.processed) {
      console.log(`找到待处理订阅: ${key} for user ${emailKey} (ID: ${userId})`);
      return subscription;
    }
  }

  return null;
}

// 标记订阅为已处理 - 支持按用户ID精确标记
export function markSubscriptionProcessed(userEmail: string, userId?: string): void {
  const emailKey = userEmail.toLowerCase();

  // 按用户ID精确查找和标记
  for (const [key, subscription] of pendingSubscriptions.entries()) {
    if (subscription.userEmail.toLowerCase() === emailKey &&
        (!userId || subscription.userId === userId)) {
      subscription.processed = true;
      pendingSubscriptions.set(key, subscription);
      console.log(`订阅已标记为处理: ${key} for user ${emailKey} (ID: ${userId})`);
      saveSubscriptionsToStorage(); // 立即保存到localStorage
      return; // 找到并处理后立即返回
    }
  }
}

// 清理已处理的订阅（可选）
export function cleanupProcessedSubscriptions(): void {
  for (const [key, subscription] of pendingSubscriptions.entries()) {
    if (subscription.processed) {
      pendingSubscriptions.delete(key)
      console.log(`清理已处理订阅: ${key}`)
    }
  }
}

// 获取所有待处理订阅（调试用）
export function getAllPendingSubscriptions(): Map<string, PendingSubscription> {
  return new Map(pendingSubscriptions)
}

// 清理过期的订阅数据，防止内存泄漏
export function cleanupExpiredSubscriptions(): void {
  const now = new Date();
  const keysToDelete: string[] = [];

  for (const [key, subscription] of pendingSubscriptions.entries()) {
    // 删除超过7天或已过期的订阅
    const isOld = (now.getTime() - new Date(subscription.createdAt).getTime()) > 7 * 24 * 60 * 60 * 1000;
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;

    if (isOld || (isExpired && subscription.processed)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => {
    pendingSubscriptions.delete(key);
    console.log(`清理过期订阅: ${key}`);
  });

  if (keysToDelete.length > 0) {
    console.log(`已清理 ${keysToDelete.length} 个过期订阅`);
  }
}

// 检查订阅是否过期
export function isSubscriptionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

// 触发服务端同步（异步执行，不阻塞主流程）
function triggerServerSync(subscription: PendingSubscription): void {
  if (typeof window === 'undefined') return; // 只在客户端执行

  try {
    // 异步执行，不阻塞用户界面
    fetch('/api/payment/sync-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: subscription.userEmail,
        userId: subscription.userId,
        clientData: {
          pendingSubscriptions: Array.from(pendingSubscriptions.entries())
        }
      }),
    }).catch(error => {
      console.log('⚠️ 服务端同步失败（可忽略）:', error.message)
    })
  } catch (error) {
    console.log('⚠️ 触发服务端同步失败（可忽略）:', error)
  }
}