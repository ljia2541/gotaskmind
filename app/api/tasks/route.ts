'use server'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Task } from '@/types/task';

/**
 * 获取所有任务的API端点
 * @returns 任务列表或错误信息
 */
export async function GET() {
  try {
      // 检查用户认证状态
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('user_session')?.value;
      if (!sessionCookie) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 由于在服务器端无法直接访问localStorage，我们创建一个适配方案
    // 先尝试从客户端传递的数据中获取任务
    const tasks: Task[] = [];

    // 在服务器环境中，我们不能直接访问localStorage
    // 但是我们可以通过请求头或查询参数从客户端获取数据
    // 为了保持向后兼容，这里先返回空数组，让客户端自行处理

    // 注意：这是一个临时解决方案
    // 理想情况下应该使用数据库来存储任务数据
    console.log('API请求：返回空任务数组，将由客户端从localStorage填充');

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('获取任务失败:', error);
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建新任务的API端点
 * @param request 包含任务数据的请求
 * @returns 创建的任务或错误信息
 */
export async function POST(request: NextRequest) {
  try {
    // 检查用户认证状态
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 解析请求体
    const taskData = await request.json();

    // 验证必要字段
    if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim().length === 0) {
      return NextResponse.json(
        { error: '任务标题不能为空' },
        { status: 400 }
      );
    }

    // 在实际应用中，这里应该保存到数据库
    // 现在使用模拟数据返回
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'work',
      createdAt: new Date().toISOString(),
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}