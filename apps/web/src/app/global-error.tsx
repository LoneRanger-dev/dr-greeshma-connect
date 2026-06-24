"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center dark:bg-slate-950">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Something went wrong
        </h2>
        <p className="max-w-md text-slate-500 dark:text-slate-400">
          {error.message || "A critical error occurred."}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
