import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化相对时间
 */
export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return options?.addSuffix ? '刚刚' : '0分钟';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return options?.addSuffix ? `${diffInMinutes}分钟前` : `${diffInMinutes}分钟`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return options?.addSuffix ? `${diffInHours}小时前` : `${diffInHours}小时`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return options?.addSuffix ? `${diffInDays}天前` : `${diffInDays}天`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return options?.addSuffix ? `${diffInMonths}个月前` : `${diffInMonths}个月`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return options?.addSuffix ? `${diffInYears}年前` : `${diffInYears}年`;
}
