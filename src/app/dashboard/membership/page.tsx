import { GivingHistory } from "@/components/ngo/giving-history";
import { RecurringDonations } from "@/components/ngo/recurring-donations";
import { MemberHub, CaseConversation } from "@/components/ngo/member-hub";
export const dynamic = "force-dynamic";
export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="eyebrow">Member services</p>
      <h1 className="mb-7 mt-4 text-3xl font-semibold">
        Membership, documents & messages
      </h1>
      {params.case && /^[a-f0-9]{24}$/i.test(params.case) && (
        <div className="mb-8 border-y border-ink/15 py-5">
          <h2 className="mb-3 text-lg font-semibold">Case conversation</h2>
          <CaseConversation id={params.case} />
        </div>
      )}
      <MemberHub />
      <div className="mt-8">
        <GivingHistory />
      </div>
      <div className="mt-8">
        <RecurringDonations />
      </div>
    </div>
  );
}
