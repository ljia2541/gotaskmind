'use server'

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * 处理GitHub认证回调
 * 使用Supabase服务器端方式交换授权码获取用户会话
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('GitHub回调 - 开始处理');
  console.log('请求参数:', {
    code: code ? `${code.substring(0, 10)}...` : 'missing',
    error,
    errorDescription
  });

  // 如果有next参数，用作重定向URL
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/';
  }

  // 检查是否有GitHub返回的错误
  if (error) {
    console.error('GitHub OAuth返回错误:', { error, errorDescription });
    const errorParams = new URLSearchParams({
      authError: error,
      description: errorDescription || 'Unknown error'
    });
    return NextResponse.redirect(`${origin}/?${errorParams.toString()}`);
  }

  // 检查是否有授权码
  if (!code) {
    console.error('GitHub回调缺少授权码');
    return NextResponse.redirect(`${origin}/?authError=missing_code`);
  }

  try {
    // 创建服务器端Supabase客户端
    const supabase = await createClient();

    console.log('开始交换GitHub授权码获取会话...');

    // 使用Supabase服务器端方式交换授权码获取会话
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('GitHub授权码交换失败:', exchangeError);
      const errorParams = new URLSearchParams({
        authError: 'session_exchange_failed',
        description: exchangeError.message
      });
      return NextResponse.redirect(`${origin}/?${errorParams.toString()}`);
    }

    if (!data?.session) {
      console.error('GitHub认证会话创建失败: 未返回会话数据');
      const errorParams = new URLSearchParams({
        authError: 'session_creation_failed'
      });
      return NextResponse.redirect(`${origin}/?${errorParams.toString()}`);
    }

    console.log('GitHub认证成功:', {
      userId: data.session.user.id,
      email: data.session.user.email
    });

    // 重定向到应用首页或指定页面
    return NextResponse.redirect(`${origin}${next}`);

  } catch (error) {
    console.error('GitHub认证回调处理异常:', error);
    const errorParams = new URLSearchParams({
      authError: 'unexpected_error',
      description: process.env.NODE_ENV === 'development' ? String(error) : '认证过程中发生未知错误'
    });
    return NextResponse.redirect(`${origin}/?${errorParams.toString()}`);
  }
}