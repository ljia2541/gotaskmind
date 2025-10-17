'use server'

import { NextResponse } from 'next/server';
import { verifyAuthCode } from '@/app/lib/auth-service';
import { cookies } from 'next/headers';

/**
 * 处理Google认证回调
 */
export async function GET(request: Request) {
  try {
    // 解析URL查询参数
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    // 检查是否有错误
    if (error) {
      return NextResponse.redirect(
        new URL('/?authError=' + encodeURIComponent(error), request.url)
      );
    }
    
    // 检查授权码
    if (!code) {
      return NextResponse.redirect(
        new URL('/?authError=missing_code', request.url)
      );
    }
    
    // 直接调用验证授权码的函数
    const { tokens, userInfo } = await verifyAuthCode(code);
    
    // 设置用户会话cookie
    cookies().set('user_session', JSON.stringify({
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      token: tokens.id_token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时过期
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    
    // 登录成功后重定向到首页
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Google认证回调处理失败:', error);
    return NextResponse.redirect(
      new URL('/?authError=callback_failed', request.url)
    );
  }
}