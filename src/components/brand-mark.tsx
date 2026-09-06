import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10", className)}
      role="img"
      aria-label="Skymeredian Foundation"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#082b26" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="sm-glow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#sm-bg)" />
      {/* Horizon & Meridian Swoosh */}
      <path
        d="M10 32.5C16.5 25.5 24 20 36 17.5C31.5 23.5 25 28 15 31.5C13.2 32.1 11.5 32.4 10 32.5Z"
        fill="#f8f7f1"
      />
      <path
        d="M13 36C20 33 27 27 34 18.5"
        stroke="url(#sm-glow)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Zenith Sun / Star */}
      <circle cx="35" cy="14" r="3.2" fill="#f59e0b" />
      <path
        d="M17 37C23.5 36.5 30 33.5 37 28.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.5"
      />
    </svg>
  );
}
