import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Droplets,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Leaf,
  MapPin,
  Play,
  Quote,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Users,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Faq } from "@/components/home/faq";
import { GlobeLazy } from "@/components/home/globe-lazy";
import { Hero } from "@/components/home/hero";
import { DonationCalculator } from "@/components/home/donation-calculator";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";
import type { PublicPaymentReadiness } from "@/lib/payment-readiness";
import { getPublicPaymentReadiness } from "@/lib/server/public-payment-readiness";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const partners = [
  "JalSutra",
  "Nayi Disha",
  "Solis Health",
  "Kora Labs",
  "Northstar Relief",
  "Aarambh Trust",
];

const stats: {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    value: 148,
    suffix: "K+",
    label: "People reached",
    detail: "direct participants",
    icon: Users,
  },
  {
    value: 2400,
    suffix: "K",
    label: "Meals served",
    detail: "school and emergency meals",
    icon: Utensils,
  },
  {
    value: 186,
    suffix: "K",
    label: "Trees established",
    detail: "surviving two monsoons",
    icon: Sprout,
  },
  {
    value: 18,
    suffix: ".9K",
    label: "Children learning",
    detail: "with 75%+ attendance",
    icon: BookOpen,
  },
  {
    value: 12,
    suffix: ".6K",
    label: "Women earning more",
    detail: "sustained after six months",
    icon: HandHeart,
  },
  {
    value: 96,
    label: "Projects completed",
    detail: "with finance + outcome review",
    icon: BadgeCheck,
  },
];

const campaigns = [
  {
    slug: "water-for-resilient-villages",
    title: "Clean water, powered by sunlight",
    location: "Barmer, Rajasthan",
    image: "/images/campaign-water.png",
    alt: "Families gather at a new solar-powered community water station",
    category: "Water & health",
    raised: "₹36.4L",
    goal: "₹48L",
    progress: 76,
    days: 18,
  },
  {
    slug: "classrooms-without-limits",
    title: "Learning labs beyond the last mile",
    location: "Raichur, Karnataka",
    image: "/images/campaign-learning.png",
    alt: "Teacher and children build a small solar science project",
    category: "Education",
    raised: "₹22.8L",
    goal: "₹32L",
    progress: 71,
    days: 31,
  },
  {
    slug: "green-livelihoods-for-women",
    title: "Women growing climate-ready farms",
    location: "Wayanad, Kerala",
    image: "/images/campaign-farming.png",
    alt: "Women farmers inspect seedlings at a regenerative farming cooperative",
    category: "Livelihoods",
    raised: "₹18.2L",
    goal: "₹30L",
    progress: 61,
    days: 44,
  },
];

const programs: {
  title: string;
  description: string;
  number: string;
  icon: LucideIcon;
  href: string;
  className: string;
}[] = [
  {
    title: "Learning that travels",
    description:
      "Community classrooms, digital bridges, and mentor networks designed around each learner.",
    number: "01",
    icon: GraduationCap,
    href: "/programs#learning",
    className: "bg-[#dcece5] dark:bg-[#17334b]",
  },
  {
    title: "Care closer to home",
    description:
      "Mobile clinics and trusted health workers connecting families to timely primary care.",
    number: "02",
    icon: Stethoscope,
    href: "/programs#health",
    className: "bg-[#efe5d6] dark:bg-[#433324]",
  },
  {
    title: "Women-led livelihoods",
    description:
      "Capital, skills, and market access for enterprises that keep value inside communities.",
    number: "03",
    icon: HandHeart,
    href: "/programs#livelihoods",
    className: "bg-[#e5e2f2] dark:bg-[#2f2b4a]",
  },
  {
    title: "Living landscapes",
    description:
      "Native forests, resilient farms, clean water, and local stewardship of shared ecosystems.",
    number: "04",
    icon: Leaf,
    href: "/programs#climate",
    className: "bg-[#dbe9cf] dark:bg-[#29244b]",
  },
];

const locations = [
  ["Raichur", "Karnataka", "Learning · Health", "24,680 people"],
  ["Barmer", "Rajasthan", "Water · Livelihoods", "18,420 people"],
  ["Wayanad", "Kerala", "Climate · Enterprise", "11,730 people"],
  ["Dhemaji", "Assam", "Relief · Resilience", "8,900 people"],
] as const;

