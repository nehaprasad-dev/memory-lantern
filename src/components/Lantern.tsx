interface LanternProps {
  className?: string;
  /** Show the soft halo behind the flame. */
  halo?: boolean;
}

/** A small candle-lantern mark with a gently flickering flame. */
export function Lantern({ className = "h-16 w-16", halo = true }: LanternProps) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      {halo && (
        <span className="absolute inset-[-40%] animate-glow rounded-full bg-[radial-gradient(circle,rgb(232_162_79/0.35),transparent_65%)]" />
      )}
      <svg viewBox="0 0 64 64" className="relative h-full w-full" fill="none">
        <path d="M24 10h16M32 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold" />
        <path
          d="M22 14h20l-2 6H24l-2-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="text-gold"
        />
        <rect x="21" y="20" width="22" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-gold" />
        <path d="M32 20v30" stroke="currentColor" strokeWidth="0.75" className="text-gold/40" />
        <path d="M20 54h24l-2-4H22l-2 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-gold" />
        <g className="origin-[32px_42px] animate-flicker">
          <path d="M32 29c3 4 4.5 6.5 4.5 9.2a4.5 4.5 0 0 1-9 0c0-2.7 1.5-5.2 4.5-9.2Z" fill="url(#flame)" />
          <path d="M32 35c1.3 1.8 2 3 2 4.1a2 2 0 0 1-4 0c0-1.1.7-2.3 2-4.1Z" fill="#fff6e0" opacity="0.9" />
        </g>
        <path d="M32 42.5v3" stroke="#4a3f33" strokeWidth="1.25" strokeLinecap="round" />
        <defs>
          <linearGradient id="flame" x1="32" y1="29" x2="32" y2="43" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffd98a" />
            <stop offset="0.6" stopColor="#e8a24f" />
            <stop offset="1" stopColor="#c46a2c" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
