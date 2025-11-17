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
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Task, TimeSlot, CalendarEvent } from '@/types/task';
import { SmartSchedulerService } from '@/app/lib/smart-scheduler-service';

interface TimelineCalendarProps {
  tasks: Task[];
  currentDate?: Date;
  onTaskUpdate?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export function TimelineCalendar({ tasks, currentDate = new Date(), onTaskUpdate, onTaskEdit, onTaskDelete }: TimelineCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null);
  const [showEventDetail, setShowEventDetail] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'task' | 'event'; item: Task | CalendarEvent } | null>(null);
  const [showEditEvent, setShowEditEvent] = useState<CalendarEvent | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'meeting' as CalendarEvent['type'],
    isBlocking: false
  });
  const [loading, setLoading] = useState(false);

  const scheduler = SmartSchedulerService.getInstance();

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

  const weekDates = getWeekDates();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            时间线日历
          </CardTitle>
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
                className={`min-h-[200px] border rounded-lg p-2 space-y-1 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className={`text-center p-1 rounded ${
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <div className="text-xs">{date.getDate()}</div>
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
                          {new Date(event.startTime).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
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
                              {startTime.toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit'
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
            <span>高优先级任务</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
            <span>中优先级任务</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>低优先级任务</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>不可用时间</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>其他事件</span>
          </div>
        </div>
      </CardContent>

      {/* 任务详情对话框 */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
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
                        {new Date(slot.startTime).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} -
                        {new Date(slot.endTime).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
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
            <DialogTitle>事件详情</DialogTitle>
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
                  {new Date(showEventDetail.startTime).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} -
                  {new Date(showEventDetail.endTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
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
            <DialogTitle>确认删除</DialogTitle>
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
            <DialogTitle>编辑事件</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveEventEdit(); }} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">事件标题</Label>
              <Input
                id="event-title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">事件描述</Label>
              <Textarea
                id="event-description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start-time">开始时间</Label>
                <Input
                  id="event-start-time"
                  type="datetime-local"
                  value={eventFormData.startTime}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-end-time">结束时间</Label>
                <Input
                  id="event-end-time"
                  type="datetime-local"
                  value={eventFormData.endTime}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">事件类型</Label>
                <Select
                  value={eventFormData.type}
                  onValueChange={(value) => setEventFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="选择事件类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">会议</SelectItem>
                    <SelectItem value="personal">个人</SelectItem>
                    <SelectItem value="work">工作</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
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
    </Card>
  );
}