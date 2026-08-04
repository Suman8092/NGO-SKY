"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Camera, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { gallery } from "@/content/site";

const filters = ["all", "people", "fieldwork", "events", "nature"] as const;

export function GalleryPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [selected, setSelected] = useState<(typeof gallery)[number] | null>(null);
  const items = filter === "all" ? gallery : gallery.filter((item) => item.category === filter);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <main>
      <section className="border-b border-ink/10 bg-[#e7eee8] pb-16 pt-36 dark:bg-[#10251f] sm:pb-24">
        <div className="page-shell"><p className="eyebrow">Field gallery</p><h1 className="display-title mt-6 max-w-5xl">The work, witnessed with care.</h1><p className="prose-premium mt-6 max-w-2xl">A consent-aware visual record of people leading, learning, building, gathering, and restoring what sustains them.</p></div>
      </section>
      <section className="section-space page-shell">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter gallery">
          {filters.map((option) => <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${filter === option ? "bg-forest text-white dark:text-[#071813]" : "border border-ink/12 bg-paper hover:border-forest/35"}`}>{option}</button>)}
        </div>
        <motion.div layout className="mt-9 columns-1 gap-5 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => <motion.button layout key={item.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} type="button" onClick={() => setSelected(item)} className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-3xl text-left shadow-soft" aria-label={`Open ${item.title}`}>
              <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={`w-full object-cover transition duration-700 group-hover:scale-[1.035] ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071c18]/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[#7bd6b7]">{item.category}</p><h2 className="mt-2 font-display text-xl font-bold tracking-tight">{item.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-white/55"><MapPin className="size-3.5" />{item.location}</p></div>
            </motion.button>)}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>
        {selected ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04110e]/92 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}>
          <motion.div initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-4xl bg-[#0a211c] text-white" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-black/45 backdrop-blur-lg" aria-label="Close image"><X className="size-5" /></button>
            <div className="relative max-h-[68vh] min-h-[380px]"><Image src={selected.image.src} alt={selected.image.alt} fill sizes="90vw" className="object-contain" /></div>
            <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-xs text-[#7bd6b7]"><Camera className="size-3.5" />{new Date(selected.capturedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p><h2 className="mt-2 font-display text-2xl font-bold">{selected.title}</h2><p className="mt-1 text-xs text-white/45">{selected.location}</p></div>{selected.storyHref ? <Link href={selected.storyHref} className="inline-flex items-center gap-2 text-sm font-bold text-[#f3bd67]">Read the field story <ArrowUpRight className="size-4" /></Link> : null}</div>
          </motion.div>
        </motion.div> : null}
      </AnimatePresence>
    </main>
  );
}
