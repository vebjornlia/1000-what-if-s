"use client";

import { motion } from "framer-motion";
import { Mic, Sparkles, Send } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Tell it who you are",
    description:
      "Have a 2-minute voice conversation with AI. It learns your skills, goals, tone, and edges.",
  },
  {
    icon: Sparkles,
    title: "It finds 1,000 doors",
    description:
      "Real companies, podcasts, brands, and people — each with a message drafted in YOUR voice.",
  },
  {
    icon: Send,
    title: "Swipe to send",
    description:
      "Swipe right to queue, left to skip. Review, edit, and send — all in seconds.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          How it works
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg text-white">
                <step.icon className="h-7 w-7" />
              </div>
              <div className="mb-2 text-sm font-bold text-accent-purple">
                Step {i + 1}
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
