"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-24 px-4 bg-white">
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-6">
          Your next big break is one
          <br />
          <span className="gradient-text">unsent message</span> away
        </h2>
        <p className="text-lg text-muted mb-8 max-w-md mx-auto">
          Stop wondering &ldquo;what if?&rdquo; and start sending. It takes 2 minutes to get your first 1,000 opportunities.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-2xl gradient-bg px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-purple/25 transition hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
        >
          Get Your 1,000 What Ifs — Free
        </Link>
      </motion.div>
    </section>
  );
}
