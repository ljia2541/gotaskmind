'use server'

import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/app/lib/ai-service';
import { cookies } from 'next/headers';

/**
 * 获取任务统计和时间跟踪数据的API端点
 * 提供基本统计数据和AI智能分析建议
 * @returns 分析数据或错误信息
 */
export async function GET(request: NextRequest) {
  try {
    // 检查用户认证状态
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: '请先登录后再查看分析数据' },
        { status: 401 }
      );
    }

    // 生成模拟分析数据
    const now = new Date();
    const dailyLabels = [];
    const dailyCounts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyLabels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      dailyCounts.push(Math.floor(Math.random() * 10) + 1);
    }

    // 生成模拟分析数据
    const analyticsData = {
      // 总览数据
      overview: {
        totalTasks: 125,
        completedTasks: 89,
        pendingTasks: 36,
        completionRate: 71.2,
        averageCompletionTime: 2.5,
        estimatedHoursThisWeek: 42,
        spentHoursThisWeek: 38.5
      },

      // 任务状态分布
      statusDistribution: [
        { name: '待办', value: 36, color: '#3B82F6' },
        { name: '进行中', value: 24, color: '#F59E0B' },
        { name: '已完成', value: 89, color: '#10B981' },
        { name: '已归档', value: 18, color: '#6B7280' }
      ],

      // 任务优先级分布
      priorityDistribution: [
        { name: '高', value: 32, color: '#EF4444' },
        { name: '中', value: 65, color: '#F59E0B' },
        { name: '低', value: 45, color: '#10B981' }
      ],

      // 任务类别分布
      categoryDistribution: [
        { name: '工作', value: 78, color: '#3B82F6' },
        { name: '学习', value: 24, color: '#8B5CF6' },
        { name: '个人', value: 16, color: '#EC4899' },
        { name: '其他', value: 7, color: '#6B7280' }
      ],

      // 每日任务完成趋势
      dailyTaskCompletion: {
        labels: dailyLabels,
        data: dailyCounts,
        total: dailyCounts.reduce((sum, count) => sum + count, 0)
      },

      // 时间跟踪统计
      timeTracking: {
        byCategory: [
          { category: '工作', estimatedHours: 24, actualHours: 22.5, efficiency: 93.8 },
          { category: '学习', estimatedHours: 12, actualHours: 10.8, efficiency: 90 },
          { category: '个人', estimatedHours: 6, actualHours: 5.2, efficiency: 86.7 }
        ],
        totalEstimatedHours: 42,
        totalActualHours: 38.5,
        overallEfficiency: 91.7
      }
    };

    // 调用AI服务获取智能分析建议
    let aiInsights = '';
    try {
      const aiService = createAIService();
      aiInsights = await aiService.analyzeProject(analyticsData);
    } catch (aiError) {
      console.error('AI分析失败:', aiError);
      // AI分析失败不影响基本统计数据的返回
      aiInsights = '当前AI分析服务暂时不可用，请稍后再试';
    }

    return NextResponse.json({
      success: true,
      data: {
        statistics: analyticsData,
        insights: aiInsights,
        lastUpdated: now.toISOString()
      }
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json(
      { error: '获取分析数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 分析项目数据并提供AI洞察
 * @param request HTTP请求，包含任务数据
 * @returns AI生成的项目分析和建议
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
        completedTasks: data.tasks.filter((task: any) => task.status === 'completed' || task.status === 'done').length,
        highPriorityTasks: data.tasks.filter((task: any) => task.priority === 'high').length,
        currentDate: new Date().toISOString()
      }
    };
    
    try {
      // 调用AI服务进行分析
      const analysisResult = await aiService.analyzeProject(projectData);
      
      // 返回分析结果
      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      });
    } catch (aiError) {
      // AI分析失败时返回模拟分析结果作为后备
      console.warn('AI分析失败，返回模拟数据:', aiError);
      
      const mockAnalysis = {
        summary: '项目进展顺利，有' + projectData.metadata.totalTasks + '个任务，其中' + 
                projectData.metadata.completedTasks + '个已完成。',
        insights: [
          '建议关注高优先级任务的完成情况',
          '考虑对进度落后的任务重新评估时间估计',
          '总体任务完成率良好'
        ],
        recommendations: [
          '优化任务分配，平衡团队工作量',
          '定期回顾项目进展，及时调整计划',
          '关注任务依赖关系，避免阻塞'
        ],
        isMockData: true
      };
      
      return NextResponse.json({
        success: true,
        analysis: mockAnalysis,
        message: 'AI分析暂时不可用，返回模拟分析结果',
        timestamp: new Date().toISOString()
      });
    }
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