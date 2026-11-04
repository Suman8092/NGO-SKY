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
  CircleX,
  Clock3,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { resolveContactSubject } from "@/lib/contact-subjects";
import {
  paymentProviderLabel,
  type PublicPaymentReadiness,
} from "@/lib/payment-readiness";

import { ContactForm, DonationForm, VolunteerForm } from "./action-forms";
import { campaigns } from "./campaigns-pages";
import {
  CheckList,
  IconCard,
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
  submissionsAvailable,
}: {
  initialInterest?: string;
  submissionsAvailable: boolean;
}) {
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Volunteer" }]}
        description="Bring your time, care, and capability to work that communities have already said matters—and receive the support to contribute well."
        eyebrow="Volunteer with Skymeredian"
        primaryAction={{ href: "#roles", label: "Explore open roles" }}
        secondaryAction={
          submissionsAvailable
            ? { href: "#apply", label: "Apply now" }
            : undefined
        }
        title={
          <>
            Your time can become someone’s{" "}
            <span className="text-forest dark:text-[#91c4ff]">
              turning point.
            </span>
          </>
        }
      >
        <div className={`rounded-xl p-8 ${pageSurface}`}>
          <HeartHandshake
            aria-hidden="true"
            className="h-10 w-10 text-forest dark:text-[#91c4ff]"
          />
          <p className="mt-8 text-2xl font-semibold tracking-tight text-ink">
            Volunteer roles are designed around reliability, respect, and real
            programme need.
          </p>
          <p className="mt-8 border-t border-white/10 pt-6 text-sm leading-7 text-slate-300">
            Registering interest does not promise a placement. The team will
            respond only when a verified role and appropriate supervision are
            available.
          </p>
        </div>
      </PageHero>

      <section
        className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16"
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

      <section className="border-y border-ink/[0.07] bg-paper/60 py-12 dark:border-white/[0.08] dark:bg-[#061427]/60 lg:py-16">
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
                  className={`rounded-lg p-7 ${pageSurface}`}
                  key={step.number}
                >
                  <p className="text-xs font-extrabold text-forest dark:text-[#91c4ff]">
                    {step.number}
                  </p>
                  <h3 className="mt-7 text-xl font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-ink/65">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
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
          <aside className="rounded-xl bg-teal-950 p-8 text-white shadow-none sm:p-10">
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
              href="/contact?subject=safeguarding"
            >
              Ask a safeguarding question{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      <section
        className="border-y border-ink/[0.07] bg-paper/60 py-12 dark:border-white/[0.08] dark:bg-[#061427]/60 lg:py-16"
        id="apply"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
          <div>
            <SectionHeading
              description={
                submissionsAvailable
                  ? "This takes around five minutes. Share only what you are comfortable sharing at this stage."
                  : "The production website is not accepting volunteer applications at this time."
              }
              eyebrow="Register your interest"
              title={
                submissionsAvailable
                  ? "Let’s find your place in the work"
                  : "Applications are currently unavailable"
              }
            />
            <div className={`mt-8 rounded-lg p-6 ${pageSurface}`}>
              <p className="font-bold text-ink">
                {submissionsAvailable
                  ? "What happens after you apply?"
                  : "No application will be collected"}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {submissionsAvailable
                  ? "Submitted applications enter the managed volunteer review workflow. A submission does not promise a role or response date."
                  : "The form stays hidden until durable storage, managed notification delivery, and an explicit production launch flag are configured."}
              </p>
            </div>
          </div>
          <div className={`rounded-xl p-7 sm:p-10 ${pageSurface}`}>
            {submissionsAvailable ? (
              <VolunteerForm initialInterest={initialInterest} />
            ) : (
              <SubmissionUnavailable
                description="Please return later or use a separately verified contact channel if one is published on this site."
                title="Volunteer intake is closed on this deployment"
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const publicContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

function SubmissionUnavailable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
      role="status"
    >
      <ShieldCheck aria-hidden="true" className="h-7 w-7" />
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-7 opacity-80">{description}</p>
    </div>
  );
}

const contactOptions = publicContactEmail
  ? [
      {
        icon: MessageCircle,
        title: "General enquiries",
        detail: publicContactEmail,
        href: `mailto:${publicContactEmail}`,
      },
    ]
  : [];

export function ContactPage({
  subject,
  submissionsAvailable,
}: {
  subject?: string;
  submissionsAvailable: boolean;
}) {
  const initialSubject = resolveContactSubject(subject);
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Contact" }]}
        description={
          submissionsAvailable
            ? "Ask a question, share an idea, request support, or start a partnership conversation through the managed contact service."
            : "The managed contact form is not accepting messages on this deployment."
        }
        eyebrow="We are listening"
        title={
          <>
            A good conversation can be the start of{" "}
            <span className="text-forest dark:text-[#91c4ff]">
              meaningful change.
            </span>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {contactOptions.length ? (
            contactOptions.map((option) => (
              <a
                className={`group rounded-[1.5rem] p-6 transition hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${pageSurface}`}
                href={option.href}
                key={option.title}
              >
                <option.icon
                  aria-hidden="true"
                  className="h-6 w-6 text-forest dark:text-[#91c4ff]"
                />
                <p className="mt-7 font-bold text-ink">
                  {option.title}
                </p>
                <p className="mt-1 break-all text-sm text-slate-500 transition group-hover:text-teal-700 dark:text-slate-400 dark:group-hover:text-teal-300">
                  {option.detail}
                </p>
              </a>
            ))
          ) : (
            <div
              className={`rounded-[1.5rem] p-6 sm:col-span-2 ${pageSurface}`}
            >
              <MessageCircle
                aria-hidden="true"
                className="h-6 w-6 text-forest dark:text-[#91c4ff]"
              />
              <p className="mt-7 font-bold text-ink">
                {submissionsAvailable
                  ? "Managed contact form"
                  : "No public contact channel is active"}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/50">
                {submissionsAvailable
                  ? "Use the form below. A public email address will appear here only after it is verified."
                  : "No managed form or verified public email address is available on this deployment."}
              </p>
            </div>
          )}
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[.72fr_1.28fr] lg:px-8 lg:py-16">
        <div>
          <SectionHeading
            description={
              submissionsAvailable
                ? "Tell us what you need and include any helpful context. Please do not send sensitive personal, medical, or financial information through this form."
                : "No contact details or message content will be collected while the managed submission workflow is unavailable."
            }
            eyebrow={submissionsAvailable ? "Send a message" : "Contact status"}
            title={
              submissionsAvailable ? "How can we help?" : "Form unavailable"
            }
          />
          <div className="mt-9 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#91c4ff]">
                <Clock3 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink">
                  {submissionsAvailable
                    ? "Response handling"
                    : "No submission is collected"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink/65">
                  {submissionsAvailable
                    ? "Response times depend on the type of request. Please avoid sending urgent or emergency reports through this website."
                    : "The website cannot accept or route a message while the managed workflow is unavailable."}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                <Accessibility aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink">
                  {submissionsAvailable
                    ? "Access support"
                    : "Accessibility contact pending"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink/65">
                  {submissionsAvailable
                    ? "Share your preferred language, format, or communication adjustment in the managed form."
                    : "A verified accessibility contact route will be published before requests are accepted."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-7 sm:p-10 ${pageSurface}`}>
          {submissionsAvailable ? (
            <ContactForm initialSubject={initialSubject} />
          ) : (
            <SubmissionUnavailable
              description="The form will appear only after durable storage, verified email delivery, a notification destination, and an explicit production launch flag are configured."
              title="Messages are not being accepted"
            />
          )}
        </div>
      </section>
    </main>
  );
}

export function DonatePage({
  checkoutCancelled = false,
  initialAmount,
  paymentReadiness,
}: {
  checkoutCancelled?: boolean;
  initialAmount?: number;
  paymentReadiness: PublicPaymentReadiness;
}) {
  const paymentsUnavailable = !paymentReadiness.oneTimeProvider;
  const oneTimeLabel = paymentProviderLabel(paymentReadiness.oneTimeProvider);

  return (
    <main>
      <PageHero
        accent="amber"
        breadcrumbs={[{ label: "Donate" }]}
        description="Online checkout is enabled only when durable storage, a safe return origin, live provider credentials, signed webhooks, and the explicit launch flag are ready."
        eyebrow="Verified online giving"
        title={
          <>
            Turn your care into{" "}
            <span className="text-forest dark:text-[#91c4ff]">
              forward motion.
            </span>
          </>
        }
      >
        <div className="relative overflow-hidden rounded-xl bg-teal-950 p-8 text-white shadow-none sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
          />
          <HeartHandshake
            aria-hidden="true"
            className="relative h-10 w-10 text-amber-300"
          />
          <p className="relative mt-10 text-3xl font-semibold tracking-tight">
            Checkout configuration is checked on the server.
          </p>
          <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            <div>
              <p className="text-sm font-bold text-teal-300">
                {paymentReadiness.persistenceReady
                  ? "Configured"
                  : "Unavailable"}
              </p>
              <p className="mt-1 text-xs text-slate-400">durable records</p>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-300">{oneTimeLabel}</p>
              <p className="mt-1 text-xs text-slate-400">one-time checkout</p>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-300">
                Domestic INR
              </p>
              <p className="mt-1 text-xs text-slate-400">supported scope</p>
            </div>
          </div>
        </div>
      </PageHero>

      {paymentsUnavailable ? (
        <section
          aria-label="Payment availability notice"
          className="border-b border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
        >
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-6 py-4 text-sm leading-6 lg:px-8">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            <p>
              <strong>Online donations are temporarily unavailable.</strong> No
              payment or pledge can be submitted until the required production
              checkout configuration is present.
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:px-8 lg:py-16">
        <aside className="lg:sticky lg:top-28">
          <SectionHeading
            description="No pledge or payment is accepted when the production checkout is unavailable."
            eyebrow="Checkout status"
            title="Give only through a verified flow"
          />
          <div className="mt-8">
            <CheckList
              items={[
                "Secure provider-hosted payment",
                "Durable server-side donation record",
                "Signed payment status confirmation",
                "Explicit launch flag and safe HTTPS return origin",
              ]}
            />
          </div>
          <div className={`mt-8 rounded-lg p-6 ${pageSurface}`}>
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-forest dark:text-[#91c4ff]"
              />
              <div>
                <p className="font-bold text-ink">
                  Your information is protected
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  The form validates required details on the server and does not
                  store complete card information.
                </p>
              </div>
            </div>
          </div>
        </aside>
        <div className={`rounded-xl p-7 sm:p-10 ${pageSurface}`}>
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
          {paymentsUnavailable ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
              <ShieldCheck aria-hidden="true" className="h-7 w-7" />
              <h2 className="mt-5 text-2xl font-bold">No checkout is active</h2>
              <p className="mt-3 leading-7">
                This form appears only after durable records, a safe return
                origin, live provider credentials, signed webhooks, and the
                explicit launch flag are ready.
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-amber-950 px-5 text-sm font-bold text-white dark:bg-amber-200 dark:text-amber-950"
                href="/contact?subject=donation-support"
              >
                Contact the team
              </Link>
            </div>
          ) : (
            <DonationForm
              initialAmount={initialAmount}
              paymentReadiness={paymentReadiness}
            />
          )}
        </div>
      </section>

      <section className="border-y border-ink/[0.07] bg-paper/60 py-12 dark:border-white/[0.08] dark:bg-[#061427]/60 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="These controls are enforced by the application whenever online checkout is active."
            eyebrow="Technical safeguards"
            title="A payment flow that fails closed"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <IconCard
              description="Complete card or bank details stay with the payment provider."
              icon={LockKeyhole}
              title="Secure payment"
            />
            <IconCard
              description="The donation request is stored durably before checkout begins."
              icon={Landmark}
              title="Durable record first"
            />
            <IconCard
              description="Only a valid signed provider webhook can confirm final payment status."
              icon={BadgeCheck}
              title="Visible accountability"
            />
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-ink/50">
            Questions about payment availability or an existing transaction?{" "}
            <Link
              className="font-bold text-teal-700 underline underline-offset-4 dark:text-teal-300"
              href="/contact?subject=donation-support"
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
    title: "About Skymeredian",
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
    keywords: "give payment checkout monthly contribution",
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
      <section className="border-b border-ink/[0.08] bg-paper pb-16 pt-32 dark:border-white/10 dark:bg-slate-950 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-forest dark:text-[#91c4ff]">
            Search Skymeredian
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
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

      <section className="mx-auto min-h-[34rem] max-w-7xl px-6 py-16 lg:px-8 lg:py-12">
        {normalizedQuery ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.08] pb-6 dark:border-white/10">
              <h2 className="text-2xl font-bold text-ink">
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for “{query.trim()}”
              </h2>
              <Link
                className="text-sm font-bold text-forest dark:text-[#91c4ff]"
                href="/search"
              >
                Clear search
              </Link>
            </div>
            {results.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <Link
                    className={`group rounded-lg p-7 transition hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${pageSurface}`}
                    href={result.href}
                    key={`${result.type}-${result.title}`}
                  >
                    <result.icon
                      aria-hidden="true"
                      className="h-7 w-7 text-forest dark:text-[#91c4ff]"
                    />
                    <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      {result.type}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-ink">
                      {result.title}
                    </h3>
                    <p className="mt-3 leading-7 text-ink/65">
                      {result.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest dark:text-[#91c4ff]">
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
              <div className="mx-auto max-w-xl py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#91c4ff]">
                  <Search aria-hidden="true" className="h-7 w-7" />
                </div>
                <h2 className="mt-7 text-2xl font-bold text-ink">
                  No close matches yet
                </h2>
                <p className="mt-3 leading-7 text-ink/65">
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
