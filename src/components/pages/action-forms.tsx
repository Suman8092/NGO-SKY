"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Send,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import {
  type ContactSubject,
  contactSubjectOptions,
} from "@/lib/contact-subjects";
import type { PublicPaymentReadiness } from "@/lib/payment-readiness";

type SubmissionState = {
  kind: "idle" | "submitting" | "success" | "error";
  message?: string;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-ink/[0.12] bg-white/80 px-4 py-3.5 text-sm text-ink outline-none backdrop-blur-md shadow-sm transition-all duration-200 placeholder:text-ink/35 focus:border-forest focus:bg-white focus:ring-4 focus:ring-forest/10 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#91c4ff] dark:focus:bg-white/[0.08]";
const labelClass = "text-xs font-bold uppercase tracking-wider text-ink/75 dark:text-white/80";

async function postJson(endpoint: string, payload: unknown) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => null)) as null | {
    ok?: boolean;
    error?:
      | {
          message?: string;
          details?: { fieldErrors?: Record<string, string[]> };
        }
      | string;
    data?: Record<string, unknown>;
  };

  if (!response.ok || !result?.ok) {
    const fieldErrors =
      typeof result?.error === "object"
        ? result.error.details?.fieldErrors
        : undefined;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).flat()[0]
      : undefined;
    const message =
      firstFieldError ??
      (typeof result?.error === "string"
        ? result.error
        : result?.error?.message) ??
      "We could not submit this form. Please review your details and try again.";
    throw new Error(message);
  }
  return result.data ?? {};
}

