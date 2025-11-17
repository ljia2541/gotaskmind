import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "./providers/auth-provider"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { NetworkErrorHandler } from "@/app/components/network-error-handler"

export const metadata: Metadata = {
  title: 'GoTaskMind - AI-Powered Project Planning',
  description: 'Boost productivity with AI-driven intelligent planning and easy project management.',
  generator: 'v0.app',
  keywords: ['AI project management', 'task planning', 'project management tool', 'intelligent planning'],
  openGraph: {
    title: 'GoTaskMind - AI-Powered Project Planning',
    description: 'Boost productivity with AI-driven intelligent planning and easy project management.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>)
{  
  return (
    <html className="" lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <AuthProvider>
            <NetworkErrorHandler>
              <NotificationBanner />
              <div className="min-h-screen">
                {children}
              </div>
            </NetworkErrorHandler>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
