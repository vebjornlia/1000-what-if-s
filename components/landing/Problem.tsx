"use client";

import { motion } from "framer-motion";

export default function Problem() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-6">
            You have the talent.
            <br />
            <span className="gradient-text">You just never hit send.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed max-w-xl mx-auto">
            The best opportunities in your life aren&apos;t behind applications or job boards.
            They&apos;re one bold message away. But you never write it — because you don&apos;t know
            who to reach, what to say, or where to start.
          </p>
          <p className="mt-6 text-lg font-medium text-foreground">
            Until now.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
