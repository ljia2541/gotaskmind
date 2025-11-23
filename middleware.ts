import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 用于在服务器端处理Supabase会话管理和Cookie刷新
 * 遵循Supabase官方推荐的服务器端认证模式
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 创建Supabase服务器端客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 首先更新请求对象的cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });

          // 然后创建新的响应对象
          supabaseResponse = NextResponse.next({
            request,
          });

          // 最后设置响应的cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 刷新用户的会话（这是Supabase推荐的做法）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 开发环境下添加调试信息
  if (process.env.NODE_ENV === 'development' && user) {
    console.log('Middleware - 用户已登录:', {
      id: user.id,
      email: user.email,
      path: request.nextUrl.pathname
    });
  }

  // 受保护的路由列表（只有设置页面需要完全保护）
  const protectedRoutes = ['/settings'];
  const authRoutes = ['/auth'];

  // 公开的路由（允许未登录用户访问，但会提示登录）
  const publicRoutesWithAuthPrompt = ['/tasks', '/analytics'];

  const { pathname } = request.nextUrl;

  // 检查是否访问订阅管理页面
  if (pathname === '/settings/subscription') {
    console.log('访问订阅管理页面 - 用户状态:', {
      hasUser: !!user,
      userEmail: user?.email,
      referer: request.headers.get('referer')
    });

    // 如果用户已登录，允许访问
    if (user && user.email) {
      console.log('用户已登录，允许访问订阅管理页面');
      return supabaseResponse;
    }

    // 如果用户未登录，检查是否从支付成功页面跳转
    const referer = request.headers.get('referer');
    const isFromPaymentSuccess = referer?.includes('/payment/success');

    if (isFromPaymentSuccess) {
      console.log('从支付成功页面访问，允许通过');
      return supabaseResponse;
    }

    // 否则重定向到首页
    const url = request.nextUrl.clone();
    url.searchParams.set('redirectTo', pathname);
    url.pathname = '/';
    console.log('用户未登录，重定向到首页');
    return NextResponse.redirect(url);
  }

  // 如果用户未登录且访问其他完全保护的路由
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.searchParams.set('redirectTo', pathname);
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 如果用户已登录且访问认证页面，重定向到主页
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};