'use client'

import React from 'react'
import { useAuth } from './use-auth'

/**
 * 功能访问控制Hook
 * 基于用户订阅状态控制对不同功能的访问
 */
export function useFeatureAccess() {
  const { user, subscription, isAuthenticated, isPro } = useAuth()

  // 检查用户是否有权限访问特定功能
  const canAccessFeature = (feature: FeatureType): boolean => {
    // 未登录用户只能访问基础功能
    if (!isAuthenticated) {
      return PUBLIC_FEATURES.includes(feature)
    }

    // Pro用户可以访问所有功能
    if (isPro) {
      return true
    }

    // 免费用户只能访问允许的功能
    return FREE_USER_FEATURES.includes(feature)
  }

  // 获取功能访问状态信息
  const getFeatureAccessInfo = (feature: FeatureType): FeatureAccessInfo => {
    const canAccess = canAccessFeature(feature)
    const isPublic = PUBLIC_FEATURES.includes(feature)
    const isFreeFeature = FREE_USER_FEATURES.includes(feature)

    return {
      canAccess,
      isPublic,
      isFreeFeature,
      requiresPro: !isPublic && !isFreeFeature,
      featureName: FEATURE_NAMES[feature],
      upgradeMessage: getUpgradeMessage(feature),
      ctaText: getCTAText(feature)
    }
  }

  // 渲染功能访问限制组件
  const renderFeatureGate = ({
    feature,
    children,
    fallback
  }: FeatureGateProps) => {
    const accessInfo = getFeatureAccessInfo(feature)

    if (accessInfo.canAccess) {
      return <>{children}</>
    }

    // 如果有自定义fallback，使用它
    if (fallback) {
      return <>{fallback}</>
    }

    // 默认的升级提示组件
    return (
      <FeatureUpgradePrompt
        feature={accessInfo}
        user={user}
        subscription={subscription}
      />
    )
  }

  return {
    canAccessFeature,
    getFeatureAccessInfo,
    renderFeatureGate,
    // 便捷方法
    canAccessKanban: canAccessFeature('kanban'),
    canAccessCalendar: canAccessFeature('calendar'),
    canAccessScheduler: canAccessFeature('scheduler'),
    canAccessAnalytics: canAccessFeature('analytics'),
    canAccessAdvancedReports: canAccessFeature('advanced-reports'),
    canAccessTeamCollaboration: canAccessFeature('team-collaboration'),
    canAccessIntegrations: canAccessFeature('integrations'),
    canAccessPrioritySupport: canAccessFeature('priority-support'),
    canAccessCustomWorkflows: canAccessFeature('custom-workflows'),
    canAccessApiAccess: canAccessFeature('api-access')
  }
}

// 功能类型枚举
export type FeatureType =
  | 'task-list'           // 任务列表（免费）
  | 'kanban'             // 看板视图（付费）
  | 'calendar'           // 日历视图（付费）
  | 'scheduler'          // 智能安排（付费）
  | 'analytics'          // 数据分析（付费）
  | 'advanced-reports'   // 高级报告（付费）
  | 'team-collaboration' // 团队协作（付费）
  | 'integrations'       // 第三方集成（付费）
  | 'priority-support'   // 优先支持（付费）
  | 'custom-workflows'   // 自定义工作流（付费）
  | 'api-access'         // API访问（付费）

// 功能访问信息接口
export interface FeatureAccessInfo {
  canAccess: boolean
  isPublic: boolean
  isFreeFeature: boolean
  requiresPro: boolean
  featureName: string
  upgradeMessage: string
  ctaText: string
}

// 功能门控组件Props
interface FeatureGateProps {
  feature: FeatureType
  children: React.ReactNode
  fallback?: React.ReactNode
}

// 升级提示组件Props
interface FeatureUpgradePromptProps {
  feature: FeatureAccessInfo
  user: any
  subscription: any
}

// 公开功能（未登录用户也可访问）
const PUBLIC_FEATURES: FeatureType[] = [
  'task-list'
]

// 免费用户功能（需要登录但免费）
const FREE_USER_FEATURES: FeatureType[] = [
  'task-list'
]

// 功能名称映射
const FEATURE_NAMES: Record<FeatureType, string> = {
  'task-list': '任务列表',
  'kanban': '看板视图',
  'calendar': '日历视图',
  'scheduler': '智能安排',
  'analytics': '数据分析',
  'advanced-reports': '高级报告',
  'team-collaboration': '团队协作',
  'integrations': '第三方集成',
  'priority-support': '优先支持',
  'custom-workflows': '自定义工作流',
  'api-access': 'API访问'
}

// 获取升级提示信息
function getUpgradeMessage(feature: FeatureType): string {
  const messages: Record<FeatureType, string> = {
    'task-list': '', // 免费功能，不需要升级提示
    'kanban': '升级到Pro版本解锁看板视图，拖拽式管理您的任务',
    'calendar': '升级到Pro版本解锁日历视图，可视化您的时间安排',
    'scheduler': '升级到Pro版本解锁智能安排，AI帮您自动规划任务时间',
    'analytics': '升级到Pro版本解锁数据分析，深入了解您的工作效率',
    'advanced-reports': '升级到Pro版本解锁高级报告功能',
    'team-collaboration': '升级到Pro版本解锁团队协作功能',
    'integrations': '升级到Pro版本解锁第三方工具集成',
    'priority-support': '升级到Pro版本解锁优先客户支持',
    'custom-workflows': '升级到Pro版本解锁自定义工作流',
    'api-access': '升级到Pro版本解锁API访问权限'
  }

  return messages[feature] || '升级到Pro版本解锁此功能'
}

// 获取CTA按钮文本
function getCTAText(feature: FeatureType): string {
  const texts: Record<FeatureType, string> = {
    'task-list': '', // 免费功能，不需要CTA
    'kanban': '升级解锁看板',
    'calendar': '升级解锁日历',
    'scheduler': '升级解锁智能安排',
    'analytics': '升级解锁分析',
    'advanced-reports': '升级解锁高级报告',
    'team-collaboration': '升级解锁团队协作',
    'integrations': '升级解锁集成',
    'priority-support': '升级解锁优先支持',
    'custom-workflows': '升级解锁自定义工作流',
    'api-access': '升级解锁API'
  }

  return texts[feature] || '升级到Pro'
}

// 功能升级提示组件
function FeatureUpgradePrompt({ feature, user, subscription }: FeatureUpgradePromptProps) {
  const handleUpgrade = () => {
    // 存储购买意图
    if (user && user.email) {
      localStorage.setItem('pending_purchase', JSON.stringify({
        planId: 'pro-monthly',
        feature: feature.featureName,
        timestamp: Date.now(),
        returnTo: window.location.pathname
      }))
    }

    // 跳转到定价页面
    window.location.href = '/pricing'
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Pro功能</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          {feature.upgradeMessage}
        </p>
      </div>

      <button
        onClick={handleUpgrade}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {feature.ctaText}
      </button>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>仅需 ¥29/月，解锁所有高级功能</p>
      </div>
    </div>
  )
}