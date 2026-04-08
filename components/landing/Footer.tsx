import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-[family-name:var(--font-playfair)] font-bold text-lg">
          <Sparkles className="h-5 w-5 text-accent-purple" />
          1000 What Ifs
        </div>
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} 1000 What Ifs. Life&apos;s too short for unsent messages.
        </p>
      </div>
    </footer>
  );
}
