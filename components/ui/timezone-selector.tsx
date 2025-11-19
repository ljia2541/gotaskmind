'use client'

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, Clock, Settings } from 'lucide-react';
import { timeZoneService, TimeZoneInfo } from '@/app/lib/timezone-service';

interface TimeZoneSelectorProps {
  onTimeZoneChange?: (timeZone: string, timeZoneInfo: TimeZoneInfo) => void;
  showOffset?: boolean;
  showFlag?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function TimeZoneSelector({
  onTimeZoneChange,
  showOffset = true,
  showFlag = false,
  variant = 'default'
}: TimeZoneSelectorProps) {
  const [currentTimeZone, setCurrentTimeZone] = useState<string>('');
  const [currentTimeZoneInfo, setCurrentTimeZoneInfo] = useState<TimeZoneInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 加载用户时区偏好
    timeZoneService.loadUserTimeZonePreference();
    const userTimeZone = timeZoneService.getUserTimeZone();
    const userTimeZoneInfo = timeZoneService.getUserTimeZoneInfo();

    setCurrentTimeZone(userTimeZone);
    setCurrentTimeZoneInfo(userTimeZoneInfo);
  }, []);

  const handleTimeZoneChange = (timeZoneId: string) => {
    const timeZoneInfo = timeZoneService.getSupportedTimeZones().find(tz => tz.id === timeZoneId);
    if (timeZoneInfo) {
      timeZoneService.saveUserTimeZonePreference(timeZoneId);
      setCurrentTimeZone(timeZoneId);
      setCurrentTimeZoneInfo(timeZoneInfo);
      onTimeZoneChange?.(timeZoneId, timeZoneInfo);
    }
    setIsOpen(false);
  };

  const getRegionFlag = (region: string): string => {
    const flags: Record<string, string> = {
      'Asia': '🌏',
      'America': '🌎',
      'Europe': '🌍',
      'Australia': '🦘',
      'Pacific': '🏝️',
      'Africa': '🌍'
    };
    return flags[region] || '🌐';
  };

  const getCountryFlag = (country?: string): string => {
    if (!country) return '';
    const countryFlags: Record<string, string> = {
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'Singapore': '🇸🇬',
      'UAE': '🇦🇪',
      'India': '🇮🇳',
      'UK': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Russia': '🇷🇺',
      'USA': '🇺🇸',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'New Zealand': '🇳🇿',
    };
    return countryFlags[country] || '';
  };

  const formatCurrentTime = (timeZone: string): string => {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <Select value={currentTimeZone} onValueChange={handleTimeZoneChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeZoneService.getSupportedTimeZones().map((tz) => (
              <SelectItem key={tz.id} value={tz.id}>
                <div className="flex items-center gap-2">
                  {showFlag && getRegionFlag(tz.region)}
                  <span>{tz.country || tz.name}</span>
                  <span className="text-muted-foreground text-xs">{tz.offsetString}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {currentTimeZoneInfo?.country || currentTimeZoneInfo?.name || 'UTC'}
          </span>
          {showOffset && currentTimeZoneInfo && (
            <span className="text-muted-foreground text-xs hidden md:inline">
              {currentTimeZoneInfo.offsetString}
            </span>
          )}
          <Settings className="w-3 h-3 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            选择时区
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 当前时区信息 */}
          {currentTimeZoneInfo && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">当前时区</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatCurrentTime(currentTimeZone)}</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {getCountryFlag(currentTimeZoneInfo.country)} {currentTimeZoneInfo.country || currentTimeZoneInfo.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentTimeZoneInfo.offsetString} • {currentTimeZoneInfo.region}
              </div>
            </div>
          )}

          {/* 时区选择器 */}
          <div className="space-y-3">
            <h3 className="font-medium">选择时区</h3>
            <Select value={currentTimeZone} onValueChange={handleTimeZoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择您的时区" />
              </SelectTrigger>
              <SelectContent>
                {timeZoneService.getSupportedTimeZones().map((tz) => (
                  <SelectItem key={tz.id} value={tz.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {getRegionFlag(tz.region)}
                        {getCountryFlag(tz.country)}
                        <span>{tz.country || tz.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tz.offsetString}</span>
                        <span className="hidden sm:inline">{formatCurrentTime(tz.id)}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 全球地区快速选择 */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">全球地区快速选择</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { region: 'Asia', label: '亚洲', flag: '🌏' },
                { region: 'Europe', label: '欧洲', flag: '🌍' },
                { region: 'America', label: '美洲', flag: '🌎' },
                { region: 'Africa', label: '非洲', flag: '🌍' },
                { region: 'Australia', label: '澳洲', flag: '🦘' },
                { region: 'Pacific', label: '太平洋', flag: '🏝️' }
              ].map(({ region, label, flag }) => (
                <Button
                  key={region}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const timeZones = timeZoneService.getTimeZonesByRegion(region);
                    if (timeZones.length > 0) {
                      // 选择该地区的代表性时区
                      let representativeTimeZone = timeZones[0];
                      if (region === 'Asia') representativeTimeZone = timeZones.find(tz => tz.id === 'Asia/Shanghai') || timeZones[0];
                      if (region === 'Europe') representativeTimeZone = timeZones.find(tz => tz.id === 'Europe/London') || timeZones[0];
                      if (region === 'America') representativeTimeZone = timeZones.find(tz => tz.id === 'America/New_York') || timeZones[0];
                      if (region === 'Africa') representativeTimeZone = timeZones.find(tz => tz.id === 'Africa/Cairo') || timeZones[0];
                      if (region === 'Australia') representativeTimeZone = timeZones.find(tz => tz.id === 'Australia/Sydney') || timeZones[0];
                      if (region === 'Pacific') representativeTimeZone = timeZones.find(tz => tz.id === 'Pacific/Auckland') || timeZones[0];

                      handleTimeZoneChange(representativeTimeZone.id);
                    }
                  }}
                  className="flex items-center gap-2 text-xs"
                >
                  {flag} {label}
                </Button>
              ))}
            </div>

            {/* 热门城市快速选择 */}
            <h4 className="font-medium text-sm mt-4">热门城市</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Asia/Shanghai', label: '北京/上海', flag: '🇨🇳' },
                { id: 'Asia/Tokyo', label: '东京', flag: '🇯🇵' },
                { id: 'Asia/Seoul', label: '首尔', flag: '🇰🇷' },
                { id: 'Europe/London', label: '伦敦', flag: '🇬🇧' },
                { id: 'Europe/Paris', label: '巴黎', flag: '🇫🇷' },
                { id: 'America/New_York', label: '纽约', flag: '🇺🇸' },
                { id: 'America/Los_Angeles', label: '洛杉矶', flag: '🇺🇸' },
                { id: 'Australia/Sydney', label: '悉尼', flag: '🇦🇺' },
                { id: 'Africa/Johannesburg', label: '约翰内斯堡', flag: '🇿🇦' }
              ].map(({ id, label, flag }) => {
                const tzInfo = timeZoneService.getSupportedTimeZones().find(tz => tz.id === id);
                return tzInfo ? (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTimeZoneChange(id)}
                    className="flex items-center gap-2 text-xs"
                  >
                    {flag} {label}
                    <span className="text-muted-foreground text-xs">{tzInfo.offsetString}</span>
                  </Button>
                ) : null;
              })}
            </div>
          </div>

          {/* 说明 */}
          <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p>• 时区设置将影响所有时间和日期的显示</p>
            <p>• 日历和时间安排将根据您的时区自动调整</p>
            <p>• 您的时区偏好会被保存以便下次使用</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}