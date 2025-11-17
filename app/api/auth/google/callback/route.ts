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

  // 如果有next参数，用作重定向URL
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    // 如果next不是相对URL，使用默认值
    next = '/';
  }

  if (code) {
    try {
      const supabase = await createClient();

      // 交换授权码获取会话
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // 获取转发的主机（负载均衡器前的原始来源）
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          // 本地环境下直接使用origin
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          // 生产环境使用转发的主机名
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          // 回退方案
          return NextResponse.redirect(`${origin}${next}`);
        }
      }

      console.error('Google认证交换失败:', error);
    } catch (error) {
      console.error('Google回调处理异常:', error);
    }
  }

  // 返回用户到错误页面
  return NextResponse.redirect(`${origin}/?authError=google_callback_failed`);
}