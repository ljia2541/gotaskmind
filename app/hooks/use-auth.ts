'use client'

import { useState, useEffect, useCallback } from 'react';

/**
 * 用户信息接口
 */
export interface User {
  email: string;
  name: string;
  picture?: string;
}

/**
 * 认证钩子，用于管理用户登录状态
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户会话 - 已移除测试用户支持
  const checkAuth = useCallback(() => {
    try {
      // 清除可能存在的测试用户cookie
      if (document.cookie.includes('user_session=')) {
        document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        console.log('已清除用户会话cookie');
      }
      
      // 不再自动设置用户，需要真实登录
      setUser(null);
    } catch (error) {
      console.error('检查用户会话失败:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出函数
  const logout = useCallback(async () => {
    try {
      // 调用登出API端点
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 更新状态
        setUser(null);
        
        // 在localStorage中更新认证状态（用于多标签页同步）
        localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: false }));
      }
    } catch (error) {
      console.error('登出请求失败:', error);
      // 发生错误时，至少清除本地状态
      setUser(null);
    } finally {
      // 无论如何都重定向到首页
      window.location.href = '/';
    }
  }, []);

  // 已移除模拟登录函数，不再使用测试用户
  const mockLogin = useCallback(() => {
    console.log('模拟登录已禁用');
    // 保留函数以避免破坏引用依赖，但不再设置测试用户
  }, []);
  
  // 登录函数，已移除自动模拟登录
  const login = useCallback(() => {
    // 已移除自动模拟登录
    // 如果需要真实登录，可以使用以下API
    window.location.href = '/api/auth/google';
  }, []);

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
}