'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Supabase Google认证配置检查API
 * 用于验证Google OAuth配置是否正确
 */
export async function GET() {
  try {
    const config = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not configured',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // 尝试创建Supabase客户端
    let supabaseConnection = 'unknown';
    let googleProvider = 'unknown';
    let githubProvider = 'unknown';

    try {
      const supabase = await createClient();

      // 测试基本连接
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        supabaseConnection = 'error: ' + error.message;
      } else {
        supabaseConnection = 'connected';
      }

      // 检查Google提供商是否启用（通过尝试获取OAuth URL）
      const { data: googleOauthData, error: googleOauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
          skipBrowserRedirect: true, // 仅生成URL，不重定向
        },
      });

      if (googleOauthError) {
        googleProvider = 'error: ' + googleOauthError.message;
      } else if (googleOauthData?.url) {
        googleProvider = 'enabled';
      } else {
        googleProvider = 'disabled';
      }

      // 检查GitHub提供商是否启用（通过尝试获取OAuth URL）
      const { data: githubOauthData, error: githubOauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
          skipBrowserRedirect: true, // 仅生成URL，不重定向
        },
      });

      if (githubOauthError) {
        githubProvider = 'error: ' + githubOauthError.message;
      } else if (githubOauthData?.url) {
        githubProvider = 'enabled';
      } else {
        githubProvider = 'disabled';
      }

    } catch (error) {
      supabaseConnection = 'failed: ' + String(error);
      googleProvider = 'failed: ' + String(error);
      githubProvider = 'failed: ' + String(error);
    }

    const result = {
      success: true,
      config,
      connections: {
        supabase: supabaseConnection,
        googleProvider: googleProvider,
        githubProvider: githubProvider
      },
      recommendations: []
    };

    // 添加建议
    if (!config.supabaseUrl || !config.supabaseKey) {
      result.recommendations.push('请配置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY环境变量');
    }

    if (googleProvider.includes('error') || googleProvider === 'disabled') {
      result.recommendations.push('请在Supabase控制台中启用Google OAuth提供商');
      result.recommendations.push('确保在Google Cloud Console中配置了正确的回调URL');
    }

    if (githubProvider.includes('error') || githubProvider === 'disabled') {
      result.recommendations.push('请在Supabase控制台中启用GitHub OAuth提供商');
      result.recommendations.push('确保在GitHub OAuth应用中配置了正确的回调URL');
    }

    if (!config.siteUrl) {
      result.recommendations.push('请配置NEXT_PUBLIC_SITE_URL环境变量');
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        recommendations: ['检查服务器配置和权限']
      },
      { status: 500 }
    );
  }
}