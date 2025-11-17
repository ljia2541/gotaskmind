"use client"

import { useEffect, useState } from 'react'

interface NetworkErrorHandlerProps {
  children: React.ReactNode
}

export function NetworkErrorHandler({ children }: NetworkErrorHandlerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    // 检查网络状态
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (!navigator.onLine) {
        setShowRetry(true)
      }
    }

    // 初始检查
    updateOnlineStatus()

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // 清理事件监听器
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // 定期检查服务器连接
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'HEAD',
          cache: 'no-cache'
        })
        if (response.ok) {
          setShowRetry(false)
        }
      } catch (error) {
        console.log('服务器连接检查失败:', error)
        setShowRetry(true)
      }
    }

    // 每30秒检查一次
    const interval = setInterval(checkServerConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  if (!isOnline) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">网络连接已断开</h3>
          <p className="text-muted-foreground mb-4">
            请检查您的网络连接，然后重试。
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            重试连接
          </button>
        </div>
      </div>
    )
  }

  if (showRetry) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600 dark:text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                网络连接不稳定
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                某些功能可能无法正常使用
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}