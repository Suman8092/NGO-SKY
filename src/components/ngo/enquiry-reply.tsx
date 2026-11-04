"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
export function EnquiryReply({ id }: { id: string }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        className="text-xs font-semibold text-forest"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close reply" : "Reply from admin"}
      </button>
      {open && (
        <form
          className="mt-3"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            setBusy(true);
            try {
              const r = await fetch("/api/admin/enquiry-reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id,
                  content: new FormData(form).get("content"),
                }),
              });
              const b = await r.json();
              if (!r.ok) throw new Error(b.error?.message);
              toast.success(`Reply ${b.data.reference} saved; email queued.`);
              form.reset();
              setOpen(false);
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Could not save reply.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-2 text-xs font-medium">
            Your reply
            <textarea
              name="content"
              required
              maxLength={10000}
              rows={4}
              className="ngo-input"
            />
          </label>
          <button
            disabled={busy}
            className="button-primary mt-3 min-h-9 px-4 text-xs"
          >
            {busy ? "Saving…" : "Save reply & queue email"}
          </button>
        </form>
      )}
    </div>
  );
}
