"use client";

const items = [
  "🎬 What if you pitched Netflix your documentary idea?",
  "🎙️ What if you got on Joe Rogan's podcast?",
  "🚀 What if Y Combinator funded your side project?",
  "📰 What if Forbes wrote about your story?",
  "🤝 What if you DMed your hero and they replied?",
  "🎨 What if Nike collabed on your art?",
  "🌍 What if National Geographic followed your expedition?",
  "💼 What if you pitched Sequoia Capital?",
  "🎵 What if Spotify featured your playlist?",
  "📱 What if Apple showcased your app?",
];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-border bg-white py-4">
      <div className="flex animate-[marquee_40s_linear_infinite] gap-8">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-sm font-medium text-muted"
          >
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
