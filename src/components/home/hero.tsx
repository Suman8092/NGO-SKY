"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight, BadgeCheck, Heart, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const imageX = useTransform(smoothX, [0, 1], ["-1.2%", "1.2%"]);
  const imageY = useTransform(smoothY, [0, 1], ["-1.2%", "1.2%"]);

  useEffect(() => {
    if (!root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from("[data-hero-reveal]", {
        y: 42,
        opacity: 0,
        filter: "blur(12px)",
        duration: 1.05,
        stagger: 0.11,
        ease: "power3.out",
        delay: 0.15,
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate min-h-[760px] overflow-hidden bg-[#071c18] text-white sm:min-h-[800px] lg:min-h-[860px]"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        mouseX.set((event.clientX - bounds.left) / bounds.width);
        mouseY.set((event.clientY - bounds.top) / bounds.height);
      }}
    >
      <motion.div className="absolute -inset-5" style={{ x: imageX, y: imageY }} aria-hidden="true">
        <Image
          src="/images/hero-community.png"
          alt="Community volunteers and local families planting a native tree together after the monsoon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[63%_50%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,19,16,.96)_0%,rgba(4,19,16,.80)_37%,rgba(4,19,16,.28)_69%,rgba(4,19,16,.10)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,19,16,.93)_0%,transparent_42%,rgba(4,19,16,.2)_100%)]" />
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_72%_30%,rgba(245,158,11,.25),transparent_24rem)]" />

      <div className="page-shell relative z-10 flex min-h-[760px] items-end pb-16 pt-32 sm:min-h-[800px] md:items-center md:pb-20 lg:min-h-[860px]">
        <div className="w-full pt-20 md:pt-24">
          <div className="max-w-[760px]">
            <div data-hero-reveal className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.08] px-3 py-2 text-[0.67rem] font-bold uppercase tracking-[0.2em] text-white/76 backdrop-blur-xl">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#73d7b7] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#73d7b7]" />
              </span>
              Locally led · Radically transparent
            </div>
            <h1 className="mt-7 font-display text-[clamp(3.25rem,8vw,7.6rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              <span data-hero-reveal className="block">Hope should</span>
              <span data-hero-reveal className="block">not wait.</span>
              <span data-hero-reveal className="mt-2 block font-medium italic text-[#f3bd67]">It should arrive.</span>
            </h1>
            <p data-hero-reveal className="mt-7 max-w-xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              We back practical ideas that keep children learning, families healthy, incomes growing, and ecosystems alive—then show you the evidence.
            </p>
            <div data-hero-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/donate" className="button-primary bg-[#f3bd67] text-[#10211d] shadow-[#f3bd67]/20 hover:bg-[#ffd182]">
                Make hope happen <Heart className="size-4 fill-current" aria-hidden="true" />
              </Link>
              <Link href="/impact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-bold text-white backdrop-blur-lg transition hover:bg-white/[0.15]">
                Follow every rupee <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div data-hero-reveal className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/58">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#73d7b7]" aria-hidden="true" /> 80G eligible</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck className="size-4 text-[#73d7b7]" aria-hidden="true" /> Audited annually</span>
            <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-[#f3bd67]" aria-hidden="true" /> 91% to programs</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="absolute bottom-10 right-6 z-10 hidden max-w-[250px] rounded-3xl border border-white/18 bg-[#0b2822]/72 p-5 shadow-2xl backdrop-blur-2xl md:block lg:bottom-16 lg:right-12 xl:right-16"
      >
        <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/50">
          Live field pulse <span className="size-2 rounded-full bg-[#73d7b7] shadow-[0_0_0_5px_rgba(115,215,183,.14)]" />
        </div>
        <p className="mt-5 font-display text-3xl font-bold tracking-tight">148,260</p>
        <p className="mt-1 text-xs leading-5 text-white/60">people reached across 96 completed projects</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: "76%" }} transition={{ delay: 1.45, duration: 1.2 }} className="h-full rounded-full bg-gradient-to-r from-[#73d7b7] to-[#f3bd67]" /></div>
        <p className="mt-2 text-[0.62rem] text-white/38">Verified · 31 July 2026</p>
      </motion.div>

      <a href="#impact" className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/45 lg:flex">
        Scroll to the work <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
