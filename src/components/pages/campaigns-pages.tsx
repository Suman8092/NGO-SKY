import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  MessageCircleHeart,
  Quote,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import {
  Breadcrumbs,
  CheckList,
  CtaBand,
  PageHero,
  Pill,
  ProgressBar,
  SectionHeading,
  pageSurface,
} from "./page-primitives";

export type Campaign = {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  location: string;
  icon: LucideIcon;
  goal: number;
  raised: number;
  supporters: number;
  daysLeft: number;
  featured?: boolean;
  urgent?: boolean;
  story: string[];
  outcomes: string[];
  funding: Array<{ label: string; percent: number; detail: string }>;
  updates: Array<{ date: string; title: string; description: string }>;
  quote: { text: string; name: string; role: string };
};

export const campaigns: Campaign[] = [
  {
    slug: "classrooms-without-limits",
    category: "Education",
    title: "Classrooms Without Limits",
    shortDescription:
      "Bring safe learning spaces, trained mentors, and digital access to children in remote communities.",
    location: "Rural Karnataka",
    icon: BookOpen,
    goal: 2400000,
    raised: 1812000,
    supporters: 684,
    daysLeft: 21,
    featured: true,
    story: [
      "For many children in remote villages, the school day ends when transport fails, seasonal work begins, or a shared device is no longer available. The issue is not ambition. It is consistent access.",
      "Classrooms Without Limits turns existing community rooms into welcoming learning hubs. Local mentors provide after-school support, children can use a small offline-first digital library, and families receive help navigating scholarships and school systems.",
      "This phase will equip six hubs and train eighteen local mentors. Each hub is designed with its village education committee, creating a clear plan for local ownership from the start.",
    ],
    outcomes: [
      "Six community learning hubs equipped and opened",
      "420 children receive weekly learning support",
      "18 local mentors trained and paid fairly",
      "Family support for scholarships, attendance, and transitions",
    ],
    funding: [
      {
        label: "Learning spaces & equipment",
        percent: 42,
        detail:
          "Furniture, solar backup, learning kits, and offline digital libraries",
      },
      {
        label: "Mentors & programme delivery",
        percent: 34,
        detail: "Training, fair stipends, safeguarding, and teaching support",
      },
      {
        label: "Family engagement",
        percent: 14,
        detail: "Workshops, school navigation, and inclusion support",
      },
      {
        label: "Measurement & operations",
        percent: 10,
        detail: "Monitoring, audits, and essential programme coordination",
      },
    ],
    updates: [
      {
        date: "18 July 2026",
        title: "First mentor cohort selected",
        description:
          "Eighteen candidates nominated by village committees have begun safeguarding and learning-facilitation training.",
      },
      {
        date: "29 June 2026",
        title: "Hub designs approved",
        description:
          "Children, caregivers, and teachers reviewed layouts for all six spaces, including accessibility improvements.",
      },
    ],
    quote: {
      text: "I used to wait for my cousin’s phone to practise. At the hub, I can learn every day—and I help my younger brother too.",
      name: "Meera, 13",
      role: "Student and learning-hub member",
    },
  },
  {
    slug: "mobile-health-near-home",
    category: "Healthcare",
    title: "Healthcare, Closer to Home",
    shortDescription:
      "Help a mobile care team deliver screenings, maternal support, and trusted referrals in underserved settlements.",
    location: "Maharashtra",
    icon: HeartPulse,
    goal: 1800000,
    raised: 1098000,
    supporters: 391,
    daysLeft: 34,
    story: [
      "Distance, lost wages, and unclear referral systems can turn preventable conditions into emergencies.",
      "This mobile health partnership brings scheduled screening days close to home, then stays with patients through referrals and follow-up. Local health guides build trust and help families access public entitlements.",
      "Funds support clinical visits, diagnostics, maternal-health navigation, health-guide training, and a simple continuity-of-care record owned by each patient.",
    ],
    outcomes: [
      "3,200 preventive screenings",
      "600 maternal and child-health consultations",
      "24 local health guides trained",
      "Referral navigation through treatment completion",
    ],
    funding: [
      {
        label: "Clinical delivery",
        percent: 46,
        detail: "Qualified teams, essential diagnostics, and consumables",
      },
      {
        label: "Referral support",
        percent: 24,
        detail: "Navigation, transport assistance, and follow-up",
      },
      {
        label: "Local health guides",
        percent: 20,
        detail: "Training, stipends, and community sessions",
      },
      {
        label: "Safety & learning",
        percent: 10,
        detail: "Clinical quality, data protection, and evaluation",
      },
    ],
    updates: [
      {
        date: "12 July 2026",
        title: "Care route mapped",
        description:
          "Local health guides and public facilities agreed on referral routes for high-risk pregnancy and non-communicable disease care.",
      },
    ],
    quote: {
      text: "The health guide did not just give me an address. She called the hospital, came with me, and made sure I understood what happened next.",
      name: "Farida",
      role: "Programme participant",
    },
  },
  {
    slug: "community-kitchens-of-care",
    category: "Food security",
    title: "Community Kitchens of Care",
    shortDescription:
      "Fund nutritious meals today while supporting women-led kitchens that build income and resilience for tomorrow.",
    location: "Delhi NCR",
    icon: Utensils,
    goal: 1200000,
    raised: 1044000,
    supporters: 927,
    daysLeft: 12,
    urgent: true,
    story: [
      "A reliable meal creates more than relief: it creates the breathing room to attend school, recover from illness, or search for work.",
      "Women-led community kitchens prepare culturally familiar, nutritious food and direct it through neighbourhood partners to people facing acute food insecurity.",
      "The model pairs urgent meal support with food-safety certification, procurement skills, and paid pathways for kitchen members.",
    ],
    outcomes: [
      "75,000 balanced meals served",
      "Four women-led kitchens strengthened",
      "30 kitchen members gain certification and income",
      "Local suppliers prioritised wherever possible",
    ],
    funding: [
      {
        label: "Food & preparation",
        percent: 58,
        detail: "Fresh ingredients, cooking fuel, and safe packaging",
      },
      {
        label: "Kitchen livelihoods",
        percent: 22,
        detail: "Fair wages, training, and certification",
      },
      {
        label: "Delivery network",
        percent: 12,
        detail: "Neighbourhood distribution and safe transport",
      },
      {
        label: "Quality & operations",
        percent: 8,
        detail: "Nutrition review, food safety, and reporting",
      },
    ],
    updates: [
      {
        date: "25 July 2026",
        title: "Monsoon meal route expanded",
        description:
          "Two additional community points now receive evening meals after local partners identified an urgent access gap.",
      },
    ],
    quote: {
      text: "We know the families we cook for, and they know us. That trust helps us notice when someone needs more than a meal.",
      name: "Sunita Devi",
      role: "Kitchen collective member",
    },
  },
  {
    slug: "water-for-resilient-villages",
    category: "Climate resilience",
    title: "Water for Resilient Villages",
    shortDescription:
      "Restore local water systems and help farming families prepare for longer, less predictable dry seasons.",
    location: "Bundelkhand",
    icon: Droplets,
    goal: 3200000,
    raised: 1376000,
    supporters: 276,
    daysLeft: 47,
    story: [
      "Water stress shapes every part of village life—from time spent collecting water to school attendance, crop choices, health, and debt.",
      "The project combines water-source restoration, recharge structures, household water planning, and climate-smart agriculture with strong village water committees.",
      "Technical decisions are reviewed locally and water-access safeguards ensure that landless households and marginalised hamlets share in the benefit.",
    ],
    outcomes: [
      "Eight village water systems restored",
      "1,100 households improve year-round access",
      "140 farmers adopt lower-risk practices",
      "Village committees manage maintenance funds",
    ],
    funding: [
      {
        label: "Water infrastructure",
        percent: 55,
        detail: "Restoration, recharge, materials, and technical quality",
      },
      {
        label: "Farm resilience",
        percent: 19,
        detail: "Demonstrations, tools, and farmer learning groups",
      },
      {
        label: "Local governance",
        percent: 16,
        detail: "Water committees, inclusion planning, and maintenance systems",
      },
      {
        label: "Monitoring & operations",
        percent: 10,
        detail: "Seasonal measurement, audits, and coordination",
      },
    ],
    updates: [
      {
        date: "8 July 2026",
        title: "Pre-monsoon work complete",
        description:
          "Three recharge structures passed technical inspection before the first major rains.",
      },
    ],
    quote: {
      text: "We chose the work together, so everyone knows why it matters and who will maintain it after the project team leaves.",
      name: "Ramesh Patel",
      role: "Village water committee member",
    },
  },
  {
    slug: "green-livelihoods-for-women",
    category: "Livelihoods",
    title: "Green Livelihoods for Women",
    shortDescription:
      "Back women building climate-smart enterprises through skills, peer networks, and patient early-stage support.",
    location: "Odisha",
    icon: Leaf,
    goal: 2000000,
    raised: 840000,
    supporters: 213,
    daysLeft: 58,
    story: [
      "Women already hold deep knowledge of local materials, food systems, and repair economies, but often lack access to capital and markets.",
      "This project supports collective enterprises in sustainable products and services through practical business learning, safe mobility support, market testing, and peer mentorship.",
      "Funding is released in learning-linked stages so each collective can test demand without taking on harmful debt.",
    ],
    outcomes: [
      "120 women complete enterprise pathways",
      "12 collectives test green products or services",
      "Market and finance links built",
      "Care and mobility barriers addressed",
    ],
    funding: [
      {
        label: "Enterprise grants",
        percent: 38,
        detail: "Patient, staged capital for collective pilots",
      },
      {
        label: "Skills & mentoring",
        percent: 28,
        detail: "Business, technical, and digital capability",
      },
      {
        label: "Market access",
        percent: 20,
        detail: "Product testing, buyer links, and showcases",
      },
      {
        label: "Inclusion & operations",
        percent: 14,
        detail: "Mobility, care support, safeguards, and learning",
      },
    ],
    updates: [
      {
        date: "16 July 2026",
        title: "Product labs underway",
        description:
          "Five collectives completed their first customer interviews and are refining prototypes before receiving pilot grants.",
      },
    ],
    quote: {
      text: "The training did not tell us what business to start. It helped us test the idea we already had and make the numbers work.",
      name: "Laxmi Sahu",
      role: "Collective entrepreneur",
    },
  },
];

