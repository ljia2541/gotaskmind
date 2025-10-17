import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/app/lib/ai-service';

/**
 * 分析项目数据并提供AI洞察
 * @param request HTTP请求，包含任务数据
 * @returns AI生成的项目分析和建议
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const data = await request.json();
    
    // 验证请求数据
    if (!data.tasks || !Array.isArray(data.tasks)) {
      return NextResponse.json(
        { error: '无效的请求数据：必须提供tasks数组' },
        { status: 400 }
      );
    }
    
    // 创建AI服务实例
    const aiService = createAIService();
    
    // 准备项目数据
    const projectData = {
      tasks: data.tasks,
      metadata: {
        totalTasks: data.tasks.length,
        completedTasks: data.tasks.filter((task: any) => task.status === 'completed').length,
        highPriorityTasks: data.tasks.filter((task: any) => task.priority === 'high').length,
        currentDate: new Date().toISOString()
      }
    };
    
    // 调用AI服务进行分析
    const analysisResult = await aiService.analyzeProject(projectData);
    
    // 返回分析结果
    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });
  } catch (error) {
    console.error('项目分析API错误:', error);
    return NextResponse.json(
      { 
        error: '项目分析失败', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}