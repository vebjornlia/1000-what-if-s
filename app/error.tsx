"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-3">
        Something went wrong
      </h1>
      <p className="text-muted max-w-md mb-6">
        We hit an unexpected error. Try again, and if it keeps happening, reach out to us.
      </p>
      <button
        onClick={reset}
        className="rounded-xl gradient-bg px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
