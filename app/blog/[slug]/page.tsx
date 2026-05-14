import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getRelatedPosts, posts } from "../posts"
import { AiMindMapGenerator } from "./articles/ai-mind-map-generator"
import { MindMapForStudents } from "./articles/mind-map-for-students"
import { MindMapForProjectManagement } from "./articles/mind-map-for-project-management"
import { BenefitsOfMindMapping } from "./articles/benefits-of-mind-mapping"
import { MindMapExamples } from "./articles/mind-map-examples"
import { AiBrainstormingTools2026 } from "./articles/ai-brainstorming-tools-2026"
import { MindMapForBeginners } from "./articles/mind-map-for-beginners"
import { AiTextToMindMap } from "./articles/ai-text-to-mind-map"
import { MindMapStudyTechniques } from "./articles/mind-map-study-techniques"
import { FreeMindMapApps } from "./articles/free-mind-map-apps"
import { MindMapForEssayWriting } from "./articles/mind-map-for-essay-writing"

const articleComponents: Record<string, React.ComponentType> = {
  "ai-mind-map-generator": AiMindMapGenerator,
  "mind-map-for-students": MindMapForStudents,
  "mind-map-for-project-management": MindMapForProjectManagement,
  "benefits-of-mind-mapping": BenefitsOfMindMapping,
  "mind-map-examples": MindMapExamples,
  "ai-brainstorming-tools-2026": AiBrainstormingTools2026,
  "mind-map-for-beginners": MindMapForBeginners,
  "ai-text-to-mind-map": AiTextToMindMap,
  "mind-map-study-techniques": MindMapStudyTechniques,
  "free-mind-map-apps": FreeMindMapApps,
  "mind-map-for-essay-writing": MindMapForEssayWriting,
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} | GoTaskMind Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://www.gotaskmind.com/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const ArticleComponent = articleComponents[slug]
  const related = getRelatedPosts(slug, 3)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "GoTaskMind",
      url: "https://www.gotaskmind.com",
    },
    publisher: {
      "@type": "Organization",
      name: "GoTaskMind",
      url: "https://www.gotaskmind.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.gotaskmind.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
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
              <a href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10">
          <a
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← Back to blog
          </a>

          <article className="mb-12">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {post.title}
              </h1>
            </header>

            <div className="prose prose-gray max-w-none">
              {ArticleComponent && <ArticleComponent />}
            </div>
          </article>

          <div className="border rounded-xl p-6 text-center bg-white mb-12">
            <h3 className="font-semibold text-lg mb-2">Try GoTaskMind for Free</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Generate beautiful AI mind maps in seconds. No signup required.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Create Your Mind Map →
            </a>
          </div>

          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group block rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {r.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
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
