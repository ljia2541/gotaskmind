import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * 创建Supabase服务器端客户端
 * 配置为使用cookies存储会话信息，增强生产环境兼容性
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch (error) {
            console.error('获取cookies失败:', error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 确保在生产环境中设置正确的cookie属性
              const cookieOptions = {
                ...options,
                secure: process.env.NODE_ENV === 'production' ? true : options?.secure,
                sameSite: 'lax' as const,
                httpOnly: true,
              };

              cookieStore.set(name, value, cookieOptions);
            });
          } catch (error) {
            console.error('设置cookies失败:', error);
            // 在某些环境下（如静态导出）可能无法设置cookies
            // 这是预期的行为，不会影响应用运行
          }
        },
      },
    }
  );
}