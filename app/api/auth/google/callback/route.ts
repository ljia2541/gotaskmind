'use server'

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * 处理Google认证回调
 * 交换授权码获取用户会话并设置cookie
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('Google回调 - 请求信息:', {
    url: request.url,
    code: code ? 'received' : 'missing',
    error,
    origin,
    env: process.env.NODE_ENV
  });

  // 如果有错误参数，重定向到错误页面
  if (error) {
    console.error('Google认证返回错误:', error);
    return NextResponse.redirect(`${origin}/?authError=${error}`);
  }

  // 如果有next参数，用作重定向URL
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/';
  }

  // 检查是否有从支付页面保存的返回URL
  const returnToHeader = request.headers.get('X-Auth-Return-To');
  if (returnToHeader && returnToHeader.startsWith('/')) {
    next = returnToHeader;
    console.log('使用支付页面保存的返回URL:', next);
  }

  // 作为备选方案，也可以查询auth_return_to cookie（如果存在）
  const authReturnCookie = request.headers.get('cookie')?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('auth_return_to='));

  if (authReturnCookie) {
    const returnUrl = authReturnCookie.split('=')[1];
    if (returnUrl && returnUrl.startsWith('/')) {
      next = returnUrl;
      console.log('从cookie获取返回URL:', next);
    }
  }

  if (!code) {
    console.error('Google回调: 缺少授权码');
    return NextResponse.redirect(`${origin}/?authError=missing_code`);
  }

  try {
    const supabase = await createClient();

    console.log('开始交换授权码...');

    // 交换授权码获取会话
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Google认证交换失败:', exchangeError);
      return NextResponse.redirect(`${origin}/?authError=exchange_failed`);
    }

    if (data.session && data.user) {
      console.log('认证成功:', {
        userId: data.user.id,
        email: data.user.email,
        hasSession: !!data.session
      });

      // 构建正确的重定向URL - 开发环境强制使用localhost:3000
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : (process.env.NEXT_PUBLIC_SITE_URL || origin);
      const redirectUrl = `${baseUrl}${next}`;

      console.log('重定向到:', redirectUrl);

      // 创建响应并设置cookie
      const response = NextResponse.redirect(redirectUrl);

      // 确保session cookie正确传递
      if (data.session.access_token) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7天
          httpOnly: true,
          secure: true,
          sameSite: 'lax'
        });
      }

      if (data.session.refresh_token) {
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30天
          httpOnly: true,
          secure: true,
          sameSite: 'lax'
        });
      }

      // 清除auth_return_to cookie（如果存在）
      response.cookies.set('auth_return_to', '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });

      return response;
    } else {
      console.error('认证失败: 无会话或用户数据');
      return NextResponse.redirect(`${origin}/?authError=no_session`);
    }

  } catch (error) {
    console.error('Google回调处理异常:', error);
    return NextResponse.redirect(`${origin}/?authError=callback_exception`);
  }
}