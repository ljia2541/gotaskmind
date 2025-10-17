import { NextResponse } from 'next/server';
import { createAIService } from '@/app/lib/ai-service';

/**
 * 处理AI任务分解请求
 * @param request Request对象，包含项目描述
 * @returns NextResponse 包含生成的任务列表或错误信息
 */
export async function POST(request: Request) {
  try {
    // 解析请求体中的项目描述
    const { projectDescription } = await request.json();
    
    // 验证项目描述是否为空
    if (!projectDescription) {
      return NextResponse.json(
        { error: '项目描述不能为空' },
        { status: 400 }
      );
    }
    
    // 使用工厂函数创建AI服务实例，确保正确处理API密钥
    const aiService = createAIService();
    
    // 生成任务分解
    const taskBreakdown = await aiService.generateTaskBreakdown(projectDescription);
    
    // 解析生成的JSON
    const parsedTasks = JSON.parse(taskBreakdown);
    
    // 返回成功响应，包含生成的任务列表
    return NextResponse.json({
      success: true,
      tasks: parsedTasks.tasks
    });
  } catch (error) {
    // 记录错误信息
    console.error('AI任务分解失败:', error);
    // 返回错误响应
    return NextResponse.json(
      { error: '任务分解生成失败，请重试' },
      { status: 500 }
    );
  }
}