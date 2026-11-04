import Image from "next/image";
import { cn } from "@/lib/utils";

/** Displays the complete supplied artwork, excluding only its empty outer margin. */
export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block aspect-[58/55] shrink-0 overflow-hidden rounded-md bg-white",
        className ?? "w-44",
      )}
    >
      <Image
        src="/brand/foundation-logo.png"
        alt="Skymeredian Foundation — Section 8 | Non-Profit"
        width={1024}
        height={1024}
        priority={priority}
        sizes="(max-width: 640px) 190px, 240px"
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: "176.551724%",
          height: "auto",
          left: "-37.931034%",
          top: "-34.545455%",
        }}
      />
    </span>
  );
}
