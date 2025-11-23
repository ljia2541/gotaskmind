'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/hooks/use-auth';
import { useFeatureAccess } from '@/app/hooks/use-feature-access';
import { NotificationButton } from '@/components/ui/notification-button';
import { LogOut, UserCircle2, Menu, CreditCard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/components/ui/use-mobile';
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';

/**
 * 认证导航组件
 * 根据用户登录状态显示不同的导航选项
 */
export function AuthNavigation() {
  const { user, isAuthenticated, loginWithGoogle, loginWithGitHub, logout, isPro, subscription } = useAuth();
  const { canAccessAnalytics } = useFeatureAccess();
  const isMobile = useIsMobile();
  // 使用Next.js提供的usePathname钩子获取当前路径，避免使用window对象
  const pathname = usePathname();

  // 添加调试日志
  useEffect(() => {
    console.log('📍 AuthNavigation 状态更新:', {
      hasUser: !!user,
      userEmail: user?.email,
      isPro,
      planId: subscription?.planId,
      pathname
    });
  }, [user, isPro, subscription, pathname]);

  // 服务端渲染时始终使用默认语言(中文)，避免Hydration不匹配
  // 在客户端组件中，可以在useEffect中更新语言
  const [userLanguage, setUserLanguage] = useState('zh');
  const [translations, setTranslations] = useState(analyticsTranslations['zh']);
  
  // 在客户端加载后更新语言偏好
  useEffect(() => {
    const clientLanguage = LanguageService.getUserLanguage() || 'zh';
    setUserLanguage(clientLanguage);
    setTranslations(analyticsTranslations[clientLanguage]);
  }, [])
  
  // 桌面端导航 - 放在右侧
  const DesktopNavigation = () => {
    // 获取当前路径，用于高亮当前页面
    const currentPath = pathname;
    
    return (
      <nav className="hidden md:flex items-center justify-end gap-6 ml-auto">
        <Link 
          href="/" 
          className={`text-sm transition-colors ${currentPath === '/' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {translations.navigation.home}
        </Link>
        <Link 
          href="/tasks" 
          className={`text-sm transition-colors ${currentPath === '/tasks' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {translations.navigation.tasks}
        </Link>
        {canAccessAnalytics ? (
          <Link
            href="/analytics"
            className={`text-sm transition-colors ${currentPath === '/analytics' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {translations.navigation.analytics}
          </Link>
        ) : (
          <button
            onClick={() => {
              // 存储购买意图
              if (user && user.email) {
                localStorage.setItem('pending_purchase', JSON.stringify({
                  planId: 'pro-monthly',
                  feature: '数据分析',
                  timestamp: Date.now(),
                  returnTo: '/analytics'
                }));
              }
              // 跳转到定价页面
              window.location.href = '/pricing';
            }}
            className={`text-sm transition-colors text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0 flex items-center gap-1`}
          >
            <span>{translations.navigation.analytics}</span>
            <span className="text-xs opacity-70">🔒</span>
          </button>
        )}
        <button
          onClick={() => {
            if (currentPath === '/') {
              // 如果在主页，滚动到定价部分
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } else {
              // 如果在其他页面，跳转到定价页面
              window.location.href = '/pricing';
            }
          }}
          className={`text-sm transition-colors ${currentPath === '/pricing' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'} bg-transparent border-none cursor-pointer p-0`}
        >
          {translations.navigation.pricing}
        </button>
        {isAuthenticated && isPro && (
          <Link
            href="/settings/subscription"
            className={`text-sm transition-colors ${currentPath === '/settings/subscription' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <CreditCard className="w-4 h-4 inline mr-1" />
            {translations.navigation.subscription}
          </Link>
        )}
          {isAuthenticated ? (
          <>
            {/* <NotificationButton userEmail={user?.email} isPro={isPro} /> */}
            <AuthenticatedMenu user={user!} onLogout={logout} translations={translations} />
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={loginWithGoogle}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" size="sm" onClick={loginWithGitHub}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>
        )}
      </nav>
    );
  };

  // 移动端导航
  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <div className="flex flex-col gap-6 mt-10">
        <Link 
          href="/" 
          className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
        >
          {translations.navigation.home}
        </Link>
        <Link 
          href="/tasks" 
          className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
        >
          {translations.navigation.tasks}
        </Link>
        {canAccessAnalytics ? (
          <Link
            href="/analytics"
            className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
          >
            {translations.navigation.analytics}
          </Link>
        ) : (
          <button
            onClick={() => {
              // 存储购买意图
              if (user && user.email) {
                localStorage.setItem('pending_purchase', JSON.stringify({
                  planId: 'pro-monthly',
                  feature: '数据分析',
                  timestamp: Date.now(),
                  returnTo: '/analytics'
                }));
              }
              // 跳转到定价页面
              window.location.href = '/pricing';
            }}
            className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors w-full text-left bg-transparent border-none cursor-pointer flex items-center justify-between"
          >
            <span>{translations.navigation.analytics}</span>
            <span className="text-xs opacity-70">🔒</span>
          </button>
        )}
          <button
          onClick={() => {
            const pricingSection = document.getElementById('pricing');
            if (pricingSection && pathname === '/') {
              // 如果在主页，关闭侧边栏并滚动到定价部分
              pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              // 如果在其他页面，跳转到定价页面
              window.location.href = '/pricing';
            }
          }}
          className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors w-full text-left bg-transparent border-none cursor-pointer"
        >
          {translations.navigation.pricing}
        </button>
        <Separator />
          {isAuthenticated && isPro && (
            <Link
              href="/settings/subscription"
              className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors flex items-center gap-3"
            >
              <CreditCard className="w-4 h-4" />
              {translations.navigation.subscription}
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {user?.picture ? (
                      <img src={user.picture} alt={user.name} />
                    ) : (
                      <UserCircle2 className="h-5 w-5" />
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                {/* <NotificationButton userEmail={user?.email} isPro={isPro} /> */}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {translations.navigation.logout}
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <Button variant="default" className="w-full" onClick={loginWithGoogle}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full" onClick={loginWithGitHub}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <DesktopNavigation />
      <MobileNavigation />
    </>
  );
}

/**
 * 已登录用户菜单组件
 */
interface AuthenticatedMenuProps {
  user: { name: string; email: string; picture?: string };
  onLogout: () => void;
  translations: typeof analyticsTranslations.zh; // 添加translations prop类型
}

function AuthenticatedMenu({ user, onLogout, translations }: AuthenticatedMenuProps) {
  const { isPro } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {user.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <UserCircle2 className="h-5 w-5" />
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-10 w-10">
            {user.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <UserCircle2 className="h-6 w-6" />
            )}
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {user.email}
            </p>
          </div>
        </div>
        <Separator />
        {isPro && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings/subscription" className="flex items-center w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{translations.navigation.subscription}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{translations.navigation.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}