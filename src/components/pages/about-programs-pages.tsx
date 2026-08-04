import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Eye,
  HandHeart,
  HeartPulse,
  Home,
  Leaf,
  PawPrint,
  Scale,
  Shield,
  Sparkles,
  Sprout,
  Target,
  Users,
  Utensils,
  Waves,
} from "lucide-react";
import Link from "next/link";

import {
  CheckList,
  CtaBand,
  IconCard,
  MetricGrid,
  PageHero,
  QuotePanel,
  SectionHeading,
  pageSurface,
} from "./page-primitives";

const values = [
  {
    icon: HandHeart,
    title: "Dignity first",
    description:
      "People are participants in their own progress—not case studies, beneficiaries, or numbers on a dashboard.",
  },
  {
    icon: Eye,
    title: "Radical clarity",
    description:
      "We share the decisions, costs, evidence, and lessons behind our work in language everyone can understand.",
  },
  {
    icon: Scale,
    title: "Local power",
    description:
      "Community leaders shape priorities, direct resources, and remain at the centre of every long-term solution.",
  },
  {
    icon: Sprout,
    title: "Built to last",
    description:
      "We design for resilience—strengthening local systems instead of creating permanent dependence.",
  },
];

const milestones = [
  {
    year: "2017",
    title: "Ashaaya begins",
    detail:
      "A neighbourhood learning circle becomes a registered public-interest initiative.",
  },
  {
    year: "2019",
    title: "Community councils launch",
    detail:
      "Residents gain a formal role in planning, reviewing, and improving every programme.",
  },
  {
    year: "2021",
    title: "Crisis response network",
    detail:
      "Local partners coordinate food, health access, and recovery support across vulnerable districts.",
  },
  {
    year: "2023",
    title: "Livelihoods at scale",
    detail:
      "Women-led collectives and youth skills pathways connect training directly to sustainable income.",
  },
  {
    year: "Today",
    title: "One connected mission",
    detail:
      "Education, health, livelihoods, and climate resilience now work as one community-owned system.",
  },
];

