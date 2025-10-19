'use server';

import { cookies } from 'next/headers';

/**
 * 会话状态检查API端点
 * 用于验证用户是否已登录并返回会话信息
 * @returns 包含用户信息的JSON响应
 */
export async function GET() {
  try {
    // 获取用户会话cookie（注意：这里应该使用'user_session'而不是'session'）
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;

    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '用户未登录',
          isAuthenticated: false
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // 解析会话cookie内容
    const sessionData = JSON.parse(sessionCookie);
    
    // 验证会话是否过期
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      // 会话过期
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '会话已过期，请重新登录',
          isAuthenticated: false
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // 会话有效，返回用户信息
    return new Response(
      JSON.stringify({
        success: true,
        message: '会话有效',
        isAuthenticated: true,
        user: {
          email: sessionData.email,
          name: sessionData.name,
          picture: sessionData.picture
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('会话检查错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: '服务器内部错误',
        isAuthenticated: false
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}