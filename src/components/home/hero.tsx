"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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
      <motion.div
        className="absolute -inset-5"
        style={{ x: imageX, y: imageY }}
        aria-hidden="true"
      >
        <Image
          src="/images/hero-community.png"
          alt="People working together outdoors"
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
            <div
              data-hero-reveal
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/85 shadow-sm backdrop-blur-2xl"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#73d7b7] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#73d7b7]" />
              </span>
              Clear information · Verified impact
            </div>
            <h1 className="mt-7 font-display text-[clamp(3.25rem,8vw,7.6rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              <span data-hero-reveal className="block">
                Hope should
              </span>
              <span data-hero-reveal className="block">
                not wait.
              </span>
              <span
                data-hero-reveal
                className="mt-2 block bg-gradient-to-r from-[#ffe4ab] via-[#f3bd67] to-[#e89f38] bg-clip-text font-serif italic text-transparent drop-shadow-sm"
              >
                It should arrive.
              </span>
            </h1>
            <p
              data-hero-reveal
              className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8"
            >
              Empowering grassroots community leadership across education,
              sustainable livelihoods, clean water, and local ecosystems.
            </p>
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              {/* A native anchor keeps this critical route usable before the large homepage finishes hydrating. */}
              <a
                href="/donate"
                className="group relative inline-flex min-h-13 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#ffd385] to-[#f3bd67] px-8 py-3.5 text-sm font-extrabold text-[#091e19] shadow-[0_12px_36px_rgba(243,189,103,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(243,189,103,0.45)]"
              >
                Support our work{" "}
                <Heart className="size-4 fill-current transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15"
              >
                Contact the team{" "}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            data-hero-reveal
            className="mt-12 flex flex-wrap items-center gap-3 text-xs text-white/70"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md">
              <ShieldCheck
                className="size-4 text-[#73d7b7]"
                aria-hidden="true"
              />{" "}
              Server-validated forms
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md">
              <BadgeCheck
                className="size-4 text-[#73d7b7]"
                aria-hidden="true"
              />{" "}
              Verified field logs
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="size-4 text-[#f3bd67]" aria-hidden="true" />{" "}
              Statutory 80G tax benefits
            </span>
          </div>
        </div>
      </div>

      <a
        href="#impact"
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/45 lg:flex"
      >
        Scroll to the work{" "}
        <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
