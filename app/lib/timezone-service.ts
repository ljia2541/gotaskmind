/**
 * 时区服务 - 处理用户时区检测、转换和显示
 */

export interface TimeZoneInfo {
  id: string;
  name: string;
  offset: number; // 相对于UTC的偏移分钟数
  offsetString: string; // 格式化的偏移字符串，如 "UTC+8", "UTC-5"
  region: string; // 地区，如 "Asia", "America", "Europe"
  country?: string;
}

export interface DateTimeWithZone {
  date: Date;
  timeZone: string;
  localTime: string;
  utcTime: string;
  offsetString: string;
}

export class TimeZoneService {
  private static instance: TimeZoneService;
  private userTimeZone: string = 'UTC';
  private userTimeZoneInfo: TimeZoneInfo | null = null;

  private constructor() {
    this.detectUserTimeZone();
  }

  public static getInstance(): TimeZoneService {
    if (!TimeZoneService.instance) {
      TimeZoneService.instance = new TimeZoneService();
    }
    return TimeZoneService.instance;
  }

  /**
   * 检测用户时区
   */
  private detectUserTimeZone(): void {
    if (typeof window !== 'undefined') {
      // 优先使用Intl API检测用户时区
      const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.userTimeZone = detectedTimeZone;
      this.userTimeZoneInfo = this.parseTimeZoneInfo(detectedTimeZone);
    }
  }

