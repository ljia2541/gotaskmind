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
  title: 'GoTaskMind - Free AI Project Planner & Task Management Tool',
  description: 'Free AI task generator. Describe your project in plain English and get instant structured task breakdowns with priorities, dependencies, and time estimates. No signup required.',
  generator: 'v0.app',
  keywords: [
    // Core AI task generation
    'AI project planning', 'AI task generator', 'AI task planner', 'AI task breakdown',
    'AI project management', 'automated task creation', 'AI task list generator',
    // Developer-focused
    'AI sprint planning tool', 'software project planning AI', 'story points generator AI',
    'developer productivity tools', 'AI backlog management', 'scrum planning AI',
    'break down project into tasks AI', 'AI work breakdown structure',
    // Content creator
    'content calendar AI planner', 'editorial calendar AI', 'content planning AI',
    'video production planning AI', 'social media content planner AI',
    // Academic/research
    'academic project planner AI', 'thesis planning tool AI', 'research project management AI',
    // General productivity
    'task management tool', 'project planning software', 'smart task breakdown',
    'productivity tools', 'AI productivity assistant', 'work planning AI tool',
    'project management AI assistant', 'task management AI free',
    'AI project timeline generator', 'AI kanban board',
    // High intent
    'free AI task generator', 'best free project planning tool',
    'how to break down a project into tasks', 'AI project planning tools 2026',
    'no signup project planner AI', 'instant task breakdown from description',
    // Long tail
    'describe project get task list', 'natural language task planning',
    'AI powered task management free', 'project planning for developers free',
  ],
  metadataBase: new URL('https://gotaskmind.com'),
  openGraph: {
    title: 'GoTaskMind - Free AI Project Planner & Task Management',
    description: 'Transform ideas into actionable plans with AI. Describe your project and get structured task breakdowns instantly. Free to start, no signup required.',
    type: 'website',
    siteName: 'GoTaskMind',
    url: 'https://gotaskmind.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoTaskMind - Free AI Project Planner',
    description: 'AI-powered project planning. Describe your idea, get structured tasks instantly. Free.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
      <link rel="canonical" href="https://gotaskmind.com" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              '@id': 'https://gotaskmind.com/#webapp',
              name: 'GoTaskMind',
              description: 'Free AI project planner that transforms ideas into actionable task plans with structured breakdowns, priorities, and time estimates.',
              url: 'https://gotaskmind.com',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: '0',
                highPrice: '88',
                offerCount: '2',
              },
            },
            {
              '@type': 'Organization',
              '@id': 'https://gotaskmind.com/#organization',
              name: 'GoTaskMind',
              url: 'https://gotaskmind.com',
            },
            {
              '@type': 'FAQPage',
              '@id': 'https://gotaskmind.com/#faq',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is GoTaskMind free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! GoTaskMind offers a free plan with 3 projects, 10 tasks per project, basic AI task generation, and Kanban view. No signup required to start.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does AI project planning work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Simply describe your project in plain English. GoTaskMind\'s AI analyzes your description and generates a structured task list with priorities, dependencies, and estimated timelines.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What types of projects can I plan with GoTaskMind?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'GoTaskMind works for software development, content creation, academic research, event planning, marketing campaigns, and any project that needs structured task breakdown.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do I need to create an account to use GoTaskMind?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'You can try AI task generation without an account. For saving projects, managing tasks, and accessing advanced features, a free account is needed.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is the best AI project planning tool?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'GoTaskMind is designed specifically for AI-powered project planning, offering natural language task breakdown, priority suggestions, dependency tracking, and Kanban views — all with a generous free tier.',
                  },
                },
              ],
            },
          ],
        })
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
