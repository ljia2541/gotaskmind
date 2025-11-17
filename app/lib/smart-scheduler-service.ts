import { Task, TimeSlot, CalendarEvent, WorkPreferences, TaskPriority, TaskEnergyLevel } from '@/types/task';

/**
 * 智能时间安排服务
 * 根据个人日历、工作习惯和任务特性自动安排最佳执行时间
 */
export class SmartSchedulerService {
  private static instance: SmartSchedulerService;

  private constructor() {}

  public static getInstance(): SmartSchedulerService {
    if (!SmartSchedulerService.instance) {
      SmartSchedulerService.instance = new SmartSchedulerService();
    }
    return SmartSchedulerService.instance;
  }

  /**
   * 获取默认工作偏好设置
   */
  public getDefaultWorkPreferences(): WorkPreferences {
    return {
      workDays: [1, 2, 3, 4, 5], // 周一到周五
      workHours: {
        start: '09:00',
        end: '17:00'
      },
      breakTimes: [
        { start: '12:00', end: '13:00' } // 午休时间
      ],
      peakEnergyHours: [
        { start: '09:00', end: '11:00' }, // 上午高效时段
        { start: '14:00', end: '16:00' }  // 下午高效时段
      ],
      minTaskDuration: 30, // 最小任务30分钟
      maxTasksPerDay: 8,
      preferredTaskTimes: {
        high: [
          { start: '09:00', end: '11:00' }, // 高能量任务安排在上午
          { start: '14:00', end: '16:00' }  // 或下午
        ],
        medium: [
          { start: '11:00', end: '12:00' }, // 中能量任务安排在午前或午后
          { start: '16:00', end: '17:00' }
        ],
        low: [
          { start: '13:00', end: '14:00' }, // 低能量任务安排在午休后
          { start: '17:00', end: '18:00' }  // 或下班前
        ]
      }
    };
  }

  /**
   * 从localStorage获取工作偏好设置
   */
  public async getWorkPreferences(): Promise<WorkPreferences> {
    if (typeof window === 'undefined') {
      return this.getDefaultWorkPreferences();
    }

    try {
      const saved = localStorage.getItem('workPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        return { ...this.getDefaultWorkPreferences(), ...prefs };
      }
    } catch (error) {
      console.error('Failed to load work preferences:', error);
    }

    return this.getDefaultWorkPreferences();
  }

