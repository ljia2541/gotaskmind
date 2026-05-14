export interface BlogPost {
  slug: string
  title: string
  description: string
  keywords: string[]
  date: string
  readTime: string
  content: React.ReactNode
}

export const posts: BlogPost[] = [
  {
    slug: "ai-mind-map-generator",
    title: "Best AI Mind Map Generator: Create Visual Brainstorming Maps in Seconds",
    description: "Discover how AI mind map generators like GoTaskMind can instantly transform any topic into beautiful, structured visual mind maps. Free, no signup required.",
    keywords: ["ai mind map generator", "free mind map tool", "ai brainstorming tool"],
    date: "2026-05-14",
    readTime: "6 min read",
  },
  {
    slug: "mind-map-for-students",
    title: "How Students Can Use Mind Maps to Study Smarter in 2026",
    description: "Learn how students can leverage mind maps to boost retention, organize notes, and ace exams. Includes subject-specific examples and practical tips.",
    keywords: ["mind map for students", "study mind map", "mind map for learning"],
    date: "2026-05-13",
    readTime: "7 min read",
  },
  {
    slug: "mind-map-for-project-management",
    title: "Mind Mapping for Project Management: A Complete Guide",
    description: "Master mind mapping for project management. Learn how to create WBS, plan sprints, and improve team collaboration with visual thinking tools.",
    keywords: ["mind map project management", "project planning mind map", "mind map for teams"],
    date: "2026-05-12",
    readTime: "8 min read",
  },
  {
    slug: "benefits-of-mind-mapping",
    title: "10 Proven Benefits of Mind Mapping (Backed by Research)",
    description: "Explore 10 scientifically-backed benefits of mind mapping, from improved memory to enhanced creativity. Learn why visual thinking works.",
    keywords: ["benefits of mind mapping", "why use mind maps", "mind mapping advantages"],
    date: "2026-05-11",
    readTime: "7 min read",
  },
  {
    slug: "mind-map-examples",
    title: "15 Mind Map Examples for Every Industry and Use Case",
    description: "Explore 15 practical mind map examples across business, education, technology, and personal life. Find inspiration for your next project.",
    keywords: ["mind map examples", "mind map templates", "types of mind maps"],
    date: "2026-05-10",
    readTime: "8 min read",
  },
  {
    slug: "ai-brainstorming-tools-2026",
    title: "Top 10 AI Brainstorming Tools in 2026 (Free & Paid)",
    description: "Compare the best AI brainstorming tools of 2026. Features, pricing, pros and cons of GoTaskMind, Miro, XMind, MindMeister, and more.",
    keywords: ["ai brainstorming tools", "ai ideation tools", "brainstorming software 2026"],
    date: "2026-05-09",
    readTime: "9 min read",
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function getRelatedPosts(currentSlug: string, count = 3): BlogPost[] {
  return posts.filter(p => p.slug !== currentSlug).slice(0, count)
}
