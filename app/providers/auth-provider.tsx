'use client'

import { ReactNode, createContext, useContext } from 'react';
import { useAuth, User } from '@/app/hooks/use-auth';

/**
 * 认证上下文接口
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件属性接口
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件，用于在整个应用中提供认证状态
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的钩子
 * @returns 认证上下文
 * @throws 如果在AuthProvider之外使用
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext必须在AuthProvider内部使用');
  }
  
  return context;
}