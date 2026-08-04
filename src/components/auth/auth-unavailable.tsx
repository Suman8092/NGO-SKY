import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function AuthUnavailable({
  allowPreview,
  action,
}: {
  allowPreview: boolean;
  action: "sign-in" | "sign-up";
}) {
  const heading = allowPreview
    ? "Authentication is in demo mode."
    : action === "sign-in"
      ? "Supporter sign-in is temporarily unavailable."
      : "New account creation is temporarily unavailable.";
  const description = allowPreview
    ? "This explicit demo environment can preview the dashboard without creating an account."
    : "Secure accounts are not configured for this deployment yet. Please return to the website and try again later.";

  return (
    <div className="max-w-md rounded-3xl border border-ink/10 bg-paper p-8 shadow-soft">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl font-bold">{heading}</h1>
      <p className="mt-4 text-sm leading-7 text-ink/55">{description}</p>
      <Link href={allowPreview ? "/dashboard" : "/"} className={allowPreview ? "button-primary mt-7" : "button-secondary mt-7"}>
        {allowPreview ? "Preview dashboard" : "Return home"} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
