"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, Clock, Target, Zap, Battery, Moon, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface PersonalWorkStatsProps {
  tasks: Task[];
}

// 获取本周的开始和结束日期
function getWeekRange() {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // 调整为周一开始

  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// 本周概览数据
function getWeekOverview(tasks: Task[]) {
  const { weekStart, weekEnd } = getWeekRange();

  const weekTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  const completedThisWeek = weekTasks.filter(task =>
    task.status === 'completed' &&
    task.completedAt &&
    new Date(task.completedAt) >= weekStart &&
    new Date(task.completedAt) <= weekEnd
  );

  const totalHoursThisWeek = completedThisWeek.reduce((total, task) =>
    total + (task.estimatedHours || 0), 0
  );

  const totalTasksCreated = weekTasks.length;
  const completionRate = totalTasksCreated > 0
    ? Math.round((completedThisWeek.length / totalTasksCreated) * 100)
    : 0;

  return {
    totalTasks: totalTasksCreated,
    completedTasks: completedThisWeek.length,
    totalHours: totalHoursThisWeek,
    completionRate,
    weekStart: weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    weekEnd: weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  };
}

// 优先级分布数据
function getPriorityDistribution(tasks: Task[]) {
  const distribution = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  return [
    { name: '高优先级', value: distribution.high, color: '#ef4444' },
    { name: '中优先级', value: distribution.medium, color: '#f59e0b' },
    { name: '低优先级', value: distribution.low, color: '#10b981' }
  ].filter(item => item.value > 0);
}

// 时间预估准确率分析
function getTimeEstimateAccuracy(tasks: Task[]) {
  const completedTasks = tasks.filter(task =>
    task.status === 'completed' &&
    task.estimatedHours &&
    task.createdAt &&
    task.completedAt
  );

  if (completedTasks.length === 0) {
    return {
      accuracy: 0,
      analysis: '没有已完成的任务数据',
      tasks: []
    };
  }

  const analyzedTasks = completedTasks.map(task => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.completedAt!).getTime();
    const actualHours = (completed - created) / (1000 * 60 * 60); // 转换为小时
    const estimated = task.estimatedHours || 0;
    const accuracy = estimated > 0 ? Math.min(100, (estimated / actualHours) * 100) : 0;

    return {
      title: task.title,
      estimated,
      actual: actualHours,
      accuracy
    };
  });

  const averageAccuracy = analyzedTasks.reduce((sum, task) => sum + task.accuracy, 0) / analyzedTasks.length;

  let analysis = '';
  if (averageAccuracy >= 90) {
    analysis = '时间预估非常准确！';
  } else if (averageAccuracy >= 70) {
    analysis = '时间预估比较准确，还有提升空间';
  } else if (averageAccuracy >= 50) {
    analysis = '时间预估需要改进，建议预留更多缓冲时间';
  } else {
    analysis = '时间预估偏差较大，建议重新评估时间规划方法';
  }

  return {
    accuracy: Math.round(averageAccuracy),
    analysis,
    tasks: analyzedTasks.slice(0, 5) // 只显示前5个任务
  };
}

// 能量周期匹配分析
function getEnergyCycleMatch(tasks: Task[]) {
  // 定义个人高效时段（假设为上午9-12点和下午2-5点）
  const productiveHours = [
    { start: 9, end: 12 },   // 上午
    { start: 14, end: 17 }   // 下午
  ];

  const completedTasks = tasks.filter(task =>
    task.status === 'completed' &&
    task.completedAt &&
    task.energyLevel
  );

  if (completedTasks.length === 0) {
    return {
      matchRate: 0,
      analysis: '没有已完成的任务数据',
      distribution: [
        { time: '上午', high: 0, medium: 0, low: 0 },
        { time: '下午', high: 0, medium: 0, low: 0 },
        { time: '晚上', high: 0, medium: 0, low: 0 }
      ]
    };
  }

  // 统计不同时间段完成的任务
  const timeDistribution = {
    morning: { high: 0, medium: 0, low: 0 },
    afternoon: { high: 0, medium: 0, low: 0 },
    evening: { high: 0, medium: 0, low: 0 }
  };

  let highEnergyInProductiveTime = 0;
  let totalHighEnergyTasks = 0;

  completedTasks.forEach(task => {
    const completedHour = new Date(task.completedAt!).getHours();
    const energyLevel = task.energyLevel!;

    // 判断时间段
    if (completedHour >= 6 && completedHour < 12) {
      timeDistribution.morning[energyLevel]++;
    } else if (completedHour >= 12 && completedHour < 18) {
      timeDistribution.afternoon[energyLevel]++;
    } else {
      timeDistribution.evening[energyLevel]++;
    }

    // 统计高能量任务
    if (energyLevel === 'high') {
      totalHighEnergyTasks++;
      const isInProductiveTime = productiveHours.some(range =>
        completedHour >= range.start && completedHour < range.end
      );
      if (isInProductiveTime) {
        highEnergyInProductiveTime++;
      }
    }
  });

  const matchRate = totalHighEnergyTasks > 0
    ? Math.round((highEnergyInProductiveTime / totalHighEnergyTasks) * 100)
    : 0;

  // 转换为图表数据
  const distribution = [
    {
      time: '上午 (6-12)',
      高能量: timeDistribution.morning.high,
      中能量: timeDistribution.morning.medium,
      低能量: timeDistribution.morning.low
    },
    {
      time: '下午 (12-18)',
      高能量: timeDistribution.afternoon.high,
      中能量: timeDistribution.afternoon.medium,
      低能量: timeDistribution.afternoon.low
    },
    {
      time: '晚上 (18-24)',
      高能量: timeDistribution.evening.high,
      中能量: timeDistribution.evening.medium,
      低能量: timeDistribution.evening.low
    }
  ];

  let analysis = '';
  if (matchRate >= 80) {
    analysis = '很好的能量管理！高能量任务主要在高效时段完成';
  } else if (matchRate >= 60) {
    analysis = '能量匹配度不错，可以进一步优化任务安排';
  } else if (matchRate >= 40) {
    analysis = '建议将更多高能量任务安排在高效时段';
  } else {
    analysis = '需要重新规划任务时间，提高能量利用率';
  }

  return {
    matchRate,
    analysis,
    distribution
  };
}

