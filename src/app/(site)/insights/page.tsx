import type { Metadata } from "next";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { articles } from "@/content/site";

export const metadata: Metadata = { title: "Insights & field notes", description: "Research, field learning, perspectives, and accountable updates from Ashaaya Foundation." };

export default function InsightsPage() {
  const featured = articles.filter((article) => article.featured);
  return (
    <main>
      <section className="bg-[#09231e] pb-20 pt-36 text-white sm:pb-28"><div className="page-shell"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#70d5b3]">Insights & field notes</p><h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">What the work is teaching us.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">Evidence, hard questions, operational lessons, and the thinking that changes what we do next.</p></div></section>
      <section className="section-space page-shell">
        <div className="grid gap-5 lg:grid-cols-3">
          {featured.map((article) => <article key={article.slug} className="group overflow-hidden rounded-4xl border border-ink/10 bg-paper shadow-soft"><Link href={`/insights/${article.slug}`} className="relative block aspect-[4/3] overflow-hidden"><Image src={article.image.src} alt={article.image.alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" /><span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-ink">{article.category.replace("-", " ")}</span></Link><div className="p-6"><p className="flex items-center gap-1.5 text-xs text-ink/40"><Clock3 className="size-3.5" />{article.readTime} · {article.author}</p><h2 className="mt-4 font-display text-2xl font-bold leading-tight"><Link href={`/insights/${article.slug}`}>{article.title}</Link></h2><p className="mt-4 text-sm leading-7 text-ink/55">{article.excerpt}</p><Link href={`/insights/${article.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest">Read insight <ArrowUpRight className="size-4" /></Link></div></article>)}
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.filter((article) => !article.featured).map((article) => <article key={article.slug} className="border-t border-ink/12 pt-6"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-forest">{article.category.replace("-", " ")}</p><h2 className="mt-3 font-display text-xl font-bold leading-tight"><Link href={`/insights/${article.slug}`} className="hover:text-forest">{article.title}</Link></h2><p className="mt-3 text-sm leading-6 text-ink/52">{article.excerpt}</p><p className="mt-5 text-xs text-ink/35">{article.author} · {article.readTime}</p></article>)}
        </div>
      </section>
    </main>
  );
}
