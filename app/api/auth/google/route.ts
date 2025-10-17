'use server'

import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/app/lib/auth-service';
import { cookies } from 'next/headers';

/**
 * 处理Google登录请求
 */
export async function GET() {
  try {
    // 直接调用生成Google认证URL的函数
    const authUrl = await generateAuthUrl();
    
    // 重定向到Google认证页面
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('生成Google认证URL失败:', error);
    return NextResponse.json(
      { error: '登录服务暂时不可用' },
      { status: 500 }
    );
  }
}