  /**
   * 解析时区信息
   */
  private parseTimeZoneInfo(timeZone: string): TimeZoneInfo {
    const now = new Date();

    // 获取时区信息
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timeZone;

    // 计算UTC偏移
    const utcDate = new Date(now.getTime());
    const localDate = new Date(now.toLocaleString("en-US", { timeZone }));
    const offset = (localDate.getTime() - utcDate.getTime()) / (1000 * 60);

    // 格式化偏移字符串
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    const sign = offset >= 0 ? '+' : '-';
    const offsetString = `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;

    // 解析地区
    let region = 'Unknown';
    let country: string | undefined;

    if (timeZone.includes('/')) {
      const [regionPart, countryPart] = timeZone.split('/');
      region = regionPart;
      country = countryPart?.replace(/_/g, ' ');
    }

    return {
      id: timeZone,
      name: timeZoneName,
      offset,
      offsetString,
      region,
      country
    };
  }

  /**
   * 获取用户时区信息
   */
  public getUserTimeZone(): string {
    return this.userTimeZone;
  }

  /**
   * 获取用户时区详细信息
   */
  public getUserTimeZoneInfo(): TimeZoneInfo | null {
    return this.userTimeZoneInfo;
  }

  /**
   * 获取支持的主要时区列表（全球覆盖）
   */
  public getSupportedTimeZones(): TimeZoneInfo[] {
    return [
      // 亚洲时区
      { id: 'Asia/Shanghai', name: 'CST', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '中国' },
      { id: 'Asia/Hong_Kong', name: 'HKT', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '中国香港' },
      { id: 'Asia/Taipei', name: 'CST', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '中国台湾' },
      { id: 'Asia/Tokyo', name: 'JST', offset: 540, offsetString: 'UTC+9:00', region: 'Asia', country: '日本' },
      { id: 'Asia/Seoul', name: 'KST', offset: 540, offsetString: 'UTC+9:00', region: 'Asia', country: '韩国' },
      { id: 'Asia/Singapore', name: 'SGT', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '新加坡' },
      { id: 'Asia/Bangkok', name: 'ICT', offset: 420, offsetString: 'UTC+7:00', region: 'Asia', country: '泰国' },
      { id: 'Asia/Jakarta', name: 'WIB', offset: 420, offsetString: 'UTC+7:00', region: 'Asia', country: '印度尼西亚' },
      { id: 'Asia/Manila', name: 'PST', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '菲律宾' },
      { id: 'Asia/Kuala_Lumpur', name: 'MYT', offset: 480, offsetString: 'UTC+8:00', region: 'Asia', country: '马来西亚' },
      { id: 'Asia/Ho_Chi_Minh', name: 'ICT', offset: 420, offsetString: 'UTC+7:00', region: 'Asia', country: '越南' },
      { id: 'Asia/Dubai', name: 'GST', offset: 240, offsetString: 'UTC+4:00', region: 'Asia', country: '阿联酋' },
      { id: 'Asia/Riyadh', name: 'AST', offset: 180, offsetString: 'UTC+3:00', region: 'Asia', country: '沙特阿拉伯' },
      { id: 'Asia/Tehran', name: 'IRST', offset: 210, offsetString: 'UTC+3:30', region: 'Asia', country: '伊朗' },
      { id: 'Asia/Kolkata', name: 'IST', offset: 330, offsetString: 'UTC+5:30', region: 'Asia', country: '印度' },
      { id: 'Asia/Karachi', name: 'PKT', offset: 300, offsetString: 'UTC+5:00', region: 'Asia', country: '巴基斯坦' },
      { id: 'Asia/Dhaka', name: 'BST', offset: 360, offsetString: 'UTC+6:00', region: 'Asia', country: '孟加拉国' },
      { id: 'Asia/Colombo', name: 'SLST', offset: 330, offsetString: 'UTC+5:30', region: 'Asia', country: '斯里兰卡' },
      { id: 'Asia/Kathmandu', name: 'NPT', offset: 345, offsetString: 'UTC+5:45', region: 'Asia', country: '尼泊尔' },
      { id: 'Asia/Yangon', name: 'MMT', offset: 390, offsetString: 'UTC+6:30', region: 'Asia', country: '缅甸' },

      // 西亚时区
      { id: 'Asia/Jerusalem', name: 'IST', offset: 120, offsetString: 'UTC+2:00', region: 'Asia', country: '以色列' },
      { id: 'Asia/Istanbul', name: 'TRT', offset: 180, offsetString: 'UTC+3:00', region: 'Asia', country: '土耳其' },
      { id: 'Europe/Moscow', name: 'MSK', offset: 180, offsetString: 'UTC+3:00', region: 'Europe', country: '俄罗斯' },

      // 欧洲时区
      { id: 'Europe/London', name: 'GMT/BST', offset: 0, offsetString: 'UTC+0:00', region: 'Europe', country: '英国' },
      { id: 'Europe/Paris', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '法国' },
      { id: 'Europe/Berlin', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '德国' },
      { id: 'Europe/Rome', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '意大利' },
      { id: 'Europe/Madrid', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '西班牙' },
      { id: 'Europe/Amsterdam', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '荷兰' },
      { id: 'Europe/Brussels', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '比利时' },
      { id: 'Europe/Zurich', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '瑞士' },
      { id: 'Europe/Vienna', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '奥地利' },
      { id: 'Europe/Stockholm', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '瑞典' },
      { id: 'Europe/Oslo', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '挪威' },
      { id: 'Europe/Copenhagen', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '丹麦' },
      { id: 'Europe/Helsinki', name: 'EET/EEST', offset: 120, offsetString: 'UTC+2:00', region: 'Europe', country: '芬兰' },
      { id: 'Europe/Warsaw', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '波兰' },
      { id: 'Europe/Prague', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '捷克' },
      { id: 'Europe/Budapest', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Europe', country: '匈牙利' },
      { id: 'Europe/Bucharest', name: 'EET/EEST', offset: 120, offsetString: 'UTC+2:00', region: 'Europe', country: '罗马尼亚' },
      { id: 'Europe/Sofia', name: 'EET/EEST', offset: 120, offsetString: 'UTC+2:00', region: 'Europe', country: '保加利亚' },
      { id: 'Europe/Athens', name: 'EET/EEST', offset: 120, offsetString: 'UTC+2:00', region: 'Europe', country: '希腊' },
      { id: 'Europe/Lisbon', name: 'WET/WEST', offset: 0, offsetString: 'UTC+0:00', region: 'Europe', country: '葡萄牙' },
      { id: 'Europe/Dublin', name: 'GMT/IST', offset: 0, offsetString: 'UTC+0:00', region: 'Europe', country: '爱尔兰' },

      // 北美洲时区
      { id: 'America/New_York', name: 'EST/EDT', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '美国东部' },
      { id: 'America/Los_Angeles', name: 'PST/PDT', offset: -480, offsetString: 'UTC-8:00', region: 'America', country: '美国西部' },
      { id: 'America/Chicago', name: 'CST/CDT', offset: -360, offsetString: 'UTC-6:00', region: 'America', country: '美国中部' },
      { id: 'America/Denver', name: 'MST/MDT', offset: -420, offsetString: 'UTC-7:00', region: 'America', country: '美国山地' },
      { id: 'America/Phoenix', name: 'MST', offset: -420, offsetString: 'UTC-7:00', region: 'America', country: '美国亚利桑那' },
      { id: 'America/Anchorage', name: 'AKST/AKDT', offset: -540, offsetString: 'UTC-9:00', region: 'America', country: '美国阿拉斯加' },
      { id: 'Pacific/Honolulu', name: 'HST', offset: -600, offsetString: 'UTC-10:00', region: 'America', country: '美国夏威夷' },
      { id: 'America/Toronto', name: 'EST/EDT', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '加拿大' },
      { id: 'America/Vancouver', name: 'PST/PDT', offset: -480, offsetString: 'UTC-8:00', region: 'America', country: '加拿大' },
      { id: 'America/Montreal', name: 'EST/EDT', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '加拿大' },
      { id: 'America/Mexico_City', name: 'CST/CDT', offset: -360, offsetString: 'UTC-6:00', region: 'America', country: '墨西哥' },
      { id: 'America/Guatemala', name: 'CST', offset: -360, offsetString: 'UTC-6:00', region: 'America', country: '危地马拉' },
      { id: 'America/Costa_Rica', name: 'CST', offset: -360, offsetString: 'UTC-6:00', region: 'America', country: '哥斯达黎加' },
      { id: 'America/Panama', name: 'EST', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '巴拿马' },

      // 南美洲时区
      { id: 'America/Sao_Paulo', name: 'BRT/BRST', offset: -180, offsetString: 'UTC-3:00', region: 'America', country: '巴西' },
      { id: 'America/Buenos_Aires', name: 'ART', offset: -180, offsetString: 'UTC-3:00', region: 'America', country: '阿根廷' },
      { id: 'America/Santiago', name: 'CLT/CLST', offset: -240, offsetString: 'UTC-4:00', region: 'America', country: '智利' },
      { id: 'America/Lima', name: 'PET', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '秘鲁' },
      { id: 'America/Bogota', name: 'COT', offset: -300, offsetString: 'UTC-5:00', region: 'America', country: '哥伦比亚' },
      { id: 'America/Caracas', name: 'VET', offset: -240, offsetString: 'UTC-4:00', region: 'America', country: '委内瑞拉' },
      { id: 'America/La_Paz', name: 'BOT', offset: -240, offsetString: 'UTC-4:00', region: 'America', country: '玻利维亚' },
      { id: 'America/Montevideo', name: 'UYT', offset: -180, offsetString: 'UTC-3:00', region: 'America', country: '乌拉圭' },
      { id: 'America/Asuncion', name: 'PYT/PYST', offset: -240, offsetString: 'UTC-4:00', region: 'America', country: '巴拉圭' },
      { id: 'America/Guyana', name: 'GYT', offset: -240, offsetString: 'UTC-4:00', region: 'America', country: '圭亚那' },

      // 大洋洲时区
      { id: 'Australia/Sydney', name: 'AEDT/AEST', offset: 660, offsetString: 'UTC+11:00', region: 'Australia', country: '澳大利亚' },
      { id: 'Australia/Melbourne', name: 'AEDT/AEST', offset: 660, offsetString: 'UTC+11:00', region: 'Australia', country: '澳大利亚' },
      { id: 'Australia/Brisbane', name: 'AEST', offset: 600, offsetString: 'UTC+10:00', region: 'Australia', country: '澳大利亚' },
      { id: 'Australia/Perth', name: 'AWST', offset: 480, offsetString: 'UTC+8:00', region: 'Australia', country: '澳大利亚' },
      { id: 'Australia/Adelaide', name: 'ACDT/ACST', offset: 630, offsetString: 'UTC+10:30', region: 'Australia', country: '澳大利亚' },
      { id: 'Australia/Darwin', name: 'ACST', offset: 570, offsetString: 'UTC+9:30', region: 'Australia', country: '澳大利亚' },
      { id: 'Pacific/Auckland', name: 'NZDT/NZST', offset: 720, offsetString: 'UTC+12:00', region: 'Pacific', country: '新西兰' },
      { id: 'Pacific/Fiji', name: 'FJT', offset: 720, offsetString: 'UTC+12:00', region: 'Pacific', country: '斐济' },

      // 非洲时区
      { id: 'Africa/Cairo', name: 'EET/EEST', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '埃及' },
      { id: 'Africa/Lagos', name: 'WAT/WAST', offset: 60, offsetString: 'UTC+1:00', region: 'Africa', country: '尼日利亚' },
      { id: 'Africa/Johannesburg', name: 'SAST', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '南非' },
      { id: 'Africa/Nairobi', name: 'EAT', offset: 180, offsetString: 'UTC+3:00', region: 'Africa', country: '肯尼亚' },
      { id: 'Africa/Casablanca', name: 'WET/WEST', offset: 0, offsetString: 'UTC+0:00', region: 'Africa', country: '摩洛哥' },
      { id: 'Africa/Algiers', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Africa', country: '阿尔及利亚' },
      { id: 'Africa/Tunis', name: 'CET/CEST', offset: 60, offsetString: 'UTC+1:00', region: 'Africa', country: '突尼斯' },
      { id: 'Africa/Tripoli', name: 'EET', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '利比亚' },
      { id: 'Africa/Khartoum', name: 'CAT', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '苏丹' },
      { id: 'Africa/Addis_Ababa', name: 'EAT', offset: 180, offsetString: 'UTC+3:00', region: 'Africa', country: '埃塞俄比亚' },
      { id: 'Africa/Dar_es_Salaam', name: 'EAT', offset: 180, offsetString: 'UTC+3:00', region: 'Africa', country: '坦桑尼亚' },
      { id: 'Africa/Harare', name: 'CAT', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '津巴布韦' },
      { id: 'Africa/Lusaka', name: 'CAT', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '赞比亚' },
      { id: 'Africa/Maputo', name: 'CAT', offset: 120, offsetString: 'UTC+2:00', region: 'Africa', country: '莫桑比克' },
      { id: 'Africa/Accra', name: 'GMT', offset: 0, offsetString: 'UTC+0:00', region: 'Africa', country: '加纳' },
      { id: 'Africa/Dakar', name: 'GMT', offset: 0, offsetString: 'UTC+0:00', region: 'Africa', country: '塞内加尔' },

      // 其他重要时区
      { id: 'UTC', name: 'UTC', offset: 0, offsetString: 'UTC+0:00', region: 'Global', country: '协调世界时' },
    ];
  }

  /**
   * 根据地区推荐时区
   */
  public getTimeZonesByRegion(region: string): TimeZoneInfo[] {
    return this.getSupportedTimeZones().filter(tz =>
      tz.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * 转换时间到用户时区
   */
  public convertToUserTimeZone(date: Date | string, sourceTimeZone: string = 'UTC'): DateTimeWithZone {
    const targetDate = typeof date === 'string' ? new Date(date) : date;

    // 获取用户时区的本地时间
    const localTime = targetDate.toLocaleString('zh-CN', {
      timeZone: this.userTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 获取UTC时间
    const utcTime = targetDate.toLocaleString('zh-CN', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      date: targetDate,
      timeZone: this.userTimeZone,
      localTime,
      utcTime,
      offsetString: this.userTimeZoneInfo?.offsetString || 'UTC+0:00'
    };
  }

  /**
   * 将时间从用户时区转换为UTC
   */
  public convertFromUserTimeZone(localDateTime: string): Date {
    // 创建一个假设是本地时间的日期对象
    const date = new Date(localDateTime);

    // 转换为UTC时间
    return new Date(date.getTime() - (this.userTimeZoneInfo?.offset || 0) * 60000);
  }

  /**
   * 格式化时间显示（包含时区信息）
   */
  public formatDateTimeWithZone(date: Date | string, options: {
    showUTC?: boolean;
    showOffset?: boolean;
    format?: 'short' | 'long' | 'time-only' | 'date-only';
  } = {}): string {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const { showUTC = false, showOffset = true, format = 'short' } = options;

    let result = '';

    switch (format) {
      case 'time-only':
        result = targetDate.toLocaleTimeString('zh-CN', {
          timeZone: this.userTimeZone,
          hour: '2-digit',
          minute: '2-digit'
        });
        break;
      case 'date-only':
        result = targetDate.toLocaleDateString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        break;
      case 'long':
        result = targetDate.toLocaleString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long'
        });
        break;
      default: // short
        result = targetDate.toLocaleString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        break;
    }

    // 添加时区信息
    if (showOffset) {
      result += ` ${this.userTimeZoneInfo?.offsetString || 'UTC+0:00'}`;
    }

    if (showUTC) {
      const utcTime = targetDate.toLocaleString('zh-CN', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      result += ` (${utcTime} UTC)`;
    }

    return result;
  }

  /**
   * 简化时间显示（只显示日期和时间，隐藏时区信息）
   */
  public formatDateTimeSimple(date: Date | string, options: {
    format?: 'short' | 'long' | 'time-only' | 'date-only';
  } = {}): string {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const { format = 'short' } = options;

    switch (format) {
      case 'time-only':
        return targetDate.toLocaleTimeString('zh-CN', {
          timeZone: this.userTimeZone,
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'date-only':
        return targetDate.toLocaleDateString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'long':
        return targetDate.toLocaleString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long'
        });
      default: // short
        return targetDate.toLocaleString('zh-CN', {
          timeZone: this.userTimeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  }

  /**
   * 获取当前时区的小时数（0-23）
   */
  public getCurrentHourInTimeZone(): number {
    return new Date().getHours();
  }

  /**
   * 判断是否为工作时间（9:00-18:00）
   */
  public isWorkingHours(date: Date | string = new Date()): boolean {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const hour = targetDate.getHours();
    return hour >= 9 && hour < 18;
  }

  /**
   * 保存用户时区偏好
   */
  public saveUserTimeZonePreference(timeZoneId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-timezone', timeZoneId);
      this.userTimeZone = timeZoneId;
      this.userTimeZoneInfo = this.parseTimeZoneInfo(timeZoneId);
    }
  }

  /**
   * 加载用户时区偏好
   */
  public loadUserTimeZonePreference(): void {
    if (typeof window !== 'undefined') {
      const savedTimeZone = localStorage.getItem('user-timezone');
      if (savedTimeZone) {
        this.userTimeZone = savedTimeZone;
        this.userTimeZoneInfo = this.parseTimeZoneInfo(savedTimeZone);
      }
    }
  }

  /**
   * 检测用户地理位置并推荐时区
   */
  public async detectLocationAndRecommendTimeZone(): Promise<TimeZoneInfo | null> {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // 这里可以使用反向地理编码API，但为了简单起见，我们基于时区偏移来推断
              const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              const timeZoneInfo = this.parseTimeZoneInfo(timeZone);
              resolve(timeZoneInfo);
            } catch (error) {
              console.error('Error detecting location:', error);
              resolve(null);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            resolve(null);
          }
        );
      });
    }
    return null;
  }
}

// 导出单例实例
export const timeZoneService = TimeZoneService.getInstance();