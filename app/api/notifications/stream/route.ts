import { NextRequest } from 'next/server';

// 活跃的SSE连接映射
const activeConnections: Map<string, Set<ReadableStreamDefaultController>> = new Map();

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

export async function GET(request: NextRequest) {
  console.log('📡 收到SSE连接请求');

  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    console.log(`📧 解析到的用户邮箱: ${userEmail}`);

    if (!userEmail) {
      console.log('❌ 缺少用户邮箱参数');
      return new Response(JSON.stringify({ error: '用户邮箱是必需的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔗 开始建立SSE连接: ${userEmail}`);

    // 创建一个可读流
    const stream = new ReadableStream({
      start(controller) {
        console.log(`✅ SSE流已创建: ${userEmail}`);

        // 保存连接控制器
        if (!activeConnections.has(userEmail)) {
          activeConnections.set(userEmail, new Set());
          console.log(`📝 为用户 ${userEmail} 创建新的连接集合`);
        }

        activeConnections.get(userEmail)!.add(controller);
        const totalConnections = activeConnections.get(userEmail)!.size;
        console.log(`🔌 用户 ${userEmail} 的活跃连接数: ${totalConnections}`);

        let heartbeatInterval: NodeJS.Timeout | null = null;

        // 清理函数
        const cleanup = () => {
          console.log(`🔌 断开SSE连接: ${userEmail}`);
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
          }
          const connections = activeConnections.get(userEmail);
          if (connections) {
            connections.delete(controller);
            const remainingConnections = connections.size;
            console.log(`📊 用户 ${userEmail} 剩余连接数: ${remainingConnections}`);
            if (remainingConnections === 0) {
              activeConnections.delete(userEmail);
              console.log(`🗑️ 移除用户 ${userEmail} 的连接集合`);
            }
          }
        };

        try {
          // 发送初始连接确认
          const connectMessage = JSON.stringify({
            type: 'connected',
            message: '通知流已建立',
            userEmail: userEmail,
            timestamp: new Date().toISOString()
          });

          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${connectMessage}\n\n`));
          console.log(`📨 发送连接确认消息: ${userEmail}`);

          // 定期发送心跳包（每15秒，缩短间隔以便快速检测连接）
          heartbeatInterval = setInterval(() => {
            try {
              const heartbeatMessage = JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                userEmail: userEmail
              });
              controller.enqueue(encoder.encode(`data: ${heartbeatMessage}\n\n`));
              console.log(`💓 发送心跳包: ${userEmail}`);
            } catch (error) {
              console.error(`❌ 发送心跳包失败: ${userEmail}`, error);
              if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
              }
              cleanup();
            }
          }, 15000);

          return cleanup;

        } catch (writeError) {
          console.error(`❌ 写入初始消息失败: ${userEmail}`, writeError);
          cleanup();
          throw writeError;
        }
      },
      cancel() {
        console.log(`❌ SSE流被取消: ${userEmail}`);
        const connections = activeConnections.get(userEmail);
        if (connections) {
          console.log(`🧹 清理用户 ${userEmail} 的连接`);
          activeConnections.delete(userEmail);
        }
      }
    });

    console.log(`🚀 返回SSE响应: ${userEmail}`);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });

  } catch (error) {
    console.error('❌ SSE连接建立失败:', error);
    return new Response(JSON.stringify({
      error: 'SSE连接建立失败',
      details: error instanceof Error ? error.message : '未知错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 导出连接管理函数供其他API使用
export function getActiveConnections() {
  return activeConnections;
}

export function broadcastNotification(userEmail: string, notification: any) {
  const connections = activeConnections.get(userEmail);
  if (connections && connections.size > 0) {
    console.log(`📡 广播通知给 ${userEmail} 的 ${connections.size} 个连接`);

    const encoder = new TextEncoder();
    connections.forEach(controller => {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'new_notification',
          notification,
          timestamp: new Date().toISOString()
        })}\n\n`));
      } catch (error) {
        console.error('广播通知失败:', error);
        // 移除失效的连接
        connections.delete(controller);
      }
    });

    return connections.size;
  }
  return 0;
}