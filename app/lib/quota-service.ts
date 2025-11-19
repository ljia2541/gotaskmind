import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { useAuth } from '@/app/hooks/use-auth';

/**
 * 项目配额服务 - 检查和管理用户的项目配额限制
 * 实现严格的配额控制：一旦达到配额上限，删除项目不再释放配额
 */
export class QuotaService {
  private static instance: QuotaService;

  // 配额配置
  private readonly QUOTA_LIMITS = {
    free: {
      projects: 3,
      tasksPerProject: 10,
      description: '免费版项目限制（严格配额）'
    },
    pro: {
      projects: 500,
      tasksPerProject: Infinity, // Pro版无任务限制
      description: 'Pro版项目限制'
    }
  };

  // 严格配额控制的本地存储键
  private readonly STORAGE_KEYS = {
    quotaReached: 'gotaskmind_quota_reached', // 记录是否曾达到配额上限
    quotaReachedDate: 'gotaskmind_quota_reached_date', // 记录达到配额上限的日期
    peakProjectCount: 'gotaskmind_peak_project_count', // 历史最高项目数量
    lastQuotaCheck: 'gotaskmind_last_quota_check' // 最后配额检查时间
  };

  private constructor() {}

  public static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }

  /**
   * 获取用户的项目配额限制
   */
  public getProjectQuota(isPro: boolean): number {
    return isPro ? this.QUOTA_LIMITS.pro.projects : this.QUOTA_LIMITS.free.projects;
  }

  /**
   * 获取配额描述
   */
  public getQuotaDescription(isPro: boolean): string {
    return isPro ? this.QUOTA_LIMITS.pro.description : this.QUOTA_LIMITS.free.description;
  }

  /**
   * 检查是否可以创建新项目 - 实现严格配额控制
   */
  public canCreateProject(currentProjectCount: number, isPro: boolean): {
    canCreate: boolean;
    quotaLimit: number;
    quotaUsed: number;
    quotaRemaining: number;
    quotaDescription: string;
    isStrictQuotaEnforced?: boolean;
    quotaReachedPreviously?: boolean;
  } {
    const quotaLimit = this.getProjectQuota(isPro);
    const hasReachedQuotaBefore = this.hasReachedQuotaBefore();

    // 严格配额控制：如果之前达到过配额上限，则不再允许创建新项目（仅免费版）
    if (!isPro && hasReachedQuotaBefore) {
      return {
        canCreate: false,
        quotaLimit,
        quotaUsed: currentProjectCount,
        quotaRemaining: 0,
        quotaDescription: this.getQuotaDescription(isPro) + '（严格配额已生效）',
        isStrictQuotaEnforced: true,
        quotaReachedPreviously: true
      };
    }

    const quotaRemaining = quotaLimit - currentProjectCount;
    const canCreate = quotaRemaining > 0;

    // 如果当前项目数量达到或超过配额，记录到历史中
    if (!isPro && currentProjectCount >= quotaLimit && canCreate === false) {
      this.recordQuotaReached(currentProjectCount);
    }

    return {
      canCreate,
      quotaLimit,
      quotaUsed: currentProjectCount,
      quotaRemaining: Math.max(0, quotaRemaining),
      quotaDescription: this.getQuotaDescription(isPro),
      isStrictQuotaEnforced: false,
      quotaReachedPreviously: hasReachedQuotaBefore
    };
  }

  /**
   * 检查项目配额并在超限时抛出错误 - 实现严格配额控制
   */
  public checkProjectQuota(projects: Project[], isPro: boolean): void {
    const quotaInfo = this.canCreateProject(projects.length, isPro);

    if (!quotaInfo.canCreate) {
      let errorMessage = `项目配额已满！\n` +
        `当前配额方案: ${quotaInfo.quotaDescription}\n` +
        `已使用: ${quotaInfo.quotaUsed} 个项目\n` +
        `配额上限: ${quotaInfo.quotaLimit} 个项目`;

      // 如果是严格配额控制，添加特殊说明
      if (quotaInfo.isStrictQuotaEnforced) {
        errorMessage += `\n\n⚠️ 严格配额模式：一旦达到配额上限，删除项目也不会释放配额`;
        errorMessage += `\n💡 解决方案：升级到Pro版本可获得 ${this.QUOTA_LIMITS.pro.projects} 个项目配额`;
      } else {
        errorMessage += `\n升级到Pro版本可获得 ${this.QUOTA_LIMITS.pro.projects} 个项目配额`;
      }

      const error = new Error(errorMessage);

      // 添加自定义错误代码以便前端识别
      (error as any).code = quotaInfo.isStrictQuotaEnforced ? 'STRICT_QUOTA_EXCEEDED' : 'QUOTA_EXCEEDED';
      (error as any).quotaInfo = quotaInfo;

      throw error;
    }
  }

  /**
   * 获取配额使用情况的详细信息
   */
  public getQuotaInfo(projects: Project[], isPro: boolean): {
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
    usagePercentage: number;
    quotaDescription: string;
    isPro: boolean;
    planName: string;
    canCreateMore: boolean;
    upgradeAvailable: boolean;
  } {
    const quotaLimit = this.getProjectQuota(isPro);
    const currentCount = projects.length;
    const remaining = quotaLimit - currentCount;
    const usagePercentage = Math.round((currentCount / quotaLimit) * 100);

    return {
      totalQuota: quotaLimit,
      usedQuota: currentCount,
      remainingQuota: remaining,
      usagePercentage,
      quotaDescription: this.getQuotaDescription(isPro),
      isPro,
      planName: isPro ? 'Pro' : 'Free',
      canCreateMore: remaining > 0,
      upgradeAvailable: !isPro && currentCount >= this.QUOTA_LIMITS.free.projects * 0.8 // 在80%时提示升级
    };
  }

  /**
   * 检查是否可以在指定项目中创建新任务
   */
  public canCreateTaskInProject(projectTasks: Task[], isPro: boolean): {
    canCreate: boolean;
    taskLimit: number;
    currentTasks: number;
    remainingTasks: number;
    projectDescription: string;
  } {
    const taskLimit = isPro ? this.QUOTA_LIMITS.pro.tasksPerProject : this.QUOTA_LIMITS.free.tasksPerProject;
    const currentTaskCount = projectTasks.length;
    const remaining = taskLimit - currentTaskCount;

    return {
      canCreate: remaining > 0,
      taskLimit,
      currentTasks: currentTaskCount,
      remainingTasks: remaining,
      projectDescription: isPro ? 'Pro版' : '免费版'
    };
  }

  /**
   * 检查项目任务配额并在超限时抛出错误
   */
  public checkTaskQuotaInProject(projectTasks: Task[], isPro: boolean): void {
    const quotaInfo = this.canCreateTaskInProject(projectTasks, isPro);

    if (!quotaInfo.canCreate) {
      const error = new Error(`项目任务配额已满！\n` +
        `当前配额方案: ${quotaInfo.projectDescription}\n` +
        `该项目已有: ${quotaInfo.currentTasks} 个任务\n` +
        `任务上限: ${quotaInfo.taskLimit === Infinity ? '无限制' : quotaInfo.taskLimit + ' 个任务'}\n` +
        `升级到Pro版本可获得无限制任务`);

      // 添加自定义错误代码以便前端识别
      (error as any).code = 'TASK_QUOTA_EXCEEDED';
      (error as any).quotaInfo = quotaInfo;

      throw error;
    }
  }

  /**
   * 获取项目任务配额信息
   */
  public getTaskQuotaInfo(projectTasks: Task[], isPro: boolean): {
    totalTaskQuota: number;
    usedTaskQuota: number;
    remainingTaskQuota: number;
    taskUsagePercentage: number;
    isPro: boolean;
    planName: string;
    canCreateMoreTasks: boolean;
    upgradeAvailable: boolean;
    taskLimitReached: boolean;
  } {
    const quotaInfo = this.canCreateTaskInProject(projectTasks, isPro);
    const taskLimit = quotaInfo.taskLimit;
    const currentCount = quotaInfo.currentTasks;
    const remaining = quotaInfo.remainingTasks;
    const usagePercentage = taskLimit === Infinity ? 0 : Math.round((currentCount / taskLimit) * 100);

    return {
      totalTaskQuota: taskLimit,
      usedTaskQuota: currentCount,
      remainingTaskQuota: remaining,
      taskUsagePercentage: usagePercentage,
      isPro,
      planName: isPro ? 'Pro' : 'Free',
      canCreateMoreTasks: remaining > 0,
      upgradeAvailable: !isPro && currentCount >= this.QUOTA_LIMITS.free.tasksPerProject * 0.8, // 在80%时提示升级
      taskLimitReached: remaining === 0
    };
  }

  /**
   * 格式化配额信息用于显示
   */
  public formatQuotaForDisplay(quotaInfo: ReturnType<QuotaService['getQuotaInfo']>): string {
    return `${quotaInfo.usedQuota}/${quotaInfo.totalQuota} (${quotaInfo.usagePercentage}%)`;
  }

  /**
   * 格式化任务配额信息用于显示
   */
  public formatTaskQuotaForDisplay(taskQuotaInfo: ReturnType<QuotaService['getTaskQuotaInfo']>): string {
    if (taskQuotaInfo.totalTaskQuota === Infinity) {
      return `${taskQuotaInfo.usedTaskQuota}/∞ (无限制)`;
    }
    return `${taskQuotaInfo.usedTaskQuota}/${taskQuotaInfo.totalTaskQuota} (${taskQuotaInfo.taskUsagePercentage}%)`;
  }

  /**
   * 获取配额警告状态
   */
  public getQuotaWarningLevel(quotaInfo: ReturnType<QuotaService['getQuotaInfo']>): 'normal' | 'warning' | 'danger' {
    if (quotaInfo.remainingQuota === 0) return 'danger';
    if (quotaInfo.usagePercentage >= 80) return 'warning';
    return 'normal';
  }

  /**
   * 获取配额状态颜色
   */
  public getQuotaStatusColor(quotaInfo: ReturnType<QuotaService['getQuotaInfo']>): string {
    const warningLevel = this.getQuotaWarningLevel(quotaInfo);
    switch (warningLevel) {
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  }

  // ===== 严格配额控制核心方法 =====

  /**
   * 检查用户之前是否达到过配额上限
   */
  public hasReachedQuotaBefore(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.STORAGE_KEYS.quotaReached) === 'true';
  }

  /**
   * 记录用户达到配额上限
   */
  private recordQuotaReached(projectCount: number): void {
    if (typeof window === 'undefined') return;

    const now = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEYS.quotaReached, 'true');
    localStorage.setItem(this.STORAGE_KEYS.quotaReachedDate, now);
    localStorage.setItem(this.STORAGE_KEYS.peakProjectCount, projectCount.toString());
    localStorage.setItem(this.STORAGE_KEYS.lastQuotaCheck, now);
  }

  /**
   * 获取配额历史信息
   */
  public getQuotaHistory(): {
    hasReachedQuota: boolean;
    quotaReachedDate?: string;
    peakProjectCount: number;
    lastQuotaCheck?: string;
    daysSinceQuotaReached?: number;
  } {
    if (typeof window === 'undefined') {
      return {
        hasReachedQuota: false,
        peakProjectCount: 0
      };
    }

    const hasReachedQuota = this.hasReachedQuotaBefore();
    const quotaReachedDate = localStorage.getItem(this.STORAGE_KEYS.quotaReachedDate);
    const peakProjectCount = parseInt(localStorage.getItem(this.STORAGE_KEYS.peakProjectCount) || '0');
    const lastQuotaCheck = localStorage.getItem(this.STORAGE_KEYS.lastQuotaCheck);

    let daysSinceQuotaReached;
    if (quotaReachedDate) {
      const reachedDate = new Date(quotaReachedDate);
      const now = new Date();
      daysSinceQuotaReached = Math.floor((now.getTime() - reachedDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      hasReachedQuota,
      quotaReachedDate,
      peakProjectCount,
      lastQuotaCheck,
      daysSinceQuotaReached
    };
  }

  /**
   * 清除配额历史记录（仅用于升级到Pro版本或特殊情况）
   */
  public clearQuotaHistory(): void {
    if (typeof window === 'undefined') return;

    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * 获取严格配额状态描述
   */
  public getStrictQuotaStatus(isPro: boolean): string {
    if (isPro) {
      return 'Pro版本无配额限制';
    }

    const quotaHistory = this.getQuotaHistory();
    if (quotaHistory.hasReachedQuota) {
      const days = quotaHistory.daysSinceQuotaReached || 0;
      return `严格配额模式已生效 ${days} 天`;
    }

    return '标准配额模式';
  }

  /**
   * 更新getQuotaInfo方法以支持严格配额
   */
  public getQuotaInfoWithStrictControl(projects: Project[], isPro: boolean): ReturnType<QuotaService['getQuotaInfo']> & {
    strictQuotaEnforced: boolean;
    quotaHistory: ReturnType<QuotaService['getQuotaHistory']>;
    strictQuotaStatus: string;
  } {
    const baseQuotaInfo = this.getQuotaInfo(projects, isPro);
    const quotaHistory = this.getQuotaHistory();
    const strictQuotaEnforced = !isPro && quotaHistory.hasReachedQuota;
    const strictQuotaStatus = this.getStrictQuotaStatus(isPro);

    // 如果严格配额已生效，调整剩余配额为0
    if (strictQuotaEnforced) {
      baseQuotaInfo.remainingQuota = 0;
      baseQuotaInfo.canCreateMore = false;
      baseQuotaInfo.usagePercentage = 100;
    }

    return {
      ...baseQuotaInfo,
      strictQuotaEnforced,
      quotaHistory,
      strictQuotaStatus
    };
  }
}

// 导出单例实例
export const quotaService = QuotaService.getInstance();