"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const demoCards = [
  {
    emoji: "🎬",
    category: "Film",
    recipient: "A24 Films",
    message:
      "Hey A24 team — I just wrapped a short doc about underground skateboard culture in Oslo that has the same raw energy as your early Safdie brothers stuff. Would love to share a 2-min teaser. Who should I send it to?",
  },
  {
    emoji: "🎙️",
    category: "Podcast",
    recipient: "Lex Fridman Podcast",
    message:
      "Lex — I've spent 3 years building AI that generates life-changing opportunities for people. The thesis: most people's biggest break is one unsent message away. Would love to unpack the psychology of that on your show.",
  },
  {
    emoji: "🚀",
    category: "Startup",
    recipient: "Y Combinator",
    message:
      "YC team — We're building the 'Tinder for opportunities.' AI analyzes who you are and generates 1,000 cold messages you should send. Would love to tell you more — applying for W25.",
  },
  {
    emoji: "🤝",
    category: "Collab",
    recipient: "MrBeast",
    message:
      "Jimmy — What if we ran an experiment: give 100 random people their 'dream cold message' and film what happens? Could be the most inspiring video on YouTube this year.",
  },
  {
    emoji: "📰",
    category: "Press",
    recipient: "TechCrunch",
    message:
      "Hey TC — I built an AI that writes 1,000 personalized cold outreach messages and lets you Tinder-swipe through them. It finds the best email for each contact and drafts messages in your voice. Story?",
  },
  {
    emoji: "🎨",
    category: "Sponsorship",
    recipient: "Nike",
    message:
      "Nike team — I'm documenting 1,000 bold asks in 30 days. Every day, I send cold messages to dream contacts and film what happens. It's the 'Just Do It' ethos, literally. Sponsorship collab?",
  },
];

export default function SwipeDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleSwipe() {
    setCurrentIndex((prev) => (prev + 1) % demoCards.length);
  }

  return (
    <section id="demo" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          Try it yourself
        </motion.h2>
        <p className="text-center text-muted mb-12 text-lg">
          Drag a card or tap the buttons. These are real examples.
        </p>

        <div className="relative mx-auto h-[420px] w-full max-w-sm">
          {/* Stacked background cards */}
          {[2, 1].map((offset) => (
            <div
              key={`bg-${offset}`}
              className="absolute inset-0 rounded-3xl border border-border bg-white shadow-sm"
              style={{
                transform: `scale(${1 - offset * 0.04}) translateY(${offset * 12}px)`,
                opacity: 1 - offset * 0.15,
                zIndex: 10 - offset,
              }}
            />
          ))}

          {/* Active card */}
          <DemoCard
            key={currentIndex}
            card={demoCards[currentIndex % demoCards.length]}
            onSwipe={handleSwipe}
          />

          {/* Buttons */}
          <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 gap-6">
            <button
              onClick={handleSwipe}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 text-red-400 transition hover:bg-red-50 hover:border-red-300 text-xl"
            >
              ✕
            </button>
            <button
              onClick={handleSwipe}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-200 text-green-500 transition hover:bg-green-50 hover:border-green-300 text-xl"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoCard({
  card,
  onSwipe,
}: {
  card: (typeof demoCards)[0];
  onSwipe: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const sendOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0 z-20 cursor-grab rounded-3xl border border-border bg-white p-6 shadow-lg active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          animate(x, 500, { duration: 0.3 });
          setTimeout(onSwipe, 200);
        } else if (info.offset.x < -100) {
          animate(x, -500, { duration: 0.3 });
          setTimeout(onSwipe, 200);
        } else {
          animate(x, 0, { type: "spring", stiffness: 300 });
        }
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Swipe indicators */}
      <motion.div
        className="absolute top-6 right-6 rounded-lg bg-green-100 px-3 py-1 text-sm font-bold text-green-600 rotate-12"
        style={{ opacity: sendOpacity }}
      >
        SEND ✨
      </motion.div>
      <motion.div
        className="absolute top-6 left-6 rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-500 -rotate-12"
        style={{ opacity: skipOpacity }}
      >
        SKIP
      </motion.div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{card.emoji}</span>
        <span className="rounded-full gradient-bg px-3 py-0.5 text-xs font-semibold text-white">
          {card.category}
        </span>
      </div>

      <p className="text-sm font-semibold text-muted mb-1">To:</p>
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">
        {card.recipient}
      </h3>

      <p className="text-sm text-muted leading-relaxed">{card.message}</p>
    </motion.div>
  );
}
