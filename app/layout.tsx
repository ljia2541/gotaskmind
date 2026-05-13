import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: 'GoTaskMind - Free AI Mind Map Generator | Instant Visual Brainstorming',
  description: 'Generate beautiful mind maps instantly with AI. Enter any topic and get a structured visual mind map in seconds. Free, no signup required. Export as PNG or SVG.',
  keywords: [
    // Core mind map
    'AI mind map generator', 'mind map maker', 'mind map generator',
    'AI mind map', 'online mind map', 'free mind map generator',
    'mind map creator', 'mind map tool', 'mind mapping tool',
    // AI-specific
    'AI mind map maker', 'AI mind mapping', 'AI brainstorming tool',
    'text to mind map', 'AI concept map generator', 'AI visual thinking',
    // Use cases
    'brainstorming tool', 'idea organizer', 'visual brainstorming',
    'study mind map', 'project planning mind map', 'concept map maker',
    'flowchart generator', 'diagram generator',
    // High intent
    'free mind map online', 'best free mind map tool',
    'mind map generator no signup', 'AI mind map free',
    'instant mind map', 'mind map from text',
    // Long tail
    'how to create a mind map online', 'AI powered mind map',
    'free online brainstorming tool', 'mind map for students free',
    'project planning mind map tool', 'visual thinking tool',
    // Brand
    'GoTaskMind', 'gotaskmind',
  ],
  metadataBase: new URL('https://www.gotaskmind.com'),
  openGraph: {
    title: 'GoTaskMind - Free AI Mind Map Generator',
    description: 'Turn any topic into a beautiful mind map instantly. Free AI-powered mind mapping. No signup needed.',
    type: 'website',
    siteName: 'GoTaskMind',
    url: 'https://www.gotaskmind.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoTaskMind - Free AI Mind Map Generator',
    description: 'AI-powered mind mapping. Enter a topic, get a beautiful mind map instantly. Free.',
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
              description: 'Free AI mind map generator. Enter any topic and instantly generate a structured visual mind map. No signup required. Export as PNG or SVG.',
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
                    text: 'Yes! GoTaskMind is completely free. Generate unlimited mind maps without signing up or paying anything.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does AI mind map generation work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Simply enter any topic or idea. Our AI analyzes it and generates a structured mind map with logical branches and sub-topics in seconds.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I export the mind map?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! Export your mind map as PNG or SVG for free. No watermarks.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do I need an account?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No account needed. Just enter a topic and generate your mind map instantly.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is the best free AI mind map generator?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'GoTaskMind is a free AI mind map generator that creates beautiful, structured mind maps from any topic instantly. No signup, no watermark, export for free.',
                  },
                },
              ],
            },
          ],
        })
      }} />
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <div className="min-h-screen">
            {children}
          </div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
