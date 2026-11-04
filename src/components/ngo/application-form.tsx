"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
type Option = {
  id: string;
  reference: string;
  data: Record<string, string | number | boolean>;
};
export function ApplicationForm({
  module,
  sourceId,
  enabled = true,
}: {
  module: "members" | "registrations" | "applications" | "complaints";
  sourceId?: string;
  enabled?: boolean;
}) {
  return enabled ? (
    <SignedInApplication module={module} sourceId={sourceId} />
  ) : (
    <p className="text-sm text-ink/60">
      Secure registration is temporarily unavailable.
    </p>
  );
}
function SignedInApplication({
  module,
  sourceId,
}: {
  module: "members" | "registrations" | "applications" | "complaints";
  sourceId?: string;
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [options, setOptions] = useState<Option[]>([]),
    [loading, setLoading] = useState(module !== "complaints"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState<{
      reference: string;
      data: Record<string, unknown>;
    }>();
  const source =
    module === "members"
      ? "designations"
      : module === "registrations"
        ? "events"
        : "internships";
  const sourceField =
    module === "members"
      ? "designation"
      : module === "registrations"
        ? "event"
        : "internship";
  useEffect(() => {
    if (module === "complaints") return;
    const controller = new AbortController();
    fetch(`/api/ngo/public/${source}`, { signal: controller.signal })
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok)
          throw new Error(
            b.error?.message || "Could not load registration options.",
          );
        setOptions(b.data);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [module, source]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget),
      data = Object.fromEntries(
        [...form.entries()].filter(
          ([k]) => !["consent", "website"].includes(k),
        ),
      );
    if (module === "members") {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) data.referredBy = ref;
    }
    try {
      const r = await fetch(`/api/ngo/apply/${module}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          consent: form.get("consent") === "on",
          website: String(form.get("website") ?? ""),
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message || "Could not submit.");
      setReceipt(b.data);
      toast.success("Your application has been stored.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }
  if (!isLoaded || loading)
    return (
      <p role="status" className="py-6 text-sm text-ink/60">
        Loading secure registration…
      </p>
    );
  if (!isSignedIn)
    return (
      <div className="border-y border-ink/15 py-6">
        <p className="text-sm leading-7 text-ink/60">
          Sign in with a verified email to submit your application and follow
          its status privately.
        </p>
        <Link href="/sign-in" className="button-primary mt-4 min-h-10 text-xs">
          Sign in to continue
        </Link>
      </div>
    );
  if (receipt)
    return (
      <div role="status" className="border-y border-forest/25 py-6">
        <h2 className="text-xl font-semibold">Application received</h2>
        <p className="mt-3 text-sm">
          Reference: <strong>{receipt.reference}</strong>
        </p>
        <p className="mt-3 text-sm leading-7 text-ink/60">
          {Number(receipt.data._feeMinor) > 0
            ? `The fee is INR ${Number(receipt.data._feeMinor) / 100}. Payment and review status are available in your member dashboard.`
            : "No registration fee is due. Membership approval and document issuance, where applicable, are reviewed by the foundation."}
        </p>
        <Link
          href="/dashboard/membership"
          className="button-primary mt-5 min-h-10 text-xs"
        >
          View my application
        </Link>
      </div>
    );
  if (module !== "complaints" && !options.length)
    return (
      <p
        role="status"
        className="border-y border-ink/15 py-6 text-sm leading-7 text-ink/60"
      >
        {error ||
          "No registration options are currently published. Please check again when the foundation opens registration."}
      </p>
    );
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      {error && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-2">
          {error}
        </p>
      )}
      <label className="grid gap-2 text-sm font-medium">
        Full name
        <input
          required
          name="name"
          defaultValue={user?.fullName ?? user?.firstName ?? ""}
          maxLength={120}
          className="ngo-input"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Mobile
        <input name="phone" type="tel" maxLength={25} className="ngo-input" />
      </label>
      {module !== "complaints" && (
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          {module === "members"
            ? "Choose a designation"
            : module === "registrations"
              ? "Choose an event"
              : "Choose a program"}
          <select
            required
            name={sourceField}
            defaultValue={sourceId ?? ""}
            className="ngo-input"
          >
            <option value="">Select…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {String(o.data.name)} — INR {Number(o.data.fee ?? 0)}
              </option>
            ))}
          </select>
        </label>
      )}
      {module === "members" && (
        <>
          <label className="grid gap-2 text-sm font-medium">
            Date of birth (optional)
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              name="dateOfBirth"
              className="ngo-input"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Address
            <textarea
              name="address"
              rows={3}
              maxLength={2000}
              className="ngo-input"
            />
          </label>
        </>
      )}
      {module === "applications" && (
        <>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Education
            <input
              required
              name="education"
              className="ngo-input"
              maxLength={500}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Why would you like to join?
            <textarea
              required
              name="motivation"
              rows={4}
              maxLength={6000}
              className="ngo-input"
            />
          </label>
        </>
      )}
      {module === "registrations" && (
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Accessibility / special requirements
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            className="ngo-input"
          />
        </label>
      )}
      {module === "complaints" && (
        <>
          <label className="grid gap-2 text-sm font-medium">
            Type
            <select name="type" className="ngo-input">
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Subject
            <input
              required
              name="title"
              maxLength={250}
              className="ngo-input"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Details
            <textarea
              name="description"
              required
              rows={5}
              maxLength={10000}
              className="ngo-input"
            />
          </label>
        </>
      )}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-xs leading-6 text-ink/70 sm:col-span-2">
        <input
          type="checkbox"
          required
          name="consent"
          className="mt-1 size-4 shrink-0"
        />
        I consent to the foundation processing this information for this
        application and related operational communication. I understand that fee
        payment does not automatically grant a position or administrator access.
      </label>
      <button
        disabled={busy}
        className="button-primary justify-self-start text-xs disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
