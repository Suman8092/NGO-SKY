"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getModule, type NgoRecord, type ModuleField } from "@/lib/ngo/catalog";
type Result = { rows: NgoRecord[]; total: number; page: number };
const initial: Result = { rows: [], total: 0, page: 1 };
export function ModuleWorkspace({
  module,
  field = false,
}: {
  module: string;
  field?: boolean;
}) {
  const definition = getModule(module)!;
  const [result, setResult] = useState(initial),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [category, setCategory] = useState(""),
    [designation, setDesignation] = useState(""),
    [project, setProject] = useState(""),
    [coordinator, setCoordinator] = useState(""),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(false),
    [selected, setSelected] = useState<NgoRecord>();
  const base = field
    ? `/api/ngo/field/${module}`
    : `/api/admin/modules/${module}`;
  const params = new URLSearchParams({
    q: query,
    status,
    from,
    to,
    category,
    designation,
    project,
    coordinator,
    page: String(page),
  }).toString();
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${base}?${params}`, {
          signal,
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok || !body.ok)
          throw new Error(body.error?.message || "Could not load records.");
        setResult(body.data);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [base, params],
  );
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void load(controller.signal);
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load]);
  async function archive(record: NgoRecord) {
    if (
      !window.confirm(
        `Archive ${record.reference}? Its audit history will be retained.`,
      )
    )
      return;
    try {
      const r = await fetch(`${base}/${record.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: record.revision }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message);
      toast.success("Record archived.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Archive failed.");
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-3xl text-sm leading-6 text-ink/65">
          {definition.description}
        </p>
        {!definition.readOnly && (
          <button
            type="button"
            className="button-primary min-h-10 px-4 text-xs"
            onClick={() => {
              setSelected(undefined);
              setEditing(true);
            }}
          >
            Add {definition.singular}
          </button>
        )}
      </div>
      {editing && (
        <RecordEditor
          key={selected?.id ?? "new"}
          module={module}
          record={selected}
          field={field}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            toast.success("Record saved.");
            void load();
          }}
        />
      )}
      <div className="flex flex-wrap items-end gap-3 border-y border-ink/15 py-4">
        <label className="grid gap-1 text-xs font-medium">
          Search
          <input
            type="search"
            placeholder="Name, mobile, reference…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="ngo-input w-52"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="ngo-input"
          >
            <option value="">All statuses</option>
            {definition.statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {definition.fields.some((f) => f.key === "category") && (
          <label className="grid gap-1 text-xs font-medium">
            Category
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="ngo-input w-36"
            />
          </label>
        )}
        <label className="grid gap-1 text-xs font-medium">
          From
          <input
            type="date"
            className="ngo-input"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          To
          <input
            type="date"
            className="ngo-input"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {module !== "audit" && (
          <div className="flex gap-3 pb-2 text-xs font-semibold text-forest">
            <a
              href={`${field ? "/api/ngo/field" : "/api/admin/modules"}/${module}/export?${params}&format=xlsx`}
            >
              Excel export
            </a>
            <a
              href={`${field ? "/api/ngo/field" : "/api/admin/modules"}/${module}/export?${params}&format=pdf`}
            >
              PDF report
            </a>
            {!field && module !== "online-donations" && (
              <a href={`/api/admin/backup?module=${module}&${params}`}>
                JSON backup
              </a>
            )}
          </div>
        )}
      </div>
      <details className="text-xs text-ink/60">
        <summary className="cursor-pointer font-medium">
          Period and assignment filters
        </summary>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            ["Today", 0],
            ["Last 7 days", 6],
            ["Last 30 days", 29],
            ["Last year", 364],
          ].map(([label, days]) => (
            <button
              key={label}
              type="button"
              className="min-h-9 rounded border border-ink/15 px-3"
              onClick={() => {
                const end = new Date(),
                  start = new Date();
                start.setDate(start.getDate() - Number(days));
                setFrom(start.toISOString().slice(0, 10));
                setTo(end.toISOString().slice(0, 10));
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
          {definition.fields.some((f) => f.reference === "designations") && (
            <input
              aria-label="Designation record ID"
              placeholder="Designation record ID"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setPage(1);
              }}
              className="ngo-input"
            />
          )}
          {definition.fields.some((f) => f.key === "project") && (
            <input
              aria-label="Project record ID"
              placeholder="Project record ID"
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setPage(1);
              }}
              className="ngo-input"
            />
          )}
          {!field && definition.fields.some((f) => f.key === "coordinator") && (
            <input
              aria-label="Coordinator record ID"
              placeholder="Coordinator record ID"
              value={coordinator}
              onChange={(e) => {
                setCoordinator(e.target.value);
                setPage(1);
              }}
              className="ngo-input"
            />
          )}
        </div>
      </details>
      {error && (
        <div role="alert" className="border-l-2 border-red-500 p-4 text-sm">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 font-semibold text-forest"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <p role="status" className="py-8 text-sm text-ink/60">
          Loading protected records…
        </p>
      ) : (
        !error && (
          <>
            <p role="status" className="text-xs text-ink/60">
              {result.total} matching records
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">{definition.title}</caption>
                <thead className="border-b border-ink/15 text-xs text-ink/60">
                  <tr>
                    {[
                      "Reference / date",
                      "Record",
                      "Status",
                      "Details",
                      "Actions",
                    ].map((h) => (
                      <th key={h} scope="col" className="px-3 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {result.rows.map((record) => (
                    <tr key={record.id}>
                      <td className="px-3 py-4 align-top">
                        <span className="block text-xs font-semibold">
                          {record.reference}
                        </span>
                        <span className="mt-1 block text-xs text-ink/50">
                          {new Date(record.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-4 align-top">
                        <span className="font-medium">
                          {String(
                            record.data.name ??
                              record.data.title ??
                              record.data.item ??
                              record.reference,
                          )}
                        </span>
                        <span className="mt-1 block text-xs text-ink/55">
                          {String(
                            record.data.email ??
                              record.data.location ??
                              record.data.actor ??
                              "",
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-4 align-top text-xs capitalize">
                        {record.status.replaceAll("-", " ")}
                      </td>
                      <td className="max-w-xs px-3 py-4 align-top text-xs leading-6 text-ink/65">
                        {record.data.amount !== undefined
                          ? `${record.data.currency ?? "INR"} ${Number(record.data.amount).toLocaleString("en-IN")}`
                          : record.data._feeMinor !== undefined
                            ? `Fee: INR ${Number(record.data._feeMinor) / 100} · ${record.data._paymentStatus}`
                            : String(
                                record.data.designation ??
                                  record.data.module ??
                                  record.data.category ??
                                  record.data.date ??
                                  "",
                              )}
                      </td>
                      <td className="px-3 py-4 align-top">
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-forest">
                          {module === "audit" && (
                            <details className="w-full">
                              <summary className="cursor-pointer">
                                Full activity details
                              </summary>
                              <dl className="mt-3 space-y-2 text-ink/65">
                                {Object.entries(record.data).map(([k, v]) => (
                                  <div key={k}>
                                    <dt className="font-medium">{k}</dt>
                                    <dd className="break-words font-normal">
                                      {String(v)}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </details>
                          )}
                          {!definition.readOnly && !field && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(record);
                                setEditing(true);
                              }}
                            >
                              View / edit
                            </button>
                          )}
                          {!field &&
                            ["documents", "certificates", "letters"].includes(
                              module,
                            ) &&
                            record.status === "issued" && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const r = await fetch(
                                      "/api/admin/delivery",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          action: "resend",
                                          id: record.id,
                                        }),
                                      },
                                    );
                                    const b = await r.json();
                                    if (!r.ok)
                                      throw new Error(b.error?.message);
                                    toast.info(
                                      b.data.blocked
                                        ? "Email queued; a verified sender is required."
                                        : "Email delivery processed. Check the delivery log for the result.",
                                    );
                                  } catch (e) {
                                    toast.error(
                                      e instanceof Error
                                        ? e.message
                                        : "Could not queue email.",
                                    );
                                  }
                                }}
                              >
                                Email copy
                              </button>
                            )}
                          {[
                            "documents",
                            "certificates",
                            "letters",
                            "custom-receipts",
                          ].includes(module) && (
                            <a
                              href={`/api/ngo/documents/${record.id}?preview=1`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview / print PDF
                            </a>
                          )}
                          {!field &&
                            [
                              "offline-donations",
                              "membership-payments",
                              "project-funds",
                              "expenses",
                              "custom-receipts",
                            ].includes(module) &&
                            ["confirmed", "approved"].includes(
                              record.status,
                            ) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const reason = window.prompt(
                                    "Reason for reversing this recorded payment (at least 10 characters). This does not initiate a gateway refund.",
                                  );
                                  if (!reason) return;
                                  try {
                                    const r = await fetch(
                                      `/api/admin/modules/${module}/${record.id}/reverse`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          reason,
                                          revision: record.revision,
                                        }),
                                      },
                                    );
                                    const b = await r.json();
                                    if (!r.ok)
                                      throw new Error(b.error?.message);
                                    toast.success(
                                      "Reversal recorded; linked receipts revoked.",
                                    );
                                    void load();
                                  } catch (e) {
                                    toast.error(
                                      e instanceof Error
                                        ? e.message
                                        : "Reversal failed.",
                                    );
                                  }
                                }}
                              >
                                Record reversal
                              </button>
                            )}
                          {module === "recurring-donations" &&
                            ![
                              "cancelled",
                              "completed",
                              "setup-failed",
                            ].includes(record.status) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      "Cancel this donor mandate at the gateway?",
                                    )
                                  )
                                    return;
                                  try {
                                    const r = await fetch(
                                      "/api/ngo/recurring",
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          id: record.id,
                                          action: "cancel",
                                        }),
                                      },
                                    );
                                    const b = await r.json();
                                    if (!r.ok)
                                      throw new Error(b.error?.message);
                                    toast.success(
                                      `Gateway status: ${b.data.status}`,
                                    );
                                    void load();
                                  } catch (e) {
                                    toast.error(
                                      e instanceof Error
                                        ? e.message
                                        : "Cancellation failed.",
                                    );
                                  }
                                }}
                              >
                                Stop mandate
                              </button>
                            )}
                          {module === "complaints" && (
                            <Link
                              href={`/dashboard/membership?case=${record.id}`}
                            >
                              Conversation
                            </Link>
                          )}
                          {!field &&
                            !definition.readOnly &&
                            ![
                              "members",
                              "coordinators",
                              "certificates",
                              "letters",
                              "offline-donations",
                              "membership-payments",
                              "project-funds",
                              "expenses",
                              "custom-receipts",
                            ].includes(module) && (
                              <button
                                type="button"
                                onClick={() => void archive(record)}
                              >
                                Archive
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!result.rows.length && (
                <p className="py-10 text-center text-sm text-ink/60">
                  No records match these filters. Add the first{" "}
                  {definition.singular} when the information is ready.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-4 text-xs">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="min-h-10 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.max(1, Math.ceil(result.total / 25))}
              </span>
              <button
                type="button"
                disabled={page * 25 >= result.total}
                onClick={() => setPage((p) => p + 1)}
                className="min-h-10 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}
function RecordEditor({
  module,
  record,
  field,
  onClose,
  onSaved,
}: {
  module: string;
  record?: NgoRecord;
  field: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const definition = getModule(module)!;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const locked =
    !!record &&
    [
      "offline-donations",
      "membership-payments",
      "project-funds",
      "expenses",
      "custom-receipts",
    ].includes(module) &&
    ["confirmed", "approved", "void"].includes(record.status);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {};
    for (const f of definition.fields) {
      const value = form.get(f.key);
      if (f.type === "checkbox") data[f.key] = value === "on";
      else if (value !== null && value !== "")
        data[f.key] =
          f.type === "money" || f.type === "number"
            ? Number(value)
            : String(value);
    }
    try {
      const base = field
        ? `/api/ngo/field/${module}`
        : `/api/admin/modules/${module}`;
      const r = await fetch(record ? `${base}/${record.id}` : base, {
        method: record ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          status: form.get("status"),
          ...(record ? { revision: record.revision } : {}),
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error?.message || "Save failed.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="border-y border-forest/25 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {record ? record.reference : `New ${definition.singular}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 px-3 text-sm text-ink/60"
        >
          Close
        </button>
      </div>
      {locked && (
        <p role="status" className="mb-4 text-sm text-ink/65">
          This confirmed financial record is retained as an immutable original.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-5 text-sm text-red-600">
          {error}
        </p>
      )}
      <fieldset disabled={busy || locked} className="grid gap-5 md:grid-cols-2">
        {definition.fields
          .filter((f) => !field || f.key !== "accountUserId")
          .map((f) => (
            <EditorField
              key={f.key}
              field={f}
              value={record?.data[f.key]}
              publicImage={!!definition.public}
            />
          ))}
        <label className="grid gap-2 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={record?.status ?? definition.statuses[0]}
            className="ngo-input"
          >
            {(field ? [definition.statuses[0]] : definition.statuses).map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </label>
      </fieldset>
      {!locked && (
        <button
          disabled={busy}
          className="button-primary mt-6 min-h-10 px-5 text-xs"
        >
          {busy ? "Saving…" : "Save record"}
        </button>
      )}
    </form>
  );
}
function EditorField({
  field,
  value,
  publicImage,
}: {
  field: ModuleField;
  value?: string | number | boolean;
  publicImage: boolean;
}) {
  const [url, setUrl] = useState(String(value ?? "")),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  if (field.type === "checkbox")
    return (
      <label className="flex items-center gap-3 self-center text-sm">
        <input
          type="checkbox"
          name={field.key}
          defaultChecked={value === true}
          required={field.required}
          className="size-4"
        />
        {field.label}
      </label>
    );
  if (field.type === "file" || field.type === "image")
    return (
      <div className="grid gap-2 text-sm font-medium">
        <label htmlFor={`file-${field.key}`}>{field.label}</label>
        <input type="hidden" name={field.key} value={url} />
        <input
          id={`file-${field.key}`}
          type="file"
          accept={
            field.type === "image"
              ? "image/png,image/jpeg"
              : "application/pdf,image/png,image/jpeg"
          }
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setError("");
            const body = new FormData();
            body.set("file", file);
            body.set("publicImage", String(publicImage));
            try {
              const r = await fetch("/api/ngo/upload", {
                method: "POST",
                body,
              });
              const b = await r.json();
              if (!r.ok) throw new Error(b.error?.message);
              setUrl(b.data.url);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Upload failed.");
            } finally {
              setUploading(false);
            }
          }}
          className="ngo-input"
        />
        {uploading && (
          <p role="status" className="text-xs">
            Uploading…
          </p>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-forest"
          >
            View uploaded file
          </a>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <span className="text-xs font-normal text-ink/50">
          JPEG, PNG or PDF; up to 3 MB.
        </span>
      </div>
    );
  const props = {
    name: field.key,
    required: field.required,
    defaultValue: String(value ?? ""),
    className: "ngo-input",
    id: `field-${field.key}`,
  };
  return (
    <div
      className={`grid gap-2 text-sm font-medium ${field.type === "textarea" ? "md:col-span-2" : ""}`}
    >
      <label htmlFor={props.id}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "textarea" ? (
        <textarea {...props} rows={4} />
      ) : field.type === "select" ? (
        <select {...props}>
          <option value="">Select…</option>
          {field.options?.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      ) : (
        <input
          {...props}
          type={field.type === "money" ? "number" : (field.type ?? "text")}
          min={
            field.type === "number" || field.type === "money" ? 0 : undefined
          }
          step={
            field.type === "money"
              ? "0.01"
              : field.type === "number"
                ? "1"
                : undefined
          }
        />
      )}{" "}
      {field.reference && (
        <p className="text-xs font-normal text-ink/50">
          Paste the reference or record ID from{" "}
          <Link
            href={`/admin/manage/${field.reference}`}
            className="text-forest underline"
          >
            {getModule(field.reference)?.title}
          </Link>
          .
        </p>
      )}
    </div>
  );
}
