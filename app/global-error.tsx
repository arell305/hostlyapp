"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; data?: any };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: send to your logger/Sentry
    console.error("Global error:", error);
  }, [error]);

  const message =
    (error as any)?.data?.message ?? error.message ?? "Unexpected error.";

  return (
    <html>
      <body>
        <div className="m-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <div className="font-medium">Something went wrong</div>
          <p className="mt-1 opacity-80">{message}</p>
          <button
            onClick={reset}
            className="mt-3 rounded-md border px-3 py-1 text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
