"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "../shared/AnimatedCounter";

const stats = [
  { value: 147000, suffix: "+", label: "What-ifs generated" },
  { value: 23, suffix: "%", label: "Average response rate" },
  { value: 4200, suffix: "+", label: "Messages actually sent" },
];

export default function Stats() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-[family-name:var(--font-playfair)] text-5xl font-bold gradient-text">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-muted font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
