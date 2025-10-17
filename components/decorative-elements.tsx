export function DecorativeElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Stars */}
      <svg className="absolute top-[20%] left-[8%] w-8 h-8 text-amber-400/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
      </svg>

      <svg
        className="absolute bottom-[30%] right-[12%] w-6 h-6 text-amber-400/15"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
      </svg>

      {/* Plus signs */}
      <svg
        className="absolute top-[45%] left-[15%] w-6 h-6 text-orange-400/20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>

      <svg
        className="absolute top-[60%] right-[20%] w-5 h-5 text-orange-400/15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>

      {/* Checkmarks */}
      <svg
        className="absolute top-[35%] right-[8%] w-7 h-7 text-teal-400/20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>

      <svg
        className="absolute bottom-[40%] left-[18%] w-6 h-6 text-teal-400/15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>

      {/* Dots */}
      <div className="absolute top-[25%] right-[25%] w-2 h-2 rounded-full bg-purple-400/20" />
      <div className="absolute bottom-[35%] left-[25%] w-2 h-2 rounded-full bg-blue-400/20" />
      <div className="absolute top-[70%] left-[12%] w-1.5 h-1.5 rounded-full bg-pink-400/15" />
      <div className="absolute top-[15%] right-[18%] w-1.5 h-1.5 rounded-full bg-green-400/15" />
    </div>
  )
}
