'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/hooks/use-auth';
import { LogOut, UserCircle2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/components/ui/use-mobile';

/**
 * 认证导航组件
 * 根据用户登录状态显示不同的导航选项
 */
export function AuthNavigation() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const isMobile = useIsMobile();

  // 桌面端导航
  const DesktopNavigation = () => (
    <nav className="hidden md:flex items-center justify-end gap-8">
      <Link href="/" className="font-bold text-foreground hover:text-foreground transition-colors">
        首页
      </Link>
      <Link href="/tasks" className="font-bold text-foreground hover:text-foreground transition-colors">
        任务管理
      </Link>
      <Link href="/analytics" className="font-bold text-foreground hover:text-foreground transition-colors">
        数据分析
      </Link>
      <Link href="/features" className="font-bold text-foreground hover:text-foreground transition-colors">
        功能
      </Link>
      {isAuthenticated ? (
        <AuthenticatedMenu user={user!} onLogout={logout} />
      ) : (
        <Button variant="default" size="sm" onClick={login}>
          登录
        </Button>
      )}
    </nav>
  );

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
            首页
          </Link>
          <Link 
            href="/tasks" 
            className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
          >
            任务管理
          </Link>
          <Link 
            href="/analytics" 
            className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
          >
            数据分析
          </Link>
          <Link 
            href="/features" 
            className="text-base hover:bg-accent hover:text-accent-foreground py-2 px-3 rounded-md transition-colors"
          >
            功能
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
                退出登录
              </Button>
            </>
          ) : (
            <Button variant="default" className="w-full" onClick={login}>
              登录
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
}

function AuthenticatedMenu({ user, onLogout }: AuthenticatedMenuProps) {
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
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}