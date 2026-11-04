"use client";

import { Children, cloneElement, isValidElement, useState, type ReactNode, type ReactElement } from "react";

type NodeProps = { children?: ReactNode };
function textContent(node: ReactNode): string {
  return Children.toArray(node).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    if (isValidElement<NodeProps>(child)) return textContent(child.props.children);
    return "";
  }).join(" ");
}

export function RecordsTable({ label, children }: { label: string; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const parts = Children.toArray(children);
  const body = parts.find((part) => isValidElement(part) && part.type === "tbody") as ReactElement<NodeProps> | undefined;
  const rows = Children.toArray(body?.props.children);
  const matches = rows.filter((row) => textContent(row).replace(/\s+/g, " ").toLowerCase().includes(query.trim().replace(/\s+/g, " ").toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(matches.length / 10));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = matches.slice(currentPage * 10, currentPage * 10 + 10);
  return (
    <div className="border-y border-ink/15">
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <label className="flex items-center gap-3 text-xs font-semibold">
          Search records
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={`Search ${label.toLowerCase()}`} className="min-h-10 w-48 rounded-md border border-ink/20 bg-transparent px-3 text-sm sm:w-64" />
        </label>
        <p role="status" className="text-xs text-ink/60">{matches.length} of {rows.length} loaded records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">{label}</caption>
          {parts.map((part) => part === body && body ? cloneElement(body, {}, visible) : part)}
        </table>
      </div>
      {matches.length === 0 && <p className="py-8 text-center text-sm text-ink/60">No records match your search.</p>}
      {pageCount > 1 && <nav aria-label={`${label} pages`} className="flex items-center justify-end gap-4 py-4 text-xs">
        <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="min-h-10 px-3 font-semibold disabled:opacity-40">Previous</button>
        <span>Page {currentPage + 1} of {pageCount}</span>
        <button type="button" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)} className="min-h-10 px-3 font-semibold disabled:opacity-40">Next</button>
      </nav>}
    </div>
  );
}
