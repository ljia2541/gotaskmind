'use server'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Task } from '@/types/task';

/**
 * 获取单个任务的API端点
 * @param request NextRequest对象
 * @param params 路由参数，包含任务ID
 * @returns 任务详情或错误信息
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 检查用户认证状态
    const sessionCookie = cookies().get('user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取任务ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // 在实际应用中，这里应该从数据库获取任务
    // 现在使用模拟数据进行演示
    const mockTask: Task = {
      id: taskId,
      title: '示例任务',
      description: '这是一个示例任务描述',
      status: 'todo',
      priority: 'medium',
      category: 'work',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 2
    };

    return NextResponse.json({
      success: true,
      task: mockTask
    });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    return NextResponse.json(
      { error: '获取任务详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新任务的API端点
 * @param request 包含更新数据的请求
 * @param params 路由参数，包含任务ID
 * @returns 更新后的任务或错误信息
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 检查用户认证状态
    const sessionCookie = cookies().get('user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取任务ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // 解析请求体
    const updateData = await request.json();

    // 验证标题
    if (updateData.title !== undefined && (typeof updateData.title !== 'string' || updateData.title.trim().length === 0)) {
      return NextResponse.json(
        { error: '任务标题不能为空' },
        { status: 400 }
      );
    }

    // 在实际应用中，这里应该更新数据库中的任务
    // 现在使用模拟数据返回
    const updatedTask: Task = {
      id: taskId,
      title: updateData.title || '更新后的任务',
      description: updateData.description !== undefined ? updateData.description : '更新后的描述',
      status: updateData.status || 'in-progress',
      priority: updateData.priority || 'medium',
      category: updateData.category || 'work',
      createdAt: new Date().toISOString(),
      dueDate: updateData.dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: updateData.estimatedHours !== undefined ? updateData.estimatedHours : 3
    };

    return NextResponse.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('更新任务失败:', error);
    return NextResponse.json(
      { error: '更新任务失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除任务的API端点
 * @param request NextRequest对象
 * @param params 路由参数，包含任务ID
 * @returns 删除结果或错误信息
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 检查用户认证状态
    const sessionCookie = cookies().get('user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取任务ID
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // 在实际应用中，这里应该从数据库删除任务
    // 现在直接返回成功

    return NextResponse.json({
      success: true,
      message: '任务删除成功',
      taskId
    });
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json(
      { error: '删除任务失败' },
      { status: 500 }
    );
  }
}