  /**
   * 保存工作偏好设置到localStorage
   */
  public async saveWorkPreferences(preferences: WorkPreferences): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('workPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save work preferences:', error);
    }
  }

  /**
   * 获取个人日历事件（模拟实现）
   * 在实际应用中，这里可以集成Google Calendar、Outlook等API
   */
  public async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    // 模拟从外部日历API获取数据
    // 在实际应用中，这里应该调用真实的日历API
    return this.getMockCalendarEvents(startDate, endDate);
  }

  /**
   * 模拟日历事件数据
   */
  private getMockCalendarEvents(startDate: Date, endDate: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      // 添加一些固定的模拟事件
      if (dayOfWeek === 1) { // 周一
        events.push({
          id: `meeting-${dateStr}-09`,
          title: '团队晨会',
          startTime: `${dateStr}T09:00:00`,
          endTime: `${dateStr}T09:30:00`,
          type: 'meeting',
          isBlocking: true,
          description: '每周团队同步会议'
        });
      }

      if (dayOfWeek === 3) { // 周三
        events.push({
          id: `meeting-${dateStr}-14`,
          title: '项目评审',
          startTime: `${dateStr}T14:00:00`,
          endTime: `${dateStr}T15:30:00`,
          type: 'meeting',
          isBlocking: true,
          description: '项目进度评审会议'
        });
      }

      if (dayOfWeek === 5) { // 周五
        events.push({
          id: `personal-${dateStr}-17`,
          title: '健身',
          startTime: `${dateStr}T17:30:00`,
          endTime: `${dateStr}T18:30:00`,
          type: 'personal',
          isBlocking: true,
          description: '每周健身时间'
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return events;
  }

  /**
   * 智能安排任务时间
   */
  public async scheduleTasks(
    tasks: Task[],
    startDate?: Date,
    endDate?: Date
  ): Promise<{ tasks: Task[]; scheduledCount: number; unscheduledTasks: Task[] }> {
    const preferences = await this.getWorkPreferences();
    const start = startDate || new Date();
    const end = endDate || new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000); // 默认安排2周

    // 获取日历事件
    const calendarEvents = await this.getCalendarEvents(start, end);

    // 过滤需要安排的任务
    const tasksToSchedule = tasks.filter(task =>
      task.status === 'todo' &&
      !task.isTimeScheduled &&
      task.estimatedHours && task.estimatedHours > 0
    );

    // 按优先级和依赖关系排序任务
    const sortedTasks = this.prioritizeTasks(tasksToSchedule);

    const scheduledTasks: Task[] = [];
    const unscheduledTasks: Task[] = [];

    // 为每个任务安排时间
    for (const task of sortedTasks) {
      const timeSlot = await this.findBestTimeSlot(
        task,
        scheduledTasks,
        calendarEvents,
        preferences,
        start,
        end
      );

      if (timeSlot) {
        const updatedTask = {
          ...task,
          isTimeScheduled: true,
          scheduledSlots: [timeSlot],
          updatedAt: new Date().toISOString()
        };
        scheduledTasks.push(updatedTask);
      } else {
        unscheduledTasks.push(task);
      }
    }

    return {
      tasks: [...tasks.filter(t => t.isTimeScheduled || t.status !== 'todo'), ...scheduledTasks],
      scheduledCount: scheduledTasks.length,
      unscheduledTasks
    };
  }

  /**
   * 任务优先级排序
   */
  private prioritizeTasks(tasks: Task[]): Task[] {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return tasks.sort((a, b) => {
      // 首先按优先级排序
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // 然后按截止日期排序
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // 最后按预估时间排序（短任务优先）
      return (a.estimatedHours || 0) - (b.estimatedHours || 0);
    });
  }

  /**
   * 为任务寻找最佳时间段
   */
  private async findBestTimeSlot(
    task: Task,
    scheduledTasks: Task[],
    calendarEvents: CalendarEvent[],
    preferences: WorkPreferences,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot | null> {
    const taskDuration = (task.estimatedHours || 1) * 60; // 转换为分钟
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();

      // 检查是否为工作日
      if (!preferences.workDays.includes(dayOfWeek)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // 获取当天所有已占用的时间段
      const occupiedSlots = this.getOccupiedTimeSlots(
        current,
        scheduledTasks,
        calendarEvents
      );

      // 获取当天的可用时间段
      const availableSlots = this.getAvailableTimeSlots(
        current,
        occupiedSlots,
        preferences
      );

      // 根据任务特性找到最佳时间段
      const bestSlot = this.findBestAvailableSlot(
        availableSlots,
        task,
        taskDuration,
        preferences,
        current
      );

      if (bestSlot) {
        return {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          taskId: task.id,
          startTime: bestSlot.startTime,
          endTime: bestSlot.endTime,
          date: current.toISOString().split('T')[0],
          isScheduled: true,
          isCompleted: false
        };
      }

      current.setDate(current.getDate() + 1);
    }

    return null;
  }

  /**
   * 获取指定日期已占用的时间段
   */
  private getOccupiedTimeSlots(
    date: Date,
    scheduledTasks: Task[],
    calendarEvents: CalendarEvent[]
  ): Array<{ startTime: Date; endTime: Date }> {
    const dateStr = date.toISOString().split('T')[0];
    const occupied: Array<{ startTime: Date; endTime: Date }> = [];

    // 添加已安排任务的时间段
    scheduledTasks.forEach(task => {
      task.scheduledSlots?.forEach(slot => {
        if (slot.date === dateStr) {
          occupied.push({
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime)
          });
        }
      });
    });

    // 添加日历事件的时间段
    calendarEvents.forEach(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      if (event.isBlocking && this.isSameDate(eventStart, date)) {
        occupied.push({ startTime: eventStart, endTime: eventEnd });
      }
    });

    return occupied.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * 获取指定日期的可用时间段
   */
  private getAvailableTimeSlots(
    date: Date,
    occupiedSlots: Array<{ startTime: Date; endTime: Date }>,
    preferences: WorkPreferences
  ): Array<{ startTime: Date; endTime: Date; score: number }> {
    const workStart = this.combineDateAndTime(date, preferences.workHours.start);
    const workEnd = this.combineDateAndTime(date, preferences.workHours.end);
    const available: Array<{ startTime: Date; endTime: Date; score: number }> = [];

    // 移除休息时间段
    const workPeriods = this.removeBreakTimes(
      [{ startTime: workStart, endTime: workEnd }],
      preferences.breakTimes.map(breakTime => ({
        startTime: this.combineDateAndTime(date, breakTime.start),
        endTime: this.combineDateAndTime(date, breakTime.end)
      }))
    );

    // 从工作时段中移除已占用的时间段
    workPeriods.forEach(period => {
      const segments = this.subtractOccupiedSlots(period, occupiedSlots);
      segments.forEach(segment => {
        const score = this.calculateTimeSlotScore(segment, preferences);
        available.push({ ...segment, score });
      });
    });

    return available;
  }

  /**
   * 从可用时间段中找到最佳匹配
   */
  private findBestAvailableSlot(
    availableSlots: Array<{ startTime: Date; endTime: Date; score: number }>,
    task: Task,
    duration: number,
    preferences: WorkPreferences,
    date: Date
  ): { startTime: string; endTime: string } | null {
    let bestSlot: { startTime: Date; endTime: Date; score: number } | null = null;

    for (const slot of availableSlots) {
      const slotDuration = (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60);

      if (slotDuration >= duration) {
        // 根据任务特性调整分数
        let adjustedScore = slot.score;

        // 能量级别匹配加分
        if (task.energyLevel) {
          adjustedScore += this.getEnergyMatchScore(slot.startTime, task.energyLevel, preferences);
        }

        // 优先级加分
        if (task.priority === 'high') {
          adjustedScore += 10;
        }

        // 截止日期紧急度加分
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 3) {
            adjustedScore += (4 - daysUntilDue) * 5;
          }
        }

        if (!bestSlot || adjustedScore > bestSlot.score) {
          bestSlot = {
            startTime: slot.startTime,
            endTime: new Date(slot.startTime.getTime() + duration * 60 * 1000),
            score: adjustedScore
          };
        }
      }
    }

    return bestSlot ? {
      startTime: bestSlot.startTime.toISOString(),
      endTime: bestSlot.endTime.toISOString()
    } : null;
  }

  /**
   * 计算时间段基础分数
   */
  private calculateTimeSlotScore(
    slot: { startTime: Date; endTime: Date },
    preferences: WorkPreferences
  ): number {
    let score = 50; // 基础分数

    // 高效时段加分
    preferences.peakEnergyHours.forEach(peak => {
      const peakStart = this.combineDateAndTime(slot.startTime, peak.start);
      const peakEnd = this.combineDateAndTime(slot.startTime, peak.end);

      const overlap = this.getTimeOverlap(slot, { startTime: peakStart, endTime: peakEnd });
      if (overlap > 0) {
        score += overlap / 60 * 2; // 每分钟高效时段加2分
      }
    });

    // 早上时间段加分
    const hour = slot.startTime.getHours();
    if (hour >= 9 && hour <= 11) {
      score += 20;
    } else if (hour >= 14 && hour <= 16) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * 获取能量匹配分数
   */
  private getEnergyMatchScore(
    startTime: Date,
    energyLevel: TaskEnergyLevel,
    preferences: WorkPreferences
  ): number {
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    let score = 0;
    preferences.preferredTaskTimes[energyLevel].forEach(prefTime => {
      if (this.isTimeInRange(timeString, prefTime.start, prefTime.end)) {
        score += 15;
      }
    });

    return score;
  }

  /**
   * 工具方法：合并日期和时间
   */
  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * 工具方法：检查是否为同一日期
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  }

  /**
   * 工具方法：从时间段中移除休息时间
   */
  private removeBreakTimes(
    periods: Array<{ startTime: Date; endTime: Date }>,
    breaks: Array<{ startTime: Date; endTime: Date }>
  ): Array<{ startTime: Date; endTime: Date }> {
    let result = [...periods];

    // 确保 periods 不为空
    if (result.length === 0) {
      return [];
    }

    breaks.forEach(breakTime => {
      // 确保第一个和最后一个时间段存在
      if (result.length > 0) {
        result = this.subtractOccupiedSlots(
          {
            startTime: new Date(result[0].startTime),
            endTime: new Date(result[result.length - 1].endTime)
          },
          [breakTime]
        );
      }
    });

    return result;
  }

  /**
   * 工具方法：从时间段中减去已占用的时间段
   */
  private subtractOccupiedSlots(
    period: { startTime: Date; endTime: Date },
    occupied: Array<{ startTime: Date; endTime: Date }>
  ): Array<{ startTime: Date; endTime: Date }> {
    let segments = [{
      startTime: new Date(period.startTime),
      endTime: new Date(period.endTime)
    }];

    occupied.forEach(occupiedSlot => {
      const newSegments: Array<{ startTime: Date; endTime: Date }> = [];

      segments.forEach(segment => {
        // 确保时间比较使用 Date 对象
        const segmentEndTime = new Date(segment.endTime);
        const segmentStartTime = new Date(segment.startTime);
        const occupiedStartTime = new Date(occupiedSlot.startTime);
        const occupiedEndTime = new Date(occupiedSlot.endTime);

        // 如果没有重叠，保留原段
        if (segmentEndTime <= occupiedStartTime || segmentStartTime >= occupiedEndTime) {
          newSegments.push({
            startTime: new Date(segment.startTime),
            endTime: new Date(segment.endTime)
          });
        } else {
          // 有重叠，分割段
          if (segmentStartTime < occupiedStartTime) {
            newSegments.push({
              startTime: new Date(segment.startTime),
              endTime: new Date(Math.min(segmentEndTime.getTime(), occupiedStartTime.getTime()))
            });
          }
          if (segmentEndTime > occupiedEndTime) {
            newSegments.push({
              startTime: new Date(Math.max(segmentStartTime.getTime(), occupiedEndTime.getTime())),
              endTime: new Date(segment.endTime)
            });
          }
        }
      });

      segments = newSegments;
    });

    return segments;
  }

  /**
   * 工具方法：计算时间段重叠时间（分钟）
   */
  private getTimeOverlap(
    slot1: { startTime: Date; endTime: Date },
    slot2: { startTime: Date; endTime: Date }
  ): number {
    // 确保 Date 对象有效
    if (!slot1.startTime || !slot1.endTime || !slot2.startTime || !slot2.endTime) {
      console.error('Invalid date objects in getTimeOverlap:', { slot1, slot2 });
      return 0;
    }

    const start = Math.max(slot1.startTime.getTime(), slot2.startTime.getTime());
    const end = Math.min(slot1.endTime.getTime(), slot2.endTime.getTime());

    return Math.max(0, end - start) / (1000 * 60);
  }

  /**
   * 工具方法：检查时间是否在范围内
   */
  private isTimeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    return time >= rangeStart && time <= rangeEnd;
  }

  /**
   * 重新安排特定任务
   */
  public async rescheduleTask(
    task: Task,
    preferredDate?: string,
    preferredTime?: string
  ): Promise<Task | null> {
    const preferences = await this.getWorkPreferences();
    const targetDate = preferredDate ? new Date(preferredDate) : new Date();
    const endDate = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 如果指定了偏好时间，创建约束
    if (preferredTime) {
      task.timeConstraints = {
        ...task.timeConstraints,
        earliestStartTime: preferredTime,
        latestEndTime: this.addMinutesToTime(preferredTime, Math.ceil((task.estimatedHours || 1) * 60))
      };
    }

    if (preferredDate) {
      task.preferredDate = preferredDate;
    }

    // 临时移除任务的时间安排状态
    const originalTask = { ...task };
    task.isTimeScheduled = false;
    task.scheduledSlots = [];

    // 重新安排
    const result = await this.scheduleTasks([task], targetDate, endDate);

    if (result.scheduledCount > 0) {
      return result.tasks.find(t => t.id === task.id) || null;
    }

    // 如果安排失败，恢复原始状态
    return originalTask;
  }

  /**
   * 添加分钟到时间字符串
   */
  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * 获取任务的时间统计信息
   */
  public getTaskTimeStats(tasks: Task[]): {
    totalScheduled: number;
    totalUnscheduled: number;
    totalEstimatedHours: number;
    averageTaskDuration: number;
    tasksByPriority: Record<string, number>;
    tasksByEnergyLevel: Record<string, number>;
  } {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const scheduledTasks = todoTasks.filter(t => t.isTimeScheduled);
    const unscheduledTasks = todoTasks.filter(t => !t.isTimeScheduled);

    const totalEstimatedHours = todoTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const averageTaskDuration = scheduledTasks.length > 0
      ? scheduledTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0) / scheduledTasks.length
      : 0;

    const tasksByPriority = todoTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByEnergyLevel = todoTasks.reduce((acc, task) => {
      if (task.energyLevel) {
        acc[task.energyLevel] = (acc[task.energyLevel] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScheduled: scheduledTasks.length,
      totalUnscheduled: unscheduledTasks.length,
      totalEstimatedHours,
      averageTaskDuration,
      tasksByPriority,
      tasksByEnergyLevel
    };
  }
}