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

  // 模拟登录函数，用于测试
  const mockLogin = useCallback(() => {
    try {
      // 创建模拟用户
      const mockUser: User = {
        email: 'test@example.com',
        name: '测试用户',
        picture: '/placeholder-user.jpg'
      };
      
      // 设置用户状态
      setUser(mockUser);
      
      // 创建会话对象
      const session = {
        email: mockUser.email,
        name: mockUser.name,
        picture: mockUser.picture,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
      };
      
      // 设置cookie
      document.cookie = `user_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
      
      // 在localStorage中更新认证状态
      localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: true }));

      // 不重新加载页面，让React状态管理更新
      console.log('模拟登录完成，用户状态已更新');
    } catch (error) {
      console.error('模拟登录失败:', error);
    }
  }, []);
  
  // 登录函数，默认使用模拟登录
  const login = useCallback(() => {
    // 使用模拟登录进行测试
    mockLogin();
    
    // 如果需要真实登录，可以取消下面这行的注释
    // window.location.href = '/api/auth/google';
  }, [mockLogin]);

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