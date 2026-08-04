import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowRight,
  Eye,
  FileCheck2,
  Keyboard,
  LockKeyhole,
  Mail,
  Scale,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  Breadcrumbs,
  CtaBand,
  SectionHeading,
  pageSurface,
} from "./page-primitives";

type PolicySection = { id: string; title: string; content: ReactNode };

function PolicyPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  sections,
  note,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sections: PolicySection[];
  note: string;
}) {
  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50 pb-16 pt-32 dark:border-white/10 dark:bg-slate-950 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: title }]} />
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl">
                {title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-teal-700 text-white shadow-xl shadow-teal-900/15">
              <Icon aria-hidden="true" className="h-9 w-9" />
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>Last reviewed: 5 August 2026</span>
            <span>Version 2.1</span>
            <span>Applies to: ashaaya.org and related services</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8 lg:py-24">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav
            aria-label={`${title} contents`}
            className={`rounded-[1.75rem] p-5 ${pageSurface}`}
          >
            <p className="px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
              On this page
            </p>
            <ol className="mt-4 space-y-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    className="flex rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-300 dark:hover:bg-teal-400/10 dark:hover:text-teal-200"
                    href={`#${section.id}`}
                  >
                    <span className="mr-3 text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {note}
          </p>
        </aside>
        <article className="min-w-0">
          <div className="space-y-14">
            {sections.map((section, index) => (
              <section
                className="scroll-mt-28 border-b border-slate-200 pb-14 last:border-b-0 dark:border-white/10"
                id={section.id}
                key={section.id}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 text-xs font-extrabold text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="policy-copy mt-5 space-y-4 leading-7 text-slate-600 dark:text-slate-300">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-14 rounded-[2rem] bg-teal-950 p-8 text-white">
            <Mail aria-hidden="true" className="h-7 w-7 text-teal-300" />
            <h2 className="mt-6 text-2xl font-bold">
              Questions about this policy?
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              Write to{" "}
              <a
                className="font-bold text-teal-300 underline underline-offset-4"
                href="mailto:privacy@ashaaya.org"
              >
                privacy@ashaaya.org
              </a>{" "}
              or use our contact form. We will route accessibility requests,
              privacy rights, and formal notices to the appropriate person.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-amber-300"
              href="/contact"
            >
              Contact Ashaaya{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

const privacySections: PolicySection[] = [
  {
    id: "scope",
    title: "Scope and who we are",
    content: (
      <>
        <p>
          Ashaaya Foundation (“Ashaaya”, “we”, “us”) is a public-interest
          organisation. This policy explains how we handle personal information
          when you visit our website, donate, register for an event, volunteer,
          contact us, subscribe to updates, or otherwise interact with our
          services.
        </p>
        <p>
          Some community programmes use additional consent notices because they
          involve different information, risks, or partner organisations. Where
          a programme notice conflicts with this general policy, the more
          specific notice applies to that activity.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "Information we collect",
    content: (
      <>
        <p>Depending on how you engage, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            identity and contact details such as name, email, phone, city, and
            communication preferences;
          </li>
          <li>
            donation details such as amount, frequency, campaign, receipt
            information, tax identifier where required, and limited payment
            status;
          </li>
          <li>
            volunteer or event details including interests, availability,
            skills, access needs, attendance, and relevant screening records;
          </li>
          <li>
            messages, feedback, consent records, and records of our
            communication with you;
          </li>
          <li>
            basic technical information such as device type, browser,
            approximate location, referral source, and website usage where
            analytics are enabled.
          </li>
        </ul>
        <p>
          Complete payment-card or bank credentials are processed by approved
          payment providers and are not stored by Ashaaya.
        </p>
      </>
    ),
  },
  {
    id: "collection",
    title: "How information reaches us",
    content: (
      <p>
        We receive information directly from you, automatically through
        necessary site operations and consented analytics, from a person acting
        with your permission, or from trusted programme and payment partners. If
        another person provides your details, we ask them to confirm they have
        authority to do so.
      </p>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    content: (
      <>
        <p>
          We use personal information to provide the action you requested;
          process and acknowledge donations; issue eligible receipts; manage
          events and volunteer applications; respond to enquiries; protect
          people and services; meet legal, audit, and safeguarding
          responsibilities; understand and improve our work; and send optional
          updates where you have chosen to receive them.
        </p>
        <p>
          We do not sell personal information. We do not use sensitive programme
          information for advertising, and we do not make decisions with legal
          or similarly significant effects solely through automated processing.
        </p>
      </>
    ),
  },
  {
    id: "basis",
    title: "Consent and other grounds",
    content: (
      <p>
        We rely on the ground appropriate to the activity: your consent; taking
        steps you request or fulfilling an agreement; meeting a legal
        obligation; protecting someone’s vital interests; or a carefully
        assessed legitimate organisational interest that does not override your
        rights. You can withdraw consent for future use at any time, although
        earlier lawful processing remains valid.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "When information is shared",
    content: (
      <>
        <p>
          We share only what is reasonably necessary with service providers
          supporting hosting, secure payments, email, forms, analytics,
          security, audits, or professional advice; with vetted programme
          partners carrying out an agreed activity; with authorities where law
          or immediate safety requires it; or with another organisation during a
          lawful structural change.
        </p>
        <p>
          Providers must follow written confidentiality, security, and purpose
          restrictions. We do not allow partners to reuse personal information
          for their own marketing.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention and deletion",
    content: (
      <p>
        We keep information only as long as its purpose, legal requirements,
        financial-record rules, safeguarding needs, or active relationship
        reasonably require. Retention periods vary by record type. When
        information is no longer needed, we delete it, anonymise it, or securely
        restrict it until deletion is possible.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        We use role-based access, encryption in transit, secure service
        providers, backups, logging, staff training, and incident procedures
        proportionate to the information and risk. No system can guarantee
        absolute security. If an incident creates a material risk to you, we
        will provide notice as required and explain practical protective steps.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    content: (
      <>
        <p>
          Subject to applicable law, you may ask to access, correct, update,
          delete, restrict, or receive a copy of your information; object to
          certain uses; withdraw consent; or complain about our handling. You
          may unsubscribe from non-essential email using the link in the
          message.
        </p>
        <p>
          Send a request to{" "}
          <a
            className="font-bold text-teal-700 underline underline-offset-4 dark:text-teal-300"
            href="mailto:privacy@ashaaya.org"
          >
            privacy@ashaaya.org
          </a>
          . We may need to verify your identity and clarify the scope before
          acting. We will not penalise anyone for making a good-faith privacy
          request.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children and safeguarding",
    content: (
      <p>
        Our public website is not designed to collect personal information
        directly from young children. Programme activities involving children
        use age-appropriate explanations, guardian involvement where
        appropriate, strict access controls, and safeguarding procedures. If you
        believe a child submitted information through the website without
        appropriate permission, contact us promptly.
      </p>
    ),
  },
  {
    id: "transfers",
    title: "International services",
    content: (
      <p>
        Some technology providers may process information outside your state or
        country. Where required, we use contractual and organisational
        safeguards and assess provider practices before transfer. You can
        contact us for more information about the safeguards relevant to your
        data.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    content: (
      <>
        <p>
          We may update this policy when our services, partners, or legal
          obligations change. We will update the review date and provide
          prominent notice when a change materially affects how information is
          used.
        </p>
        <p>
          For privacy questions or rights requests, email privacy@ashaaya.org.
          For safeguarding concerns, email safeguarding@ashaaya.org. If someone
          is in immediate danger, contact the appropriate local emergency
          service first.
        </p>
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <PolicyPage
      description="A clear account of the information we collect, why we use it, how we protect it, and the choices available to you."
      eyebrow="Your information, treated with care"
      icon={LockKeyhole}
      note="This policy provides transparency about our practices and is not a substitute for rights available under applicable law."
      sections={privacySections}
      title="Privacy Policy"
    />
  );
}

const termsSections: PolicySection[] = [
  {
    id: "acceptance",
    title: "Using this website",
    content: (
      <p>
        These terms apply when you access ashaaya.org, submit a form, register
        for an event, make a donation, or use a related digital service operated
        by Ashaaya Foundation. By using a service, you agree to these terms and
        the notices shown for that activity. If you do not agree, please do not
        continue with that service.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and accurate details",
    content: (
      <p>
        You must have legal capacity to take the action you request or act with
        appropriate permission. Information you provide must be accurate to the
        best of your knowledge. Do not impersonate another person, submit
        someone else’s sensitive information without authority, or use our
        services for unlawful or harmful purposes.
      </p>
    ),
  },
  {
    id: "information-use",
    title: "Website information",
    content: (
      <p>
        We work to keep programme, event, campaign, and educational information
        clear and current. Circumstances in community work can change quickly,
        so website content is general information—not professional medical,
        legal, financial, or emergency advice. Contact us before relying on
        time-sensitive event, eligibility, or programme information.
      </p>
    ),
  },
  {
    id: "donations",
    title: "Donations and payment",
    content: (
      <>
        <p>
          Donation amounts and frequency are shown for confirmation before
          payment. Approved third-party providers process payment credentials
          under their own terms. A donation is complete only when the payment
          provider confirms successful settlement; a form submission or pledge
          alone is not proof of payment.
        </p>
        <p>
          Where a gift is designated to a campaign, we use it for that stated
          purpose. If the purpose becomes completed, impracticable, or
          overfunded, we will communicate with affected donors where reasonably
          possible and apply the gift to the closest related charitable purpose
          consistent with applicable requirements.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Errors, cancellations, and refunds",
    content: (
      <p>
        If you believe a donation was duplicated, entered incorrectly, or made
        without authority, contact giving@ashaaya.org promptly with the
        transaction reference. Refund eligibility depends on payment status,
        law, tax documentation already issued, provider rules, and whether funds
        have been committed. Event cancellation and transfer terms are stated at
        registration.
      </p>
    ),
  },
  {
    id: "receipts",
    title: "Receipts and tax information",
    content: (
      <p>
        We provide acknowledgements and eligible tax documentation based on the
        information supplied and applicable requirements. Tax treatment depends
        on the donor, jurisdiction, registration status, and nature of the gift.
        Ashaaya does not provide personal tax advice; consult a qualified
        adviser where needed.
      </p>
    ),
  },
  {
    id: "community",
    title: "Acceptable use and community conduct",
    content: (
      <>
        <p>
          You may not interfere with site security, attempt unauthorised access,
          introduce malicious code, scrape personal information, overload
          services, submit abusive or discriminatory content, misrepresent
          affiliation with Ashaaya, or use our brand to solicit funds without
          written approval.
        </p>
        <p>
          Event and volunteer participants must follow applicable conduct and
          safeguarding standards. We may limit access or participation when
          reasonably necessary to protect people, services, or the integrity of
          our work.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Content and intellectual property",
    content: (
      <p>
        Unless otherwise stated, Ashaaya owns or is licensed to use the website
        design, text, graphics, reports, marks, and media. You may share public
        pages and quote brief portions with attribution for non-commercial
        purposes. Do not alter context, imply endorsement, use identifiable
        stories or images beyond their published purpose, or commercially
        reproduce content without permission.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    content: (
      <p>
        Links and embedded tools may lead to services operated by payment, map,
        video, social, registration, or other providers. Their terms and privacy
        practices apply when you use them. A link does not necessarily mean
        Ashaaya controls or endorses every statement on that service.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    content: (
      <p>
        We may update, suspend, or withdraw site features for maintenance,
        security, programme changes, or reasons beyond our control. We aim to
        preserve important records and give notice where practical, but do not
        guarantee uninterrupted or error-free access.
      </p>
    ),
  },
  {
    id: "responsibility",
    title: "Responsibility and liability",
    content: (
      <p>
        Nothing in these terms excludes responsibility that cannot lawfully be
        excluded. To the extent permitted by law, Ashaaya is not responsible for
        indirect loss arising solely from reliance on general website
        information, third-party services, or events outside reasonable control.
        These terms do not reduce statutory consumer, donor, data-protection, or
        other mandatory rights.
      </p>
    ),
  },
  {
    id: "law-contact",
    title: "Questions, concerns, and governing rules",
    content: (
      <p>
        These terms are interpreted under the laws applicable to Ashaaya
        Foundation and the relevant service, without overriding mandatory rights
        that apply where you live. Please contact legal@ashaaya.org first so we
        can try to resolve concerns fairly and promptly. Formal notices may also
        be sent through the contact details published on this site.
      </p>
    ),
  },
];

export function TermsPage() {
  return (
    <PolicyPage
      description="The ground rules for using our website, making a donation, joining an event, and engaging with Ashaaya online."
      eyebrow="Clear expectations, mutual respect"
      icon={Scale}
      note="These terms are written in plain language. Mandatory rights under applicable law continue to apply."
      sections={termsSections}
      title="Terms of Use"
    />
  );
}

const accessibilitySections: PolicySection[] = [
  {
    id: "commitment",
    title: "Our commitment",
    content: (
      <p>
        Ashaaya Foundation wants every person to access information, make
        choices, and take action with dignity. We treat accessibility as an
        ongoing product and content practice—not a one-time certification. Our
        teams consider disabled people, older adults, low-bandwidth users,
        varied literacy, and different ways of interacting with technology.
      </p>
    ),
  },
  {
    id: "standard",
    title: "The standard we work toward",
    content: (
      <p>
        We aim for conformance with the Web Content Accessibility Guidelines
        (WCAG) 2.2 Level AA across the public website and key donation, contact,
        event, and volunteer journeys. Conformance means meeting testable
        criteria; it does not mean every experience will be equally usable for
        every person or assistive technology.
      </p>
    ),
  },
  {
    id: "features",
    title: "Accessibility features",
    content: (
      <>
        <p>Current design and engineering practices include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            semantic headings, landmarks, lists, labels, and descriptive link
            text;
          </li>
          <li>
            keyboard access with visible focus and no intentional keyboard
            traps;
          </li>
          <li>responsive layouts that support zoom and text reflow;</li>
          <li>
            colour contrast designed to meet AA thresholds and information not
            communicated by colour alone;
          </li>
          <li>
            form instructions, native validation, error notices, and status
            announcements;
          </li>
          <li>
            text alternatives for meaningful images and reduced-motion
            consideration for non-essential effects;
          </li>
          <li>
            captions, transcripts, or equivalent alternatives for published
            media where available.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "compatibility",
    title: "Browsers and assistive technology",
    content: (
      <p>
        We test recent versions of major browsers on desktop and mobile,
        keyboard-only navigation, screen-reader combinations in common use, 200%
        and 400% zoom, forced-colour behaviour where feasible, and
        reduced-motion preferences. Older or highly customised technology may
        behave differently; tell us if your setup encounters a barrier.
      </p>
    ),
  },
  {
    id: "limitations",
    title: "Known limitations",
    content: (
      <>
        <p>
          Some third-party payment, map, video, document, or event tools may not
          yet match the accessibility of the core site. Historic PDFs and media
          may also lack complete tagging, transcripts, or audio description. We
          prioritise alternatives for active campaigns and essential journeys
          and work with providers to resolve barriers.
        </p>
        <p>
          If a third-party experience blocks you, contact us. We can provide
          information, assist with registration, or arrange an alternative
          donation method without requiring you to use the inaccessible tool.
        </p>
      </>
    ),
  },
  {
    id: "alternatives",
    title: "Alternative formats and adjustments",
    content: (
      <p>
        You can request information in a more accessible digital document, large
        print, plain-language summary, transcript, or another reasonable format.
        You can also request communication, event, or volunteering adjustments.
        We will confirm the request, discuss what works, and give a realistic
        delivery timeframe. There is no charge for reasonable accessibility
        support.
      </p>
    ),
  },
  {
    id: "feedback",
    title: "Report a barrier",
    content: (
      <>
        <p>
          Email accessibility@ashaaya.org or use the contact form with
          “Accessibility” in the message. Helpful details include the page or
          task, what you expected, what happened, your browser or assistive
          technology if you are comfortable sharing it, and the best way to
          respond.
        </p>
        <p>
          We aim to acknowledge accessibility reports within two working days,
          provide an immediate alternative for time-sensitive tasks where
          possible, and share the outcome after investigation.
        </p>
      </>
    ),
  },
  {
    id: "improvement",
    title: "How we keep improving",
    content: (
      <p>
        Accessibility checks are part of design review, content publishing, and
        engineering verification. We combine automated checks with keyboard,
        screen-reader, zoom, contrast, and human usability testing. High-impact
        issues in donating, seeking help, contacting us, or reporting
        safeguarding concerns receive priority.
      </p>
    ),
  },
  {
    id: "statement",
    title: "Statement review",
    content: (
      <p>
        This statement is reviewed when major site functionality changes and at
        least annually. The most recent review included keyboard navigation,
        screen-reader landmarks and form labels, zoom and reflow, focus
        visibility, contrast, motion preferences, and essential third-party
        journeys.
      </p>
    ),
  },
];

export function AccessibilityPage() {
  return (
    <>
      <PolicyPage
        description="How we design, test, improve, and provide alternatives so more people can use Ashaaya’s digital services."
        eyebrow="Access belongs to everyone"
        icon={Accessibility}
        note="If an essential task is blocked, contact us for an immediate alternative. You do not need to diagnose the technical issue first."
        sections={accessibilitySections}
        title="Accessibility Statement"
      />
      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            align="center"
            description="These principles shape every new interface, form, story, document, and event experience."
            eyebrow="Designed into the work"
            title="Four ways we keep access visible"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Keyboard,
                title: "Operable",
                text: "Every essential action works without a mouse.",
              },
              {
                icon: Eye,
                title: "Perceivable",
                text: "Content adapts to different ways of seeing and hearing.",
              },
              {
                icon: Volume2,
                title: "Understandable",
                text: "Language, structure, and feedback reduce guesswork.",
              },
              {
                icon: FileCheck2,
                title: "Robust",
                text: "Semantic code supports current assistive technologies.",
              },
            ].map((item) => (
              <article
                className={`rounded-[1.75rem] p-7 ${pageSurface}`}
                key={item.title}
              >
                <item.icon
                  aria-hidden="true"
                  className="h-7 w-7 text-teal-700 dark:text-teal-300"
                />
                <h3 className="mt-7 text-xl font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        description="Tell us what you were trying to do. We will help with the immediate task and use your feedback to improve the underlying experience."
        primaryAction={{
          href: "/contact?subject=accessibility",
          label: "Report an access barrier",
        }}
        secondaryAction={{
          href: "mailto:accessibility@ashaaya.org",
          label: "Email accessibility team",
        }}
        title="Found something that gets in the way?"
      />
    </>
  );
}