function SubmissionNotice({ state }: { state: SubmissionState }) {
  if (state.kind === "idle" || state.kind === "submitting") return null;
  const success = state.kind === "success";
  return (
    <div
      aria-live="polite"
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4.5 text-sm backdrop-blur-md shadow-sm ${
        success
          ? "border-emerald-500/20 bg-emerald-50/90 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "border-rose-500/20 bg-rose-50/90 text-rose-950 dark:border-rose-400/20 dark:bg-rose-950/30 dark:text-rose-200"
      }`}
      role={success ? "status" : "alert"}
    >
      {success ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
      )}
      <p className="leading-relaxed font-medium">{state.message}</p>
    </div>
  );
}

function SubmitButton({
  state,
  label,
  submittingLabel,
}: {
  state: SubmissionState;
  label: string;
  submittingLabel: string;
}) {
  const pending = state.kind === "submitting";
  return (
    <button
      className="group relative inline-flex min-h-13 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-forest px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-forest/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00427d] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:cursor-wait disabled:opacity-70 dark:bg-[#91c4ff] dark:text-[#06192d] dark:hover:bg-[#85e5c6]"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <Send aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
      {pending ? submittingLabel : label}
    </button>
  );
}

export function ContactForm({
  initialSubject = "General enquiry",
}: {
  initialSubject?: ContactSubject;
}) {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "submitting" });
    try {
      await postJson("/api/contact", {
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim() || undefined,
        subject: String(data.get("subject") ?? "").trim(),
        message: String(data.get("message") ?? "").trim(),
        consent: data.get("consent") === "on",
      });
      form.reset();
      setState({
        kind: "success",
        message: "Thank you—your message was accepted by the contact service.",
      });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Full name
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="name"
            className={fieldClass}
            name="name"
            required
          />
        </label>
        <label className={labelClass}>
          Email address
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="email"
            className={fieldClass}
            name="email"
            required
            type="email"
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <input
            autoComplete="tel"
            className={fieldClass}
            name="phone"
            type="tel"
          />
        </label>
        <label className={labelClass}>
          What can we help with?
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <select
            className={fieldClass}
            defaultValue={initialSubject}
            name="subject"
            required
          >
            {contactSubjectOptions.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        Your message
        <span aria-hidden="true" className="text-red-600">
          {" "}
          *
        </span>
        <textarea
          className={`${fieldClass} min-h-36 resize-y`}
          minLength={20}
          name="message"
          placeholder="Tell us enough to direct your message to the right person."
          required
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          name="consent"
          required
          type="checkbox"
        />
        <span>
          I consent to Skymeredian Foundation using these details to respond to my
          enquiry.{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </span>
      </label>
      <SubmitButton
        label="Send message"
        state={state}
        submittingLabel="Sending securely…"
      />
      <SubmissionNotice state={state} />
    </form>
  );
}

const skillOptions = [
  "Teaching & mentoring",
  "Design & communications",
  "Technology & data",
  "Events & logistics",
  "Health expertise",
  "Finance & legal",
];

const volunteerAreas = [
  "Education & mentoring",
  "Health & wellbeing",
  "Livelihoods & enterprise",
  "Climate & environment",
  "Food & relief",
  "Events & community",
  "Professional skills",
] as const;

const volunteerInterestAliases: Record<
  string,
  (typeof volunteerAreas)[number]
> = {
  education: "Education & mentoring",
  mentoring: "Education & mentoring",
  health: "Health & wellbeing",
  livelihoods: "Livelihoods & enterprise",
  climate: "Climate & environment",
  food: "Food & relief",
  relief: "Food & relief",
  events: "Events & community",
  skills: "Professional skills",
};

export function VolunteerForm({
  initialInterest = "Education & mentoring",
}: {
  initialInterest?: string;
}) {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });
  const resolvedInterest = volunteerAreas.includes(
    initialInterest as (typeof volunteerAreas)[number],
  )
    ? initialInterest
    : (volunteerInterestAliases[initialInterest.toLowerCase()] ??
      volunteerAreas[0]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "submitting" });
    try {
      await postJson("/api/volunteer", {
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        city: String(data.get("city") ?? "").trim(),
        country: String(data.get("country") ?? "India").trim() || "India",
        areaOfInterest: String(data.get("areaOfInterest") ?? "").trim(),
        skills: data.getAll("skills").map(String),
        availability: String(data.get("availability") ?? "flexible"),
        motivation: String(data.get("motivation") ?? "").trim(),
        experience: String(data.get("experience") ?? "").trim() || undefined,
        consent: data.get("consent") === "on",
      });
      form.reset();
      setState({
        kind: "success",
        message:
          "Your interest is registered. Our volunteer team will review the fit and contact you about a discovery conversation.",
      });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not register your interest. Please try again.",
      });
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Full name
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="name"
            className={fieldClass}
            name="name"
            required
          />
        </label>
        <label className={labelClass}>
          Email address
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="email"
            className={fieldClass}
            name="email"
            required
            type="email"
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Phone number
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="tel"
            className={fieldClass}
            name="phone"
            required
            type="tel"
          />
        </label>
        <label className={labelClass}>
          City
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="address-level2"
            className={fieldClass}
            name="city"
            required
          />
        </label>
      </div>
      <input name="country" type="hidden" value="India" />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Primary area of interest
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <select
            className={fieldClass}
            defaultValue={resolvedInterest}
            name="areaOfInterest"
            required
          >
            {volunteerAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Usual availability
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <select
            className={fieldClass}
            defaultValue="flexible"
            name="availability"
            required
          >
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
            <option value="flexible">Flexible</option>
            <option value="event_based">Event-based</option>
          </select>
        </label>
      </div>
      <fieldset>
        <legend className={labelClass}>
          Skills you would like to share{" "}
          <span className="font-normal text-slate-400">(choose any)</span>
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {skillOptions.map((skill) => (
            <label
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              key={skill}
            >
              <input
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                name="skills"
                type="checkbox"
                value={skill}
              />
              {skill}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={labelClass}>
        Why would you like to volunteer?
        <span aria-hidden="true" className="text-red-600">
          {" "}
          *
        </span>
        <textarea
          className={`${fieldClass} min-h-32 resize-y`}
          minLength={30}
          name="motivation"
          placeholder="Share what draws you to this work and what a meaningful experience would look like."
          required
        />
      </label>
      <label className={labelClass}>
        Relevant experience{" "}
        <span className="font-normal text-slate-400">(optional)</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          name="experience"
          placeholder="Professional, lived, community, or volunteer experience is all welcome."
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          name="consent"
          required
          type="checkbox"
        />
        <span>
          I consent to being contacted about volunteering and understand that
          roles may require references, safeguarding training, or a background
          check.{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </span>
      </label>
      <SubmitButton
        label="Submit my interest"
        state={state}
        submittingLabel="Submitting…"
      />
      <SubmissionNotice state={state} />
    </form>
  );
}

const presetAmounts = [500, 1000, 2500, 5000, 10000];

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on?: (event: "payment.failed", handler: (response: unknown) => void) => void;
};

type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact?: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal: { ondismiss: () => void; confirm_close: boolean };
}) => RazorpayCheckout;

function getRazorpayConstructor() {
  return (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
}

async function loadRazorpayCheckout(): Promise<RazorpayConstructor> {
  const existing = getRazorpayConstructor();
  if (existing) return existing;

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      "razorpay-checkout-script",
    ) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error("Secure payment could not load. No payment was taken."),
          ),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Secure payment could not load. No payment was taken."));
    };
    document.head.appendChild(script);
  });

  const loaded = getRazorpayConstructor();
  if (!loaded)
    throw new Error("Secure payment is unavailable. No payment was taken.");
  return loaded;
}

export function DonationForm({
  initialAmount = 2500,
  paymentReadiness,
}: {
  initialAmount?: number;
  paymentReadiness: PublicPaymentReadiness;
}) {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });
  const [amount, setAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState("");
  const frequency = "one_time" as const;
  const idempotency = useRef<{ fingerprint: string; key: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selectedAmount = customAmount ? Number(customAmount) : amount;
    if (!Number.isFinite(selectedAmount) || selectedAmount < 100) {
      setState({
        kind: "error",
        message: "Please choose an amount of at least ₹100.",
      });
      return;
    }
    setState({ kind: "submitting" });
    try {
      const provider = paymentReadiness.oneTimeProvider;
      if (!provider) {
        throw new Error(
          "That giving frequency is not available in this deployment. No payment was taken.",
        );
      }
      const donorEmail = String(data.get("email") ?? "").trim();
      const fingerprint = JSON.stringify([
        selectedAmount,
        frequency,
        provider,
        donorEmail,
      ]);
      if (idempotency.current?.fingerprint !== fingerprint) {
        idempotency.current = {
          fingerprint,
          key: globalThis.crypto.randomUUID(),
        };
      }
      const result = await postJson("/api/donations", {
          campaignId: new URLSearchParams(window.location.search).get("campaign") || undefined,
          referredBy: new URLSearchParams(window.location.search).get("ref") || undefined,
        amount: selectedAmount,
        currency: "INR",
        frequency,
        provider,
        donor: {
          name: String(data.get("name") ?? "").trim(),
          email: donorEmail,
          phone: String(data.get("phone") ?? "").trim() || undefined,
          country: "India",
        },
        anonymous: data.get("anonymous") === "on",
        message: String(data.get("message") ?? "").trim() || undefined,
        consent: data.get("consent") === "on",
        idempotencyKey: idempotency.current.key,
      });
      const donation = result.donation as undefined | { id?: string };
      const payment = result.payment as
        | undefined
        | {
            provider?: "razorpay";
            status?: "requires_action" | "unavailable";
            orderId?: string;
            keyId?: string;
            amountMinor?: number;
            currency?: string;
            reason?: "demo_mode" | "not_configured" | "persistence_required";
          };
      if (
        payment?.provider === "razorpay" &&
        payment.status === "requires_action"
      ) {
        const donationId = donation?.id;
        const orderId = payment.orderId;
        const keyId = payment.keyId;
        const amountMinor = payment.amountMinor;
        const currency = payment.currency;
        if (!donationId || !orderId || !keyId || !amountMinor || !currency) {
          throw new Error(
            "The secure checkout response was incomplete. No payment was taken.",
          );
        }

        const Razorpay = await loadRazorpayCheckout();
        const donorName = String(data.get("name") ?? "").trim();
        const donorEmail = String(data.get("email") ?? "").trim();
        const donorPhone = String(data.get("phone") ?? "").trim() || undefined;
        await new Promise<void>((resolve) => {
          let finished = false;
          const checkout = new Razorpay({
            key: keyId,
            amount: amountMinor,
            currency,
            name: "Skymeredian Foundation",
            description: "Donation",
            order_id: orderId,
            prefill: {
              name: donorName,
              email: donorEmail,
              contact: donorPhone,
            },
            theme: { color: "#00549f" },
            handler: async (response) => {
              if (finished) return;
              finished = true;
              try {
                await postJson("/api/payments/razorpay/verify", {
                  donationId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                setState({
                  kind: "success",
                  message:
                    "Payment details were submitted for verification. Keep the payment reference; final status is set only after signed provider confirmation.",
                });
              } catch (error) {
                setState({
                  kind: "error",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Payment verification is pending. Keep your payment reference and contact our giving team.",
                });
              }
              resolve();
            },
            modal: {
              confirm_close: true,
              ondismiss: () => {
                if (finished) return;
                finished = true;
                setState({
                  kind: "error",
                  message: "Checkout was closed. No payment was taken.",
                });
                resolve();
              },
            },
          });
          checkout.on?.("payment.failed", () => {
            if (finished) return;
            finished = true;
            setState({
              kind: "error",
              message:
                "The payment was not completed. No successful charge was recorded; please try again.",
            });
            resolve();
          });
          checkout.open();
        });
        return;
      }
      if (payment?.status === "unavailable") {
        setState({
          kind: "error",
          message:
            "Checkout is currently unavailable. No payment was initiated.",
        });
      } else {
        setState({
          kind: "error",
          message:
            "The payment provider did not return a checkout action. No payment was initiated.",
        });
      }
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not start your donation. No payment was taken.",
      });
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <fieldset>
        <legend className={labelClass}>Supported checkout</legend>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Online checkout is limited to domestic, one-time INR donations through
          the configured live Razorpay account. Recurring and foreign-source
          donations are not offered by this form.
        </p>
        <div className="mt-3 rounded-2xl border border-teal-700/25 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-900 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100">
          One-time · INR · Razorpay
        </div>
      </fieldset>
      <fieldset>
        <legend className={labelClass}>Donation amount</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {presetAmounts.map((value) => (
            <button
              aria-pressed={!customAmount && amount === value}
              className={`min-h-12 rounded-2xl border px-3 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${!customAmount && amount === value ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:border-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}
              key={value}
              onClick={() => {
                setAmount(value);
                setCustomAmount("");
              }}
              type="button"
            >
              ₹{value.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        <label className={`${labelClass} mt-4 block`}>
          Custom amount{" "}
          <span className="font-normal text-slate-400">(minimum ₹100)</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-slate-500">
              ₹
            </span>
            <input
              className={`${fieldClass} pl-9`}
              inputMode="numeric"
              min={100}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Enter another amount"
              type="number"
              value={customAmount}
            />
          </div>
        </label>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Full name
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="name"
            className={fieldClass}
            name="name"
            required
          />
        </label>
        <label className={labelClass}>
          Email address
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <input
            autoComplete="email"
            className={fieldClass}
            name="email"
            required
            type="email"
          />
        </label>
      </div>
      <label className={labelClass}>
        Phone <span className="font-normal text-slate-400">(optional)</span>
        <input
          autoComplete="tel"
          className={fieldClass}
          name="phone"
          type="tel"
        />
      </label>
      <label className={labelClass}>
        Message <span className="font-normal text-slate-400">(optional)</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          name="message"
          placeholder="A dedication or note for the team."
        />
      </label>
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <input
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            name="anonymous"
            type="checkbox"
          />
          <span>Mark this donation as anonymous in the donation record.</span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <input
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            name="consent"
            required
            type="checkbox"
          />
          <span>
            I consent to processing these details for this donation, required
            payment verification, and compliance checks.{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </span>
        </label>
      </div>
      <SubmitButton
        label={`Continue securely with ₹${(customAmount ? Number(customAmount || 0) : amount).toLocaleString("en-IN")}`}
        state={state}
        submittingLabel="Preparing secure payment…"
      />
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
        Payment details are entered in the selected provider&apos;s checkout.
      </div>
      <SubmissionNotice state={state} />
    </form>
  );
}
