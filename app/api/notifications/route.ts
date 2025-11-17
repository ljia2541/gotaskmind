import { NextRequest, NextResponse } from 'next/server';
import { broadcastNotification } from './stream/route';

// 模拟数据库 - 在实际项目中应该使用真正的数据库
let notifications: Array<{
  id: string;
  type: string;
  title: string;
  message: string;
  fromUserId: string;
  fromUserName: string;
  toUserEmail: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}> = [];

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const type = searchParams.get('type');
    const read = searchParams.get('read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userEmail) {
      return NextResponse.json(
        { error: '用户邮箱是必需的' },
        { status: 400 }
      );
    }

    // 过滤通知
    let userNotifications = notifications.filter(n => n.toUserEmail === userEmail);

    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    if (read !== null) {
      const isRead = read === 'true';
      userNotifications = userNotifications.filter(n => n.read === isRead);
    }

    // 排序和分页
    userNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginatedNotifications = userNotifications.slice(offset, offset + limit);

    return NextResponse.json({
      notifications: paginatedNotifications,
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      hasMore: offset + limit < userNotifications.length
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      }
    });

  } catch (error) {
    console.error('获取通知失败:', error);
    return NextResponse.json(
      { error: '获取通知失败' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      fromUserId,
      fromUserName,
      toUserEmail,
      metadata
    } = body;

    // 验证必需字段
    if (!type || !fromUserId || !fromUserName || !toUserEmail) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
          }
        }
      );
    }

    // 通知模板
    const templates = {
      project_assignment: {
        title: '项目分配',
        message: `${fromUserName} 将您分配到项目 ${metadata?.projectName || ''}`,
        actionUrl: '/tasks',
        actionText: '查看项目'
      },
      project_removed: {
        title: '项目移除',
        message: `${fromUserName} 将您从项目 ${metadata?.projectName || ''} 中移除`,
        actionUrl: '/tasks',
        actionText: '查看详情'
      },
      task_update: {
        title: '任务更新',
        message: `${fromUserName} 更新了任务 ${metadata?.taskTitle || ''}: ${metadata?.action || ''}`,
        actionUrl: '/tasks',
        actionText: '查看任务'
      }
    };

    const template = templates[type as keyof typeof templates];
    if (!template) {
      return NextResponse.json(
        { error: '不支持的通知类型' },
        { status: 400 }
      );
    }

    // 创建通知
    const notification = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      message: template.message,
      fromUserId,
      fromUserName,
      toUserEmail,
      createdAt: new Date().toISOString(),
      read: false,
      actionUrl: template.actionUrl,
      actionText: template.actionText,
      metadata
    };

    // 保存到"数据库"
    notifications.push(notification);

    console.log('✅ 新通知已创建:', {
      id: notification.id,
      type: notification.type,
      toUserEmail: notification.toUserEmail,
      fromUserName: notification.fromUserName
    });

    // 使用SSE广播通知给目标用户的所有活跃连接
    const broadcastCount = broadcastNotification(toUserEmail, notification);
    if (broadcastCount > 0) {
      console.log(`📡 通知已实时推送给 ${toUserEmail} 的 ${broadcastCount} 个连接`);
    } else {
      console.log(`📬 用户 ${toUserEmail} 当前无活跃连接，通知已保存到数据库`);
    }

    return NextResponse.json({
      success: true,
      notification
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      }
    });

  } catch (error) {
    console.error('创建通知失败:', error);
    return NextResponse.json(
      { error: '创建通知失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action, userEmail } = body;

    if (!notificationId || !action || !userEmail) {
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    const notification = notifications.find(n =>
      n.id === notificationId && n.toUserEmail === userEmail
    );

    if (!notification) {
      return NextResponse.json(
        { error: '通知不存在或无权限' },
        { status: 404 }
      );
    }

    if (action === 'mark_read') {
      notification.read = true;
      notification.updatedAt = new Date().toISOString();
    } else if (action === 'mark_unread') {
      notification.read = false;
      notification.updatedAt = new Date().toISOString();
    } else if (action === 'delete') {
      const index = notifications.indexOf(notification);
      notifications.splice(index, 1);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: true,
      notification
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      }
    });

  } catch (error) {
    console.error('更新通知失败:', error);
    return NextResponse.json(
      { error: '更新通知失败' },
      { status: 500 }
    );
  }
}