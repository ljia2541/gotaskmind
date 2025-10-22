'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/hooks/use-auth';
import { LogOut, UserCircle2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/components/ui/use-mobile';
import { LanguageService, analyticsTranslations } from '@/app/lib/language-service';

/**
 * 认证导航组件
 * 根据用户登录状态显示不同的导航选项
 */
export function AuthNavigation() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const isMobile = useIsMobile();
  // 使用Next.js提供的usePathname钩子获取当前路径，避免使用window对象
  const pathname = usePathname();

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
        <Link 
          href="/team" 
          className={`text-sm transition-colors ${currentPath === '/team' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {translations.navigation.team}
        </Link>
        <Link 
          href="/analytics" 
          className={`text-sm transition-colors ${currentPath === '/analytics' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {translations.navigation.analytics}
        </Link>
        {isAuthenticated ? (
          <AuthenticatedMenu user={user!} onLogout={logout} translations={translations} />
        ) : (
          <Button variant="default" size="sm" onClick={login}>
          {translations.navigation.login}
        </Button>
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
        <Link 
          href="/analytics" 
          className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
        >
          {translations.navigation.analytics}
        </Link>
        <Link 
          href="/team" 
          className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
        >
          {translations.navigation.team}
        </Link>
        <Separator />
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-3">
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
            <Button variant="default" className="w-full" onClick={login}>
              {translations.navigation.login}
            </Button>
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
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{translations.navigation.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}