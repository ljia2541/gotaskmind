"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/app/hooks/use-auth';
import { useServerNotifications } from '@/app/hooks/use-server-notifications';
import { NotificationButton } from '@/components/ui/notification-button';

export default function NotificationTestPage() {
  const { user, isAuthenticated, isPro } = useAuth();
  const { createNotification, notifications, reload, loading, error, isConnected } = useServerNotifications(user?.email, isPro);

  const [testNotification, setTestNotification] = useState({
    type: 'project_assignment' as const,
    toEmail: '',
    metadata: {}
  });

  const handleSendTest = () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (!testNotification.toEmail) {
      toast.error('请输入接收者邮箱');
      return;
    }

    if (!user?.name) {
      toast.error('用户信息不完整');
      return;
    }

    const metadata: any = {};

    switch (testNotification.type) {
      case 'project_assignment':
        metadata.projectId = 'test-project';
        metadata.projectName = '测试项目';
        metadata.roleName = '编辑者';
        break;
            case 'project_removed':
        metadata.projectId = 'test-project';
        metadata.projectName = '测试项目';
        break;
      case 'task_update':
        metadata.taskTitle = '测试任务';
        metadata.action = '已完成';
        break;
    }

    const notification = createNotification(
      testNotification.type,
      user.id,
      user.name,
      testNotification.toEmail,
      metadata
    );

    if (notification) {
      toast.success('测试通知已发送', {
        description: `通知类型: ${testNotification.type}, 接收者: ${testNotification.toEmail}`
      });

      // 如果是发给自己的，刷新通知列表
      if (testNotification.toEmail === user.email) {
        setTimeout(() => {
          reload();
        }, 500);
      }
    } else {
      toast.error('发送通知失败');
    }
  };

  const handleSendToSelf = () => {
    if (!user?.email) return;

    setTestNotification(prev => ({
      ...prev,
      toEmail: user.email
    }));
  };

  const notificationTypes = [
    { value: 'project_assignment', label: '项目分配' },
    { value: 'project_removed', label: '项目移除' },
    { value: 'task_update', label: '任务更新' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">通知系统测试</h1>
        {isAuthenticated && <NotificationButton userEmail={user?.email} isPro={isPro} />}
      </div>

      <div className="grid gap-6">
        {/* 发送测试通知 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">发送测试通知</h2>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="notificationType">通知类型</Label>
              <Select
                value={testNotification.type}
                onValueChange={(value: any) => setTestNotification(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择通知类型" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="toEmail">接收者邮箱</Label>
              <div className="flex gap-2">
                <Input
                  id="toEmail"
                  type="email"
                  placeholder="输入接收者邮箱"
                  value={testNotification.toEmail}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, toEmail: e.target.value }))}
                />
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={handleSendToSelf}
                    title="使用自己的邮箱"
                  >
                    自己
                  </Button>
                )}
              </div>
            </div>

            <Button onClick={handleSendTest} className="w-full">
              发送测试通知
            </Button>
          </div>
        </Card>

        {/* 当前用户信息 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>
          <div className="grid gap-2 text-sm">
            <div><strong>登录状态:</strong> {isAuthenticated ? '已登录' : '未登录'}</div>
            <div><strong>用户ID:</strong> {user?.id || '无'}</div>
            <div><strong>用户名:</strong> {user?.name || '无'}</div>
            <div><strong>邮箱:</strong> {user?.email || '无'}</div>
            <div><strong>专业版:</strong> {isPro ? '是' : '否'}</div>
            <div className="flex items-center gap-2">
              <strong>通知连接:</strong>
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{isConnected ? '已连接' : '未连接'}</span>
            </div>
            <div><strong>加载状态:</strong> {loading ? '加载中' : '已完成'}</div>
            {error && <div className="text-red-600"><strong>错误:</strong> {error}</div>}
          </div>
        </Card>

        {/* 通知列表 */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">当前用户的通知 ({notifications.length})</h2>
            <Button variant="outline" size="sm" onClick={reload}>
              刷新
            </Button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无通知
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      notification.read ? 'bg-gray-100' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {notification.read ? '已读' : '未读'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <div className="text-xs text-muted-foreground">
                    <div>类型: {notification.type}</div>
                    <div>发送者: {notification.fromUserName} ({notification.fromUserId})</div>
                    <div>接收者: {notification.toUserEmail}</div>
                    <div>时间: {new Date(notification.createdAt).toLocaleString()}</div>
                    {notification.actionUrl && (
                      <div>操作链接: {notification.actionUrl}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}