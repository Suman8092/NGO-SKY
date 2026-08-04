import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const surface =
  "border border-slate-200/80 bg-white/85 shadow-[0_24px_80px_-40px_rgba(15,118,110,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75";

export type Accent = "teal" | "amber" | "emerald";

const accentStyles: Record<
  Accent,
  { glow: string; pill: string; icon: string }
> = {
  teal: {
    glow: "from-teal-500/20 via-cyan-400/10 to-transparent",
    pill: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200",
    icon: "bg-teal-600 text-white",
  },
  amber: {
    glow: "from-amber-400/25 via-orange-300/10 to-transparent",
    pill: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    icon: "bg-amber-500 text-slate-950",
  },
  emerald: {
    glow: "from-emerald-500/20 via-teal-300/10 to-transparent",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
    icon: "bg-emerald-600 text-white",
  },
};

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <li>
          <Link
            className="rounded-sm transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-teal-300"
            href="/"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li
            className="flex items-center gap-1.5"
            key={`${item.label}-${index}`}
          >
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            {item.href ? (
              <Link
                className="rounded-sm transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-teal-300"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="font-medium text-slate-800 dark:text-slate-200"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type HeroAction = { href: string; label: string };

export function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  accent = "teal",
  breadcrumbs,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  children?: ReactNode;
  accent?: Accent;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  const styles = accentStyles[accent];

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-slate-50 pb-20 pt-32 dark:border-white/10 dark:bg-slate-950 sm:pb-28 sm:pt-36">
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 -top-52 -z-10 mx-auto h-[34rem] max-w-5xl rounded-full bg-gradient-to-b ${styles.glow} blur-3xl`}
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full border border-teal-500/10 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.12),transparent_65%)]"
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div
          className={`grid gap-12 ${children ? "lg:grid-cols-[minmax(0,1.08fr)_minmax(21rem,.72fr)] lg:items-center" : "max-w-4xl"}`}
        >
          <div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles.pill}`}
            >
              {eyebrow}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
              {description}
            </p>
            {primaryAction || secondaryAction ? (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {primaryAction ? (
                  <Link
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                    href={primaryAction.href}
                  >
                    {primaryAction.label}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-teal-400 dark:hover:text-teal-200"
                    href={secondaryAction.href}
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
          {children ? <div>{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      {eyebrow ? (
        <p
          className={`text-xs font-extrabold uppercase tracking-[0.2em] ${tone === "inverse" ? "text-teal-300" : "text-teal-700 dark:text-teal-300"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl ${tone === "inverse" ? "text-white" : "text-slate-950 dark:text-white"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 text-pretty text-base leading-7 sm:text-lg ${tone === "inverse" ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function IconCard({
  icon: Icon,
  title,
  description,
  meta,
  href,
  accent = "teal",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
  href?: string;
  accent?: Accent;
}) {
  const content = (
    <>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentStyles[accent].icon} shadow-lg`}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      {meta ? (
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
          {meta}
        </p>
      ) : null}
      <h3
        className={`${meta ? "mt-2" : "mt-7"} text-xl font-bold tracking-tight text-slate-950 dark:text-white`}
      >
        {title}
      </h3>
      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {href ? (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300">
          Explore{" "}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      ) : null}
    </>
  );

  const classes = `group block h-full rounded-[1.75rem] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-38px_rgba(15,118,110,0.5)] ${surface}`;
  return href ? (
    <Link
      className={`${classes} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}
      href={href}
    >
      {content}
    </Link>
  ) : (
    <article className={classes}>{content}</article>
  );
}

export function MetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: Array<{ value: string; label: string; detail?: string }>;
  columns?: 3 | 4;
}) {
  return (
    <dl
      className={`grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900 ${columns === 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}
    >
      {metrics.map((metric, index) => (
        <div
          className={`p-7 sm:p-8 ${index > 0 ? "border-t border-slate-200 dark:border-white/10 sm:border-l sm:border-t-0" : ""} ${columns === 4 && index === 2 ? "sm:border-l-0 lg:border-l" : ""}`}
          key={metric.label}
        >
          <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {metric.label}
          </dt>
          <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
            {metric.value}
          </dd>
          {metric.detail ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {metric.detail}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div
        aria-label={`${label}: ${safeValue}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-700 via-teal-500 to-amber-400"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export function QuotePanel({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="font-serif text-7xl leading-none text-teal-300"
      >
        “
      </span>
      <blockquote className="relative -mt-3 text-pretty text-xl font-medium leading-8 sm:text-2xl">
        {quote}
      </blockquote>
      <figcaption className="mt-7 border-t border-white/10 pt-5">
        <p className="font-bold">{name}</p>
        <p className="mt-1 text-sm text-slate-400">{role}</p>
      </figcaption>
    </figure>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          className="flex gap-3 text-slate-700 dark:text-slate-300"
          key={item}
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span className="leading-6">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CtaBand({
  eyebrow = "Take the next step",
  title,
  description,
  primaryAction = { href: "/donate", label: "Make a donation" },
  secondaryAction = { href: "/volunteer", label: "Volunteer with us" },
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-slate-950 px-7 py-12 text-white shadow-2xl sm:px-12 lg:px-16 lg:py-16">
        <div
          aria-hidden="true"
          className="absolute -left-28 -top-32 -z-10 h-80 w-80 rounded-full bg-teal-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-8 -z-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
              <HeartHandshake aria-hidden="true" className="h-4 w-4" />
              {eyebrow}
            </div>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-pretty leading-7 text-slate-300 sm:text-lg">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              href={primaryAction.href}
            >
              {primaryAction.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              href={secondaryAction.href}
            >
              {secondaryAction.label}
            </Link>
          </div>
        </div>
        <div className="mt-9 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-teal-300" />
          Responsible stewardship · Secure giving · Transparent reporting
        </div>
      </div>
    </section>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      {children}
    </span>
  );
}

export const pageSurface = surface;
