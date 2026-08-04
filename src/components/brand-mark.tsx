import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10", className)}
      role="img"
      aria-label="Ashaaya Foundation"
    >
      <rect width="48" height="48" rx="15" fill="currentColor" className="text-forest" />
      <path d="M11.5 29.8C18 28.2 22.8 23.7 26.2 15c5 3.1 8.1 8.3 8.9 16.8-7.2-3.6-14.4-4-23.6-2Z" fill="#f8f7f1" />
      <path d="M15.8 33.4c5.3-5.1 10.3-9.1 17.4-12.1" fill="none" stroke="#f59e0b" strokeWidth="3.1" strokeLinecap="round" />
    </svg>
  );
}
