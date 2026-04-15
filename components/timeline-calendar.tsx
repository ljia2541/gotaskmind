"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Edit, Trash2, MoreHorizontal, Plus, Globe } from 'lucide-react';
import { Task, TimeSlot, CalendarEvent } from '@/types/task';
import { SmartSchedulerService } from '@/app/lib/smart-scheduler-service';
import { timeZoneService } from '@/app/lib/timezone-service';
import { TimeZoneSelector } from '@/components/ui/timezone-selector';

interface TimelineCalendarProps {
  tasks: Task[];
  currentDate?: Date;
  onTaskUpdate?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
}

export function TimelineCalendar({ tasks, currentDate = new Date(), onTaskUpdate, onTaskEdit, onTaskDelete, onTaskCreate }: TimelineCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null);
  const [showEventDetail, setShowEventDetail] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'task' | 'event'; item: Task | CalendarEvent } | null>(null);
  const [showEditEvent, setShowEditEvent] = useState<CalendarEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState<{ date: Date; isTask: boolean } | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'meeting' as CalendarEvent['type'],
    isBlocking: false
  });
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    category: 'work' as Task['category'],
    priority: 'medium' as Task['priority'],
    estimatedHours: 2,
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(timeZoneService.getUserTimeZone());

  const scheduler = SmartSchedulerService.getInstance();

  // 处理时区变更
  const handleTimeZoneChange = (timeZone: string) => {
    setUserTimeZone(timeZone);
  };

  useEffect(() => {
    loadCalendarEvents();
  }, [selectedDate]);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const events = await scheduler.getCalendarEvents(startOfWeek, endOfWeek);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task =>
      task.scheduledSlots?.some(slot => slot.date === dateStr)
    );
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event =>
      event.startTime.startsWith(dateStr)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const handleRescheduleTask = async (task: Task) => {
    if (!onTaskUpdate) return;

    try {
      const updatedTask = await scheduler.rescheduleTask(task);
      if (updatedTask) {
        onTaskUpdate(updatedTask);
        await loadCalendarEvents(); // 刷新日历事件
      }
    } catch (error) {
      console.error('Failed to reschedule task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    if (onTaskEdit) {
      onTaskEdit(task);
      setShowTaskDetail(null);
    }
  };

  const handleDeleteTask = (task: Task) => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
      setShowTaskDetail(null);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventFormData({
      title: event.title,
      description: event.description || '',
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
      type: event.type,
      isBlocking: event.isBlocking
    });
    setShowEditEvent(event);
    setShowEventDetail(null);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    // 从本地状态中删除事件
    setCalendarEvents(prev => prev.filter(e => e.id !== event.id));
    setShowEventDetail(null);
  };

  const handleSaveEventEdit = () => {
    if (!showEditEvent) return;

    const updatedEvent: CalendarEvent = {
      ...showEditEvent,
      title: eventFormData.title,
      description: eventFormData.description,
      startTime: new Date(eventFormData.startTime).toISOString(),
      endTime: new Date(eventFormData.endTime).toISOString(),
      type: eventFormData.type,
      isBlocking: eventFormData.isBlocking
    };

    setCalendarEvents(prev => prev.map(event =>
      event.id === showEditEvent.id ? updatedEvent : event
    ));

    setShowEditEvent(null);
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
      if (showDeleteConfirm.type === 'task') {
        handleDeleteTask(showDeleteConfirm.item as Task);
      } else {
        handleDeleteEvent(showDeleteConfirm.item as CalendarEvent);
      }
      setShowDeleteConfirm(null);
    }
  };

  // 处理点击日期单元格
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const now = new Date();

    // 获取用户时区的当前时间
    const userNow = new Date();
    const localHour = userNow.getHours();

    // 设置默认开始时间为用户时区的下一个整点
    const startHour = (localHour + 1) % 24;
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);

    // 设置默认结束时间为开始时间后1小时
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    // 将时间转换为用户时区的本地时间格式
    const formatDateTimeForInput = (date: Date): string => {
      // 创建一个表示用户时区的日期对象
      const userDate = new Date(date.toLocaleString("en-US", {
        timeZone: userTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));

      // 格式化为YYYY-MM-DDTHH:MM
      const year = userDate.getFullYear();
      const month = String(userDate.getMonth() + 1).padStart(2, '0');
      const day = String(userDate.getDate()).padStart(2, '0');
      const hours = String(userDate.getHours()).padStart(2, '0');
      const minutes = String(userDate.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // 初始化事件表单数据
    setEventFormData({
      title: '',
      description: '',
      startTime: formatDateTimeForInput(startTime),
      endTime: formatDateTimeForInput(endTime),
      type: 'meeting',
      isBlocking: false
    });

    // 初始化任务表单数据
    setTaskFormData({
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      estimatedHours: 2,
      startTime: formatDateTimeForInput(startTime),
      endTime: formatDateTimeForInput(endTime)
    });

    setShowAddEvent({ date, isTask: false });
  };

  // 处理添加新事件
  const handleAddEvent = () => {
    // 将本地时间转换为UTC时间存储
    const startTime = new Date(eventFormData.startTime);
    const endTime = new Date(eventFormData.endTime);

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: eventFormData.title,
      description: eventFormData.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: eventFormData.type,
      isBlocking: eventFormData.isBlocking
    };

    setCalendarEvents(prev => [...prev, newEvent]);
    setShowAddEvent(null);
    setEventFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      type: 'meeting',
      isBlocking: false
    });
  };

  // 处理添加新任务
  const handleAddTask = () => {
    if (!onTaskCreate) return;

    // 将本地时间转换为UTC时间存储
    const startTime = new Date(taskFormData.startTime);
    const endTime = new Date(taskFormData.endTime);

    const newTask: Omit<Task, 'id' | 'createdAt' | 'comments'> = {
      title: taskFormData.title,
      description: taskFormData.description,
      status: 'todo',
      category: taskFormData.category,
      priority: taskFormData.priority,
      estimatedHours: taskFormData.estimatedHours,
      energyLevel: 'medium',
      scheduledSlots: [{
        id: `slot-${Date.now()}`,
        taskId: '', // 将由父组件设置
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: startTime.toISOString().split('T')[0],
        isScheduled: true,
        isCompleted: false
      }],
      isTimeScheduled: true
    };

    onTaskCreate(newTask);
    setShowAddEvent(null);
    setTaskFormData({
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      estimatedHours: 2,
      startTime: '',
      endTime: ''
    });
  };

  const weekDates = getWeekDates();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              时间线日历
            </CardTitle>
            <div className="flex items-center gap-2">
              <TimeZoneSelector
                onTimeZoneChange={handleTimeZoneChange}
                variant="compact"
                showOffset={true}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {timeZoneService.formatDateTimeSimple(new Date(), {
                format: 'short'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {weekDates[0].toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} -
                {weekDates[6].toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* 星期标题 */}
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center p-2 font-medium text-sm ${
                index === 0 || index === 6 ? 'text-muted-foreground' : ''
              }`}
            >
              {day}
            </div>
          ))}

          {/* 日期内容 */}
          {weekDates.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[200px] border rounded-lg p-2 space-y-1 cursor-pointer hover:border-primary transition-colors ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-center p-1 rounded ${
                    isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <div className="text-xs">{date.getDate()}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                    title="添加事件或任务"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* 日历事件 */}
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded mb-1 group relative ${
                      event.isBlocking
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                    title={event.title}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{event.title}</div>
                        <div className="opacity-75">
                          {timeZoneService.formatDateTimeSimple(event.startTime, {
                            format: 'time-only'
                          })}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowEventDetail(event)}>
                            <AlertCircle className="h-3 w-3 mr-2" />
                            详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                            <Edit className="h-3 w-3 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteConfirm({ type: 'event', item: event })}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {/* 任务 */}
                {dayTasks.map(task => {
                  const slot = task.scheduledSlots?.find(s =>
                    s.date === date.toISOString().split('T')[0]
                  );
                  if (!slot) return null;

                  const startTime = new Date(slot.startTime);
                  const endTime = new Date(slot.endTime);

                  return (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded mb-1 border group relative ${
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-green-50 text-green-800 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setShowTaskDetail(task)}
                        >
                          <div className="truncate font-medium">{task.title}</div>
                          <div className="flex justify-between items-center opacity-75">
                            <span>
                              {timeZoneService.formatDateTimeSimple(slot.startTime, {
                                format: 'time-only'
                              })}
                            </span>
                            {task.energyLevel && (
                              <span className="ml-1">
                                {task.energyLevel === 'high' ? '⚡' :
                                 task.energyLevel === 'medium' ? '🔋' : '🌙'}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowTaskDetail(task); }}>
                              <AlertCircle className="h-3 w-3 mr-2" />
                              详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}>
                              <Edit className="h-3 w-3 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'task', item: task }); }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}

                {/* 统计信息 */}
                {(dayTasks.length > 0 || dayEvents.length > 0) && (
                  <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                    {dayTasks.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {dayTasks.length} 任务
                      </Badge>
                    )}
                    {dayEvents.length > 0 && (
                      <Badge variant="outline" className="text-xs ml-1">
                        {dayEvents.length} 事件
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>High Priority Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
            <span>Medium Priority Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>Low Priority Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Unavailable Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Other Events</span>
          </div>
        </div>
      </CardContent>

      {/* 任务详情对话框 */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>

          {showTaskDetail && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{showTaskDetail.title}</h3>
                {showTaskDetail.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {showTaskDetail.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">状态：</span>
                  <Badge variant="outline" className="ml-2">
                    {showTaskDetail.status === 'todo' ? '待办' :
                     showTaskDetail.status === 'in-progress' ? '进行中' : '已完成'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">优先级：</span>
                  <Badge variant="outline" className="ml-2">
                    {showTaskDetail.priority === 'high' ? '高' :
                     showTaskDetail.priority === 'medium' ? '中' : '低'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">分类：</span>
                  <Badge variant="outline" className="ml-2">
                    {showTaskDetail.category === 'work' ? '工作' :
                     showTaskDetail.category === 'personal' ? '个人' :
                     showTaskDetail.category === 'learning' ? '学习' : '其他'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">能量级别：</span>
                  <span className="ml-2">
                    {showTaskDetail.energyLevel === 'high' ? '⚡ 高' :
                     showTaskDetail.energyLevel === 'medium' ? '🔋 中' : '🌙 低'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-medium">预估时间：</span>
                <span className="ml-2">{showTaskDetail.estimatedHours} 小时</span>
              </div>

              {showTaskDetail.scheduledSlots && showTaskDetail.scheduledSlots.length > 0 && (
                <div>
                  <span className="font-medium">已安排时间：</span>
                  <div className="mt-2 space-y-1">
                    {showTaskDetail.scheduledSlots.map(slot => (
                      <div key={slot.id} className="text-sm p-2 bg-muted rounded">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {timeZoneService.formatDateTimeSimple(slot.startTime, {
                          format: 'short'
                        })} -
                        {timeZoneService.formatDateTimeSimple(slot.endTime, {
                          format: 'time-only'
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {onTaskEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTask(showTaskDetail)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRescheduleTask(showTaskDetail)}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  重新安排
                </Button>
                {onTaskDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm({ type: 'task', item: showTaskDetail })}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    删除
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 事件详情对话框 */}
      <Dialog open={!!showEventDetail} onOpenChange={() => setShowEventDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>

          {showEventDetail && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{showEventDetail.title}</h3>
                {showEventDetail.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {showEventDetail.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">类型：</span>
                  <Badge variant="outline" className="ml-2">
                    {showEventDetail.type === 'meeting' ? '会议' :
                     showEventDetail.type === 'personal' ? '个人' :
                     showEventDetail.type === 'work' ? '工作' : '其他'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">状态：</span>
                  <Badge variant={showEventDetail.isBlocking ? "destructive" : "outline"} className="ml-2">
                    {showEventDetail.isBlocking ? '不可用时间' : '普通事件'}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-medium">时间：</span>
                <div className="text-sm p-2 bg-muted rounded mt-2">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {timeZoneService.formatDateTimeSimple(showEventDetail.startTime, {
                    format: 'short'
                  })} -
                  {timeZoneService.formatDateTimeSimple(showEventDetail.endTime, {
                    format: 'time-only'
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEvent(showEventDetail)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm({ type: 'event', item: showEventDetail })}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          {showDeleteConfirm && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  确定要删除这个{showDeleteConfirm.type === 'task' ? '任务' : '事件'}吗？此操作无法撤销。
                </div>
              </div>

              <div className="p-3 bg-muted rounded">
                <div className="font-medium">
                  {showDeleteConfirm.type === 'task'
                    ? (showDeleteConfirm.item as Task).title
                    : (showDeleteConfirm.item as CalendarEvent).title
                  }
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 事件编辑对话框 */}
      <Dialog open={!!showEditEvent} onOpenChange={() => setShowEditEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveEventEdit(); }} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Event Description</Label>
              <Textarea
                id="event-description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start-time">Start Time</Label>
                <Input
                  id="event-start-time"
                  type="datetime-local"
                  value={eventFormData.startTime}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-end-time">End Time</Label>
                <Input
                  id="event-end-time"
                  type="datetime-local"
                  value={eventFormData.endTime}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={eventFormData.type}
                  onValueChange={(value) => setEventFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="选择事件类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="event-blocking"
                  checked={eventFormData.isBlocking}
                  onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isBlocking: checked }))}
                />
                <Label htmlFor="event-blocking">不可用时间（阻止在此期间安排其他任务）</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditEvent(null)}
              >
                取消
              </Button>
              <Button type="submit">
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 添加事件/任务对话框 */}
      <Dialog open={!!showAddEvent} onOpenChange={() => setShowAddEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              在 {showAddEvent?.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 添加
            </DialogTitle>
          </DialogHeader>

          {showAddEvent && (
            <div className="space-y-4 py-4">
              {/* 选择添加类型 */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={!showAddEvent.isTask ? "default" : "outline"}
                  onClick={() => setShowAddEvent(prev => prev ? { ...prev, isTask: false } : null)}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  添加事件
                </Button>
                <Button
                  variant={showAddEvent.isTask ? "default" : "outline"}
                  onClick={() => setShowAddEvent(prev => prev ? { ...prev, isTask: true } : null)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加任务
                </Button>
              </div>

              {!showAddEvent.isTask ? (
                /* 添加事件表单 */
                <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="add-event-title">Event Title</Label>
                    <Input
                      id="add-event-title"
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入事件标题"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-event-description">Event Description</Label>
                    <Textarea
                      id="add-event-description"
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入事件描述（可选）"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-event-start-time">Start Time</Label>
                      <Input
                        id="add-event-start-time"
                        type="datetime-local"
                        value={eventFormData.startTime}
                        onChange={(e) => setEventFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-event-end-time">End Time</Label>
                      <Input
                        id="add-event-end-time"
                        type="datetime-local"
                        value={eventFormData.endTime}
                        onChange={(e) => setEventFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-event-type">Event Type</Label>
                      <Select
                        value={eventFormData.type}
                        onValueChange={(value) => setEventFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}
                      >
                        <SelectTrigger id="add-event-type">
                          <SelectValue placeholder="选择事件类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="add-event-blocking"
                        checked={eventFormData.isBlocking}
                        onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isBlocking: checked }))}
                      />
                      <Label htmlFor="add-event-blocking" className="text-sm">
                        不可用时间
                      </Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddEvent(null)}
                    >
                      取消
                    </Button>
                    <Button type="submit">
                      添加事件
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                /* 添加任务表单 */
                <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="add-task-title">Task Title</Label>
                    <Input
                      id="add-task-title"
                      value={taskFormData.title}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入任务标题"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-task-description">Task Description</Label>
                    <Textarea
                      id="add-task-description"
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入任务描述（可选）"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-task-start-time">Start Time</Label>
                      <Input
                        id="add-task-start-time"
                        type="datetime-local"
                        value={taskFormData.startTime}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-task-end-time">End Time</Label>
                      <Input
                        id="add-task-end-time"
                        type="datetime-local"
                        value={taskFormData.endTime}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-task-category">Category</Label>
                      <Select
                        value={taskFormData.category}
                        onValueChange={(value) => setTaskFormData(prev => ({ ...prev, category: value as Task['category'] }))}
                      >
                        <SelectTrigger id="add-task-category">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="learning">Study</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-task-priority">Priority</Label>
                      <Select
                        value={taskFormData.priority}
                        onValueChange={(value) => setTaskFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
                      >
                        <SelectTrigger id="add-task-priority">
                          <SelectValue placeholder="选择优先级" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="add-task-hours">预估时间（小时）</Label>
                      <Input
                        id="add-task-hours"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={taskFormData.estimatedHours}
                        onChange={(e) => setTaskFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 2 }))}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddEvent(null)}
                    >
                      取消
                    </Button>
                    <Button type="submit">
                      添加任务
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}