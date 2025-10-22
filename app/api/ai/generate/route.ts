'use server'

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/app/lib/ai-service';

/**
 * 处理AI任务生成请求
 * @param request NextRequest对象，包含请求数据
 * @returns NextResponse对象，包含生成的任务数据或错误信息
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体数据
    const { projectDescription } = await request.json();
    
    // 2. 验证请求参数
    if (!projectDescription || typeof projectDescription !== 'string' || projectDescription.trim().length === 0) {
      return NextResponse.json(
        { error: '项目描述不能为空' },
        { status: 400 }
      );
    }
    
    // 3. 获取DeepSeek API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI服务配置未完成，请联系管理员' },
        { status: 500 }
      );
    }
    
    // 4. 创建AI服务实例
    const aiService = new AIService(apiKey);
    
    // 5. 调用AI服务生成任务分解
    const generatedTasksJson = await aiService.generateTaskBreakdown(projectDescription);
    
    // 6. 解析生成的JSON字符串
    let parsedTasks;
    try {
      parsedTasks = JSON.parse(generatedTasksJson);
      
      // 验证解析后的数据格式
      if (!parsedTasks.tasks || !Array.isArray(parsedTasks.tasks)) {
        throw new Error('生成的任务格式不正确');
      }
    } catch (parseError) {
      console.error('解析AI生成的任务失败:', parseError);
      return NextResponse.json(
        { error: '解析AI生成的任务失败，请重试' },
        { status: 500 }
      );
    }
    
    // 7. 返回成功响应
    return NextResponse.json({
      success: true,
      tasks: parsedTasks.tasks,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    // 8. 处理异常
    console.error('AI任务生成失败:', error);
    return NextResponse.json(
      { error: '任务生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}