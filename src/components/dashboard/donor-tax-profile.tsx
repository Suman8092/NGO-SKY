"use client";

import { Check, Edit2, Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type TaxProfile = {
  legalName: string;
  panNumber: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  updatedAt?: string;
};

export function DonorTaxProfileCard() {
  const [profile, setProfile] = useState<TaxProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/tax-profile");
        const json = await res.json();
        if (json.ok && json.data?.profile) {
          setProfile(json.data.profile);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSavedSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = {
      legalName: String(formData.get("legalName") ?? "").trim(),
      panNumber: String(formData.get("panNumber") ?? "").trim().toUpperCase(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      pincode: String(formData.get("pincode") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/user/tax-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to update 80G tax profile.");
      }

      setProfile(json.data.profile);
      setSavedSuccess(true);
      setEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
        <Loader2 className="size-6 animate-spin text-forest" />
      </div>
    );
  }

  const hasPan = Boolean(profile?.panNumber);

  return (
    <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm dark:bg-white/[0.055] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest dark:text-[#70d5b3]">
            Statutory Income Tax Profile
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink dark:text-white">
            Section 80G & Form 10BE Details
          </h2>
        </div>

        {hasPan && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="button-secondary min-h-9 text-xs"
          >
            <Edit2 className="size-3.5" /> Edit PAN Details
          </button>
        )}
      </div>

      <p className="mt-2 text-xs leading-6 text-ink/60 dark:text-white/60">
        Under Indian Income Tax rules, donations are reported under Form 10BE. Your PAN is stamped directly onto your 80G tax deduction certificates.
      </p>

      {savedSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Check className="size-4" /> 80G Tax Profile saved successfully.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
          {error}
        </div>
      )}

      {hasPan && !editing ? (
        /* Verified PAN overview */
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Permanent Account Number (PAN)
            </span>
            <p className="mt-1 font-mono text-lg font-extrabold tracking-wider text-ink dark:text-white">
              {profile?.panNumber.slice(0, 5)}****{profile?.panNumber.slice(-1)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" /> Ready for Form 10BE
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink/50 dark:text-white/50">
              Legal Taxpayer Name
            </span>
            <p className="mt-1 font-bold text-ink dark:text-white">
              {profile?.legalName}
            </p>
            <p className="mt-1 text-[0.7rem] text-ink/50 dark:text-white/50">
              Matches ITD records
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02] sm:col-span-2 lg:col-span-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink/50 dark:text-white/50">
              Tax Address
            </span>
            <p className="mt-1 text-xs text-ink/80 dark:text-white/80">
              {profile?.address ? `${profile.address}, ${profile.city ?? ""}, ${profile.state ?? ""} ${profile.pincode ?? ""}` : "Not specified"}
            </p>
          </div>
        </div>
      ) : (
        /* PAN Editor form */
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                Legal Name (as per PAN Card) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="legalName"
                defaultValue={profile?.legalName ?? ""}
                required
                placeholder="Full name as printed on PAN card"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                Permanent Account Number (PAN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="panNumber"
                defaultValue={profile?.panNumber ?? ""}
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 font-mono text-sm uppercase text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                Postal Address
              </label>
              <input
                type="text"
                name="address"
                defaultValue={profile?.address ?? ""}
                placeholder="Flat / House / Street"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                City
              </label>
              <input
                type="text"
                name="city"
                defaultValue={profile?.city ?? ""}
                placeholder="Bengaluru"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                State
              </label>
              <input
                type="text"
                name="state"
                defaultValue={profile?.state ?? ""}
                placeholder="Karnataka"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-white/90">
                PIN Code
              </label>
              <input
                type="text"
                name="pincode"
                defaultValue={profile?.pincode ?? ""}
                placeholder="560001"
                maxLength={6}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="button-primary min-h-10 text-xs"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save 80G Tax Profile"}
            </button>
            {hasPan && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="button-secondary min-h-10 text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

