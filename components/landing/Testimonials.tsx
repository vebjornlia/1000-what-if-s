"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I sent a message to A24 and they actually replied. This app is unreal.",
    name: "Sarah K.",
    role: "Filmmaker",
  },
  {
    quote: "Got on 3 podcasts in my first week. I never would have cold-emailed any of them.",
    name: "Marcus T.",
    role: "Startup Founder",
  },
  {
    quote: "The AI sounds more like me than I do. It's scary good.",
    name: "Priya M.",
    role: "Designer & Artist",
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
          People are actually <span className="gradient-text">sending it</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-border bg-[#FCFCFA] p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="mb-4 text-lg leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