const formatCurrency = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = Math.round((campaign.raised / campaign.goal) * 100);
  const Icon = campaign.icon;
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[2rem] ${pageSurface}`}
    >
      <div className="relative flex min-h-52 items-end overflow-hidden bg-gradient-to-br from-teal-950 via-teal-800 to-cyan-700 p-7 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/15 bg-white/5"
        />
        <div
          aria-hidden="true"
          className="absolute right-7 top-7 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur"
        >
          <Icon className="h-8 w-8 text-teal-100" />
        </div>
        <div className="relative flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
            {campaign.category}
          </span>
          {campaign.urgent ? (
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-slate-950">
              Urgent
            </span>
          ) : null}
          {campaign.featured ? (
            <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-extrabold text-teal-950">
              Featured
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
          {campaign.location}
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">
          <Link
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            href={`/campaigns/${campaign.slug}`}
          >
            {campaign.title}
          </Link>
        </h2>
        <p className="mt-3 flex-1 leading-7 text-slate-600 dark:text-slate-300">
          {campaign.shortDescription}
        </p>
        <div className="mt-7">
          <ProgressBar label="Campaign funded" value={progress} />
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold text-slate-950 dark:text-white">
              {formatCurrency(campaign.raised)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              raised of {formatCurrency(campaign.goal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {campaign.daysLeft} days
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              remaining
            </p>
          </div>
        </div>
        <Link
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
          href={`/campaigns/${campaign.slug}`}
        >
          View campaign{" "}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

export function CampaignsPage({ category = "all" }: { category?: string }) {
  const totalRaised = campaigns.reduce(
    (sum, campaign) => sum + campaign.raised,
    0,
  );
  const totalSupporters = campaigns.reduce(
    (sum, campaign) => sum + campaign.supporters,
    0,
  );
  const categories = [
    { label: "All", value: "all" },
    { label: "Education", value: "education" },
    { label: "Healthcare", value: "healthcare" },
    { label: "Food security", value: "food-security" },
    { label: "Climate", value: "climate" },
    { label: "Livelihoods", value: "livelihoods" },
  ];
  const activeCategory = categories.some((item) => item.value === category)
    ? category
    : "all";
  const visibleCampaigns =
    activeCategory === "all"
      ? campaigns
      : campaigns.filter((campaign) =>
          campaign.category
            .toLowerCase()
            .includes(
              activeCategory === "food-security" ? "food" : activeCategory,
            ),
        );
  return (
    <main>
      <PageHero
        accent="amber"
        breadcrumbs={[{ label: "Campaigns" }]}
        description="Back practical, community-led work and follow the journey from first contribution to measurable outcome."
        eyebrow="Campaigns for change"
        primaryAction={{
          href: "#active-campaigns",
          label: "Explore live campaigns",
        }}
        secondaryAction={{ href: "/impact", label: "How we report impact" }}
        title={
          <>
            Choose the change you want to{" "}
            <span className="text-teal-700 dark:text-teal-300">
              move forward.
            </span>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] bg-teal-700 p-7 text-white shadow-xl">
            <CircleDollarSign
              aria-hidden="true"
              className="h-7 w-7 text-teal-200"
            />
            <p className="mt-8 text-3xl font-semibold">
              {formatCurrency(totalRaised)}
            </p>
            <p className="mt-1 text-sm text-teal-100">
              raised across live campaigns
            </p>
          </div>
          <div className={`rounded-[1.75rem] p-7 ${pageSurface}`}>
            <Users aria-hidden="true" className="h-7 w-7 text-amber-500" />
            <p className="mt-8 text-3xl font-semibold text-slate-950 dark:text-white">
              {totalSupporters.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              people choosing to act
            </p>
          </div>
          <div className={`rounded-[1.75rem] p-6 sm:col-span-2 ${pageSurface}`}>
            <div className="flex items-start gap-4">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-6 w-6 shrink-0 text-teal-700 dark:text-teal-300"
              />
              <div>
                <p className="font-bold text-slate-950 dark:text-white">
                  Clear goals. Visible progress.
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Every campaign explains what funds unlock, reports updates,
                  and closes with a learning summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageHero>

      <section
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
        id="active-campaigns"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            description="Select a cause, understand the plan, and give at the level that is right for you."
            eyebrow="Open for support"
            title="Live campaigns"
          />
          <nav
            aria-label="Campaign categories"
            className="flex flex-wrap gap-2"
          >
            {categories.map((item) => (
              <Link
                aria-current={
                  activeCategory === item.value ? "page" : undefined
                }
                className={`rounded-full border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${activeCategory === item.value ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}
                href={
                  item.value === "all"
                    ? "/campaigns"
                    : `/campaigns?category=${item.value}`
                }
                key={item.value}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCampaigns.map((campaign) => (
            <CampaignCard campaign={campaign} key={campaign.slug} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
          <SectionHeading
            description="We design campaign giving to be clear before you donate and accountable after you do."
            eyebrow="Your giving journey"
            title="Know what happens next"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: WalletCards,
                title: "Give securely",
                text: "Choose one-time or recurring support and receive a confirmation immediately.",
              },
              {
                icon: MessageCircleHeart,
                title: "Follow progress",
                text: "Campaign updates show milestones, changes, and what teams are learning.",
              },
              {
                icon: BadgeCheck,
                title: "See the outcome",
                text: "Completion summaries connect spending to delivery and real-world results.",
              },
            ].map((item, index) => (
              <article
                className={`rounded-[1.5rem] p-6 ${pageSurface}`}
                key={item.title}
              >
                <item.icon
                  aria-hidden="true"
                  className="h-6 w-6 text-teal-700 dark:text-teal-300"
                />
                <p className="mt-7 text-xs font-bold text-slate-400">
                  0{index + 1}
                </p>
                <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        description="Monthly support lets teams plan further ahead, respond faster, and protect the quality of long-term programmes."
        primaryAction={{
          href: "/donate?frequency=monthly",
          label: "Give monthly",
        }}
        title="Make steady progress possible."
      />
    </main>
  );
}

