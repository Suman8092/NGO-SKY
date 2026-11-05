import Link from "next/link";
export default function PaymentStatusPage() {
  return (
    <main className="page-shell min-h-[70vh] pb-16 pt-36">
      <p className="eyebrow">Payment return</p>
      <h1 className="mt-4 text-3xl font-semibold">
        Check your confirmed payment record.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/65">
        The provider's server response determines the final payment status. View
        your private dashboard for the confirmed payment and receipt. A pending
        payment can take a few minutes to reconcile. Guest donors can sign in
        with their verified donation email to view their giving history.
      </p>
      <Link href="/dashboard/membership" className="button-primary mt-6">
        View payment history
      </Link>
    </main>
  );
}
