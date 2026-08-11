"use client";

import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Mail, ShieldAlert, UserRound } from "lucide-react";

export function AccountIdentity({
  role,
  clerkEnabled,
}: {
  role: "admin" | "user";
  clerkEnabled: boolean;
}) {
  if (!clerkEnabled) {
    return (
      <section
        className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.07] p-5 sm:p-6"
        aria-labelledby="account-unavailable-title"
      >
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="account-unavailable-title"
              className="font-display text-lg font-bold"
            >
              Account details unavailable
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              Authentication is not configured for this environment, so no
              account identity is being shown.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <ClerkAccountIdentity role={role} />;
}

function ClerkAccountIdentity({ role }: { role: "admin" | "user" }) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <section
        className="rounded-3xl border border-ink/8 bg-white p-5 dark:bg-white/[0.055] sm:p-6"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-ink/55">
          Loading your verified account details…
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-ink/8 bg-white p-5 dark:bg-white/[0.055] sm:p-6">
        <p className="text-sm font-semibold text-ink/55">
          No signed-in account is available.
        </p>
      </section>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const emailVerified =
    user.primaryEmailAddress?.verification?.status === "verified";
  const displayName =
    user.fullName ?? user.firstName ?? email ?? "Signed-in account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <section
      className="rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055] sm:p-6"
      aria-labelledby="account-details-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-forest/10 font-display text-lg font-bold text-forest">
          {initials || <UserRound className="size-6" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            {role === "admin" ? "Administrator account" : "Signed-in account"}
          </p>
          <h2
            id="account-details-title"
            className="mt-1 truncate font-display text-xl font-bold"
          >
            {displayName}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/52">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {email ?? "No primary email is attached"}
            </span>
          </p>
        </div>
        {email ? (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
              emailVerified
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            {emailVerified ? (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            ) : null}
            {emailVerified ? "Email verified" : "Verification pending"}
          </span>
        ) : null}
      </div>
    </section>
  );
}
