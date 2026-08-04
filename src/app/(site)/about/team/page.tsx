import type { Metadata } from "next";
import { Languages, Linkedin } from "lucide-react";
import Image from "next/image";

import { team } from "@/content/site";

export const metadata: Metadata = { title: "Our team", description: "Meet the leaders, program practitioners, and trustees accountable for Ashaaya Foundation's work." };

export default function TeamPage() {
  return (
    <main><section className="bg-[#09231e] pb-20 pt-36 text-white sm:pb-28"><div className="page-shell"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#70d5b3]">People & accountability</p><h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">A team built to listen, learn, and answer for the work.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">Field practitioners, operators, and independent governance working across disciplines and languages.</p></div></section><section className="section-space page-shell"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{team.map((member) => <article key={member.name} className="group overflow-hidden rounded-4xl border border-ink/10 bg-paper shadow-soft"><div className="relative aspect-[4/5] overflow-hidden"><Image src={member.image.src} alt={member.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" /><span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink">{member.group}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold">{member.name}</h2><p className="mt-1 text-xs font-bold text-forest">{member.role}</p></div>{member.linkedin ? <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/10"><Linkedin className="size-4" /></a> : null}</div><p className="mt-4 text-sm leading-6 text-ink/55">{member.bio}</p><p className="mt-4 flex items-center gap-2 text-[0.65rem] text-ink/38"><Languages className="size-3.5 text-forest" />{member.languages.join(" · ")}</p></div></article>)}</div></section></main>
  );
}
