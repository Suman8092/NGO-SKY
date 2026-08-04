"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={submit} className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
        <label htmlFor={compact ? "footer-email" : "newsletter-email"} className="sr-only">Email address</label>
        <input
          id={compact ? "footer-email" : "newsletter-email"}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-current/20 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-current/40 focus:border-ember"
        />
        <button type="submit" disabled={status === "loading"} className="grid min-h-12 min-w-12 place-items-center rounded-full bg-ember px-5 font-bold text-[#1c211d] transition hover:brightness-105 disabled:opacity-60" aria-label="Subscribe to field notes">
          {status === "loading" ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : compact ? <ArrowRight className="size-5" aria-hidden="true" /> : "Get field notes"}
        </button>
      </form>
      <p className="mt-2 min-h-5 text-xs opacity-70" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
