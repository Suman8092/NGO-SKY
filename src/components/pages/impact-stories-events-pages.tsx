import {
  ArrowRight,
  BarChart3,
  BookHeart,
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesCombined,
  CirclePlay,
  Clock3,
  Compass,
  Download,
  Footprints,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MapPin,
  MessageSquareQuote,
  Mic2,
  PartyPopper,
  RefreshCw,
  Salad,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

import {
  CheckList,
  CtaBand,
  IconCard,
  MetricGrid,
  PageHero,
  Pill,
  QuotePanel,
  SectionHeading,
  pageSurface,
} from "./page-primitives";

const impactMetrics = [
  {
    value: "28,640",
    label: "People reached",
    detail: "Across direct programmes and relief",
  },
  {
    value: "412K",
    label: "Nutritious meals",
    detail: "Prepared through local kitchens",
  },
  {
    value: "4,860",
    label: "Learners supported",
    detail: "Children and young adults",
  },
  {
    value: "1,920",
    label: "Women strengthened",
    detail: "Through collectives and livelihoods",
  },
];

const outcomes = [
  {
    icon: GraduationCap,
    value: "84%",
    title: "Learning continuity",
    description:
      "of regularly participating learners stayed engaged with school or a recognised learning pathway.",
  },
  {
    icon: HandCoins,
    value: "68%",
    title: "Income progression",
    description:
      "of livelihood graduates reported income growth or more reliable work within six months.",
  },
  {
    icon: Salad,
    value: "93%",
    title: "Meal reliability",
    description:
      "of scheduled community-kitchen meal days were completed despite seasonal disruptions.",
  },
  {
    icon: Leaf,
    value: "76%",
    title: "Climate practice uptake",
    description:
      "of participating farmers adopted at least two lower-risk water or soil practices.",
  },
];

const evidenceCycle = [
  {
    icon: Compass,
    title: "Define together",
    description:
      "Communities and teams agree on the outcome, starting point, and signs of meaningful progress.",
  },
  {
    icon: BarChart3,
    title: "Measure lightly",
    description:
      "We gather only useful data, using tools that respect people’s time, safety, and privacy.",
  },
  {
    icon: MessageSquareQuote,
    title: "Make sense locally",
    description:
      "Numbers are reviewed alongside lived experience and community feedback—not in isolation.",
  },
  {
    icon: RefreshCw,
    title: "Adapt openly",
    description:
      "Teams document changes, explain why they were made, and carry lessons into the next cycle.",
  },
];

export function ImpactPage() {
  return (
    <main>
      <PageHero
        accent="emerald"
        breadcrumbs={[{ label: "Our impact" }]}
        description="We measure progress to make better decisions, stay accountable to communities, and understand what is genuinely worth growing."
        eyebrow="Evidence with humanity"
        primaryAction={{
          href: "#impact-snapshot",
          label: "Explore the results",
        }}
        secondaryAction={{ href: "/campaigns", label: "Fund what works" }}
        title={
          <>
            Every number should answer a{" "}
            <span className="text-teal-700 dark:text-teal-300">
              human question.
            </span>
          </>
        }
      >
        <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
          />
          <ChartNoAxesCombined
            aria-hidden="true"
            className="relative h-9 w-9 text-teal-300"
          />
          <p className="relative mt-10 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
            2025–26 impact snapshot
          </p>
          <p className="relative mt-4 text-3xl font-semibold tracking-tight">
            Progress is stronger when communities can see it, question it, and
            shape what happens next.
          </p>
          <Link
            className="relative mt-8 inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            href="#methodology"
          >
            Read our measurement principles{" "}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </PageHero>

      <section
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
        id="impact-snapshot"
      >
        <SectionHeading
          align="center"
          description="These figures reflect verified programme records for the most recently completed reporting cycle; they are not estimates of indirect reach."
          eyebrow="At a glance"
          title="The scale of our shared work"
        />
        <div className="mt-12">
          <MetricGrid metrics={impactMetrics} />
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Reporting period: April 2025–March 2026. Figures are de-duplicated
          within programmes where reliable identifiers and consent allow.
        </p>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              description="Reach tells us how much we did. Outcomes tell us whether it mattered."
              eyebrow="Selected outcomes"
              title="Looking beyond activity"
            />
            <Pill>Reviewed on a defined follow-up cycle</Pill>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((outcome) => (
              <article
                className={`rounded-[1.75rem] p-7 ${pageSurface}`}
                key={outcome.title}
              >
                <outcome.icon
                  aria-hidden="true"
                  className="h-7 w-7 text-teal-700 dark:text-teal-300"
                />
                <p className="mt-8 text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white">
                  {outcome.value}
                </p>
                <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
                  {outcome.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {outcome.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
        id="methodology"
      >
        <div className="grid gap-14 lg:grid-cols-[.68fr_1.32fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              description="Our evidence cycle keeps decisions close to the people experiencing a programme—and keeps data collection proportionate to its use."
              eyebrow="How we learn"
              title="Rigorous enough to guide. Human enough to trust."
            />
            <div className="mt-8">
              <CheckList
                items={[
                  "Consent and purpose explained in plain language",
                  "No collection of sensitive data without a defined need",
                  "Disaggregation used to reveal exclusion, never to label people",
                  "Negative or mixed findings are documented, not hidden",
                ]}
              />
            </div>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2">
            {evidenceCycle.map((step, index) => (
              <li
                className={`rounded-[2rem] p-8 ${index === 0 || index === 3 ? "bg-teal-700 text-white shadow-xl shadow-teal-900/15" : pageSurface}`}
                key={step.title}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 || index === 3 ? "bg-white/10 text-teal-100" : "bg-teal-100 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300"}`}
                >
                  <step.icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <p
                  className={`mt-8 text-xs font-extrabold uppercase tracking-[0.16em] ${index === 0 || index === 3 ? "text-teal-200" : "text-teal-700 dark:text-teal-300"}`}
                >
                  Step 0{index + 1}
                </p>
                <h3
                  className={`mt-2 text-2xl font-bold ${index === 0 || index === 3 ? "text-white" : "text-slate-950 dark:text-white"}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-3 leading-7 ${index === 0 || index === 3 ? "text-teal-50" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-teal-950 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
                Learning in public
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                What did not go to plan matters too.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                During the last cycle, two training cohorts saw lower completion
                because care responsibilities and travel timing were not
                addressed early enough. Teams moved sessions closer to
                participants, added flexible practice hours, and funded shared
                care support.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-amber-300">−18%</p>
                  <p className="mt-1 text-xs text-slate-400">
                    initial completion gap
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-amber-300">3</p>
                  <p className="mt-1 text-xs text-slate-400">changes tested</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-amber-300">+14pt</p>
                  <p className="mt-1 text-xs text-slate-400">
                    completion recovery
                  </p>
                </div>
              </div>
            </div>
            <QuotePanel
              name="Programme Learning Council"
              quote="Transparency is not only publishing our successes. It is showing how evidence changed our mind—and what we did next."
              role="Quarterly review note"
            />
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20 lg:px-8 lg:py-28"
        id="financials"
      >
        <div
          className={`grid gap-10 rounded-[2.25rem] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center ${pageSurface}`}
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
              <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2 className="mt-7 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Read the complete annual impact review
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
              Explore programme-level results, methodology notes, governance
              practices, partner acknowledgements, and our priorities for the
              next cycle.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
              href="/contact?subject=impact-report"
            >
              Request the report{" "}
              <Download aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/15 dark:text-white"
              href="/contact?subject=data-question"
            >
              Ask about our data
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        description="Your support lets local teams plan carefully, test responsibly, and keep improving what they deliver."
        title="Help turn good intentions into lasting outcomes."
      />
    </main>
  );
}

const stories = [
  {
    category: "Education",
    title: "A room where questions belong",
    person: "Meera and the Kallur learning circle",
    location: "Karnataka",
    excerpt:
      "A shared learning hub gave Meera consistent access to books, a mentor, and something less visible: the confidence to ask for help.",
    outcome: "Now mentoring younger learners",
    icon: GraduationCap,
  },
  {
    category: "Livelihoods",
    title: "The business was already in their hands",
    person: "The Maa Tarini collective",
    location: "Odisha",
    excerpt:
      "Twelve women turned local leaf-craft knowledge into a tested product line—without taking on high-interest debt.",
    outcome: "12 steady income pathways",
    icon: HandCoins,
  },
  {
    category: "Health",
    title: "Care that completed the journey",
    person: "Farida and her health guide",
    location: "Maharashtra",
    excerpt:
      "A screening identified a risk. Referral navigation made sure distance, paperwork, and uncertainty did not stop treatment.",
    outcome: "Treatment completed",
    icon: HeartHandshake,
  },
  {
    category: "Climate",
    title: "Water decisions made together",
    person: "Bela village water committee",
    location: "Bundelkhand",
    excerpt:
      "Residents mapped water access house by house before choosing what to restore—and whose needs had been overlooked.",
    outcome: "Year-round access improving",
    icon: Leaf,
  },
  {
    category: "Food security",
    title: "More than a meal route",
    person: "Shakti community kitchen",
    location: "Delhi NCR",
    excerpt:
      "Kitchen members use their daily route to connect older adults and families to care beyond immediate food support.",
    outcome: "75,000 meals underway",
    icon: Salad,
  },
  {
    category: "Volunteering",
    title: "Two hours that became a year",
    person: "Kabir, learning volunteer",
    location: "Bengaluru",
    excerpt:
      "Kabir joined one weekend session. Careful training and a dependable schedule helped him become the mentor children could count on.",
    outcome: "48 sessions and counting",
    icon: Footprints,
  },
];

export function StoriesPage() {
  return (
    <main>
      <PageHero
        accent="amber"
        breadcrumbs={[{ label: "Stories" }]}
        description="Stories of courage, care, and everyday leadership—shared with consent and grounded in the wider systems people are working to change."
        eyebrow="Stories of possibility"
        primaryAction={{
          href: "#community-stories",
          label: "Meet the changemakers",
        }}
        secondaryAction={{ href: "/impact", label: "See the evidence" }}
        title={
          <>
            Change has a voice.{" "}
            <span className="text-teal-700 dark:text-teal-300">
              We are here to listen.
            </span>
          </>
        }
      >
        <QuotePanel
          name="Sunita Devi"
          quote="We are not waiting for someone to solve everything. We are building what our neighbourhood needs—and bringing others with us."
          role="Community kitchen collective member"
        />
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid overflow-hidden rounded-[2.25rem] bg-teal-950 text-white shadow-2xl lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative min-h-80 overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-950 p-8 sm:p-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 top-4 h-64 w-64 rounded-full border border-white/10 bg-white/5"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-10 left-10 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl"
            />
            <BookHeart
              aria-hidden="true"
              className="relative h-12 w-12 text-amber-300"
            />
            <p className="relative mt-32 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-200">
              Featured story · Education
            </p>
          </div>
          <article className="p-8 sm:p-12 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              Meera’s learning circle
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              The day learning stopped depending on a borrowed phone
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Meera had the questions and the determination. A
              community-designed learning hub gave her reliable tools, a trained
              mentor, and a safe place to learn alongside friends.
            </p>
            <p className="mt-5 leading-7 text-slate-400">
              Today, she is preparing for secondary school and helping younger
              children use the same offline library that opened a new world for
              her.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-teal-300 transition hover:text-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              href="/campaigns/classrooms-without-limits"
            >
              Support the learning hubs{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      <section
        className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28"
        id="community-stories"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="No single story represents an entire community. Together, these moments show what locally led progress can look like."
            eyebrow="From across our work"
            title="People moving possibility forward"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, index) => (
              <article
                className={`group flex flex-col rounded-[2rem] p-7 ${index === 1 || index === 5 ? "bg-teal-700 text-white shadow-xl shadow-teal-900/15" : pageSurface}`}
                key={story.title}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 1 || index === 5 ? "bg-white/10 text-teal-100" : "bg-teal-100 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300"}`}
                >
                  <story.icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <div
                  className={`mt-8 flex items-center gap-1.5 text-xs font-bold ${index === 1 || index === 5 ? "text-teal-200" : "text-teal-700 dark:text-teal-300"}`}
                >
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {story.location} · {story.category}
                </div>
                <h2
                  className={`mt-3 text-2xl font-bold tracking-tight ${index === 1 || index === 5 ? "text-white" : "text-slate-950 dark:text-white"}`}
                >
                  {story.title}
                </h2>
                <p
                  className={`mt-4 flex-1 leading-7 ${index === 1 || index === 5 ? "text-teal-50" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {story.excerpt}
                </p>
                <div
                  className={`mt-7 border-t pt-5 ${index === 1 || index === 5 ? "border-white/10" : "border-slate-200 dark:border-white/10"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.14em] ${index === 1 || index === 5 ? "text-amber-300" : "text-slate-400"}`}
                  >
                    {story.outcome}
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${index === 1 || index === 5 ? "text-white" : "text-slate-800 dark:text-slate-200"}`}
                  >
                    {story.person}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <SectionHeading
            description="People are never content. Our story practice is designed to protect dignity, agency, privacy, and the right to change one’s mind."
            eyebrow="Responsible storytelling"
            title="Shared with care, or not shared at all"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Informed consent",
                text: "Purpose, audience, format, and withdrawal options are explained clearly.",
              },
              {
                icon: Scale,
                title: "Power-aware",
                text: "Services never depend on agreeing to an interview, photograph, or quote.",
              },
              {
                icon: MessageSquareQuote,
                title: "Own words",
                text: "People review how their experience is represented before publication.",
              },
              {
                icon: Sparkles,
                title: "Whole humanity",
                text: "Stories centre capability and context—not trauma, pity, or a heroic outsider.",
              },
            ].map((item) => (
              <IconCard
                description={item.text}
                icon={item.icon}
                key={item.title}
                title={item.title}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        description="Your support helps more people access the tools, relationships, and opportunities to write what comes next."
        title="Be part of the next chapter."
      />
    </main>
  );
}

type EventItem = {
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  format: "In person" | "Online" | "Hybrid";
  href: string;
  featured?: boolean;
};

const upcomingEvents: EventItem[] = [
  {
    title: "The Long Table: Bengaluru",
    type: "Community gathering",
    date: "22 Aug 2026",
    time: "5:00–8:00 PM IST",
    location: "Bengaluru · Venue shared on registration",
    description:
      "An evening of food, field stories, and small-group conversations with community partners shaping Ashaaya’s next year.",
    format: "In person",
    href: "/contact?event=the-long-table",
    featured: true,
  },
  {
    title: "Measuring What Matters",
    type: "Open learning session",
    date: "5 Sep 2026",
    time: "4:00–5:15 PM IST",
    location: "Online",
    description:
      "A practical conversation on community-defined outcomes, responsible data, and learning when results are mixed.",
    format: "Online",
    href: "/contact?event=measuring-what-matters",
  },
  {
    title: "Steps for School",
    type: "Fundraising walk",
    date: "20 Sep 2026",
    time: "6:30–9:30 AM IST",
    location: "Cubbon Park, Bengaluru",
    description:
      "Walk five kilometres, meet volunteer mentors, and help equip the next two community learning hubs.",
    format: "In person",
    href: "/contact?event=steps-for-school",
  },
  {
    title: "Volunteer Discovery Hour",
    type: "Orientation",
    date: "3 Oct 2026",
    time: "11:00 AM–12:00 PM IST",
    location: "Online",
    description:
      "Learn about current roles, safeguarding, time commitments, and how we match skills with real programme needs.",
    format: "Online",
    href: "/volunteer#apply",
  },
];

const pastEvents = [
  {
    title: "Community Kitchens: Care in Practice",
    date: "June 2026",
    format: "Conversation",
    icon: Mic2,
  },
  {
    title: "Designing Accessible Learning Spaces",
    date: "May 2026",
    format: "Workshop",
    icon: Lightbulb,
  },
  {
    title: "Water, Work, and Climate Resilience",
    date: "March 2026",
    format: "Field forum",
    icon: Video,
  },
];

function EventCard({ event }: { event: EventItem }) {
  return (
    <article
      className={`grid overflow-hidden rounded-[2rem] ${event.featured ? "bg-teal-950 text-white shadow-2xl lg:grid-cols-[13rem_1fr]" : pageSurface}`}
    >
      <div
        className={`${event.featured ? "flex min-h-48 flex-col justify-between bg-gradient-to-br from-teal-700 to-teal-950 p-7" : "p-7 pb-0"}`}
      >
        <CalendarDays
          aria-hidden="true"
          className={`h-7 w-7 ${event.featured ? "text-amber-300" : "text-teal-700 dark:text-teal-300"}`}
        />
        <div className="mt-8">
          <p
            className={`text-xs font-bold uppercase tracking-[0.16em] ${event.featured ? "text-teal-200" : "text-teal-700 dark:text-teal-300"}`}
          >
            {event.type}
          </p>
          <p
            className={`mt-2 text-xl font-bold ${event.featured ? "text-white" : "text-slate-950 dark:text-white"}`}
          >
            {event.date}
          </p>
        </div>
      </div>
      <div className="flex flex-col p-7">
        <div className="flex flex-wrap gap-2">
          <Pill>{event.format}</Pill>
        </div>
        <h2
          className={`mt-4 text-2xl font-bold tracking-tight ${event.featured ? "text-white" : "text-slate-950 dark:text-white"}`}
        >
          {event.title}
        </h2>
        <p
          className={`mt-3 flex-1 leading-7 ${event.featured ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}
        >
          {event.description}
        </p>
        <div
          className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold ${event.featured ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}
        >
          <span className="flex items-center gap-1.5">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            {event.location}
          </span>
        </div>
        <Link
          className={`mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${event.featured ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950"}`}
          href={event.href}
        >
          Reserve your place{" "}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function EventsPage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Events" }]}
        description="Meet the people behind the work, learn something useful, and turn shared time into practical action."
        eyebrow="Gather, learn, act"
        primaryAction={{ href: "#upcoming-events", label: "Find an event" }}
        secondaryAction={{ href: "/volunteer", label: "Volunteer at an event" }}
        title={
          <>
            Come closer to the{" "}
            <span className="text-teal-700 dark:text-teal-300">change.</span>
          </>
        }
      >
        <div className={`rounded-[2rem] p-8 ${pageSurface}`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Next gathering
          </p>
          <div className="mt-6 flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
              <span className="text-xs font-bold uppercase">Aug</span>
              <span className="text-3xl font-extrabold leading-none">22</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-950 dark:text-white">
                The Long Table
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Bengaluru · 5:00 PM IST
              </p>
            </div>
          </div>
          <p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">
            An intimate evening with community partners, volunteers, and people
            curious about building change differently.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300"
            href="/contact?event=the-long-table"
          >
            View details <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </PageHero>

      <section
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
        id="upcoming-events"
      >
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            description="Free or pay-what-you-can unless noted. Registration helps us create safe, accessible, right-sized experiences."
            eyebrow="Save your place"
            title="Upcoming events"
          />
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300"
            href="/contact?subject=event-updates"
          >
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            Get event updates
          </Link>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {upcomingEvents.map((event) => (
            <EventCard event={event} key={event.title} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="Catch the key ideas from conversations and workshops you could not attend live."
            eyebrow="Past events"
            title="Keep the learning moving"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pastEvents.map((event) => (
              <article
                className={`rounded-[1.75rem] p-7 ${pageSurface}`}
                key={event.title}
              >
                <div className="flex items-center justify-between">
                  <event.icon
                    aria-hidden="true"
                    className="h-7 w-7 text-teal-700 dark:text-teal-300"
                  />
                  <span className="text-xs font-bold text-slate-400">
                    {event.date}
                  </span>
                </div>
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                  {event.format}
                </p>
                <h3 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
                  {event.title}
                </h3>
                <Link
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-teal-800 dark:text-slate-300 dark:hover:text-teal-200"
                  href="/contact?subject=event-resource"
                >
                  <CirclePlay aria-hidden="true" className="h-4 w-4" />
                  Request the recap
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              description="Ashaaya events are designed for participation, not passive audiences. We welcome community organisations, schools, workplaces, and thoughtful hosts."
              eyebrow="Create something together"
              title="Host, sponsor, or bring an event to your city"
            />
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
              href="/contact?interest=events"
            >
              Start a conversation{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <IconCard
              description="Bring a field-informed conversation or practical workshop to your team or network."
              icon={Mic2}
              title="Host a dialogue"
            />
            <IconCard
              description="Support venue access, accessibility, travel, materials, or a community fundraising experience."
              icon={PartyPopper}
              title="Sponsor thoughtfully"
            />
            <IconCard
              description="Offer facilitation, interpretation, photography, logistics, or participant care."
              icon={Users}
              title="Volunteer your skills"
            />
            <IconCard
              description="Co-create a gathering around a cause and community you already know deeply."
              icon={HeartHandshake}
              title="Partner locally"
            />
          </div>
        </div>
      </section>

      <CtaBand
        description="Choose a role that fits your time and skills, and help make every gathering welcoming, useful, and safe."
        primaryAction={{
          href: "/volunteer?interest=events",
          label: "Join the event crew",
        }}
        secondaryAction={{ href: "/contact", label: "Talk to our team" }}
        title="Good events need generous people behind the scenes."
      />
    </main>
  );
}
