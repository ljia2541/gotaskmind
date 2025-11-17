import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 创建Supabase服务器端客户端
 * 配置为使用cookies存储会话信息
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 如果在Server Component中调用setAll方法，可以忽略
            // 因为中间件会刷新用户会话
          }
        },
      },
    }
  );
}