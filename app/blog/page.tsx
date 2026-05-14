import Link from "next/link"
import type { Metadata } from "next"
import { posts } from "./posts"

export const metadata: Metadata = {
  title: "Blog - GoTaskMind | AI Mind Mapping Tips, Guides & Best Practices",
  description:
    "Explore guides, tips, and best practices for AI mind mapping. Learn how to boost productivity, study smarter, and brainstorm faster with GoTaskMind.",
  keywords: [
    "mind map blog",
    "ai mind map tips",
    "mind mapping guide",
    "brainstorming tips",
    "productivity blog",
  ],
  openGraph: {
    title: "Blog - GoTaskMind | AI Mind Mapping Tips & Guides",
    description:
      "Explore guides, tips, and best practices for AI mind mapping with GoTaskMind.",
    type: "website",
    url: "https://www.gotaskmind.com/blog",
  },
}

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "GoTaskMind Blog",
    description:
      "Guides, tips, and best practices for AI mind mapping, brainstorming, and visual thinking.",
    url: "https://www.gotaskmind.com/blog",
    publisher: {
      "@type": "Organization",
      name: "GoTaskMind",
      url: "https://www.gotaskmind.com",
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://www.gotaskmind.com/blog/${post.slug}`,
      publisher: {
        "@type": "Organization",
        name: "GoTaskMind",
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2">
                <span className="text-lg font-bold">🧠 GoTaskMind</span>
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              <span className="font-medium text-foreground">Blog</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">GoTaskMind Blog</h1>
            <p className="text-muted-foreground text-lg">
              Tips, guides, and insights on AI mind mapping, brainstorming, and
              visual thinking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border bg-white p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-semibold text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.description}
                </p>
                <span className="text-sm font-medium text-blue-600 group-hover:underline">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        </main>

        <footer className="border-t mt-auto py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">🧠 GoTaskMind</span>
                <span className="text-xs text-muted-foreground">
                  Free AI Mind Map Generator
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </a>
                <a href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </a>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              © {new Date().getFullYear()} GoTaskMind. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