export function AboutPage() {
  return (
    <main>
      <PageHero
        accent="emerald"
        breadcrumbs={[{ label: "About us" }]}
        description="Ashaaya Foundation works alongside communities to remove the barriers that keep opportunity out of reach—and to build solutions that endure long after a project ends."
        eyebrow="About Ashaaya"
        primaryAction={{ href: "/impact", label: "See our impact" }}
        secondaryAction={{ href: "/contact", label: "Meet our team" }}
        title={
          <>
            Hope becomes powerful when it is{" "}
            <span className="text-teal-700 dark:text-teal-300">shared.</span>
          </>
        }
      >
        <div
          className={`relative overflow-hidden rounded-[2rem] p-8 sm:p-10 ${pageSurface}`}
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl"
          />
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Our promise
          </p>
          <p className="mt-5 text-pretty text-2xl font-semibold leading-9 tracking-tight text-slate-950 dark:text-white">
            Listen deeply. Act with care. Measure what changes. Stay until
            communities can lead the way.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-teal-700 dark:text-teal-300">
                28K+
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                people reached
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-teal-700 dark:text-teal-300">
                42
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                community partners
              </p>
            </div>
          </div>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <SectionHeading
            description="We imagine a future where a person’s postcode, income, gender, age, or identity never determines the life they are able to build."
            eyebrow="Mission & vision"
            title="Progress designed with people, not for them"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[2rem] bg-teal-700 p-8 text-white shadow-xl shadow-teal-900/15">
              <Target aria-hidden="true" className="h-8 w-8 text-teal-200" />
              <h3 className="mt-10 text-2xl font-bold">Our mission</h3>
              <p className="mt-4 leading-7 text-teal-50">
                To unite community knowledge, practical resources, and committed
                people around the barriers that matter most.
              </p>
            </article>
            <article className="rounded-[2rem] bg-amber-400 p-8 text-slate-950 shadow-xl shadow-amber-900/10 sm:translate-y-8">
              <Sparkles aria-hidden="true" className="h-8 w-8" />
              <h3 className="mt-10 text-2xl font-bold">Our vision</h3>
              <p className="mt-4 leading-7 text-slate-800">
                Thriving, resilient communities where dignity is protected and
                opportunity belongs to everyone.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="These principles guide who we partner with, how we spend, what we measure, and when we step back."
            eyebrow="How we show up"
            title="Values with practical consequences"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <IconCard
                description={value.description}
                icon={value.icon}
                key={value.title}
                title={value.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-center">
          <div>
            <SectionHeading
              description="A small act of care grew into an organisation built around local leadership and accountable partnership."
              eyebrow="Our journey"
              title="From one learning circle to a connected movement"
            />
            <QuotePanel
              name="Ananya Rao"
              quote="The strongest ideas were already in the community. Our job was to make sure they had room, resources, and trust to grow."
              role="Founder & Executive Director"
            />
          </div>
          <ol className="relative space-y-0 before:absolute before:bottom-8 before:left-[1.18rem] before:top-8 before:w-px before:bg-gradient-to-b before:from-teal-500 before:via-teal-200 before:to-transparent dark:before:via-teal-800">
            {milestones.map((milestone) => (
              <li
                className="relative grid grid-cols-[2.5rem_1fr] gap-5 pb-8 last:pb-0"
                key={milestone.year}
              >
                <span className="relative z-10 mt-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-teal-700 text-white shadow dark:border-slate-950">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
                <div className={`rounded-3xl p-6 ${pageSurface}`}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                    {milestone.year}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 leading-6 text-slate-600 dark:text-slate-300">
                    {milestone.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="scroll-mt-28 bg-teal-950 py-20 text-white lg:py-24"
        id="reports"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div className="scroll-mt-28" id="safeguarding">
              <SectionHeading
                description="Accountability is a daily practice, not a page in an annual report. Our safeguards apply to staff, partners, volunteers, and vendors."
                eyebrow="Governance"
                title="Trust is something we earn repeatedly"
                tone="inverse"
              />
            </div>
            <CheckList
              items={[
                "Independent board oversight and conflict-of-interest controls",
                "Community feedback channels with a clear escalation path",
                "Child protection, safeguarding, and responsible data standards",
                "Programme and financial reporting reviewed on a defined cycle",
              ]}
            />
          </div>
          <div className="mt-12">
            <MetricGrid
              columns={3}
              metrics={[
                { value: "100%", label: "Projects community-reviewed" },
                { value: "Quarterly", label: "Programme learning reviews" },
                { value: "Annual", label: "Independent financial review" },
              ]}
            />
          </div>
        </div>
      </section>

      <CtaBand
        description="Whether you give, volunteer, partner, or simply share an idea, you can help turn local possibility into lasting progress."
        title="There is a place for you in this work."
      />
    </main>
  );
}

const programmes = [
  {
    icon: BookOpen,
    title: "Education",
    description:
      "Learning support, school readiness, libraries, and digital access that help children stay curious and stay in school.",
    meta: "Children & youth",
  },
  {
    icon: HeartPulse,
    title: "Community health",
    description:
      "Prevention, screenings, maternal care, mental-health referrals, and navigation for families excluded from care.",
    meta: "Health access",
  },
  {
    icon: Users,
    title: "Women-led progress",
    description:
      "Rights awareness, collective enterprise, financial capability, and safe pathways to leadership and income.",
    meta: "Equity",
  },
  {
    icon: BriefcaseBusiness,
    title: "Skills & livelihoods",
    description:
      "Market-linked training, apprenticeships, career support, and small-business mentoring for dignified work.",
    meta: "Economic mobility",
  },
  {
    icon: Utensils,
    title: "Food security",
    description:
      "Nutritious meals, community kitchens, household food support, and locally owned nutrition solutions.",
    meta: "Nutrition",
  },
  {
    icon: Waves,
    title: "Disaster resilience",
    description:
      "Preparedness, rapid relief, recovery grants, and rebuilding support led with trusted local responders.",
    meta: "Emergency response",
  },
  {
    icon: Leaf,
    title: "Climate & environment",
    description:
      "Water security, climate-smart livelihoods, native planting, and community stewardship of shared resources.",
    meta: "Planet",
  },
  {
    icon: PawPrint,
    title: "Animal welfare",
    description:
      "Rescue networks, treatment access, humane care awareness, and support for community animal caregivers.",
    meta: "Care & coexistence",
  },
  {
    icon: Shield,
    title: "Child protection",
    description:
      "Safe spaces, prevention education, case referral, and stronger protection systems around every child.",
    meta: "Safety",
  },
  {
    icon: Home,
    title: "Ageing with dignity",
    description:
      "Social connection, essential care, entitlements support, and neighbourhood networks for older adults.",
    meta: "Senior care",
  },
];

const programmeAnchors: Record<string, string> = {
  Education: "learning",
  "Community health": "health",
  "Skills & livelihoods": "livelihoods",
  "Climate & environment": "climate",
};

const programmeModel = [
  {
    number: "01",
    title: "Listen",
    description:
      "Community consultations and local evidence define the real barrier—not an outside assumption.",
  },
  {
    number: "02",
    title: "Co-design",
    description:
      "Residents, frontline teams, and specialists agree on a practical route to measurable change.",
  },
  {
    number: "03",
    title: "Deliver",
    description:
      "Local partners lead implementation with simple tools, clear responsibilities, and adaptive support.",
  },
  {
    number: "04",
    title: "Learn & transfer",
    description:
      "We publish results, improve the model, and strengthen local ownership for the long term.",
  },
];

export function ProgramsPage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Programs" }]}
        description="Ten connected areas of work. One shared goal: make the systems around people more accessible, resilient, and fair."
        eyebrow="What we do"
        primaryAction={{ href: "/campaigns", label: "Fund a live project" }}
        secondaryAction={{ href: "/impact", label: "Explore the evidence" }}
        title={
          <>
            Whole-person support.{" "}
            <span className="text-teal-700 dark:text-teal-300">
              Community-wide change.
            </span>
          </>
        }
      >
        <div className="relative min-h-[23rem] overflow-hidden rounded-[2.25rem] bg-teal-950 p-8 text-white shadow-2xl">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
          />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
            The Ashaaya model
          </p>
          <p className="relative mt-5 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.035em]">
            Care becomes durable when every part of life can move forward
            together.
          </p>
          <div className="relative mt-10 grid grid-cols-2 gap-3">
            {[
              "Locally led",
              "Evidence guided",
              "Safeguarding first",
              "Built to transfer",
            ].map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-200 backdrop-blur"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <SectionHeading
          align="center"
          description="Every programme can stand on its own. Together, they address the overlapping realities that shape a family’s choices."
          eyebrow="Programme portfolio"
          title="Support for the moments that shape a life"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map((programme, index) => (
            <div
              className="scroll-mt-28"
              id={programmeAnchors[programme.title]}
              key={programme.title}
            >
              <IconCard
                accent={
                  index % 5 === 4
                    ? "amber"
                    : index % 3 === 0
                      ? "emerald"
                      : "teal"
                }
                description={programme.description}
                href={`/contact?interest=${encodeURIComponent(programme.title.toLowerCase())}`}
                icon={programme.icon}
                meta={programme.meta}
                title={programme.title}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden border-y border-slate-200/80 bg-slate-950 py-20 text-white dark:border-white/10 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
                How programmes work
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Built with communities, from first question to final handover
              </h2>
              <p className="mt-5 leading-7 text-slate-300">
                Our approach creates a visible line between what people say they
                need, what a project does, and what meaningfully changes.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {programmeModel.map((step) => (
                <li
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-7"
                  key={step.number}
                >
                  <span className="text-sm font-extrabold text-amber-300">
                    {step.number}
                  </span>
                  <h3 className="mt-8 text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <SectionHeading
              description="A programme is ready to grow only when it protects quality, remains affordable, and can be owned locally."
              eyebrow="What we measure"
              title="Beyond activity counts to meaningful outcomes"
            />
            <div className="mt-8">
              <CheckList
                items={[
                  "Access: who is reached—and who is still excluded",
                  "Quality: whether support is safe, useful, and consistent",
                  "Agency: how much choice and control people gain",
                  "Resilience: whether progress can withstand the next shock",
                  "Ownership: whether local people and systems can sustain the work",
                ]}
              />
            </div>
            <Link
              className="mt-9 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-300 dark:hover:text-teal-100"
              href="/impact"
            >
              Read our measurement approach{" "}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className={`rounded-[2rem] p-8 sm:p-10 ${pageSurface}`}>
            <Building2
              aria-hidden="true"
              className="h-9 w-9 text-teal-700 dark:text-teal-300"
            />
            <h3 className="mt-8 text-2xl font-bold text-slate-950 dark:text-white">
              Partner with our programmes
            </h3>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              We work with community organisations, public systems, responsible
              businesses, and specialists who share our standards.
            </p>
            <div className="mt-7">
              <CheckList
                items={[
                  "Co-funded community projects",
                  "Employee engagement and skills-based volunteering",
                  "Research, training, and implementation partnerships",
                ]}
              />
            </div>
            <Link
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
              href="/contact?interest=partnerships"
            >
              Start a partnership conversation
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        description="Choose a project close to your heart and see exactly what your support is helping make possible."
        title="Every programme begins with someone choosing to care."
      />
    </main>
  );
}
