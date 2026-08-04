import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { faqs } from "@/content/site";

export const metadata: Metadata = { title: "Frequently asked questions", description: "Clear answers about donations, impact, volunteering, governance, and Ashaaya Foundation." };

export default function FaqPage() {
  return (
    <main><section className="border-b border-ink/10 bg-[#e7eee8] pb-20 pt-36 dark:bg-[#10251f]"><div className="page-shell"><p className="eyebrow">Clear answers</p><h1 className="display-title mt-6 max-w-5xl">Trust deserves specifics.</h1><p className="prose-premium mt-6 max-w-2xl">Donations, evidence, volunteering, governance, privacy, and the questions we are asked most often.</p></div></section><section className="section-space page-shell"><div className="mx-auto max-w-4xl divide-y divide-ink/10">{faqs.map((item) => <details key={item.id} id={item.id} className="group scroll-mt-28 py-6"><summary className="cursor-pointer list-none pr-10 font-display text-xl font-bold tracking-tight marker:hidden">{item.question}<span className="float-right text-forest transition group-open:rotate-45">+</span></summary><p className="mt-5 max-w-3xl text-base leading-8 text-ink/60">{item.answer}</p>{item.links?.length ? <div className="mt-4 flex flex-wrap gap-4">{item.links.map((link) => <Link key={link.href} href={link.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-forest">{link.label}<ArrowUpRight className="size-3.5" /></Link>)}</div> : null}</details>)}</div></section></main>
  );
}
