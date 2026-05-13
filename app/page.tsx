"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Download, Loader2, RotateCcw, Expand, ChevronDown } from "lucide-react"
// Logo inline

const exampleTopics = [
  "Marketing strategy for a SaaS startup",
  "Learn Python from scratch",
  "Plan a product launch",
  "Project management best practices",
  "Healthy lifestyle habits",
  "Web development roadmap 2026",
]

export default function HomePage() {
  const [topic, setTopic] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const generate = useCallback(async () => {
    if (!topic.trim() || isGenerating) return
    setIsGenerating(true)
    setError("")
    setMarkdown("")

    try {
      const res = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setMarkdown(data.markdown)
      setHistory(prev => [topic.trim(), ...prev.filter(t => t !== topic.trim())].slice(0, 10))
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }, [topic, isGenerating])

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
              const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
              return colors[node.state?.depth % colors.length] || '#6366f1'
            },
            duration: 500,
            paddingX: 20,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">🧠 GoTaskMind</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">AI Mind Map Generator</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Free · No Sign-up · Powered by AI
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            AI Mind Map Generator
          </h1>
          <p className="text-center text-muted-foreground mb-6 text-sm">
            Describe any topic and get an instant mind map. Free, no account needed.
          </p>

          <div className="flex gap-2">
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a topic... e.g. &quot;Marketing strategy for SaaS startup&quot;"
              className="resize-none h-20 text-base"
              maxLength={2000}
            />
            <Button
              onClick={generate}
              disabled={isGenerating || !topic.trim()}
              className="h-20 w-20 shrink-0"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </Button>
          </div>

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
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">
                Mind Map
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={exportPNG}>
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button variant="ghost" size="sm" onClick={exportSVG}>
                  <Download className="h-4 w-4 mr-1" />
                  SVG
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setMarkdown(""); setTopic("") }}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* SVG Container */}
            <div ref={containerRef} className="w-full" style={{ height: '70vh', minHeight: '500px' }}>
              <svg ref={svgRef} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!markdown && !isGenerating && (
          <div className="text-center py-20 text-muted-foreground">
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
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>GoTaskMind — Free AI Mind Map Generator</p>
      </footer>
    </div>
  )
}
