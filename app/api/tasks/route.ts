'use server'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Task } from '@/types/task';

/**
 * 获取所有任务的API端点
 * @returns 任务列表或错误信息
 */
export async function GET(request: NextRequest) {
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

    // 在实际应用中，这里应该从数据库获取任务
    // 现在使用模拟数据进行演示
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: '项目启动会议',
        description: '组织团队成员讨论项目范围和目标',
        status: 'todo',
        priority: 'high',
        category: 'work',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 2
      },
      {
        id: 'task-2',
        title: '用户需求分析',
        description: '收集和分析用户需求文档',
        status: 'in-progress',
        priority: 'medium',
        category: 'work',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 4
      },
      {
        id: 'task-3',
        title: '学习React新特性',
        description: '研究React 18的并发特性',
        status: 'todo',
        priority: 'low',
        category: 'learning',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 3
      }
    ];

    return NextResponse.json({
      success: true,
      tasks: mockTasks,
      total: mockTasks.length
    });
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
    const sessionCookie = cookies().get('user_session')?.value;
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
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: taskData.estimatedHours || undefined
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