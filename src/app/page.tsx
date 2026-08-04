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

import { EmergencyBanner } from "@/components/home/emergency-banner";
import { Faq } from "@/components/home/faq";
import { GlobeLazy } from "@/components/home/globe-lazy";
import { Hero } from "@/components/home/hero";
import { DonationCalculator } from "@/components/home/donation-calculator";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
    className: "bg-[#dcece5] dark:bg-[#173c33]",
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
    className: "bg-[#dbe9cf] dark:bg-[#293c24]",
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
    title: "Ashaaya Open House: Bengaluru",
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
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <section
          className="overflow-hidden border-b border-ink/10 bg-paper py-7"
          aria-label="Our partners"
        >
          <div className="mask-fade-x mx-auto max-w-[1440px] overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-14 px-7 motion-reduce:animate-none sm:gap-20">
              {[...partners, ...partners].map((partner, index) => (
                <span
                  key={`${partner}-${index}`}
                  className="whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-[0.12em] text-ink/32"
                >
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
          <div className="page-shell relative grid gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-24">
            <Reveal>
              <div className="relative mx-auto max-w-[580px] lg:mx-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] shadow-lift">
                  <Image
                    src="/images/campaign-farming.png"
                    alt="Women farmers sharing knowledge beside a tray of new seedlings"
                    fill
                    sizes="(max-width: 1024px) 90vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08241e]/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/20 bg-[#08241e]/70 p-5 text-white backdrop-blur-xl">
                    <Quote
                      className="size-6 text-[#f3bd67]"
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
                  Ashaaya does not arrive with a ready-made solution. We listen,
                  fund local leadership, connect specialists when asked, and
                  stay long enough for progress to belong to the community.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      "Listen first",
                      "Every program begins with a paid community design process.",
                    ],
                    [
                      "Build for ownership",
                      "Local institutions lead delivery, data, and maintenance.",
                    ],
                    [
                      "Measure what matters",
                      "Outcomes and lived experience—not activity counts alone.",
                    ],
                    [
                      "Show the full picture",
                      "Budgets, setbacks, corrections, and results are published.",
                    ],
                  ].map(([title, detail]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-ink/10 bg-white/35 p-5 dark:bg-white/[0.035]"
                    >
                      <h3 className="font-display text-base font-bold">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ink/55">
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
          className="section-space content-auto bg-[#e8efe9] dark:bg-[#10251f]"
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
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Reveal key={stat.label} delay={index * 0.06}>
                    <article
                      className={`card-hover min-h-[230px] rounded-4xl border border-white/65 bg-paper p-6 shadow-soft sm:p-7 ${index === 0 ? "lg:col-span-2 lg:grid lg:grid-cols-[1fr_auto]" : ""}`}
                    >
                      <div>
                        <div className="grid size-11 place-items-center rounded-2xl bg-forest/10 text-forest">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <p className="mt-7 font-display text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
                          <Counter value={stat.value} suffix={stat.suffix} />
                        </p>
                        <h3 className="mt-3 font-display text-lg font-bold">
                          {stat.label}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-ink/45">
                          {stat.detail}
                        </p>
                      </div>
                      {index === 0 ? (
                        <div className="mt-6 flex items-end lg:mt-0">
                          <div className="rounded-2xl bg-forest p-4 text-white dark:text-[#071813]">
                            <p className="text-[0.6rem] font-bold uppercase tracking-wider opacity-60">
                              Latest verification
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              31 July 2026
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  </Reveal>
                );
              })}
            </div>
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
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {campaigns.map((campaign, index) => (
                <Reveal key={campaign.slug} delay={index * 0.08}>
                  <article className="card-hover group overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-soft">
                    <Link
                      href={`/campaigns/${campaign.slug}`}
                      className="relative block aspect-[4/3] overflow-hidden"
                    >
                      <Image
                        src={campaign.image}
                        alt={campaign.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071c18]/70 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink backdrop-blur-lg">
                        {campaign.category}
                      </span>
                      <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white text-[#09231e] transition group-hover:rotate-12">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </Link>
                    <div className="p-6">
                      <p className="flex items-center gap-1.5 text-xs text-ink/45">
                        <MapPin
                          className="size-3.5 text-forest"
                          aria-hidden="true"
                        />
                        {campaign.location}
                      </p>
                      <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight">
                        <Link href={`/campaigns/${campaign.slug}`}>
                          {campaign.title}
                        </Link>
                      </h3>
                      <div className="mt-6 flex items-end justify-between">
                        <p>
                          <strong className="font-display text-xl">
                            {campaign.raised}
                          </strong>
                          <span className="ml-1 text-xs text-ink/42">
                            raised of {campaign.goal}
                          </span>
                        </p>
                        <span className="text-xs font-bold text-forest">
                          {campaign.progress}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-forest to-moss"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-ink/45">
                          {campaign.days} days left
                        </span>
                        <Link
                          href={`/donate?campaign=${campaign.slug}`}
                          className="text-xs font-extrabold text-forest"
                        >
                          Donate now
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <EmergencyBanner />

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
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {programs.map((program, index) => {
                const Icon = program.icon;
                return (
                  <Reveal key={program.title} delay={index * 0.07}>
                    <Link
                      href={program.href}
                      className={`${program.className} group flex min-h-[320px] flex-col justify-between rounded-[2.3rem] p-7 transition duration-500 hover:-translate-y-1 sm:p-9`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-extrabold tracking-[0.16em] text-ink/40">
                          {program.number}
                        </span>
                        <span className="grid size-12 place-items-center rounded-full bg-paper/60 text-forest">
                          <Icon className="size-5" />
                        </span>
                      </div>
                      <div>
                        <h3 className="max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">
                          {program.title}
                        </h3>
                        <p className="mt-4 max-w-md text-sm leading-7 text-ink/58">
                          {program.description}
                        </p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-forest">
                          Explore program{" "}
                          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
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
          className="relative overflow-hidden bg-[#071f1b] py-20 text-white md:py-28"
          aria-labelledby="map-title"
        >
          <div
            aria-hidden="true"
            className="map-dots absolute inset-0 opacity-20"
          />
          <div className="page-shell relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Reveal>
                <p className="eyebrow text-[#70d5b3]">Live project map</p>
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
                    className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-[#70d5b3]/35 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold">
                        {city}, {state}
                      </h3>
                      <ArrowUpRight className="size-4 opacity-35 transition group-hover:opacity-100" />
                    </div>
                    <p className="mt-2 text-xs text-[#70d5b3]">{focus}</p>
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
              <div className="group relative aspect-[16/11] overflow-hidden rounded-[2.7rem] shadow-lift">
                <Image
                  src="/images/campaign-learning.png"
                  alt="Children and their teacher collaborating on a solar science model"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081f1a]/65 via-transparent to-transparent" />
                <button
                  type="button"
                  className="absolute left-6 top-6 grid size-14 place-items-center rounded-full bg-white text-[#09231e] shadow-xl transition hover:scale-105"
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

        <DonationCalculator />

        <section
          className="section-space content-auto"
          aria-labelledby="volunteer-title"
        >
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-[2.7rem] bg-[#f0c16d] px-6 py-12 text-[#17231f] sm:px-10 md:py-16 lg:px-16">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-32 size-[28rem] rounded-full border-[80px] border-white/20"
              />
              <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
                <div className="max-w-3xl">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-50">
                    Bring what you know
                  </p>
                  <h2
                    id="volunteer-title"
                    className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl"
                  >
                    Your time can become someone else’s turning point.
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-7 opacity-65">
                    Mentor a learner, strengthen a data system, document a field
                    story, or join an emergency response roster. Remote and
                    field roles are open.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/volunteer"
                    className="button-primary bg-[#102d26]"
                  >
                    Find your role <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/contact?subject=skills"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#17231f]/20 px-6 text-sm font-bold transition hover:bg-white/20"
                  >
                    Offer a skill
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section-space content-auto bg-[#ece9df] dark:bg-[#142520]"
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
            <div className="mt-10 divide-y divide-ink/12 border-y border-ink/12">
              {events.map((event, index) => (
                <Reveal key={event.title} delay={index * 0.06}>
                  <Link
                    href="/events"
                    className="group grid gap-5 py-7 transition hover:pl-2 sm:grid-cols-[110px_1fr_auto] sm:items-center"
                  >
                    <div className="flex items-baseline gap-2 sm:block">
                      <span className="font-display text-4xl font-semibold">
                        {event.date}
                      </span>
                      <span className="text-[0.65rem] font-extrabold tracking-[0.17em] text-forest sm:ml-2">
                        {event.month}
                      </span>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/40">
                        {event.type}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-xs text-ink/45">
                        {event.location}
                      </p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-full border border-ink/15 transition group-hover:bg-forest group-hover:text-white">
                      <ArrowUpRight className="size-4" />
                    </span>
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
          <div className="page-shell grid gap-10 lg:grid-cols-[0.55fr_1fr] lg:gap-24">
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
