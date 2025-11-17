'use client';

/**
 * 语言服务类，用于管理应用的语言一致性
 */
export class LanguageService {
  /**
   * 检测文本是否包含中文
   * @param text 要检测的文本
   * @returns boolean 是否包含中文
   */
  static isChinese(text: string): boolean {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  /**
   * 检测任务数据的主要语言
   * @param tasks 任务数组
   * @returns 'zh' | 'en' 检测到的语言代码
   */
  static detectTasksLanguage(tasks: Array<{ title?: string; description?: string }>): 'zh' | 'en' {
    if (!tasks || tasks.length === 0) {
      // 默认使用中文
      return 'zh';
    }

    let chineseCount = 0;
    let englishCount = 0;

    tasks.forEach(task => {
      const hasChineseTitle = task.title ? LanguageService.isChinese(task.title) : false;
      const hasChineseDesc = task.description ? LanguageService.isChinese(task.description) : false;
      
      if (hasChineseTitle || hasChineseDesc) {
        chineseCount++;
      } else {
        englishCount++;
      }
    });

    // 如果中文任务数量多于英文任务，返回中文，否则返回英文
    return chineseCount >= englishCount ? 'zh' : 'en';
  }

  /**
   * 保存用户语言偏好到本地存储
   * @param language 语言代码 'zh' | 'en'
   */
  static saveUserLanguage(language: 'zh' | 'en'): void {
    try {
      localStorage.setItem('userLanguage', language);
    } catch (error) {
      console.error('保存语言偏好失败:', error);
    }
  }

  /**
   * 获取用户保存的语言偏好
   * 注意：在客户端组件中使用，服务端组件需要使用默认值
   * @returns 'zh' | 'en' | null 语言代码或null（如果没有保存）
   */
  static getUserLanguage(): 'zh' | 'en' | null {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('userLanguage');
        return saved === 'zh' || saved === 'en' ? saved : null;
      }
      return null;
    } catch (error) {
      console.error('获取语言偏好失败:', error);
      return null;
    }
  }
}

/**
 * 分析页面的翻译文本
 */