const events = [
  {
    date: "18",
    month: "AUG",
    title: "Field Notes: Rebuilding after the water recedes",
    type: "Online briefing",
    location: "Zoom · 18:30 IST",
  },
  {
    date: "06",
    month: "SEP",
    title: "Skymeredian Open House: Bengaluru",
    type: "Community gathering",
    location: "Indiranagar · 11:00 IST",
  },
  {
    date: "21",
    month: "SEP",
    title: "The Long Table: food, soil, and shared futures",
    type: "Benefit dinner",
    location: "Mumbai · 19:30 IST",
  },
];

export default function HomePage() {
  const clerkEnabled = isClerkConfigured();
  const paymentReadiness = getPublicPaymentReadiness();

  if (!isEditorialContentPublished()) {
    return (
      <ProductionHomePage
        clerkEnabled={clerkEnabled}
        paymentReadiness={paymentReadiness}
      />
    );
  }

  return (
    <>
      <SiteHeader clerkEnabled={clerkEnabled} editorialContentPublished />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <section
          className="relative overflow-hidden border-b border-ink/[0.07] bg-paper/60 py-8 backdrop-blur-sm dark:border-white/[0.07]"
          aria-label="Our partners and field collaborators"
        >
          <div className="page-shell mb-4 flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-ink/40">
              Trusted Field Collaborators & Institutional Partners
            </span>
            <span className="hidden items-center gap-1.5 text-[0.65rem] font-semibold tracking-wider text-forest/70 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-forest animate-pulse" />
              Verified Deployments
            </span>
          </div>
          <div className="mask-fade-x mx-auto max-w-[1440px] overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-16 px-7 motion-reduce:animate-none sm:gap-24">
              {[...partners, ...partners].map((partner, index) => (
                <span
                  key={`${partner}-${index}`}
                  className="group flex items-center gap-3 whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-[0.15em] text-ink/35 transition hover:text-forest dark:hover:text-[#91c4ff]"
                >
                  <span className="size-1 rounded-full bg-ink/20 group-hover:bg-forest transition" />
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-space relative overflow-hidden"
          aria-labelledby="belief-title"
        >
          <div
            aria-hidden="true"
            className="absolute -left-44 top-16 size-[30rem] rounded-full bg-moss/10 blur-[110px]"
          />
          <div className="page-shell relative grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-12">
            <Reveal>
              <div className="relative mx-auto max-w-[580px] lg:mx-0">
                <div className="relative aspect-[5/4] overflow-hidden rounded-lg">
                  <Image
                    src="/images/campaign-farming.png"
                    alt="Women farmers sharing knowledge beside a tray of new seedlings"
                    fill
                    sizes="(max-width: 1024px) 90vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081e33]/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 border-l-2 border-ember bg-[#081e33]/80 p-4 text-white">
                    <Quote
                      className="size-6 text-[#ff9f1c]"
                      aria-hidden="true"
                    />
                    <p className="mt-3 font-display text-lg font-semibold leading-7">
                      “The strongest solutions already live here. Our job is to
                      make room for them to lead.”
                    </p>
                    <p className="mt-3 text-xs text-white/50">
                      Meera Dev · Founding Director
                    </p>
                  </div>
                </div>
                <div className="absolute -right-5 top-10 hidden rounded-2xl border border-ink/10 bg-paper px-5 py-4 shadow-soft sm:block">
                  <strong className="font-display text-3xl text-forest">
                    14 years
                  </strong>
                  <span className="block text-xs text-ink/50">
                    of learning in the field
                  </span>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow">Our conviction</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2
                  id="belief-title"
                  className="display-title mt-6 text-balance"
                >
                  People closest to the problem are closest to the answer.
                </h2>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="prose-premium mt-7 max-w-2xl">
                  Skymeredian does not arrive with a ready-made solution. We listen,
                  fund local leadership, connect specialists when asked, and
                  stay long enough for progress to belong to the community.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      "01",
                      "Listen first",
                      "Every program begins with a paid community design process.",
                    ],
                    [
                      "02",
                      "Build for ownership",
                      "Local institutions lead delivery, data, and maintenance.",
                    ],
                    [
                      "03",
                      "Measure what matters",
                      "Outcomes and lived experience—not activity counts alone.",
                    ],
                    [
                      "04",
                      "Show the full picture",
                      "Budgets, setbacks, corrections, and results are published.",
                    ],
                  ].map(([num, title, detail]) => (
                    <div
                      key={title}
                      className="group border-t border-ink/20 py-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs font-extrabold tracking-wider text-forest/70 dark:text-[#91c4ff]">
                          {num}
                        </span>
                        <span className="size-1.5 rounded-full bg-forest/30 transition group-hover:bg-forest" />
                      </div>
                      <h3 className="mt-3 font-display text-base font-bold text-ink">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/60">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-forest transition hover:gap-3"
                >
                  How we work{" "}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="impact"
          className="section-space content-auto bg-mist/40 dark:bg-[#101f34]"
          aria-labelledby="impact-title"
        >
          <div className="page-shell">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <Reveal>
                <p className="eyebrow">Impact you can inspect</p>
                <h2
                  id="impact-title"
                  className="display-title mt-6 max-w-4xl text-balance"
                >
                  Every number should lead back to a person.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Link href="/impact" className="button-secondary">
                  Open impact dashboard{" "}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-ink/15 py-6 lg:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="py-2">
                  <dt className="text-sm font-medium text-ink/65">{stat.label}</dt>
                  <dd className="mt-2 font-display text-4xl font-semibold tracking-tight text-forest lg:text-5xl">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <p className="mt-2 text-xs leading-5 text-ink/55">{stat.detail}</p>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex items-center gap-2 text-xs text-ink/45">
              <ShieldCheck className="size-4 text-forest" aria-hidden="true" />{" "}
              Figures combine verified field logs, partner records, and
              quarterly outcome samples.
            </p>
          </div>
        </section>

        <section
          className="section-space content-auto"
          aria-labelledby="campaigns-title"
        >
          <div className="page-shell">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <p className="eyebrow">Fund something specific</p>
                <h2
                  id="campaigns-title"
                  className="display-title mt-6 max-w-3xl"
                >
                  Three urgent ideas, ready to move.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-forest"
                >
                  View all campaigns <ArrowRight className="size-4" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {campaigns.map((campaign, index) => (
                <Reveal key={campaign.slug} delay={index * 0.08}>
                  <article className="group relative flex flex-col justify-between overflow-hidden border-b border-ink/15">
                    <div>
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="relative block aspect-[16/11] overflow-hidden rounded-t-lg"
                      >
                        <Image
                          src={campaign.image}
                          alt={campaign.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06192d]/75 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="rounded-full border border-white/20 bg-paper/90 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink shadow-sm backdrop-blur-md dark:bg-[#07182b]/90 dark:text-white">
                            {campaign.category}
                          </span>
                        </div>
                        <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white text-[#091e32] shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-[#ff9f1c]">
                          <ArrowUpRight className="size-4" />
                        </span>
                      </Link>
                      <div className="p-7">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                          <MapPin
                            className="size-3.5 text-forest"
                            aria-hidden="true"
                          />
                          {campaign.location}
                        </p>
                        <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-ink transition group-hover:text-forest">
                          <Link href={`/campaigns/${campaign.slug}`}>
                            {campaign.title}
                          </Link>
                        </h3>
                      </div>
                    </div>
                    <div className="px-7 pb-7 pt-0">
                      <div className="flex items-end justify-between border-t border-ink/[0.06] pt-4 dark:border-white/[0.06]">
                        <p>
                          <strong className="font-display text-2xl font-bold text-ink">
                            {campaign.raised}
                          </strong>
                          <span className="ml-1 text-xs text-ink/45">
                            raised of {campaign.goal}
                          </span>
                        </p>
                        <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-extrabold text-forest dark:bg-forest/20 dark:text-[#91c4ff]">
                          {campaign.progress}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[0.06] dark:bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-forest via-moss to-ember"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="font-medium text-ink/50">
                          {campaign.days} days remaining
                        </span>
                        <Link
                          href="/contact?subject=campaign-support"
                          className="font-bold text-forest transition hover:underline"
                        >
                          Ask about support →
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-space content-auto"
          aria-labelledby="programs-title"
        >
          <div className="page-shell">
            <Reveal className="max-w-4xl">
              <p className="eyebrow">Connected work</p>
              <h2 id="programs-title" className="display-title mt-6">
                A good life is not a single-issue project.
              </h2>
              <p className="prose-premium mt-6 max-w-2xl">
                Learning changes when health, income, safety, and the local
                environment change with it. Our programs are designed to
                reinforce one another.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-x-10 gap-y-2 md:grid-cols-2">
              {programs.map((program, index) => {
                const Icon = program.icon;
                return (
                  <Reveal key={program.title} delay={index * 0.07}>
                    <Link
                      href={program.href}
                      className={`group relative flex min-h-[180px] flex-col justify-between border-t border-ink/20 py-5 transition-colors hover:border-forest`}
                    >
                      <div className="relative z-10 flex items-start justify-between">
                        <span className="text-xs font-semibold tracking-[0.12em] text-ink/50 dark:text-white/60">
                          Program {program.number}
                        </span>
                        <span className="text-forest">
                          <Icon className="size-6" />
                        </span>
                      </div>
                      <div className="relative z-10">
                        <h3 className="max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                          {program.title}
                        </h3>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
                          {program.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest transition group-hover:gap-3">
                          Explore program{" "}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link href="/programs" className="button-secondary">
                Explore all 10 program areas <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden bg-[#071b2e] py-20 text-white md:py-28"
          aria-labelledby="map-title"
        >
          <div
            aria-hidden="true"
            className="map-dots absolute inset-0 opacity-20"
          />
          <div className="page-shell relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Reveal>
                <p className="eyebrow text-[#91c4ff]">Live project map</p>
                <h2
                  id="map-title"
                  className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl"
                >
                  Rooted locally. Learning openly.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
                  Nine field clusters share methods and evidence across four
                  South Asian countries. Explore where teams are working today.
                </p>
              </Reveal>
              <div className="mt-9 grid gap-2 sm:grid-cols-2">
                {locations.map(([city, state, focus, reach]) => (
                  <Link
                    key={city}
                    href={`/impact?location=${city.toLowerCase()}`}
                    className="group border-t border-white/20 py-4 transition hover:border-[#91c4ff]/60"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold">
                        {city}, {state}
                      </h3>
                      <ArrowUpRight className="size-4 opacity-35 transition group-hover:opacity-100" />
                    </div>
                    <p className="mt-2 text-xs text-[#91c4ff]">{focus}</p>
                    <p className="mt-1 text-xs text-white/38">{reach}</p>
                  </Link>
                ))}
              </div>
            </div>
            <GlobeLazy />
          </div>
        </section>

        <section
          className="section-space content-auto"
          aria-labelledby="story-title"
        >
          <div className="page-shell grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
            <Reveal>
              <div className="group relative aspect-[16/10] overflow-hidden rounded-lg">
                <Image
                  src="/images/campaign-learning.png"
                  alt="Children and their teacher collaborating on a solar science model"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081a2e]/65 via-transparent to-transparent" />
                <button
                  type="button"
                  className="absolute left-6 top-6 grid size-14 place-items-center rounded-full bg-white text-[#091e32] shadow-xl transition hover:scale-105"
                  aria-label="Play Kavya's story"
                >
                  <Play className="ml-0.5 size-5 fill-current" />
                </button>
                <p className="absolute bottom-6 left-6 max-w-xs text-xs leading-5 text-white/60">
                  03:18 · Captions and transcript available
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">A story of agency</p>
              <h2
                id="story-title"
                className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl"
              >
                Kavya did not need “saving.” She needed a lab that stayed open.
              </h2>
              <blockquote className="mt-7 border-l-2 border-ember pl-6 text-lg leading-8 text-ink/66">
                “Before, science was something in the textbook. Now I can make
                it move—and I help the younger group make theirs.”
              </blockquote>
              <p className="mt-5 text-sm font-bold">
                Kavya, 14{" "}
                <span className="font-normal text-ink/45">
                  · Raichur learning lab
                </span>
              </p>
              <Link
                href="/stories/kavyas-lab"
                className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-forest"
              >
                Read Kavya’s story <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        <DonationCalculator paymentReadiness={paymentReadiness} />

        <section
          className="section-space content-auto"
          aria-labelledby="volunteer-title"
        >
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#f5d089] via-[#ecb95e] to-[#e0a13d] p-8 text-[#0a1c31] shadow-lift sm:p-12 md:p-16">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-32 size-[32rem] rounded-full border-[70px] border-white/25 blur-sm pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-white/20 blur-2xl pointer-events-none"
              />
              <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#0a1c31]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a1c31]">
                    <span className="size-2 rounded-full bg-[#0a1c31]" />
                    Bring what you know
                  </div>
                  <h2
                    id="volunteer-title"
                    className="mt-6 font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#0a1c31] sm:text-6xl lg:text-7xl"
                  >
                    Your time can become someone else’s turning point.
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-[#0a1c31]/80 sm:text-lg">
                    Mentor a learner, strengthen a data system, document a field
                    story, or join an emergency response roster. Both remote and
                    field placements are open.
                  </p>
                </div>
                <div className="flex flex-col gap-3.5 sm:flex-row lg:flex-col">
                  <Link
                    href="/volunteer"
                    className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-[#0a1c31] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[#122e47]"
                  >
                    Find your role <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/contact?subject=volunteering"
                    className="inline-flex min-h-13 items-center justify-center rounded-full border border-[#0a1c31]/25 bg-white/20 px-8 py-3.5 text-sm font-bold text-[#0a1c31] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/35"
                  >
                    Offer a skill
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section-space content-auto bg-mist/30 dark:bg-[#142034]"
          aria-labelledby="events-title"
        >
          <div className="page-shell">
            <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Gather with us</p>
                <h2 id="events-title" className="display-title mt-6">
                  Upcoming moments.
                </h2>
              </div>
              <Link href="/events" className="button-secondary">
                Full calendar <CalendarDays className="size-4" />
              </Link>
            </Reveal>
            <div className="mt-12 space-y-4">
              {events.map((event, index) => (
                <Reveal key={event.title} delay={index * 0.06}>
                  <Link
                    href="/events"
                    className="group relative flex flex-col justify-between gap-5 border-t border-ink/20 py-5 transition-colors hover:border-forest sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-5">
                      <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-forest/15 bg-forest/[0.08] text-forest dark:border-forest/25 dark:bg-forest/20 dark:text-[#91c4ff]">
                        <span className="font-display text-2xl font-bold leading-none">
                          {event.date}
                        </span>
                        <span className="mt-1 text-[0.62rem] font-extrabold uppercase tracking-widest opacity-80">
                          {event.month}
                        </span>
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink/60 dark:bg-white/10 dark:text-white/70">
                          {event.type}
                        </span>
                        <h3 className="mt-2 font-display text-xl font-bold text-ink transition group-hover:text-forest sm:text-2xl">
                          {event.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
                          <MapPin className="size-3 text-forest" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="grid size-12 place-items-center rounded-full border border-ink/15 bg-paper/60 text-ink transition duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-white dark:border-white/15 dark:bg-white/5">
                        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-space content-auto"
          aria-labelledby="faq-title"
        >
          <div className="page-shell grid gap-10 lg:grid-cols-[0.55fr_1fr] lg:gap-12">
            <Reveal>
              <p className="eyebrow">Clear answers</p>
              <h2 id="faq-title" className="display-title mt-6">
                Before you give.
              </h2>
              <p className="prose-premium mt-6">
                Trust deserves specifics. If your question is not here, our
                donor care team replies within one working day.
              </p>
              <Link href="/contact" className="button-secondary mt-8">
                Ask us directly <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <Faq />
            </Reveal>
          </div>
        </section>

        <section
          className="border-t border-ink/10 py-12"
          aria-label="Trust and recognition"
        >
          <div className="page-shell grid gap-6 text-center sm:grid-cols-3 sm:text-left">
            {[
              [
                ShieldCheck,
                "Independent audit",
                "Financial and program audit published annually",
              ],
              [
                Droplets,
                "1% for shared water",
                "Member of a community-led water pledge",
              ],
              [
                HeartPulse,
                "Safeguarding first",
                "Every person and partner trained and accountable",
              ],
            ].map(([Icon, title, detail]) => (
              <div
                key={title as string}
                className="flex items-center gap-4 rounded-2xl px-2 py-3 sm:px-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest/10 text-forest">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block font-display text-sm">
                    {title as string}
                  </strong>
                  <span className="mt-1 block text-xs leading-5 text-ink/45">
                    {detail as string}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ProductionStatusHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#07182b] px-5 pb-24 pt-40 text-white sm:pb-28 sm:pt-48">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-forest/30 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-52 left-1/4 size-[32rem] rounded-full bg-amber-400/10 blur-[130px]"
      />
      <div className="relative mx-auto max-w-5xl">
        <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#91c4ff]">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-9 text-xs font-extrabold uppercase tracking-[0.2em] text-[#91c4ff]">
          Production publication safeguard
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">
          Public information is awaiting verified release.
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
          Organisation claims, campaign details, identities, and figures stay
          private until their supporting records are approved. Each available
          online action reports its own current readiness.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#07182b]"
          >
            Check contact availability
          </Link>
          <Link
            href="/donate"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white"
          >
            Check donation availability
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductionDonationStatus({
  paymentReadiness,
}: {
  paymentReadiness: PublicPaymentReadiness;
}) {
  if (paymentReadiness.oneTimeProvider) {
    return <DonationCalculator paymentReadiness={paymentReadiness} />;
  }

  return (
    <section
      className="section-space bg-[#0b253b] text-white"
      aria-labelledby="production-donation-status"
    >
      <div className="page-shell">
        <ShieldCheck className="size-8 text-[#91c4ff]" aria-hidden="true" />
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-[#91c4ff]">
          Online giving status
        </p>
        <h2
          id="production-donation-status"
          className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
        >
          Online checkout is not active.
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58">
          No amount, pledge, or payment can be submitted until the launch flag,
          durable records, safe redirect origin, live provider, and signed
          webhook configuration are ready.
        </p>
        <Link
          href="/contact"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.07] px-5 text-sm font-bold text-white"
        >
          Check contact availability
        </Link>
      </div>
    </section>
  );
}

function ProductionHomePage({
  clerkEnabled,
  paymentReadiness,
}: {
  clerkEnabled: boolean;
  paymentReadiness: PublicPaymentReadiness;
}) {
  return (
    <>
      <SiteHeader
        clerkEnabled={clerkEnabled}
        editorialContentPublished={false}
      />
      <main id="main-content" tabIndex={-1}>
        <ProductionStatusHero />

        <section
          id="impact"
          className="section-space bg-paper"
          aria-labelledby="production-home-title"
        >
          <div className="page-shell">
            <p className="eyebrow">Production publication status</p>
            <h2
              id="production-home-title"
              className="display-title mt-6 max-w-4xl"
            >
              Verified organisation content is not published yet.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-ink/58">
              This deployment checks each public action separately. Campaigns,
              figures, stories, and organisation records remain unavailable
              until their source material is approved for publication.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {(
                [
                  [
                    BadgeCheck,
                    "Editorial review pending",
                    "Draft identities, claims, and figures are withheld from the production site.",
                  ],
                  [
                    HandHeart,
                    "Contact readiness",
                    "The contact form appears only when its managed storage and notification workflow is enabled.",
                  ],
                  [
                    ShieldCheck,
                    "Fail-closed services",
                    "Authentication and payments remain unavailable until every required production gate passes.",
                  ],
                ] as const
              ).map(([Icon, title, description]) => (
                <article
                  key={title}
                  className="border-t border-ink/15 py-6"
                >
                  <Icon className="size-6 text-forest" aria-hidden="true" />
                  <h3 className="mt-6 font-display text-xl font-bold">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink/52">
                    {description}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="button-primary min-h-11">
                Check contact availability
              </Link>
              <Link href="/donate" className="button-secondary min-h-11">
                Check donation availability
              </Link>
            </div>
          </div>
        </section>

        <ProductionDonationStatus paymentReadiness={paymentReadiness} />
      </main>
      <SiteFooter />
    </>
  );
}
