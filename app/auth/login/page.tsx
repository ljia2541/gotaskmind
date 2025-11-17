'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Github } from 'lucide-react';
import { useAuthContext } from '@/app/providers/auth-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

/**
 * 登录页面
 */
export default function LoginPage() {
  const { isAuthenticated, login, loginWithGitHub } = useAuthContext();

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      redirect('/');
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">登录 GoTaskMind</CardTitle>
          <CardDescription className="text-center">
            选择您的登录方式，开始智能任务管理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={login}
          >
            <Mail className="mr-2 h-4 w-4" />
            使用 Google 邮箱登录
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={loginWithGitHub}
          >
            <Github className="mr-2 h-4 w-4" />
            使用 GitHub 账号登录
          </Button>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground text-center">
            登录即表示您同意我们的
            <a href="/terms" className="text-primary hover:underline mx-1">
              服务条款
            </a>
            和
            <a href="/privacy" className="text-primary hover:underline mx-1">
              隐私政策
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}