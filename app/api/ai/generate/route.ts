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
    const apiKey = process.env.GROQ_API_KEY;
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
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedTasksJson);

      // 验证解析后的数据格式
      if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
        throw new Error('生成的任务格式不正确');
      }

      // 验证每个任务的必要字段
      for (const task of parsedResponse.tasks) {
        if (!task.id || !task.title || !task.category || !task.priority || !task.energy_level) {
          throw new Error('任务缺少必要字段');
        }
        // 验证新增字段
        if (task.estimated_hours !== undefined && (typeof task.estimated_hours !== 'number' || task.estimated_hours <= 0)) {
          throw new Error('任务预估时间必须是正数');
        }
        if (task.dependencies !== undefined && !Array.isArray(task.dependencies)) {
          throw new Error('任务依赖必须是数组');
        }
        // 验证字段值的有效性 - category现在支持更多灵活的分类
        const validCategories = ['work', 'personal', 'learning', 'other', 'planning', 'development', 'writing', 'creation', '规划', '学习', '开发', '写作', '创作'];
        if (!validCategories.includes(task.category)) {
          console.warn('任务分类可能不标准:', task.category);
          // 不抛出错误，允许灵活分类
        }
        if (!['low', 'medium', 'high'].includes(task.priority)) {
          throw new Error('任务优先级无效');
        }
        if (!['high', 'medium', 'low'].includes(task.energy_level)) {
          throw new Error('任务能量级别无效');
        }
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
      project_title: parsedResponse.project_title || '未命名项目',
      tasks: parsedResponse.tasks,
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