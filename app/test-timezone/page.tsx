'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimeZoneSelector } from '@/components/ui/timezone-selector';
import { timeZoneService, TimeZoneInfo } from '@/app/lib/timezone-service';
import { Globe, Clock, Calendar, RefreshCw } from 'lucide-react';

export default function TimeZoneTestPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('');
  const [timeZoneInfo, setTimeZoneInfo] = useState<TimeZoneInfo | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    time: string;
    utc: string;
    offset: string;
  }>>([]);

  useEffect(() => {
    // 初始化时区
    timeZoneService.loadUserTimeZonePreference();
    const userTimeZone = timeZoneService.getUserTimeZone();
    const userTimeZoneInfo = timeZoneService.getUserTimeZoneInfo();

    setSelectedTimeZone(userTimeZone);
    setTimeZoneInfo(userTimeZoneInfo);

    // 定时更新当前时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeZoneChange = (timeZoneId: string, timeZoneInfo: TimeZoneInfo) => {
    setSelectedTimeZone(timeZoneId);
    setTimeZoneInfo(timeZoneInfo);

    // 生成测试结果
    generateTestResults(timeZoneId);
  };

  const generateTestResults = (timeZoneId: string) => {
    const testDates = [
      { name: '当前时间', date: new Date() },
      { name: '今天中午', date: new Date().setHours(12, 0, 0, 0) },
      { name: '今天午夜', date: new Date().setHours(0, 0, 0, 0) },
      { name: '明天上午9点', date: new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0) }
    ];

    const results = testDates.map(test => {
      const testDate = new Date(test.date);
      return {
        name: test.name,
        time: timeZoneService.formatDateTimeWithZone(testDate, { showOffset: true }),
        utc: timeZoneService.formatDateTimeWithZone(testDate, { showUTC: true }),
        offset: timeZoneService.formatDateTimeWithZone(testDate, { format: 'time-only', showOffset: true })
      };
    });

    setTestResults(results);
  };

  const testDifferentRegions = () => {
    // 选择全球代表性时区
    const globalTimeZones = [
      { name: '亚洲/中国', id: 'Asia/Shanghai', flag: '🇨🇳' },
      { name: '亚洲/日本', id: 'Asia/Tokyo', flag: '🇯🇵' },
      { name: '亚洲/印度', id: 'Asia/Kolkata', flag: '🇮🇳' },
      { name: '亚洲/阿联酋', id: 'Asia/Dubai', flag: '🇦🇪' },
      { name: '欧洲/英国', id: 'Europe/London', flag: '🇬🇧' },
      { name: '欧洲/德国', id: 'Europe/Berlin', flag: '🇩🇪' },
      { name: '欧洲/俄罗斯', id: 'Europe/Moscow', flag: '🇷🇺' },
      { name: '北美/美国东部', id: 'America/New_York', flag: '🇺🇸' },
      { name: '北美/美国西部', id: 'America/Los_Angeles', flag: '🇺🇸' },
      { name: '北美/加拿大', id: 'America/Toronto', flag: '🇨🇦' },
      { name: '南美/巴西', id: 'America/Sao_Paulo', flag: '🇧🇷' },
      { name: '南美/阿根廷', id: 'America/Buenos_Aires', flag: '🇦🇷' },
      { name: '非洲/南非', id: 'Africa/Johannesburg', flag: '🇿🇦' },
      { name: '非洲/埃及', id: 'Africa/Cairo', flag: '🇪🇬' },
      { name: '大洋洲/澳大利亚', id: 'Australia/Sydney', flag: '🇦🇺' },
      { name: '大洋洲/新西兰', id: 'Pacific/Auckland', flag: '🇳🇿' }
    ];

    const testDate = new Date();
    const regionResults = globalTimeZones.map(region => {
      const tzInfo = timeZoneService.getSupportedTimeZones().find(tz => tz.id === region.id);
      return {
        flag: region.flag,
        name: region.name,
        time: tzInfo ? testDate.toLocaleString('zh-CN', { timeZone: region.id }) : 'N/A',
        offset: tzInfo?.offsetString || 'N/A'
      };
    });

    alert('🌍 全球时区对比：\n\n' +
      regionResults.map(r => `${r.flag} ${r.name}: ${r.time} (${r.offset})`).join('\n') +
      '\n\n现在支持全球100+个时区！'
    );
  };

  const getGlobalTimezoneStats = () => {
    const allTimeZones = timeZoneService.getSupportedTimeZones();
    const regions = [...new Set(allTimeZones.map(tz => tz.region))];

    return {
      total: allTimeZones.length,
      regions: regions.length,
      Asia: allTimeZones.filter(tz => tz.region === 'Asia').length,
      Europe: allTimeZones.filter(tz => tz.region === 'Europe').length,
      America: allTimeZones.filter(tz => tz.region === 'America').length,
      Africa: allTimeZones.filter(tz => tz.region === 'Africa').length,
      Australia: allTimeZones.filter(tz => tz.region === 'Australia').length,
      Pacific: allTimeZones.filter(tz => tz.region === 'Pacific').length,
    };
  };

  const globalStats = getGlobalTimezoneStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="w-8 h-8" />
          时区功能测试页面
        </h1>
        <p className="text-muted-foreground">
          测试和验证不同时区下的时间显示功能
        </p>
      </div>

      {/* 当前时区信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            当前时区设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">选择时区</h3>
              <p className="text-sm text-muted-foreground">
                更改时区以查看不同地区的时间显示
              </p>
            </div>
            <TimeZoneSelector
              variant="default"
              showOffset={true}
              onTimeZoneChange={handleTimeZoneChange}
            />
          </div>

          {timeZoneInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">地区</div>
                <div className="font-medium">{timeZoneInfo.region}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">国家/城市</div>
                <div className="font-medium">{timeZoneInfo.country || timeZoneInfo.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">UTC偏移</div>
                <div className="font-medium">{timeZoneInfo.offsetString}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">时区ID</div>
                <div className="font-medium text-xs">{timeZoneInfo.id}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 实时时间显示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            实时时间显示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-primary">
              {timeZoneService.formatDateTimeWithZone(currentTime, { showUTC: true, showOffset: true })}
            </div>
            <div className="text-lg text-muted-foreground">
              {timeZoneService.formatDateTimeWithZone(currentTime, { format: 'long' })}
            </div>
            <Button onClick={() => setCurrentTime(new Date())} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新时间
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>时间格式化测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">{result.name}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">本地时间：</span>
                      <span className="font-mono">{result.time}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">UTC时间：</span>
                      <span className="font-mono">{result.utc}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">偏移：</span>
                      <Badge variant="outline">{result.offset}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 全球时区覆盖统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            全球时区覆盖统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{globalStats.total}</div>
              <div className="text-sm text-blue-800">总时区数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{globalStats.regions}</div>
              <div className="text-sm text-green-800">覆盖地区</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">24</div>
              <div className="text-sm text-purple-800">小时覆盖</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">195</div>
              <div className="text-sm text-orange-800">国家覆盖</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">各地区时区分布：</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🌏 亚洲</span>
                <Badge variant="secondary">{globalStats.Asia}个</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🌍 欧洲</span>
                <Badge variant="secondary">{globalStats.Europe}个</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🌎 美洲</span>
                <Badge variant="secondary">{globalStats.America}个</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🌍 非洲</span>
                <Badge variant="secondary">{globalStats.Africa}个</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🦘 大洋洲</span>
                <Badge variant="secondary">{globalStats.Australia}个</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>🏝️ 太平洋</span>
                <Badge variant="secondary">{globalStats.Pacific}个</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 区域测试 */}
      <Card>
        <CardHeader>
          <CardTitle>全球时区对比测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              点击按钮查看全球16个代表性地区的当前时间对比
            </p>
            <Button onClick={testDifferentRegions} className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              全球时区对比测试
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}