export const analyticsTranslations = {
  zh: {
    // 页面标题和导航
    title: '数据分析',
    navigation: {
      home: '首页',
      tasks: '任务管理',
        analytics: '数据分析',
      pricing: '定价',
      refresh: '刷新',
      login: '登录',
      logout: '登出',
      loginWithGoogle: '使用Google登录'
    },
    
    // 摘要卡片
    summary: {
      totalTasks: '总任务数',
      completedTasks: '已完成',
      completionRate: '完成率',
      total: '总数',
      success: '成功',
      progress: '进度'
    },
    
    // 图表标题和描述
    charts: {
      completionOverview: {
        title: '项目完成概览',
        description: '整体任务完成情况'
      },
      priorityDistribution: {
        title: '优先级分布',
        description: '任务优先级占比分析'
      },
      taskCompletionTrend: {
        title: '任务完成趋势',
        description: '最近7天的任务创建与完成情况'
      },
      averageCompletionTime: {
        title: '类别平均完成时间',
        description: '各类别任务的平均完成天数',
        days: '天数'
      },
      deadlineWarning: {
        title: '截止日期预警',
        description: '任务到期时间分布分析'
      },
      creationTimeDistribution: {
        title: '创建时间分布',
        description: '一天中不同时间段的任务创建情况'
      },
      categoryDistribution: {
        title: '类别分布',
        description: '任务类型分类'
      },
      upcomingTasks: {
        title: '即将到期任务',
        description: '按截止日期排序',
        viewAll: '查看全部',
        collapse: '收起'
      }
    },
    
    // 任务状态标签
    statusLabels: {
      todo: '待办',
      'in-progress': '进行中',
      completed: '已完成',
      done: '完成'
    },
    
    // 优先级标签
    priorityLabels: {
      low: '低',
      medium: '中',
      high: '高'
    },
    
    // 类别标签
    categoryLabels: {
      work: '工作',
      personal: '个人',
      learning: '学习',
      other: '其他'
    },
    
    // 时间相关
    timeRelated: {
      noDueDate: '无截止日期',
      expired: '已过期',
      dueToday: '今天到期',
      dueTomorrow: '明天到期',
      daysRemaining: (days: number) => `${days}天后到期`,
      morning: '早上(06:00-10:00)',
      lateMorning: '上午(10:00-12:00)',
      afternoon: '下午(12:00-18:00)',
      evening: '晚上(18:00-22:00)',
      night: '深夜(22:00-06:00)'
    },
    
    // 截止日期预警级别
    deadlineLevels: {
      expired: '过期',
      urgent: '紧急',
      upcoming: '即将到期',
      safe: '安全',
      noDueDate: '无截止日期'
    },
    
    // 图表提示文本
    tooltip: {
      tasks: '个任务',
      quantity: '数量',
      created: '创建',
      completed: '完成',
      averageTime: '平均完成时间',
      days: '天'
    },
    
    // 空状态
    emptyState: {
      noUpcomingTasks: '没有即将到期的任务',
      allTasksScheduled: '所有任务都已安排妥当'
    },
    
    // AI洞察
    aiInsights: {
      title: 'AI 项目洞察',
      description: '基于您的任务数据生成的智能建议',
      loading: '加载中...'
    },
    
    // 备份洞察内容
    backupInsights: {
      title: '项目分析报告',
      completionSection: '完成情况',
      completionText: (completed: number, rate: number) => `您已完成 ${completed} 个任务，完成率为 ${rate}%。`,
      prioritySection: '优先级分布',
      priorityText: (count: number) => `当前有 ${count} 个高优先级任务需要关注。`,
      timeManagementSection: '时间管理',
      timeManagementText: (count: number) => `您有 ${count} 个任务将在3天内到期，建议优先处理。`,
      suggestionsSection: '改进建议',
      suggestion1: '考虑对剩余任务进行重新排序，优先处理高优先级且即将到期的任务',
      suggestion2: '对于工作量较大的项目，可以进一步拆分任务以提高完成效率',
      suggestion3: '定期回顾已完成任务，总结经验教训以优化未来工作流程'
    },
    errors: {
      notAuthenticated: '您尚未登录',
      authCheckFailed: '认证检查失败，请重试',
      unauthorized: '未授权访问，请重新登录',
      loadTasksFailed: '加载任务数据失败',
      loadTasksError: '加载任务时发生错误',
      loadAnalyticsFailed: '加载分析数据失败',
      aiAnalysisFailed: 'AI分析失败',
      authRequired: '需要登录',
      loginToViewAnalytics: '请登录后查看您的任务分析数据'
    }
  },
  
  en: {
    // 页面标题和导航
    title: 'Analytics',
    navigation: {
      home: 'Home',
      tasks: 'Tasks',
        analytics: 'Analytics',
      pricing: 'Pricing',
      refresh: 'Refresh',
      login: 'Login',
      logout: 'Logout',
      loginWithGoogle: 'Login with Google'
    },
    
    // 摘要卡片
    summary: {
      totalTasks: 'Total Tasks',
      completedTasks: 'Completed',
      completionRate: 'Completion Rate',
      total: 'Total',
      success: 'Success',
      progress: 'Progress'
    },
    
    // 图表标题和描述
    charts: {
      completionOverview: {
        title: 'Completion Overview',
        description: 'Overall task completion status'
      },
      priorityDistribution: {
        title: 'Priority Distribution',
        description: 'Task priority proportion analysis'
      },
      taskCompletionTrend: {
        title: 'Task Completion Trend',
        description: 'Task creation and completion in the last 7 days'
      },
      averageCompletionTime: {
        title: 'Average Completion Time by Category',
        description: 'Average days to complete tasks by category',
        days: 'Days'
      },
      deadlineWarning: {
        title: 'Deadline Warning',
        description: 'Task due date distribution analysis'
      },
      creationTimeDistribution: {
        title: 'Creation Time Distribution',
        description: 'Task creation distribution throughout the day'
      },
      categoryDistribution: {
        title: 'Category Distribution',
        description: 'Task type classification'
      },
      upcomingTasks: {
        title: 'Upcoming Tasks',
        description: 'Sorted by due date',
        viewAll: 'View All',
        collapse: 'Collapse'
      }
    },
    
    // 任务状态标签
    statusLabels: {
      todo: 'To Do',
      'in-progress': 'In Progress',
      completed: 'Completed',
      done: 'Done'
    },
    
    // 优先级标签
    priorityLabels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    },
    
    // 类别标签
    categoryLabels: {
      work: 'Work',
      personal: 'Personal',
      learning: 'Learning',
      other: 'Other'
    },
    
    // 时间相关
    timeRelated: {
      noDueDate: 'No due date',
      expired: 'Expired',
      dueToday: 'Due today',
      dueTomorrow: 'Due tomorrow',
      daysRemaining: (days: number) => `Due in ${days} days`,
      morning: 'Morning (06:00-10:00)',
      lateMorning: 'Late Morning (10:00-12:00)',
      afternoon: 'Afternoon (12:00-18:00)',
      evening: 'Evening (18:00-22:00)',
      night: 'Night (22:00-06:00)'
    },
    
    // 截止日期预警级别
    deadlineLevels: {
      expired: 'Expired',
      urgent: 'Urgent',
      upcoming: 'Upcoming',
      safe: 'Safe',
      noDueDate: 'No due date'
    },
    
    // 图表提示文本
    tooltip: {
      tasks: 'tasks',
      quantity: 'Quantity',
      created: 'Created',
      completed: 'Completed',
      averageTime: 'Average completion time',
      days: 'days'
    },
    
    // 空状态
    emptyState: {
      noUpcomingTasks: 'No upcoming tasks',
      allTasksScheduled: 'All tasks are properly scheduled'
    },
    
    // AI洞察
    aiInsights: {
      title: 'AI Project Insights',
      description: 'Intelligent suggestions based on your task data',
      loading: 'Loading...'
    },
    
    // 备份洞察内容
    backupInsights: {
      title: 'Project Analysis Report',
      completionSection: 'Completion Status',
      completionText: (completed: number, rate: number) => `You have completed ${completed} tasks, with a completion rate of ${rate}%.`,
      prioritySection: 'Priority Distribution',
      priorityText: (count: number) => `There are ${count} high-priority tasks that need attention.`,
      timeManagementSection: 'Time Management',
      timeManagementText: (count: number) => `You have ${count} tasks due within 3 days, recommended for priority handling.`,
      suggestionsSection: 'Improvement Suggestions',
      suggestion1: 'Consider reordering remaining tasks to prioritize high-priority and upcoming due tasks',
      suggestion2: 'For larger projects, further break down tasks to improve completion efficiency',
      suggestion3: 'Regularly review completed tasks to summarize experiences and optimize future workflows'
    },
    errors: {
      notAuthenticated: 'You are not logged in',
      authCheckFailed: 'Authentication check failed, please try again',
      unauthorized: 'Unauthorized access, please login again',
      loadTasksFailed: 'Failed to load tasks data',
      loadTasksError: 'Error loading tasks',
      loadAnalyticsFailed: 'Failed to load analytics data',
      aiAnalysisFailed: 'AI analysis failed',
      authRequired: 'Login Required',
      loginToViewAnalytics: 'Please login to view your task analytics data'
    }
  }
};