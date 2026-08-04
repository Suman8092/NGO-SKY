import type { Metadata } from "next";
import { ArrowLeft, Clock3, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { impactStories } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return impactStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = impactStories.find((item) => item.slug === slug);
  return story ? { title: story.title, description: story.dek } : { title: "Story not found" };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = impactStories.find((item) => item.slug === slug);
  if (!story) notFound();
  return (
    <main>
      <article>
        <header className="bg-[#09231e] pb-16 pt-36 text-white sm:pb-24">
          <div className="page-shell"><Link href="/stories" className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-white"><ArrowLeft className="size-4" /> All stories</Link><p className="mt-10 text-xs font-extrabold uppercase tracking-[0.2em] text-[#70d5b3]">A story of agency</p><h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">{story.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/62 sm:text-xl">{story.dek}</p><div className="mt-7 flex flex-wrap gap-5 text-xs text-white/45"><span className="flex items-center gap-2"><MapPin className="size-4 text-[#70d5b3]" />{story.location}</span><span className="flex items-center gap-2"><Clock3 className="size-4 text-[#70d5b3]" />{story.readTime}</span></div></div>
        </header>
        <div className="page-shell -mt-8"><div className="relative aspect-[16/8] overflow-hidden rounded-4xl shadow-lift"><Image src={story.image.src} alt={story.image.alt} fill priority sizes="100vw" className="object-cover" /></div></div>
        <div className="page-shell grid gap-12 py-16 lg:grid-cols-[1fr_280px] lg:gap-20 lg:py-24">
          <div className="max-w-3xl"><blockquote className="font-display text-3xl font-semibold leading-tight tracking-tight text-forest sm:text-4xl">“{story.quote}”</blockquote>{story.chapters.map((chapter) => <section key={chapter.label} className="mt-12"><p className="eyebrow">{chapter.label}</p><p className="prose-premium mt-5">{chapter.text}</p></section>)}</div>
          <aside><div className="sticky top-28 rounded-3xl border border-ink/10 bg-ink/[0.025] p-6"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.17em] text-forest">What changed</p><dl className="mt-6 space-y-5">{story.outcomes.map((outcome) => <div key={outcome.label}><dd className="font-display text-3xl font-bold">{outcome.value}</dd><dt className="mt-1 text-xs text-ink/45">{outcome.label}</dt></div>)}</dl>{story.privacyNote ? <p className="mt-7 flex gap-2 border-t border-ink/10 pt-5 text-[0.65rem] leading-5 text-ink/43"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-forest" />{story.privacyNote}</p> : null}</div></aside>
        </div>
      </article>
    </main>
  );
}
