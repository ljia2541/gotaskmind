"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Settings, Play, RefreshCw, AlertCircle, CheckCircle, Brain, CalendarDays } from 'lucide-react';
import { Task, WorkPreferences, TimeSlot } from '@/types/task';
import { SmartSchedulerService } from '@/app/lib/smart-scheduler-service';
import { timeZoneService } from '@/app/lib/timezone-service';
import { TimeZoneSelector } from '@/components/ui/timezone-selector';

interface SmartSchedulerProps {
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
}

export function SmartScheduler({ tasks, onTasksUpdate }: SmartSchedulerProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [schedulingResults, setSchedulingResults] = useState<{
    tasks: Task[];
    scheduledCount: number;
    unscheduledTasks: Task[];
  } | null>(null);
  const [preferences, setPreferences] = useState<WorkPreferences | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const scheduler = SmartSchedulerService.getInstance();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await scheduler.getWorkPreferences();
    setPreferences(prefs);
  };

  const handleScheduleTasks = async () => {
    setIsScheduling(true);
    try {
      const startDate = new Date(selectedDateRange.start);
      const endDate = new Date(selectedDateRange.end);

      const results = await scheduler.scheduleTasks(tasks, startDate, endDate);
      setSchedulingResults(results);
      setShowResults(true);

      if (results.scheduledCount > 0) {
        onTasksUpdate(results.tasks);
      }
    } catch (error) {
      console.error('Scheduling failed:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSavePreferences = async (newPreferences: WorkPreferences) => {
    try {
      await scheduler.saveWorkPreferences(newPreferences);
      setPreferences(newPreferences);
      setShowPreferences(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const getTaskStats = () => {
    if (!tasks.length) return { total: 0, scheduled: 0, unscheduled: 0 };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const scheduled = todoTasks.filter(t => t.isTimeScheduled);
    const unscheduled = todoTasks.filter(t => !t.isTimeScheduled);

    return {
      total: todoTasks.length,
      scheduled: scheduled.length,
      unscheduled: unscheduled.length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* 主要控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            智能时间安排
          </CardTitle>
          <CardDescription>
            基于您的工作习惯和任务特性，自动安排最佳执行时间
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 时区选择器 */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">工作时区设置</h3>
                <p className="text-xs text-muted-foreground">任务时间安排将基于您选择的时区</p>
              </div>
              <TimeZoneSelector
                variant="compact"
                showOffset={true}
                onTimeZoneChange={(timeZoneId, timeZoneInfo) => {
                  // 时区变化时可以重新安排任务或刷新显示
                  console.log('Time zone changed for scheduling:', timeZoneId);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">待安排任务</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">已安排时间</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats.unscheduled}</div>
              <div className="text-sm text-muted-foreground">待安排时间</div>
            </div>
          </div>

          {stats.total > 0 && (
            <div className="mb-4">
              <Label>安排进度</Label>
              <Progress
                value={stats.total > 0 ? (stats.scheduled / stats.total) * 100 : 0}
                className="mt-2 h-2"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {stats.scheduled} / {stats.total} 任务已安排时间
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleScheduleTasks}
              disabled={isScheduling || stats.unscheduled === 0}
              className="flex-1"
            >
              {isScheduling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  智能安排中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {stats.scheduled > 0 ? '重新安排' : '开始智能安排'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              工作偏好设置
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedDateRange({
                start: new Date().toISOString().split('T')[0],
                end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              })}
            >
              <CalendarDays className="w-4 h-4" />
              重置日期范围
            </Button>
          </div>

          {/* 日期范围选择 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已安排任务展示 */}
      {stats.scheduled > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              已安排的任务时间线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks
                .filter(task => task.isTimeScheduled && task.status === 'todo')
                .sort((a, b) => {
                  const aTime = a.scheduledSlots?.[0]?.startTime || '';
                  const bTime = b.scheduledSlots?.[0]?.startTime || '';
                  return new Date(aTime).getTime() - new Date(bTime).getTime();
                })
                .map(task => (
                  <ScheduledTaskCard key={task.id} task={task} />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 工作偏好设置对话框 */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>工作偏好设置</DialogTitle>
          </DialogHeader>

          {preferences && (
            <WorkPreferencesForm
              preferences={preferences}
              onSave={handleSavePreferences}
              onCancel={() => setShowPreferences(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 安排结果对话框 */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>智能安排完成</DialogTitle>
          </DialogHeader>

          {schedulingResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">
                    成功安排 {schedulingResults.scheduledCount} 个任务
                  </div>
                  <div className="text-sm text-green-600">
                    系统已根据您的工作偏好自动安排了最佳执行时间
                  </div>
                </div>
              </div>

              {schedulingResults.unscheduledTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    无法安排的任务 ({schedulingResults.unscheduledTasks.length})
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {schedulingResults.unscheduledTasks.map(task => (
                      <div key={task.id} className="text-sm p-2 bg-amber-50 rounded border border-amber-200">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          预估时间: {task.estimatedHours}h | 优先级: {task.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  关闭
                </Button>
                <Button onClick={() => {
                  setShowResults(false);
                  // 可以添加查看日历的功能
                }}>
                  查看日历
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 已安排任务卡片组件
function ScheduledTaskCard({ task }: { task: Task }) {
  const slot = task.scheduledSlots?.[0];
  if (!slot) return null;

  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  // 使用时区服务格式化时间和日期
  const dateStr = startTime.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  const timeStr = `${timeZoneService.formatDateTimeSimple(startTime, { format: 'time-only' })} - ${timeZoneService.formatDateTimeSimple(endTime, { format: 'time-only' })}`;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium">{task.title}</div>
        <div className="text-sm text-muted-foreground">{dateStr}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {timeZoneService.formatDateTimeSimple(startTime, { format: 'date-only' })}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{timeStr}</div>
        <div className="flex gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
          </Badge>
          {task.energyLevel && (
            <Badge variant="outline" className="text-xs">
              {task.energyLevel === 'high' ? '⚡ 高' : task.energyLevel === 'medium' ? '🔋 中' : '🌙 低'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// 工作偏好设置表单组件
function WorkPreferencesForm({
  preferences,
  onSave,
  onCancel
}: {
  preferences: WorkPreferences;
  onSave: (preferences: WorkPreferences) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(preferences);

  const workDaysOptions = [
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
    { value: 0, label: '周日' }
  ];

  const handleWorkDayChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workDays: checked
        ? [...prev.workDays, day]
        : prev.workDays.filter(d => d !== day)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="schedule">时间安排</TabsTrigger>
          <TabsTrigger value="energy">能量管理</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div>
            <Label>工作日</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {workDaysOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${option.value}`}
                    checked={formData.workDays.includes(option.value)}
                    onCheckedChange={(checked) => handleWorkDayChange(option.value, checked as boolean)}
                  />
                  <Label htmlFor={`day-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workStart">工作开始时间</Label>
              <Input
                id="workStart"
                type="time"
                value={formData.workHours.start}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  workHours: { ...prev.workHours, start: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="workEnd">工作结束时间</Label>
              <Input
                id="workEnd"
                type="time"
                value={formData.workHours.end}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  workHours: { ...prev.workHours, end: e.target.value }
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxTasks">每日最大任务数</Label>
            <Input
              id="maxTasks"
              type="number"
              min="1"
              max="20"
              value={formData.maxTasksPerDay}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                maxTasksPerDay: parseInt(e.target.value) || 8
              }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div>
            <Label>午休时间</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="time"
                value={formData.breakTimes[0]?.start || '12:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  breakTimes: prev.breakTimes.length > 0
                    ? [{ ...prev.breakTimes[0], start: e.target.value }]
                    : [{ start: e.target.value, end: '13:00' }]
                }))}
              />
              <Input
                type="time"
                value={formData.breakTimes[0]?.end || '13:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  breakTimes: prev.breakTimes.length > 0
                    ? [{ ...prev.breakTimes[0], end: e.target.value }]
                    : [{ start: '12:00', end: e.target.value }]
                }))}
              />
            </div>
          </div>

          <div>
            <Label>高效时段</Label>
            <div className="space-y-2 mt-2">
              {formData.peakEnergyHours.map((hour, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={hour.start}
                    onChange={(e) => {
                      const updated = [...formData.peakEnergyHours];
                      updated[index] = { ...hour, start: e.target.value };
                      setFormData(prev => ({ ...prev, peakEnergyHours: updated }));
                    }}
                  />
                  <Input
                    type="time"
                    value={hour.end}
                    onChange={(e) => {
                      const updated = [...formData.peakEnergyHours];
                      updated[index] = { ...hour, end: e.target.value };
                      setFormData(prev => ({ ...prev, peakEnergyHours: updated }));
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  peakEnergyHours: [...prev.peakEnergyHours, { start: '10:00', end: '11:00' }]
                }))}
              >
                添加高效时段
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          <div>
            <Label>最小任务时长（分钟）</Label>
            <Input
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.minTaskDuration}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                minTaskDuration: parseInt(e.target.value) || 30
              }))}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            系统会根据任务的能量级别自动安排在最适合的时间段：
            <ul className="mt-2 space-y-1">
              <li>• 高能量任务：安排在高效时段</li>
              <li>• 中能量任务：安排在普通工作时段</li>
              <li>• 低能量任务：安排在低效时段</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存设置
        </Button>
      </DialogFooter>
    </form>
  );
}