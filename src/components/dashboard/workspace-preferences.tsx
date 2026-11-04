"use client";

import { useClerk } from "@clerk/nextjs";
import { Laptop, Moon, RefreshCw, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function WorkspacePreferences() {
  const { theme, setTheme } = useTheme();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <section
      aria-labelledby="preferences-title"
      className="border-t border-ink/15 py-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 id="preferences-title" className="text-xl font-semibold">
            Workspace preferences
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Manage your account and the appearance of this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startTransition(() => router.refresh())}
          disabled={refreshing}
          className="button-secondary min-h-10 px-4 text-xs disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {refreshing ? "Refreshing…" : "Refresh status"}
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Appearance</p>
          <div
            role="group"
            aria-label="Color theme"
            className="mt-3 flex flex-wrap gap-2"
          >
            {themeOptions.map(({ value, label, icon: ThemeIcon }) => {
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/15 px-4 text-xs font-medium transition hover:border-forest aria-pressed:border-forest aria-pressed:bg-forest/10 aria-pressed:text-forest"
                >
                  <ThemeIcon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="button-secondary min-h-10 px-4 text-xs"
        >
          <UserRound className="size-4" aria-hidden="true" />
          Manage account & security
        </button>
      </div>
    </section>
  );
}
