'use server'

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { headers } from 'next/headers';

/**
 * 处理GitHub登录请求
 * 使用Supabase服务器端OAuth认证功能重定向到GitHub登录页面
 * 遵循Supabase官方推荐的服务器端认证模式
 */
export async function GET() {
  try {
    // 创建服务器端Supabase客户端
    const supabase = await createClient();

    // 获取请求头信息用于构建回调URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    const redirectTo = `${siteUrl}/api/auth/github/callback`;

    console.log('GitHub登录 - 服务器端认证模式');
    console.log('请求来源:', `${protocol}://${host}`);
    console.log('回调URL:', redirectTo);

    // 使用Supabase服务器端OAuth登录 - 简化配置
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectTo,
        scopes: 'read:user,user:email' // 请求用户基本信息和邮箱权限
        // 移除额外参数，使用Supabase默认配置
      },
    });

    if (error) {
      console.error('GitHub OAuth初始化失败:', error);
      return NextResponse.json(
        {
          error: 'GitHub登录初始化失败',
          message: 'GitHub登录服务暂时不可用，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    if (!data?.url) {
      console.error('GitHub OAuth URL生成失败: 未返回授权URL');
      return NextResponse.json(
        {
          error: 'GitHub登录配置错误',
          message: '无法生成GitHub授权链接，请检查配置'
        },
        { status: 500 }
      );
    }

    console.log('GitHub OAuth URL生成成功');

    // 重定向到GitHub授权页面
    return NextResponse.redirect(data.url);

  } catch (error) {
    console.error('GitHub登录处理异常:', error);
    return NextResponse.json(
      {
        error: '登录服务异常',
        message: 'GitHub登录过程中发生未知错误，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}