export function CampaignDetailPage({ campaign }: { campaign: Campaign }) {
  const progress = Math.round((campaign.raised / campaign.goal) * 100);
  const Icon = campaign.icon;
  const related = campaigns
    .filter((item) => item.slug !== campaign.slug)
    .slice(0, 2);

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-50 pb-20 pt-32 dark:border-white/10 dark:bg-slate-950 sm:pb-24 sm:pt-36">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-10 -z-10 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { href: "/campaigns", label: "Campaigns" },
              { label: campaign.title },
            ]}
          />
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>{campaign.category}</Pill>
                {campaign.urgent ? (
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-slate-950">
                    Urgent
                  </span>
                ) : null}
              </div>
              <div className="mt-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-700 text-white shadow-lg shadow-teal-900/20">
                <Icon aria-hidden="true" className="h-8 w-8" />
              </div>
              <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl">
                {campaign.title}
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                {campaign.shortDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4 text-teal-700 dark:text-teal-300"
                  />
                  {campaign.location}
                </span>
                <span className="flex items-center gap-2">
                  <Users
                    aria-hidden="true"
                    className="h-4 w-4 text-teal-700 dark:text-teal-300"
                  />
                  {campaign.supporters.toLocaleString("en-IN")} supporters
                </span>
                <span className="flex items-center gap-2">
                  <Clock3
                    aria-hidden="true"
                    className="h-4 w-4 text-teal-700 dark:text-teal-300"
                  />
                  {campaign.daysLeft} days left
                </span>
              </div>
            </div>
            <aside
              className={`rounded-[2rem] p-7 lg:sticky lg:top-28 ${pageSurface}`}
              aria-label="Campaign donation summary"
            >
              <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {formatCurrency(campaign.raised)}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                raised of {formatCurrency(campaign.goal)}
              </p>
              <div className="mt-6">
                <ProgressBar label="Campaign funded" value={progress} />
              </div>
              <Link
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                href={`/donate?campaign=${campaign.slug}`}
              >
                Support this campaign{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-500 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/10 dark:text-slate-200 dark:hover:text-teal-200"
                href={`mailto:?subject=${encodeURIComponent(`Support ${campaign.title}`)}&body=${encodeURIComponent(`I thought you might care about this Ashaaya Foundation campaign: /campaigns/${campaign.slug}`)}`}
              >
                <Share2 aria-hidden="true" className="h-4 w-4" />
                Share with a friend
              </a>
              <p className="mt-5 flex items-start gap-2 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300"
                />
                Secure giving and clear campaign reporting. Eligible donors
                receive tax documentation.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article>
            <SectionHeading
              eyebrow="Why this matters"
              title="The story behind the campaign"
            />
            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
              {campaign.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <figure className="my-12 rounded-[2rem] bg-teal-950 p-8 text-white sm:p-10">
              <Quote aria-hidden="true" className="h-8 w-8 text-teal-300" />
              <blockquote className="mt-6 text-pretty text-2xl font-semibold leading-9">
                “{campaign.quote.text}”
              </blockquote>
              <figcaption className="mt-6 text-sm text-slate-300">
                <span className="font-bold text-white">
                  {campaign.quote.name}
                </span>
                <span className="mx-2 text-slate-500">·</span>
                {campaign.quote.role}
              </figcaption>
            </figure>
            <SectionHeading
              eyebrow="What your support unlocks"
              title="Outcomes we are working toward"
            />
            <div className="mt-8">
              <CheckList items={campaign.outcomes} />
            </div>
          </article>
          <aside className="space-y-5">
            <div className={`rounded-[1.75rem] p-6 ${pageSurface}`}>
              <Sparkles aria-hidden="true" className="h-6 w-6 text-amber-500" />
              <h2 className="mt-6 text-lg font-bold text-slate-950 dark:text-white">
                Ways to help
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li>Give any amount securely</li>
                <li>Invite friends to support</li>
                <li>Ask your employer to match</li>
                <li>Fund a defined milestone</li>
              </ul>
            </div>
            <div className={`rounded-[1.75rem] p-6 ${pageSurface}`}>
              <BadgeCheck
                aria-hidden="true"
                className="h-6 w-6 text-teal-700 dark:text-teal-300"
              />
              <h2 className="mt-6 text-lg font-bold text-slate-950 dark:text-white">
                Campaign standards
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Safeguarding, responsible data, budget controls, partner checks,
                and community feedback are built into delivery.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <SectionHeading
              description="Campaign budgets include the people, safeguards, and learning needed to deliver responsibly—not only visible materials."
              eyebrow="Funding plan"
              title="Where the money goes"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {campaign.funding.map((item) => (
                <article
                  className={`rounded-[1.5rem] p-6 ${pageSurface}`}
                  key={item.label}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      {item.label}
                    </h3>
                    <span className="text-lg font-extrabold text-teal-700 dark:text-teal-300">
                      {item.percent}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <SectionHeading
              description="Updates appear when the team reaches a milestone, learns something important, or needs to explain a change."
              eyebrow="From the field"
              title="Campaign updates"
            />
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300"
              href="/contact"
            >
              Ask a question{" "}
              <MessageCircleHeart aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <ol className="space-y-4">
            {campaign.updates.map((update) => (
              <li
                className={`rounded-[1.5rem] p-6 ${pageSurface}`}
                key={update.date}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  {update.date}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                  {update.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  {update.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
                More ways to help
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Other campaigns you may care about
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-300"
              href="/campaigns"
            >
              View all campaigns{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {related.map((item) => (
              <CampaignCard campaign={item} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-800 dark:text-slate-300 dark:hover:text-teal-200"
          href="/campaigns"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to all campaigns
        </Link>
      </div>
      <CtaBand
        description={`Your contribution to ${campaign.title} joins a community committed to practical, accountable change.`}
        primaryAction={{
          href: `/donate?campaign=${campaign.slug}`,
          label: "Donate to this campaign",
        }}
        title="Help move this work forward."
      />
    </main>
  );
}
