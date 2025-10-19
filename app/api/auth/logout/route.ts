'use server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 用户登出API端点
 * 用于清除用户会话cookie并终止当前登录状态
 * @returns 登出结果的JSON响应
 */
export async function POST() {
  try {
    // 清除用户会话cookie
    cookies().delete('user_session');
    
    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        message: '登出成功',
        isAuthenticated: false
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('登出处理错误:', error);
    
    // 即使发生错误，也尝试清除cookie
    try {
      cookies().delete('user_session');
    } catch (err) {
      // 忽略删除cookie时的错误
    }
    
    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        message: '登出过程中发生错误',
        isAuthenticated: false
      },
      {
        status: 500,
      }
    );
  }
}