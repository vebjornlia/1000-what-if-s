"use client";

import { motion } from "framer-motion";
import { Zap, Target, PenTool } from "lucide-react";

const highlights = [
  { icon: Zap, label: "AI-generated opportunities", description: "Personalized to your skills, goals, and style" },
  { icon: Target, label: "Smart email discovery", description: "Finds the best contact for each recipient" },
  { icon: PenTool, label: "Messages that sound like you", description: "Not generic templates — your voice, your tone" },
];

export default function Stats() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1 }}
            >
              <item.icon className="mx-auto h-10 w-10 text-accent-purple mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-xl font-bold">
                {item.label}
              </p>
              <p className="mt-2 text-muted text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
