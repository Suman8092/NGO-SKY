import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("block shrink-0 rounded-md bg-white p-1", className ?? "w-56")}>
      <Image
        src="/brand/foundation-logo-horizontal.png"
        alt="Skymeredian Foundation"
        width={2172}
        height={724}
        priority={priority}
        sizes="(max-width: 640px) 200px, 280px"
        className="block h-auto w-full object-contain"
      />
    </span>
  );
}
