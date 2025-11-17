'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * 会话状态检查API端点
 * 使用Supabase验证用户是否已登录并返回会话信息
 * @returns 包含用户信息的JSON响应
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // 使用Supabase获取当前用户信息
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase获取用户失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: '用户未登录',
          isAuthenticated: false
        },
        {
          status: 401,
        }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: '用户未登录',
          isAuthenticated: false
        },
        {
          status: 401,
        }
      );
    }
    
    // 会话有效，返回用户信息
    const user = data.user;
    return NextResponse.json({
      success: true,
      message: '会话有效',
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || '用户',
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture
      }
    });
  } catch (error) {
    console.error('会话检查错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        isAuthenticated: false
      },
      {
        status: 500,
      }
    );
  }
}