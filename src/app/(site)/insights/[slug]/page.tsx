import type { Metadata } from "next";
import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { articles } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return article ? { title: article.title, description: article.excerpt } : { title: "Insight not found" };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return (
    <main>
      <article>
        <header className="page-shell pb-12 pt-36 sm:pb-16"><Link href="/insights" className="inline-flex items-center gap-2 text-xs font-bold text-ink/45 hover:text-forest"><ArrowLeft className="size-4" /> All insights</Link><p className="eyebrow mt-10">{article.category.replace("-", " ")}</p><h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">{article.title}</h1><p className="prose-premium mt-7 max-w-3xl">{article.excerpt}</p><p className="mt-6 flex items-center gap-2 text-xs text-ink/40"><Clock3 className="size-4 text-forest" />{article.readTime} · {article.author} · {new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></header>
        <div className="page-shell"><div className="relative aspect-[16/8] overflow-hidden rounded-4xl shadow-lift"><Image src={article.image.src} alt={article.image.alt} fill priority sizes="100vw" className="object-cover" /></div></div>
        <div className="page-shell grid gap-12 py-16 lg:grid-cols-[minmax(0,760px)_260px] lg:justify-center lg:gap-20 lg:py-24"><div className="space-y-9 text-lg leading-9 text-ink/70"><p>{article.excerpt}</p><h2 className="font-display text-3xl font-bold tracking-tight text-ink">The question beneath the metric</h2><p>Our teams begin by separating activity from durable change. The useful question is not simply what happened, but who shaped it, who can sustain it, and what evidence would make us change course.</p><h2 className="font-display text-3xl font-bold tracking-tight text-ink">What we are changing</h2><p>This field note is part of Ashaaya’s quarterly learning cycle. Program leads review participant feedback alongside cost, reach, inclusion, and outcome data, then publish the decisions that follow. Progress is meaningful only when the learning remains visible.</p><p>We will return to this work in the next quarterly note with updated evidence, including what did not move as expected.</p></div><aside><div className="sticky top-28 rounded-3xl border border-ink/10 bg-ink/[0.025] p-6"><ShieldCheck className="size-5 text-forest" /><h2 className="mt-4 font-display text-lg font-bold">Editorial standard</h2><p className="mt-3 text-xs leading-6 text-ink/48">Evidence is reviewed by the relevant program lead. Participant stories follow informed-consent and withdrawal protocols.</p><div className="mt-5 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-forest/8 px-2.5 py-1 text-[0.62rem] font-bold text-forest">{tag}</span>)}</div></div></aside></div>
      </article>
    </main>
  );
}