export function PersonalWorkStats({ tasks }: PersonalWorkStatsProps) {
  const weekOverview = useMemo(() => getWeekOverview(tasks), [tasks]);
  const priorityDistribution = useMemo(() => getPriorityDistribution(tasks), [tasks]);
  const timeAccuracy = useMemo(() => getTimeEstimateAccuracy(tasks), [tasks]);
  const energyMatch = useMemo(() => getEnergyCycleMatch(tasks), [tasks]);

  // 获取能量图标
  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Battery className="w-4 h-4 text-teal-500" />;
      case 'low':
        return <Moon className="w-4 h-4 text-cyan-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 本周概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            本周概览 ({weekOverview.weekStart} - {weekOverview.weekEnd})
          </CardTitle>
          <CardDescription>
            本周任务完成情况和工作统计
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{weekOverview.totalTasks}</div>
              <div className="text-sm text-muted-foreground">总任务数</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{weekOverview.completedTasks}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{weekOverview.totalHours}h</div>
              <div className="text-sm text-muted-foreground">总工作时间</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{weekOverview.completionRate}%</div>
              <div className="text-sm text-muted-foreground">完成率</div>
              <Progress value={weekOverview.completionRate} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优先级分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              优先级分布
            </CardTitle>
            <CardDescription>
              任务优先级分布情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            {priorityDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => [`${value} 个任务`, '数量']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {priorityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 时间预估准确率 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              时间预估准确率
            </CardTitle>
            <CardDescription>
              预估时间与实际完成时间的对比
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  timeAccuracy.accuracy >= 70 ? 'text-green-600' :
                  timeAccuracy.accuracy >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {timeAccuracy.accuracy}%
                </div>
                <Progress value={timeAccuracy.accuracy} className="mt-2 h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {timeAccuracy.analysis}
                </p>
              </div>

              {timeAccuracy.tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">最近完成的任务：</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {timeAccuracy.tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                        <span className="truncate mr-2">{task.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            预估: {task.estimated}h
                          </span>
                          <span className="text-muted-foreground">
                            实际: {task.actual.toFixed(1)}h
                          </span>
                          <Badge
                            variant={task.accuracy >= 80 ? 'default' : task.accuracy >= 60 ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {Math.round(task.accuracy)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 能量周期匹配 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            能量周期匹配分析
          </CardTitle>
          <CardDescription>
            高能量任务与高效时段的匹配情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  energyMatch.matchRate >= 70 ? 'text-green-600' :
                  energyMatch.matchRate >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {energyMatch.matchRate}%
                </div>
                <Progress value={energyMatch.matchRate} className="mt-2 h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {energyMatch.analysis}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/30 rounded">
                  <div className="flex justify-center mb-1">
                    {getEnergyIcon('high')}
                  </div>
                  <div className="text-lg font-semibold">
                    {energyMatch.distribution.reduce((sum, d) => sum + (d.高能量 || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">高能量任务</div>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <div className="flex justify-center mb-1">
                    {getEnergyIcon('medium')}
                  </div>
                  <div className="text-lg font-semibold">
                    {energyMatch.distribution.reduce((sum, d) => sum + (d.中能量 || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">中能量任务</div>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <div className="flex justify-center mb-1">
                    {getEnergyIcon('low')}
                  </div>
                  <div className="text-lg font-semibold">
                    {energyMatch.distribution.reduce((sum, d) => sum + (d.低能量 || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">低能量任务</div>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyMatch.distribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      `${value} 个任务`,
                      name === '高能量' ? '高能量' : name === '中能量' ? '中能量' : '低能量'
                    ]}
                  />
                  <Bar dataKey="高能量" fill="#f97316" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="中能量" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="低能量" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">高能量任务</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-sm">中能量任务</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-sm">低能量任务</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 洞察和建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            个人生产力洞察
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                做得好的方面
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {weekOverview.completionRate >= 70 && (
                  <li>• 本周任务完成率较高，保持良好势头</li>
                )}
                {timeAccuracy.accuracy >= 70 && (
                  <li>• 时间预估准确，展现了良好的规划能力</li>
                )}
                {energyMatch.matchRate >= 70 && (
                  <li>• 能量管理优秀，高效利用了精力时段</li>
                )}
                {weekOverview.totalHours >= 20 && (
                  <li>• 工作投入充足，展现了良好的工作态度</li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                改进建议
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {weekOverview.completionRate < 50 && (
                  <li>• 建议调整任务规划，设置更现实的目标</li>
                )}
                {timeAccuracy.accuracy < 50 && (
                  <li>• 改进时间预估方法，为任务预留更多缓冲时间</li>
                )}
                {energyMatch.matchRate < 50 && (
                  <li>• 将高能量任务安排在精力最充沛的时段</li>
                )}
                {priorityDistribution.filter(d => d.name === '高优先级').reduce((sum, d) => sum + d.value, 0) > tasks.length * 0.3 && (
                  <li>• 高优先级任务较多，考虑任务分解或优先级调整</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}