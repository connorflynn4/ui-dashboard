"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="rounded-[32px] border border-rose-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-rose-500">Report error</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">The dashboard could not be generated.</h2>
        <p className="mt-3 text-sm text-slate-500">{error.message || "An unexpected error occurred while building the report."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
