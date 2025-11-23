'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { cleanupExpiredSubscriptions } from '../lib/subscription-store';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * 订阅信息接口
 */
export interface Subscription {
  planId: 'free' | 'pro-monthly' | 'pro-annual';
  status: 'active' | 'canceled' | 'expired';
  orderId?: string;
  activatedAt?: string;
  expiresAt?: string;
}

/**
 * 创建Supabase客户端（浏览器端）
 */
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// 全局内存存储（终极备选方案）- 改进的键值管理
const globalMemoryStore = new Map<string, any>();

// 生成包含浏览器标识的唯一键
function generateBrowserSpecificKey(baseKey: string, userId?: string): string {
  // 尝试获取浏览器指纹，避免跨浏览器冲突
  const browserFingerprint = typeof window !== 'undefined' ?
    `${navigator.userAgent.slice(0, 20)}_${window.innerWidth}x${window.innerHeight}` :
    'server';

  const timestamp = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseKey}_${userId || 'no-id'}_${browserFingerprint}_${timestamp}_${randomSuffix}`;
}

/**
 * 认证钩子，用于管理用户登录状态
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 防抖标记，防止重复认证检查
  const authCheckRef = useRef(false);

  // 内存存储状态标记
  const [useMemoryStore, setUseMemoryStore] = useState(false);

  // 计算用户是否已认证
  const isAuthenticated = !!user;

  // 增强的存储工具 - 支持多种存储方式
  const saveToMultipleStorages = useCallback((key: string, data: string) => {
    const storageResults = [];

    // 1. 尝试 localStorage
    try {
      localStorage.setItem(key, data);
      storageResults.push({ type: 'localStorage', success: true });
      console.log('✅ localStorage 保存成功');
    } catch (error) {
      storageResults.push({ type: 'localStorage', success: false, error });
      console.error('❌ localStorage 失败:', error);
    }

    // 2. 尝试 sessionStorage
    try {
      sessionStorage.setItem(key, data);
      storageResults.push({ type: 'sessionStorage', success: true });
      console.log('✅ sessionStorage 保存成功');
    } catch (error) {
      storageResults.push({ type: 'sessionStorage', success: false, error });
      console.error('❌ sessionStorage 失败:', error);
    }

    // 3. 尝试使用 indexedDB (适用于现代浏览器)
    try {
      if ('indexedDB' in window) {
        const request = indexedDB.open('GoTaskMindDB', 1);
        request.onerror = () => console.error('❌ IndexedDB 打开失败');
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (db.objectStoreNames.contains('subscriptions')) {
            const transaction = db.transaction(['subscriptions'], 'readwrite');
            const store = transaction.objectStore('subscriptions');
            store.put({ id: key, data, timestamp: Date.now() });
            console.log('✅ IndexedDB 保存成功');
          }
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('subscriptions')) {
            db.createObjectStore('subscriptions');
          }
        };
      }
    } catch (error) {
      console.error('❌ IndexedDB 失败:', error);
    }

    // 4. 尝试 cookie 作为最后备选
    try {
      const encodedData = encodeURIComponent(data);
      document.cookie = `${key}=${encodedData}; path=/; max-age=2592000; SameSite=Lax`;
      storageResults.push({ type: 'cookie', success: true });
      console.log('✅ Cookie 保存成功');
    } catch (error) {
      storageResults.push({ type: 'cookie', success: false, error });
      console.error('❌ Cookie 失败:', error);
    }

    return storageResults;
  }, []);

  // 从多种存储方式读取数据
  const readFromMultipleStorages = useCallback((key: string) => {
    // 1. 优先尝试 localStorage
    try {
      const data = localStorage.getItem(key);
      if (data) {
        console.log('✅ 从 localStorage 读取成功');
        return { data, source: 'localStorage' };
      }
    } catch (error) {
      console.error('❌ localStorage 读取失败:', error);
    }

    // 2. 尝试 sessionStorage
    try {
      const data = sessionStorage.getItem(key);
      if (data) {
        console.log('✅ 从 sessionStorage 读取成功');
        return { data, source: 'sessionStorage' };
      }
    } catch (error) {
      console.error('❌ sessionStorage 读取失败:', error);
    }

    // 3. 尝试 cookie
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
          const data = decodeURIComponent(value);
          console.log('✅ 从 Cookie 读取成功');
          return { data, source: 'cookie' };
        }
      }
    } catch (error) {
      console.error('❌ Cookie 读取失败:', error);
    }

    // 4. 尝试 IndexedDB (异步)
    if ('indexedDB' in window) {
      const request = indexedDB.open('GoTaskMindDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (db.objectStoreNames.contains('subscriptions')) {
          const transaction = db.transaction(['subscriptions'], 'readonly');
          const store = transaction.objectStore('subscriptions');
          const getRequest = store.get(key);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              console.log('✅ 从 IndexedDB 读取成功');
              // 异步更新状态
              setSubscription(JSON.parse(getRequest.result.data));
            }
          };
        }
      };
    }

    return { data: null, source: 'none' };
  }, []);

  // 终极内存存储解决方案 - 改进的键值管理
  const saveToMemoryStore = useCallback((key: string, data: any) => {
    try {
      // 生成包含浏览器和用户信息的唯一键
      const uniqueKey = generateBrowserSpecificKey(key, user?.id);

      globalMemoryStore.set(uniqueKey, {
        data,
        timestamp: Date.now(),
        userId: user?.id,
        userEmail: user?.email,
        originalKey: key
      });

      console.log('🧠 内存存储保存成功:', uniqueKey);

      // 也尝试保存到URL参数（作为最后的备选）
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        if (data.planId !== 'free') {
          url.searchParams.set('subscription', data.planId);
          window.history.replaceState({}, '', url.toString());
          console.log('🔗 URL参数保存成功');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ 内存存储失败:', error);
      return false;
    }
  }, [user]);

  // 从内存存储读取 - 支持浏览器指纹查找
  const readFromMemoryStore = useCallback((key: string) => {
    try {
      // 首先尝试精确匹配键名
      const item = globalMemoryStore.get(key);
      if (item && item.data) {
        console.log('🧠 从内存存储读取成功 (精确匹配):', key);
        return item.data;
      }

      // 如果精确匹配失败，尝试按用户ID和邮箱查找
      if (user) {
        for (const [storedKey, storedItem] of globalMemoryStore.entries()) {
          if (storedItem.userId === user.id &&
              storedItem.originalKey === key &&
              storedItem.data) {
            console.log('🧠 从内存存储读取成功 (用户匹配):', storedKey);
            return storedItem.data;
          }
        }
      }

      // 尝试从URL参数读取
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const subscriptionParam = url.searchParams.get('subscription');
        if (subscriptionParam && (subscriptionParam === 'pro-monthly' || subscriptionParam === 'pro-annual')) {
          console.log('🔗 从URL参数读取订阅信息');
          return {
            planId: subscriptionParam,
            status: 'active',
            activatedAt: new Date().toISOString(),
            expiresAt: subscriptionParam === 'pro-annual'
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ 内存存储读取失败:', error);
      return null;
    }
  }, []);

  // 更新订阅状态 - 简化版本，避免竞争条件
  const updateSubscription = useCallback((newSubscription: Subscription) => {
    if (user) {
      const cacheKey = `subscription_${user.id}`;

      console.log('💾 更新订阅状态 (简化版):', newSubscription);

      // 1. 立即更新React状态
      setSubscription(newSubscription);

      // 2. 立即保存到localStorage（主要存储）
      try {
        localStorage.setItem(cacheKey, JSON.stringify(newSubscription));
        console.log('✅ localStorage 保存成功');
      } catch (error) {
        console.error('❌ localStorage 保存失败:', error);
      }

      // 3. 如果是Pro订阅，立即触发状态同步事件
      if (newSubscription.planId === 'pro-monthly' || newSubscription.planId === 'pro-annual') {
        console.log('🎉 Pro订阅已激活！');

        // 清除免费配额历史记录
        try {
          import('../lib/quota-service').then(({ quotaService }) => {
            quotaService.clearQuotaHistory();
            console.log('🧹 已清除免费配额历史记录');
          });
        } catch (error) {
          console.error('❌ 清除配额历史记录失败:', error);
        }

        // 立即触发状态同步事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
            detail: { subscription: newSubscription, userId: user.id }
          }));
        }, 100);
      }
    }
  }, [user]);

  // 加载用户订阅状态 - 简化版本
  const loadSubscriptionStatus = useCallback(async (userId: string, userEmail?: string) => {
    try {
      console.log(`🔄 加载用户 ${userId} 的订阅状态...`);
      const cacheKey = `subscription_${userId}`;

      // 1. 只从localStorage读取（主要存储）
      let subscriptionData = null;
      try {
        const storedData = localStorage.getItem(cacheKey);
        if (storedData) {
          subscriptionData = JSON.parse(storedData) as Subscription;
          console.log('✅ 从localStorage读取到订阅数据');
        }
      } catch (error) {
        console.error('❌ localStorage读取失败:', error);
      }

      if (subscriptionData) {
        // 检查订阅是否过期
        if (subscriptionData.expiresAt && new Date(subscriptionData.expiresAt) < new Date()) {
          console.log('⚠️ 订阅已过期，重置为免费计划');
          setSubscription({
            planId: 'free',
            status: 'expired'
          });
        } else {
          console.log('✅ 订阅有效，设置订阅状态');
          setSubscription(subscriptionData);

          // 如果是Pro订阅，额外同步检查
          if (subscriptionData.planId === 'pro-monthly' || subscriptionData.planId === 'pro-annual') {
            console.log('🎉 检测到Pro订阅，确保状态同步...');

            // 清除免费配额历史记录
            try {
              import('../lib/quota-service').then(({ quotaService }) => {
                quotaService.clearQuotaHistory();
                console.log('🧹 已清除免费配额历史记录');
              });
            } catch (error) {
              console.error('❌ 清除配额历史记录失败:', error);
            }
          }
        }
      } else {
        console.log('📝 无本地订阅数据，设置默认免费计划');
        setSubscription({
          planId: 'free',
          status: 'active'
        });
      }

    } catch (error) {
      console.error('❌ 加载订阅状态失败:', error);
      setSubscription({
        planId: 'free',
        status: 'active'
      });
    }
  }, []);

  // 调试函数 - 检查当前订阅状态
  const debugSubscriptionStatus = useCallback(() => {
    if (user) {
      const subscriptionData = localStorage.getItem(`subscription_${user.id}`);
      console.log('=== 订阅状态调试信息 ===');
      console.log('用户ID:', user.id);
      console.log('用户邮箱:', user.email);
      console.log('localStorage中的订阅数据:', subscriptionData);
      console.log('当前subscription状态:', subscription);
      console.log('isPro状态:', subscription?.planId === 'pro-monthly' || subscription?.planId === 'pro-annual');
      console.log('订阅过期检查:', subscription?.expiresAt ? new Date(subscription.expiresAt) < new Date() : '无过期时间');
      console.log('========================');
    }
  }, [user, subscription]);

  // 强制刷新订阅状态 - 超强的浏览器兼容性
  const forceRefreshSubscription = useCallback(async () => {
    if (user && user.email) {
      console.log('🔄 强制刷新订阅状态...');
      console.log('🌐 浏览器信息:', navigator.userAgent);

      const cacheKey = `subscription_${user.id}`;

      // 清除所有可能的存储位置
      try {
        localStorage.removeItem(cacheKey);
        sessionStorage.removeItem(cacheKey);
        // 清除 cookie
        document.cookie = `${cacheKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        console.log('🧹 已清除所有存储位置');
      } catch (error) {
        console.error('❌ 清除存储失败:', error);
      }

      // 重新加载订阅状态
      await loadSubscriptionStatus(user.id, user.email);

      // 多次触发页面重新渲染，确保状态同步
      [100, 500, 1000].forEach(delay => {
        setTimeout(() => {
          console.log(`🔄 延迟 ${delay}ms 触发重新渲染`);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, delay);
      });

      console.log('✅ 订阅状态刷新完成');
    }
  }, [user, loadSubscriptionStatus]);

  // 手动激活Pro订阅 - 紧急修复功能
  const manualActivatePro = useCallback(async (planId: 'pro-monthly' | 'pro-annual' = 'pro-monthly') => {
    if (!user || !user.email) {
      console.error('❌ 用户未登录，无法激活订阅');
      return false;
    }

    try {
      console.log('🔧 手动激活Pro订阅...', { userEmail: user.email, planId });

      const response = await fetch('/api/payment/manual-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          planId: planId,
          orderId: `manual_activate_${Date.now()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 手动激活请求成功:', data);

        // 立即刷新订阅状态
        setTimeout(() => {
          forceRefreshSubscription();
        }, 500);

        return true;
      } else {
        console.error('❌ 手动激活请求失败:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 手动激活Pro订阅失败:', error);
      return false;
    }
  }, [user, forceRefreshSubscription]);

  // 检查用户会话 - 使用Supabase，添加防抖机制和状态检测
  const checkAuth = useCallback(() => {
    // 防止重复调用
    if (authCheckRef.current) {
      return;
    }

    authCheckRef.current = true;

    console.log('🔍 开始检查认证状态...');

    try {
      // 清除可能存在的旧用户会话cookie
      if (document.cookie.includes('user_session=')) {
        document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        console.log('已清除旧的用户会话cookie');
      }

      // 检查URL中是否有认证参数（OAuth回调）
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || urlParams.has('code');

      console.log('🔗 URL参数检测:', {
        hasAuthParams,
        searchParams: Object.fromEntries(urlParams.entries())
      });

      // 优先检查Supabase客户端的当前会话
      const supabase = createSupabaseClient();

      // 先检查本地Supabase会话
      supabase.auth.getUser().then(({ data: userData, error: userError }) => {
        if (!userError && userData.user) {
          console.log('✅ 从Supabase客户端获取到用户:', userData.user.email);
          setUser({
            id: userData.user.id,
            email: userData.user.email || '',
            name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || '用户',
            picture: userData.user.user_metadata?.picture || userData.user.user_metadata?.avatar_url
          });

          loadSubscriptionStatus(userData.user.id, userData.user.email);
          setIsLoading(false);
          authCheckRef.current = false;
          return;
        }

        // 如果本地没有会话，检查服务器端会话
        console.log('🔄 本地无会话，检查服务器端...');

        fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        })
          .then(response => {
            console.log('📡 会话检查响应状态:', response.status);

            if (!response.ok) {
              // 401是正常的未登录状态，不是错误
              if (response.status === 401) {
                console.log('ℹ️ 用户未登录（正常状态）');
                return { success: false, user: null, isAuthenticated: false };
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('📋 会话检查响应数据:', data);

            if (data.user) {
              console.log('✅ 从服务器获取到用户:', data.user.email);
              setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name || data.user.email.split('@')[0],
                picture: data.user.picture
              });

              // 获取用户订阅状态
              loadSubscriptionStatus(data.user.id, data.user.email);
            } else {
              console.log('❌ 服务器返回无用户数据');
              setUser(null);
              setSubscription(null);
            }
          })
          .catch(error => {
            // 检查是否是401错误（正常的未登录状态）
            if (error.message.includes('HTTP error! status: 401')) {
              console.log('ℹ️ 用户未登录（这是正常状态）');
            } else {
              console.error('❌ 获取用户会话失败:', error);
            }
            // 设置默认状态，避免无限加载
            setUser(null);
            setSubscription(null);
          })
          .finally(() => {
            setIsLoading(false);
            // 重置防抖标记，允许下次调用
            setTimeout(() => {
              authCheckRef.current = false;
            }, 1000);
          });
      }).catch(error => {
        console.error('❌ Supabase客户端检查失败:', error);

        // 回退到仅服务器端检查
        fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        })
          .then(response => response.ok ? response.json() : { user: null })
          .then(data => {
            if (data.user) {
              setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name || data.user.email.split('@')[0],
                picture: data.user.picture
              });
              loadSubscriptionStatus(data.user.id, data.user.email);
            } else {
              setUser(null);
              setSubscription(null);
            }
          })
          .catch(error => console.error('❌ 回退检查也失败:', error))
          .finally(() => {
            setIsLoading(false);
            setTimeout(() => { authCheckRef.current = false; }, 1000);
          });
      });
    } catch (error) {
      console.error('❌ 检查用户会话失败:', error);
      setUser(null);
      setIsLoading(false);
      // 重置防抖标记
      setTimeout(() => {
        authCheckRef.current = false;
      }, 1000);
    }
  }, [loadSubscriptionStatus]);

  // 登出函数 - 使用Supabase，确保完整清理
  const logout = useCallback(async () => {
    try {
      // 重置防抖标记，防止登录状态冲突
      authCheckRef.current = false;

      // 调用登出API端点
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // 更新状态
        setUser(null);
        setSubscription(null);

        // 在localStorage中更新认证状态（用于多标签页同步）
        localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: false }));

        // 清除订阅相关数据
        if (user) {
          localStorage.removeItem(`subscription_${user.id}`);
        }
      }
    } catch (error) {
      console.error('登出请求失败:', error);
      // 发生错误时，至少清除本地状态
      setUser(null);
      setSubscription(null);

      // 清除订阅数据
      if (user) {
        localStorage.removeItem(`subscription_${user.id}`);
      }
    } finally {
      // 无论如何都重定向到首页，使用更可靠的方式
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
    }
  }, [user]);

  // 已移除模拟登录函数，不再使用测试用户
  const mockLogin = useCallback(() => {
    console.log('模拟登录已禁用');
    // 保留函数以避免破坏引用依赖，但不再设置测试用户
  }, []);
  
  // 登录函数 - 使用Google登录
  const login = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  // Google登录函数
  const loginWithGoogle = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  // GitHub登录函数（使用Supabase OAuth登录）
  const loginWithGitHub = useCallback(() => {
    window.location.href = '/api/auth/github';
  }, []);

  // 检查待处理的购买意图
  const checkPendingPurchase = useCallback(() => {
    try {
      const pendingPurchase = localStorage.getItem('pending_purchase')
      if (pendingPurchase) {
        const { planId, timestamp, returnTo } = JSON.parse(pendingPurchase)

        // 检查是否在30分钟内
        const isRecent = (Date.now() - timestamp) < 30 * 60 * 1000

        console.log(`🛒 检查待处理购买意图:`, { planId, returnTo, isRecent, timestamp })

        if (isRecent && planId) {
          console.log(`✅ 发现有效的购买意图: ${planId}`)

          // 清除待处理购买意图
          localStorage.removeItem('pending_purchase')

          // 延迟触发支付流程或重定向
          setTimeout(() => {
            if (user && user.email) {
              console.log(`🔄 用户已登录，自动触发支付流程: ${planId}`)

              // 创建一个自定义事件来触发支付
              const event = new CustomEvent('triggerPurchase', {
                detail: { planId, user: { id: user.id, email: user.email } }
              })
              window.dispatchEvent(event)
            } else if (returnTo && returnTo !== '/') {
              console.log(`🔄 用户未登录，重定向到: ${returnTo}`)
              // 重定向到指定页面
              window.location.href = returnTo
            }
          }, 1500) // 增加延迟确保认证状态完全加载
        } else {
          console.log(`⏰ 购买意图已过期，清除...`)
          localStorage.removeItem('pending_purchase')
        }
      } else {
        console.log('ℹ️ 无待处理的购买意图')
      }
    } catch (error) {
      console.error('❌ 检查待处理购买意图失败:', error)
      localStorage.removeItem('pending_purchase')
    }
  }, [user])

  // 组件挂载时检查认证状态，添加延迟确保DOM完全加载
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();

      // 定期清理过期订阅数据（每5分钟执行一次）
      const cleanupInterval = setInterval(() => {
        cleanupExpiredSubscriptions();
      }, 5 * 60 * 1000);

      return () => clearInterval(cleanupInterval);
    }, 100);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  // 检测OAuth回调并立即刷新认证状态
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthCallback = urlParams.has('access_token') ||
                           urlParams.has('refresh_token') ||
                           urlParams.has('code') ||
                           urlParams.has('authError');

    if (hasAuthCallback) {
      console.log('🔄 检测到OAuth回调，立即刷新认证状态');

      // 立即检查认证状态
      setTimeout(() => {
        checkAuth();
      }, 500);

      // 再次检查（确保cookie设置完成）
      setTimeout(() => {
        checkAuth();
      }, 1500);

      // 第三次检查（最终确认）
      setTimeout(() => {
        checkAuth();
      }, 3000);

      // 清理URL参数
      if (!urlParams.has('authError')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [checkAuth]);

  // 用户登录成功后检查待处理的购买意图
  useEffect(() => {
    if (user && isAuthenticated) {
      checkPendingPurchase()
    }
  }, [user, isAuthenticated, checkPendingPurchase]);

  // 监听storage事件，用于在不同标签页间同步登录状态
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_state') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  // 监听订阅状态更新事件 - 简化版本
  useEffect(() => {
    const handleSubscriptionUpdated = (event: CustomEvent) => {
      console.log('📡 收到订阅状态更新事件:', event.detail);
      if (event.detail && event.detail.subscription) {
        // 直接设置订阅状态
        setSubscription(event.detail.subscription);
      }
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdated as EventListener);
    };
  }, []);

  return {
    user,
    subscription,
    isLoading,
    login,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    updateSubscription,
    isAuthenticated,
    isPro: subscription?.planId === 'pro-monthly' || subscription?.planId === 'pro-annual',
    debugSubscriptionStatus, // 暴露调试函数
    forceRefreshSubscription, // 暴露强制刷新函数
    manualActivatePro, // 暴露手动激活功能
    useMemoryStore // 暴露内存存储状态
  };
}