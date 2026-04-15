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
  title: 'GoTaskMind - AI Project Planning & Task Management',
  description: 'Transform project ideas into actionable task plans with AI. Break down complex projects, get smart scheduling, and boost productivity. Free to start.',
  generator: 'v0.app',
  keywords: ['AI project planning', 'task management tool', 'AI task generator', 'project planning software', 'smart task breakdown', 'productivity tools'],
  openGraph: {
    title: 'GoTaskMind - AI-Powered Project Management Platform',
    description: 'Transform your ideas into actionable plans with AI-powered project management. Perfect for teams and professionals.',
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
    <html className="" lang="en" suppressHydrationWarning>
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-8LLRSPYZGL" />
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8LLRSPYZGL');
        `
      }} />
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <AuthProvider>
            <NetworkErrorHandler>
              {/* <NotificationBanner /> */}
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
