export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.25 260)" />
            <stop offset="100%" stopColor="oklch(0.55 0.25 280)" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect x="5" y="5" width="90" height="90" rx="20" fill="url(#logoGradient)" />

        {/* GT Letters */}
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fill="white"
          fontSize="42"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-2"
        >
          GT
        </text>
      </svg>
    </div>
  )
}
