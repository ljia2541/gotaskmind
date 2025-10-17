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

  // 检查用户会话
  const checkAuth = useCallback(() => {
    try {
      const sessionCookie = document.cookie
        .split('; ') 
        .find(row => row.startsWith('user_session='));
      
      if (sessionCookie) {
        // 提取并解码cookie值
        const sessionStr = decodeURIComponent(sessionCookie.split('=')[1]);
        const session = JSON.parse(sessionStr);
        
        // 检查会话是否过期
        if (session.expires && new Date(session.expires) > new Date()) {
          setUser({
            email: session.email,
            name: session.name,
            picture: session.picture
          });
        } else {
          // 会话过期，清除cookie
          logout();
        }
      }
    } catch (error) {
      console.error('解析用户会话失败:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出函数
  const logout = useCallback(() => {
    // 清除会话cookie
    document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // 更新状态
    setUser(null);
    
    // 可选：重定向到登录页或首页
    window.location.href = '/';
  }, []);

  // 登录函数（重定向到认证端点）
  const login = useCallback(() => {
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