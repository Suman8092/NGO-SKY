import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  Clock3,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ContactForm, DonationForm, VolunteerForm } from "./action-forms";
import { campaigns } from "./campaigns-pages";
import {
  CheckList,
  IconCard,
  MetricGrid,
  PageHero,
  SectionHeading,
  pageSurface,
} from "./page-primitives";

const volunteerRoles = [
  {
    icon: GraduationCap,
    title: "Learning mentor",
    meta: "3–4 hours / week",
    description:
      "Support a consistent small group of learners with training, session plans, and an experienced programme lead beside you.",
  },
  {
    icon: CalendarDays,
    title: "Event crew",
    meta: "Event-based",
    description:
      "Help welcome participants, coordinate access, manage materials, document learning, or make a fundraising event run beautifully.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Skills partner",
    meta: "Project-based",
    description:
      "Contribute focused expertise in design, technology, finance, legal, communications, research, health, or organisational learning.",
  },
  {
    icon: HandHeart,
    title: "Community support",
    meta: "Flexible",
    description:
      "Work alongside local teams on outreach, distribution, programme logistics, language access, or neighbourhood care networks.",
  },
];

const volunteerSteps = [
  {
    number: "01",
    title: "Tell us about you",
    description:
      "Share your interests, availability, skills, and what a meaningful role would look like.",
  },
  {
    number: "02",
    title: "Explore the fit",
    description:
      "A short conversation helps us match real programme needs with your strengths and boundaries.",
  },
  {
    number: "03",
    title: "Prepare with care",
    description:
      "Role-specific orientation covers safeguarding, conduct, context, and the support available to you.",
  },
  {
    number: "04",
    title: "Begin & reflect",
    description:
      "You start with a clear point of contact, regular check-ins, and space to learn from the experience.",
  },
];

