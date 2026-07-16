"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { aggregateCategories } from "@/lib/utils/categoryStats";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Send, X as XIcon, MessageCircle, BarChart3 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  total: number;
  unseen: number;
  skipped: number;
  queued: number;
  sent: number;
  replied: number;
  categories: { name: string; value: number }[];
}

const COLORS = ["#7B68EE", "#00B894", "#FFD700", "#FF6B6B", "#4ECDC4", "#FF8A5C", "#A78BFA", "#F472B6"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: allCards } = await supabase
      .from("what_ifs")
      .select("status, category, got_reply")
      .eq("user_id", user.id);

    if (!allCards) {
      setLoading(false);
      return;
    }

    let unseen = 0, skipped = 0, queued = 0, sent = 0, replied = 0;

    for (const card of allCards) {
      if (card.status === "unseen") unseen++;
      if (card.status === "skipped") skipped++;
      if (card.status === "queued") queued++;
      if (card.status === "sent") sent++;
      if (card.got_reply) replied++;
    }

    const categories = aggregateCategories(allCards);

    setStats({
      total: allCards.length,
      unseen,
      skipped,
      queued,
      sent,
      replied,
      categories,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <BarChart3 className="h-12 w-12 text-accent-purple mb-4" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">
          No stats yet
        </h2>
        <p className="text-muted text-center">Generate and swipe through some what-ifs to see your dashboard.</p>
      </div>
    );
  }

  const statusData = [
    { name: "Unseen", value: stats.unseen },
    { name: "Skipped", value: stats.skipped },
    { name: "Queued", value: stats.queued },
    { name: "Sent", value: stats.sent },
  ].filter((d) => d.value > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total What-Ifs", value: stats.total, icon: Sparkles, color: "text-accent-purple" },
          { label: "Sent", value: stats.sent, icon: Send, color: "text-accent-teal" },
          { label: "Skipped", value: stats.skipped, icon: XIcon, color: "text-red-400" },
          { label: "Replies", value: stats.replied, icon: MessageCircle, color: "text-yellow-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border border-border bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Status pie chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-semibold mb-4">Swipe Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category bar chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-semibold mb-4">Categories</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.categories.slice(0, 8)} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {stats.categories.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generate more */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batchSize: 50, batchNumber: Math.ceil(stats.total / 50) + 1 }),
            }).then(() => fetchStats());
          }}
          className="rounded-xl gradient-bg px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Generate 50 More What Ifs
        </button>
      </div>
    </div>
  );
}
