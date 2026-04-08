"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroCanvas from "./HeroCanvas";
import AmbientParticles from "../shared/AmbientParticles";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4">
      <HeroCanvas />
      <AmbientParticles />
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-purple">
            1,000 doors. One swipe to open each.
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-7xl font-bold leading-[1.1] mb-6">
            What if you{" "}
            <span className="gradient-text italic">actually</span>{" "}
            sent it?
          </h1>
          <p className="mx-auto max-w-lg text-lg sm:text-xl text-muted leading-relaxed mb-8">
            AI finds the people, brands, and opportunities you&apos;d never think to reach.
            Then it writes the perfect cold message — in your voice.
            All you do is swipe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl gradient-bg px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-purple/25 transition hover:opacity-90 hover:shadow-xl hover:shadow-accent-purple/30 hover:-translate-y-0.5"
            >
              Get Your 1,000 What Ifs
            </Link>
            <Link
              href="#demo"
              className="rounded-2xl border border-border px-8 py-4 text-lg font-semibold text-foreground transition hover:bg-gray-50"
            >
              See it in action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
