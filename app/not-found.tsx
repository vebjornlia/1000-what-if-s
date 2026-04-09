import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">🤔</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">
        Page not found
      </h1>
      <p className="text-muted max-w-md mb-6">
        This page doesn&apos;t exist. Maybe it&apos;s a what-if for another universe.
      </p>
      <Link
        href="/"
        className="rounded-xl gradient-bg px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
