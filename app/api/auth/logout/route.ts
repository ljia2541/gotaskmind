'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * 用户登出API端点
 * 使用Supabase进行登出，终止当前用户会话
 * @returns 登出结果的JSON响应
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    // 使用Supabase进行登出
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase登出失败:', error);
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