"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Download, Loader2, RotateCcw, Share2, ChevronDown, MousePointerClick, Brain, FileDown, Image as ImageIcon, Upload } from "lucide-react"

const exampleTopics = [
  "Marketing strategy for a SaaS startup",
  "Learn Python from scratch",
  "Plan a product launch",
  "Project management best practices",
  "Healthy lifestyle habits",
  "Web development roadmap 2026",
]

const faqItems = [
  {
    q: "What is GoTaskMind?",
    a: "GoTaskMind is a free AI-powered mind map generator. Simply enter any topic and instantly get a beautiful, downloadable mind map.",
  },
  {
    q: "Is it really free?",
    a: "Yes, completely free! No sign-up required, no hidden fees, no usage limits.",
  },
  {
    q: "Can I download the mind map?",
    a: "Yes! You can export your mind map as PNG (high-resolution) or SVG (vector) with one click.",
  },
  {
    q: "What AI model do you use?",
    a: "GoTaskMind is powered by advanced AI language models that understand your topic and generate structured, meaningful mind maps.",
  },
  {
    q: "Is my data stored?",
    a: "No. We don't store your topics or generated maps. Everything runs in real-time and nothing is saved on our servers.",
  },
]

export default function HomePage() {
  const [topic, setTopic] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [selectedMode, setSelectedMode] = useState<'text' | 'image'>('text')
  const [imageUrl, setImageUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [toast, setToast] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }, [])

  const generate = useCallback(async () => {
    if (isGenerating || isAnalyzing) return

    // Image mode
    if (selectedMode === 'image') {
      if (!imageUrl.trim()) return
      setIsAnalyzing(true)
      setError('')
      setMarkdown('')
      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: imageUrl.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Analysis failed')
        setMarkdown(data.markdown)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setIsAnalyzing(false)
      }
      return
    }

    // Text mode
    if (!topic.trim()) return
    setIsGenerating(true)
    setError('')
    setMarkdown('')

    try {
      const res = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setMarkdown(data.markdown)
      setHistory(prev => [topic.trim(), ...prev.filter(t => t !== topic.trim())].slice(0, 10))
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }, [topic, isGenerating, isAnalyzing, selectedMode, imageUrl])

  // Render mind map using markmap
  useEffect(() => {
    if (!markdown || !containerRef.current) return

    let cancelled = false

    const renderMap = async () => {
      try {
        const { Markmap } = await import('markmap-view')
        const { Transformer } = await import('markmap-lib')

        if (cancelled) return

        const transformer = new Transformer()
        const { root } = transformer.transform(markdown)

        // Clear previous
        if (svgRef.current) {
          svgRef.current.innerHTML = ''
        }

        if (svgRef.current) {
          const mm = Markmap.create(svgRef.current, {
            autoFit: true,
            color: (node: any) => {
              const depth = node.state?.depth ?? 0
              // Distinct colors per level
              const colors = [
                '#4f46e5', // root - deep indigo
                '#7c3aed', // level 1 - violet
                '#0ea5e9', // level 2 - sky blue
                '#10b981', // level 3 - emerald
                '#f59e0b', // level 4 - amber
                '#ef4444', // level 5 - red
                '#ec4899', // level 6 - pink
                '#14b8a6', // level 7 - teal
              ]
              return colors[depth % colors.length] || '#6366f1'
            },
            duration: 300,
            paddingX: 24,
            zoom: true,
            pan: true,
            nodeMinHeight: 20,
          }, root)

          setTimeout(() => mm.fit(), 100)
        }
      } catch (e) {
        console.error('Markmap render error:', e)
      }
    }

    renderMap()
    return () => { cancelled = true }
  }, [markdown])

  const exportSVG = useCallback(() => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindmap-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const exportPNG = useCallback(() => {
    if (!svgRef.current) return
    const svg = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const scale = 2
    canvas.width = (svg.clientWidth || 800) * scale
    canvas.height = (svg.clientHeight || 600) * scale
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `mindmap-${Date.now()}.png`
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }, [])

  const shareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast("Link copied!")
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      showToast("Link copied!")
    }
  }, [showToast])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">🧠 GoTaskMind</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">AI Mind Map Generator</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors hidden sm:inline">How it works</a>
            <a href="#faq" className="hover:text-foreground transition-colors hidden sm:inline">FAQ</a>
            <a href="/blog" className="hover:text-foreground transition-colors hidden sm:inline">Blog</a>
            <span>Free · No Sign-up</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            AI Mind Map Generator
          </h1>
          <p className="text-center text-muted-foreground mb-6 text-sm">
            Describe any topic and get an instant mind map. Free, no account needed.
          </p>

          {/* Mode switcher */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSelectedMode('text')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedMode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-white hover:bg-muted'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Text
            </button>
            <button
              onClick={() => setSelectedMode('image')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedMode === 'image' ? 'bg-primary text-primary-foreground' : 'bg-white hover:bg-muted'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              From Photo
            </button>
          </div>

          {selectedMode === 'image' ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="w-full h-20 pl-10 pr-4 py-3 text-base border rounded-lg bg-white resize-none"
                />
              </div>
              <Button
                onClick={generate}
                disabled={isAnalyzing || !imageUrl.trim()}
                className="h-14 sm:h-20 sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6"
                size="lg"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">Analyze</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a topic... e.g. &quot;Marketing strategy for SaaS startup&quot;"
                className="resize-none h-20 sm:h-20 text-base"
                maxLength={2000}
              />
              <Button
                onClick={generate}
                disabled={isGenerating || !topic.trim()}
                className="h-14 sm:h-20 sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6"
                size="lg"
                title="Generate mind map"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">Generate</span>
              </Button>
            </div>
          )}

          {/* Example topics */}
          <div className="mt-3">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
              Try an example
            </button>
            {showExamples && (
              <div className="flex flex-wrap gap-2 mt-2">
                {exampleTopics.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setTopic(ex); setShowExamples(false) }}
                    className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {history.slice(0, 5).map((h) => (
                <button
                  key={h}
                  onClick={() => setTopic(h)}
                  className="text-xs text-muted-foreground hover:text-foreground bg-muted/50 rounded px-2 py-1 truncate max-w-[150px]"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Mind Map Display */}
        {markdown && (
          <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b bg-muted/30 overflow-x-auto">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Mind Map
              </span>
              <div className="flex gap-1 sm:gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={exportPNG} className="text-xs sm:text-sm">
                  <Download className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">PNG</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={exportSVG} className="text-xs sm:text-sm">
                  <Download className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">SVG</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={shareLink} className="text-xs sm:text-sm">
                  <Share2 className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setMarkdown(""); setTopic("") }} className="text-xs sm:text-sm">
                  <RotateCcw className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </div>
            </div>

            {/* SVG Container - responsive height */}
            <div ref={containerRef} className="w-full" style={{ height: '70vh', minHeight: '400px' }}>
              <style>{`
                @media (min-width: 640px) {
                  .mindmap-container { min-height: 500px !important; }
                }
              `}</style>
              <svg ref={svgRef} className="w-full h-full" style={{ textAlign: 'left' }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!markdown && !isGenerating && (
          <div className="text-center py-16 sm:py-20 text-muted-foreground">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-lg font-medium">Enter a topic above</p>
            <p className="text-sm mt-1">AI will generate a mind map instantly</p>
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Generating mind map...</p>
          </div>
        )}

        {/* How it Works */}
        {!markdown && !isGenerating && (
          <section id="how-it-works" className="max-w-3xl mx-auto mt-12 sm:mt-16 mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-white border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <MousePointerClick className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold mb-1">1. Enter topic</div>
                <p className="text-xs text-muted-foreground">Type any topic or idea you want to explore</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold mb-1">2. AI generates</div>
                <p className="text-xs text-muted-foreground">Our AI creates a structured mind map instantly</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <FileDown className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold mb-1">3. Download & share</div>
                <p className="text-xs text-muted-foreground">Export as PNG or SVG, or share with a link</p>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {!markdown && !isGenerating && (
          <section id="faq" className="max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div key={i} className="border rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
                  >
                    {item.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 ml-2 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 text-sm text-muted-foreground">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-auto py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">🧠 GoTaskMind</span>
              <span className="text-xs text-muted-foreground">Free AI Mind Map Generator</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
              <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} GoTaskMind. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
