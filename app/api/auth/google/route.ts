'use server'

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * 处理Google登录请求
 * 使用Supabase的OAuth认证功能重定向到Google登录页面
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 配置回调URL
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    // 生成Google OAuth登录URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // 可选：请求额外的权限范围
        scopes: 'openid profile email',
      },
    });

    if (error) {
      console.error('生成Google认证URL失败:', error);
      return NextResponse.json(
        { error: '登录服务暂时不可用' },
        { status: 500 }
      );
    }

    // 重定向到Google认证页面
    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error('Google登录处理失败:', error);
    return NextResponse.json(
      { error: '登录服务暂时不可用' },
      { status: 500 }
    );
  }
}