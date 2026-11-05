"use client";
import { openHostedCheckout } from "./hosted-checkout";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { NgoRecord } from "@/lib/ngo/catalog";
type Account = {
  records: NgoRecord[];
  messages: NgoRecord[];
  news: NgoRecord[];
  coordinator: boolean;
  referralMembers: number;
  referralDonationMinor: number;
  birthday: boolean;
};
export function MemberHub() {
  const [data, setData] = useState<Account>(),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const r = await fetch("/api/ngo/account", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await r.json();
        if (!r.ok)
          throw new Error(
            body.error?.message || "Account records unavailable.",
          );
        setData(body.data);
        setError("");
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
      }
    };
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  if (error)
    return (
      <p role="alert" className="border-l-2 border-red-500 p-4 text-sm">
        {error}
      </p>
    );
  if (!data)
    return (
      <p role="status" className="py-6 text-sm text-ink/60">
        Loading your private records…
      </p>
    );
  const member = data.records.find((r) => r.module === "members");
  const docs = data.records.filter((r) =>
    ["documents", "certificates", "letters"].includes(r.module),
  );
  const applications = data.records.filter((r) =>
    [
      "members",
      "renewals",
      "registrations",
      "applications",
      "complaints",
    ].includes(r.module),
  );
  return (
    <div className="space-y-8">
      {data.coordinator && (
        <Link
          href="/dashboard/coordinator"
          className="button-primary min-h-10 text-xs"
        >
          Open coordinator workspace
        </Link>
      )}
      {data.birthday && (
        <p
          role="status"
          className="border-y border-ember/40 py-5 text-lg font-medium"
        >
          Happy birthday, {String(member?.data.name ?? "")}! Thank you for being
          part of the foundation.
        </p>
      )}
      <section className="border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">Membership</h2>
        {member ? (
          <>
            <p className="mt-3 text-sm">
              {member.reference} ·{" "}
              <strong className="capitalize">{member.status}</strong>
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {member.data._provisional === true
                ? "PROVISIONAL TEST MEMBERSHIP · "
                : ""}
              Valid until: {String(member.data._expires ?? "Awaiting approval")}{" "}
              · Fee: INR {Number(member.data._feeMinor ?? 0) / 100} ·{" "}
              {String(member.data._paymentStatus ?? "Not recorded")}
            </p>
            {["approved", "expired"].includes(member.status) && (
              <RenewMembership member={member} />
            )}{" "}
            {member.status === "approved" && (
              <div className="mt-5 space-y-3 text-sm">
                <p>
                  You referred {data.referralMembers} members and INR{" "}
                  {(data.referralDonationMinor / 100).toLocaleString("en-IN")}{" "}
                  in confirmed donations.
                </p>
                {[
                  [
                    "Membership referral",
                    `/membership?ref=${member.reference}`,
                  ],
                  ["Donation referral", `/donate?ref=${member.reference}`],
                ].map(([label, path]) => (
                  <div
                    key={label}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <span className="text-ink/60">{label}</span>
                    <button
                      type="button"
                      className="font-semibold text-forest"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(
                            new URL(path, window.location.origin).toString(),
                          )
                          .then(() => toast.success("Referral link copied."))
                          .catch(() =>
                            toast.error("Clipboard access unavailable."),
                          );
                      }}
                    >
                      Copy link
                    </button>
                    <a href={path} className="text-forest underline">
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-7 text-ink/60">
              You have not submitted a membership application.
            </p>
            <Link
              href="/membership"
              className="button-primary mt-4 min-h-10 text-xs"
            >
              Apply for membership
            </Link>
          </>
        )}
      </section>
      <section className="border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">Applications & cases</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {applications.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">{r.reference}</p>
                <p className="mt-1 text-xs text-ink/60">
                  {r.module} · {r.status} ·{" "}
                  {String(r.data._paymentStatus ?? "")}
                </p>
              </div>
              {r.module === "complaints" ? (
                <CaseConversation id={r.id} />
              ) : Number(r.data._feeMinor) > 0 &&
                r.data._paymentStatus !== "paid" &&
                r.status !== "blocked" ? (
                <FeeCheckout source={r} />
              ) : null}
            </div>
          ))}
          {!applications.length && (
            <p className="py-5 text-sm text-ink/60">
              No applications or cases yet.
            </p>
          )}
        </div>
      </section>
      <section className="border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">
          Receipts, certificates & letters
        </h2>
        <div className="mt-4 divide-y divide-ink/10">
          {docs.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium capitalize">
                  {String(r.data.title ?? r.data.type ?? "Document").replaceAll(
                    "-",
                    " ",
                  )}
                </p>
                <p className="mt-1 text-xs text-ink/60">
                  {r.reference} · {r.status}
                </p>
              </div>
              <a
                href={`/api/ngo/documents/${r.id}`}
                className="font-semibold text-forest"
              >
                Download PDF
              </a>
            </div>
          ))}
          {!docs.length && (
            <p className="py-5 text-sm leading-7 text-ink/60">
              Issued documents appear here after payment confirmation or
              administrative approval, as applicable.
            </p>
          )}
        </div>
      </section>
      <section className="border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">Messages & updates</h2>
        {[
          ...data.messages,
          ...data.news,
          ...data.records.filter((r) => r.module === "enquiry-replies"),
        ].map((r) => (
          <article key={r.id} className="border-b border-ink/10 py-5">
            <h3 className="text-sm font-semibold">{String(r.data.name)}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink/65">
              {String(r.data.content ?? r.data.description ?? "")}
            </p>
            <p className="mt-2 text-xs text-ink/45">
              {new Date(r.createdAt).toLocaleDateString("en-IN")}
            </p>
          </article>
        ))}
        {!data.messages.length && !data.news.length && (
          <p className="mt-4 text-sm text-ink/60">No new messages.</p>
        )}
      </section>
    </div>
  );
}
export function CaseConversation({ id }: { id: string }) {
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState<NgoRecord[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load() {
    try {
      const r = await fetch(`/api/ngo/cases/${id}`);
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message);
      setRows(b.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversation unavailable.");
    }
  }
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="text-xs font-semibold text-forest"
      >
        {open ? "Close conversation" : "Open conversation"}
      </button>
      {open && (
        <div className="mt-4 border-l border-ink/15 pl-4">
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="py-3">
              <p className="text-xs font-semibold">{String(r.data.author)}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                {String(r.data.content)}
              </p>
            </div>
          ))}
          <form
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const form = e.currentTarget,
                body = new FormData(form);
              setBusy(true);
              try {
                const r = await fetch(`/api/ngo/cases/${id}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: body.get("content") }),
                });
                const b = await r.json();
                if (!r.ok) throw new Error(b.error?.message);
                form.reset();
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Reply failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="grid gap-2 text-xs font-medium">
              Reply
              <textarea
                name="content"
                required
                maxLength={10000}
                rows={3}
                className="ngo-input"
              />
            </label>
            <button
              disabled={busy}
              className="button-primary mt-3 min-h-10 text-xs"
            >
              {busy ? "Saving…" : "Save reply"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function FeeCheckout({ source }: { source: NgoRecord }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="text-xs font-semibold text-forest disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/ngo/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source: source.id }),
          });
          const b = await r.json();
          if (!r.ok)
            throw new Error(
              b.error?.message ||
                "Online fee payment is unavailable. Contact the foundation for approved payment instructions.",
            );
          if (openHostedCheckout(b.data)) return;
          await loadCheckoutScript();
          const options = {
            key: b.data.keyId,
            order_id: b.data.orderId,
            amount: b.data.amountMinor,
            currency: "INR",
            name: "Skymeredian Foundation",
            description: `Registration ${source.reference}`,
            handler: () =>
              toast.info(
                "Payment submitted. Confirmation appears here after the signed gateway webhook is verified.",
              ),
            modal: { ondismiss: () => setBusy(false) },
          };
          const Razorpay = (
            window as unknown as {
              Razorpay: new (options: unknown) => { open: () => void };
            }
          ).Razorpay;
          new Razorpay(options).open();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Checkout unavailable.");
        } finally {
          setBusy(false);
        }
      }}
    >
      Pay INR {Number(source.data._feeMinor) / 100}
    </button>
  );
}
export async function loadCheckoutScript() {
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Payment gateway could not be loaded."));
    document.head.appendChild(script);
  });
}

function RenewMembership({ member }: { member: NgoRecord }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="mt-4 text-sm font-semibold text-forest"
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/ngo/renewal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ designation: member.data.designation }),
          });
          const b = await r.json();
          if (!r.ok) throw new Error(b.error?.message || "Renewal unavailable");
          toast.success(
            "Renewal submitted. Check Applications for the fee and approval status.",
          );
          window.location.reload();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Renewal unavailable");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Submitting…" : "Request membership renewal"}
    </button>
  );
}
