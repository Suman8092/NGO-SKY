import type { Metadata } from "next";

import { DonationReturnStatus } from "@/components/pages/donation-return-status";
import {
  CheckList,
  PageHero,
  SectionHeading,
  pageSurface,
} from "@/components/pages/page-primitives";

export const metadata: Metadata = {
  title: "Donation status",
  description:
    "Check the server-confirmed status of a secure Ashaaya Foundation donation.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    donation_id?: string | string[];
    session_id?: string | string[];
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const rawDonationId = Array.isArray(params.donation_id)
    ? params.donation_id[0]
    : params.donation_id;
  const donationId =
    rawDonationId && /^(?:[a-f0-9]{24}|demo_[a-f0-9]{20})$/i.test(rawDonationId)
      ? rawDonationId
      : undefined;

  return (
    <main>
      <PageHero
        accent="emerald"
        breadcrumbs={[
          { label: "Donate", href: "/donate" },
          { label: "Donation status" },
        ]}
        description="Stripe has returned you to Ashaaya. A signed notification from the payment provider—not the browser redirect—sets the final donation status."
        eyebrow="Secure payment return"
        title="We’re confirming your gift."
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:px-8 lg:py-24">
        <DonationReturnStatus donationId={donationId} />
        <aside className={`rounded-[1.75rem] p-7 ${pageSurface}`}>
          <SectionHeading
            eyebrow="What happens next"
            title="Confirmation before celebration"
          />
          <div className="mt-7">
            <CheckList
              items={[
                "The provider sends a signed event to Ashaaya.",
                "The server verifies it before changing donation status.",
                "A confirmation email follows only after verified payment.",
              ]}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