export function VolunteerPage({
  initialInterest,
}: {
  initialInterest?: string;
}) {
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Volunteer" }]}
        description="Bring your time, care, and capability to work that communities have already said matters—and receive the support to contribute well."
        eyebrow="Volunteer with Ashaaya"
        primaryAction={{ href: "#roles", label: "Explore open roles" }}
        secondaryAction={{ href: "#apply", label: "Apply now" }}
        title={
          <>
            Your time can become someone’s{" "}
            <span className="text-teal-700 dark:text-teal-300">
              turning point.
            </span>
          </>
        }
      >
        <div className={`rounded-[2rem] p-8 ${pageSurface}`}>
          <HeartHandshake
            aria-hidden="true"
            className="h-10 w-10 text-teal-700 dark:text-teal-300"
          />
          <p className="mt-8 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Volunteer roles are designed around reliability, respect, and real
            programme need.
          </p>
          <div className="mt-8">
            <MetricGrid
              columns={3}
              metrics={[
                { value: "460+", label: "Active volunteers" },
                { value: "18K", label: "Hours shared" },
                { value: "92%", label: "Would recommend" },
              ]}
            />
          </div>
        </div>
      </PageHero>

      <section
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28"
        id="roles"
      >
        <SectionHeading
          align="center"
          description="Choose a starting point. The discovery conversation will help refine the role, location, and commitment."
          eyebrow="Current pathways"
          title="Find a way to contribute that fits"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {volunteerRoles.map((role) => (
            <IconCard
              description={role.description}
              icon={role.icon}
              key={role.title}
              meta={role.meta}
              title={role.title}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <SectionHeading
                description="A thoughtful match protects communities, makes your contribution useful, and gives volunteers a better experience."
                eyebrow="Your journey"
                title="Clear from the first hello"
              />
              <div className="mt-8">
                <CheckList
                  items={[
                    "No fee to apply or volunteer",
                    "Accessible role adjustments available",
                    "Travel or expense policy shared before you commit",
                    "You can pause or step away without guilt",
                  ]}
                />
              </div>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {volunteerSteps.map((step) => (
                <li
                  className={`rounded-[1.75rem] p-7 ${pageSurface}`}
                  key={step.number}
                >
                  <p className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                    {step.number}
                  </p>
                  <h3 className="mt-7 text-xl font-bold text-slate-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_.95fr] lg:items-center">
          <div>
            <SectionHeading
              description="You do not need a perfect résumé. You do need the willingness to listen, keep commitments, respect boundaries, and learn."
              eyebrow="What to expect"
              title="Care is a skill we practise together"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <IconCard
                description="Practical context, safeguarding, and role preparation before you begin."
                icon={BadgeCheck}
                title="Good orientation"
              />
              <IconCard
                description="A named point of contact, check-ins, and help when something feels unclear."
                icon={LifeBuoy}
                title="Real support"
              />
              <IconCard
                description="Opportunities to reflect with peers and understand the wider programme."
                icon={Users}
                title="Community of practice"
              />
              <IconCard
                description="Honest feedback and recognition of the time and care you contribute."
                icon={Sparkles}
                title="Mutual growth"
              />
            </div>
          </div>
          <aside className="rounded-[2rem] bg-teal-950 p-8 text-white shadow-2xl sm:p-10">
            <ShieldCheck aria-hidden="true" className="h-9 w-9 text-teal-300" />
            <h3 className="mt-8 text-2xl font-bold">
              Safeguarding is everyone’s responsibility
            </h3>
            <p className="mt-4 leading-7 text-slate-300">
              Roles involving children or adults at risk follow additional
              screening, training, supervision, and conduct requirements. These
              steps protect communities and volunteers alike.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-amber-300"
              href="/contact?subject=Safeguarding concern"
            >
              Ask a safeguarding question{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      <section
        className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-28"
        id="apply"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
          <div>
            <SectionHeading
              description="This takes around five minutes. Share only what you are comfortable sharing at this stage."
              eyebrow="Register your interest"
              title="Let’s find your place in the work"
            />
            <div className={`mt-8 rounded-[1.75rem] p-6 ${pageSurface}`}>
              <p className="font-bold text-slate-950 dark:text-white">
                What happens after you apply?
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                We review interest weekly. If an available role looks aligned,
                we will invite you to a discovery conversation. If there is no
                current match, you can opt to stay in the volunteer pool.
              </p>
            </div>
          </div>
          <div className={`rounded-[2rem] p-7 sm:p-10 ${pageSurface}`}>
            <VolunteerForm initialInterest={initialInterest} />
          </div>
        </div>
      </section>
    </main>
  );
}

const contactOptions = [
  {
    icon: MessageCircle,
    title: "General enquiries",
    detail: "hello@ashaaya.org",
    href: "mailto:hello@ashaaya.org",
  },
  {
    icon: CircleDollarSign,
    title: "Donations & receipts",
    detail: "giving@ashaaya.org",
    href: "mailto:giving@ashaaya.org",
  },
  {
    icon: Building2,
    title: "Partnerships",
    detail: "partners@ashaaya.org",
    href: "mailto:partners@ashaaya.org",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding",
    detail: "safeguarding@ashaaya.org",
    href: "mailto:safeguarding@ashaaya.org",
  },
];

const subjectMap: Record<string, string> = {
  partnerships: "Partnerships",
  "donations-receipts": "Donations & receipts",
  volunteering: "Volunteering",
  events: "Events",
  media: "Media & speaking",
  safeguarding: "Safeguarding concern",
  accessibility: "Accessibility",
  "impact-report": "Impact report",
};

export function ContactPage({ subject }: { subject?: string }) {
  const initialSubject =
    subjectMap[(subject ?? "").toLowerCase()] ?? "General enquiry";
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Contact" }]}
        description="Ask a question, share an idea, request support, or start a partnership conversation. We will make sure your message reaches a real person."
        eyebrow="We are listening"
        title={
          <>
            A good conversation can be the start of{" "}
            <span className="text-teal-700 dark:text-teal-300">
              meaningful change.
            </span>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {contactOptions.map((option) => (
            <a
              className={`group rounded-[1.5rem] p-6 transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${pageSurface}`}
              href={option.href}
              key={option.title}
            >
              <option.icon
                aria-hidden="true"
                className="h-6 w-6 text-teal-700 dark:text-teal-300"
              />
              <p className="mt-7 font-bold text-slate-950 dark:text-white">
                {option.title}
              </p>
              <p className="mt-1 break-all text-sm text-slate-500 transition group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:text-teal-300">
                {option.detail}
              </p>
            </a>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-8 lg:py-28">
        <div>
          <SectionHeading
            description="Tell us what you need and include any helpful context. Please do not send sensitive personal, medical, or financial information through this form."
            eyebrow="Send a message"
            title="How can we help?"
          />
          <div className="mt-9 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
                <Clock3 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Typical response time
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Within two working days. Urgent safeguarding messages are
                  triaged as soon as possible.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                <Accessibility aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Access support
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Tell us your preferred language, format, or communication
                  adjustment and we will do our best to accommodate it.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-[2rem] p-7 sm:p-10 ${pageSurface}`}>
          <ContactForm initialSubject={initialSubject} />
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="Our core team is based in Bengaluru and works alongside regional partners. Meetings are by appointment so the right person can be there."
            eyebrow="Where to find us"
            title="Local roots, connected work"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className={`rounded-[1.75rem] p-7 ${pageSurface}`}>
              <MapPin
                aria-hidden="true"
                className="h-7 w-7 text-teal-700 dark:text-teal-300"
              />
              <h3 className="mt-7 text-xl font-bold text-slate-950 dark:text-white">
                Bengaluru office
              </h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                Indiranagar, Bengaluru
                <br />
                Karnataka, India
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Visits by appointment
              </p>
            </article>
            <article className={`rounded-[1.75rem] p-7 ${pageSurface}`}>
              <Clock3
                aria-hidden="true"
                className="h-7 w-7 text-teal-700 dark:text-teal-300"
              />
              <h3 className="mt-7 text-xl font-bold text-slate-950 dark:text-white">
                Office hours
              </h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                Monday–Friday
                <br />
                9:30 AM–5:30 PM IST
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Closed on public holidays
              </p>
            </article>
            <article className="rounded-[1.75rem] bg-teal-700 p-7 text-white shadow-xl">
              <Mail aria-hidden="true" className="h-7 w-7 text-teal-200" />
              <h3 className="mt-7 text-xl font-bold">Prefer email?</h3>
              <p className="mt-3 leading-7 text-teal-50">
                Write to hello@ashaaya.org and include the best way and time to
                reach you.
              </p>
              <a
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-300"
                href="mailto:hello@ashaaya.org"
              >
                Open your email{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export function DonatePage({
  frequency = "one_time",
  campaignSlug,
  checkoutCancelled = false,
  paymentsUnavailable = false,
}: {
  frequency?: "one_time" | "monthly" | "yearly";
  campaignSlug?: string;
  checkoutCancelled?: boolean;
  paymentsUnavailable?: boolean;
}) {
  const campaign = campaigns.find((item) => item.slug === campaignSlug);
  return (
    <main>
      <PageHero
        accent="amber"
        breadcrumbs={[{ label: "Donate" }]}
        description="Your gift backs practical work shaped by communities—and the people, safeguards, and learning that make it last."
        eyebrow="Give with confidence"
        title={
          <>
            Turn your care into{" "}
            <span className="text-teal-700 dark:text-teal-300">
              forward motion.
            </span>
          </>
        }
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-teal-950 p-8 text-white shadow-2xl sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
          />
          <HeartHandshake
            aria-hidden="true"
            className="relative h-10 w-10 text-amber-300"
          />
          <p className="relative mt-10 text-3xl font-semibold tracking-tight">
            A secure gift. A clear purpose. Progress you can follow.
          </p>
          <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            <div>
              <p className="text-xl font-bold text-teal-300">₹500</p>
              <p className="mt-1 text-xs text-slate-400">learning materials</p>
            </div>
            <div>
              <p className="text-xl font-bold text-teal-300">₹2.5K</p>
              <p className="mt-1 text-xs text-slate-400">mentor support</p>
            </div>
            <div>
              <p className="text-xl font-bold text-teal-300">₹10K</p>
              <p className="mt-1 text-xs text-slate-400">community milestone</p>
            </div>
          </div>
        </div>
      </PageHero>

      {paymentsUnavailable ? (
        <section
          aria-label="Demonstration payment notice"
          className="border-b border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
        >
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-6 py-4 text-sm leading-6 lg:px-8">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            <p>
              <strong>Demonstration checkout—no payment will be taken.</strong>{" "}
              This environment records only a temporary pledge and does not
              contact a payment provider.
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:px-8 lg:py-28">
        <aside className="lg:sticky lg:top-28">
          <SectionHeading
            description={
              campaign
                ? `Your donation will support ${campaign.title}.`
                : "Choose an amount and frequency that feels right. Every contribution matters."
            }
            eyebrow="Complete your gift"
            title="Make possibility practical"
          />
          <div className="mt-8">
            <CheckList
              items={[
                "Secure provider-hosted payment",
                "Email confirmation and receipt",
                "Tax documentation for eligible gifts",
                "Clear updates on the work you support",
              ]}
            />
          </div>
          <div className={`mt-8 rounded-[1.75rem] p-6 ${pageSurface}`}>
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-teal-700 dark:text-teal-300"
              />
              <div>
                <p className="font-bold text-slate-950 dark:text-white">
                  Your information is protected
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  We collect only what is needed to process your gift, meet
                  legal obligations, and provide a receipt.
                </p>
              </div>
            </div>
          </div>
        </aside>
        <div className={`rounded-[2rem] p-7 sm:p-10 ${pageSurface}`}>
          {checkoutCancelled ? (
            <div
              className="mb-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
              role="status"
            >
              <CircleX aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <strong>Checkout was closed.</strong> No payment was taken. You
                can change your gift below or return when you are ready.
              </p>
            </div>
          ) : null}
          <DonationForm
            campaign={campaign?.slug}
            initialFrequency={frequency}
          />
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="Giving should feel clear at every step—from the first click to the final programme report."
            eyebrow="Our giving commitments"
            title="Trust built into the experience"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <IconCard
              description="Payments are handled by approved providers; Ashaaya does not store complete card details."
              icon={LockKeyhole}
              title="Secure payment"
            />
            <IconCard
              description="Restricted gifts follow the named purpose, with donor communication if circumstances materially change."
              icon={Landmark}
              title="Responsible stewardship"
            />
            <IconCard
              description="We share milestones, challenges, adaptations, and completion learning—not only polished success stories."
              icon={BadgeCheck}
              title="Visible accountability"
            />
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
            Questions about receipts, eligible tax benefits, institutional
            giving, or bank transfers?{" "}
            <Link
              className="font-bold text-teal-700 underline underline-offset-4 dark:text-teal-300"
              href="/contact?subject=donations-receipts"
            >
              Contact our giving team
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

type SearchItem = {
  title: string;
  description: string;
  href: string;
  type: string;
  keywords: string;
  icon: LucideIcon;
};

const searchItems: SearchItem[] = [
  {
    title: "About Ashaaya",
    description: "Our mission, values, journey, and governance commitments.",
    href: "/about",
    type: "Page",
    keywords: "mission vision team governance founder values",
    icon: Building2,
  },
  {
    title: "Programs",
    description:
      "Explore education, health, livelihoods, food, climate, protection, and care programmes.",
    href: "/programs",
    type: "Page",
    keywords:
      "education healthcare women skills food disaster environment animal child senior",
    icon: BookOpen,
  },
  {
    title: "Impact & evidence",
    description:
      "See recent results and how communities help define and review progress.",
    href: "/impact",
    type: "Page",
    keywords:
      "statistics results annual report evidence data metrics transparency",
    icon: CheckCircle2,
  },
  {
    title: "Stories",
    description:
      "Meet people and collectives creating change in their communities.",
    href: "/stories",
    type: "Page",
    keywords: "testimonials success stories people community",
    icon: Sparkles,
  },
  {
    title: "Upcoming events",
    description: "Gather, learn, fundraise, and get closer to the work.",
    href: "/events",
    type: "Page",
    keywords: "calendar workshop gathering webinar register",
    icon: CalendarDays,
  },
  {
    title: "Volunteer",
    description: "Find a role that fits your skills, care, and availability.",
    href: "/volunteer",
    type: "Take action",
    keywords: "apply mentor skills volunteer opportunities",
    icon: Users,
  },
  {
    title: "Donate",
    description: "Make a secure one-time, monthly, or annual gift.",
    href: "/donate",
    type: "Take action",
    keywords: "give payment tax receipt monthly contribution",
    icon: HeartHandshake,
  },
  ...campaigns.map((campaign) => ({
    title: campaign.title,
    description: campaign.shortDescription,
    href: `/campaigns/${campaign.slug}`,
    type: "Campaign",
    keywords: `${campaign.category} ${campaign.location}`,
    icon: campaign.icon,
  })),
];

export function SearchPage({ query = "" }: { query?: string }) {
  const normalizedQuery = query.trim().toLocaleLowerCase("en-IN");
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const results = normalizedQuery
    ? searchItems.filter((item) => {
        const haystack =
          `${item.title} ${item.description} ${item.type} ${item.keywords}`.toLocaleLowerCase(
            "en-IN",
          );
        return tokens.every((token) => haystack.includes(token));
      })
    : [];

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50 pb-16 pt-32 dark:border-white/10 dark:bg-slate-950 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Search Ashaaya
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-6xl">
            What are you looking for?
          </h1>
          <form action="/search" className="relative mt-8" role="search">
            <label className="sr-only" htmlFor="search-page-input">
              Search the website
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              autoFocus
              className="min-h-16 w-full rounded-full border border-slate-300 bg-white py-4 pl-14 pr-32 text-base text-slate-950 shadow-xl shadow-slate-900/5 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
              defaultValue={query}
              id="search-page-input"
              name="q"
              placeholder="Try “education”, “volunteer”, or “annual report”"
              type="search"
            />
            <button
              className="absolute right-2 top-2 min-h-12 rounded-full bg-teal-700 px-6 text-sm font-extrabold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto min-h-[34rem] max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {normalizedQuery ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for “{query.trim()}”
              </h2>
              <Link
                className="text-sm font-bold text-teal-700 dark:text-teal-300"
                href="/search"
              >
                Clear search
              </Link>
            </div>
            {results.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <Link
                    className={`group rounded-[1.75rem] p-7 transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${pageSurface}`}
                    href={result.href}
                    key={`${result.type}-${result.title}`}
                  >
                    <result.icon
                      aria-hidden="true"
                      className="h-7 w-7 text-teal-700 dark:text-teal-300"
                    />
                    <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      {result.type}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                      {result.title}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                      {result.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300">
                      Open{" "}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-xl py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-100 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
                  <Search aria-hidden="true" className="h-7 w-7" />
                </div>
                <h2 className="mt-7 text-2xl font-bold text-slate-950 dark:text-white">
                  No close matches yet
                </h2>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  Try a shorter phrase or browse the most-used destinations
                  below. You can also ask our team directly.
                </p>
                <Link
                  className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-5 text-sm font-bold text-white dark:bg-teal-500 dark:text-slate-950"
                  href="/contact"
                >
                  Ask our team
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <SectionHeading
              align="center"
              description="Start with one of these common destinations, or search by cause, location, or way to help."
              eyebrow="Popular destinations"
              title="A few places to begin"
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {searchItems.slice(0, 8).map((item) => (
                <IconCard
                  description={item.description}
                  href={item.href}
                  icon={item.icon}
                  key={item.title}
                  meta={item.type}
                  title={item.title}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
