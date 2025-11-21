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

    // 配置回调URL - 确保使用正确的URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/api/auth/google/callback`;

    console.log('Google登录 - 配置信息:', {
      baseUrl,
      redirectTo,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });

    // 生成Google OAuth登录URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
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