"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), consent: true }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Subscription failed");
      setStatus("success");
      setMessage("You’re in. One useful field note, once a month.");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="relative flex items-center rounded-full border border-white/20 bg-white/[0.08] p-1.5 backdrop-blur-xl transition focus-within:border-[#f3bd67] focus-within:ring-2 focus-within:ring-[#f3bd67]/20">
        <label htmlFor={compact ? "footer-email" : "newsletter-email"} className="sr-only">Email address</label>
        <input
          id={compact ? "footer-email" : "newsletter-email"}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Enter your email address…"
          className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/45 outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffd385] to-[#f3bd67] px-6 text-sm font-extrabold text-[#091f1a] shadow-md transition hover:scale-[1.02] disabled:opacity-60"
          aria-label="Subscribe to field notes"
        >
          {status === "loading" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : compact ? (
            <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
          ) : (
            "Join updates"
          )}
        </button>
      </form>
      <p className="mt-2 min-h-5 text-xs opacity-70" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
