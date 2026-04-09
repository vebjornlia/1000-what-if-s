"use client";

import { motion } from "framer-motion";

const examples = [
  {
    emoji: "🎬",
    who: "A filmmaker",
    description:
      "gets matched with indie production studios, film festival organizers, and local podcast hosts covering the creative scene.",
  },
  {
    emoji: "🚀",
    who: "A startup founder",
    description:
      "discovers niche podcast hosts, relevant angel investors, and potential co-marketing partners they never would have found.",
  },
  {
    emoji: "🎨",
    who: "A freelance designer",
    description:
      "finds agencies looking for contract work, local businesses needing a rebrand, and creators looking for collaborators.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          Opportunities you&apos;d <span className="gradient-text">never find alone</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {examples.map((ex, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-border bg-[#FCFCFA] p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-3xl mb-3">{ex.emoji}</p>
              <p className="font-semibold mb-2">{ex.who}</p>
              <p className="text-sm text-muted leading-relaxed">{ex.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
