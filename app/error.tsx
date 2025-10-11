// app/[slug]/app/templates/[userId]/error.tsx
"use client";

import { useEffect } from "react";

type ConvexClientError = Error & {
  digest?: string;
  data?: { code?: string; message?: string };
};

export default function TemplatesError({
  error,
  reset,
}: {
  error: ConvexClientError;
  reset: () => void;
}) {
  // Log full details for you (Sentry/console). Users won’t see this noise.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Templates route error:", {
      message: error.message,
      convex: error.data,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  // Prefer the friendly ConvexError message; fall back to generic
  const userMessage =
    error?.data?.message ??
    "We couldn’t load your templates right now. Please try again.";

  // Optional: map codes to even friendlier titles
  const titleByCode: Record<string, string> = {
    UNAUTHORIZED: "You don’t have access",
    NOT_IMPLEMENTED: "Coming soon",
    LOAD_FAILED: "Couldn’t load templates",
  };
  const title =
    (error?.data?.code && titleByCode[error.data.code]) ||
    "Something went wrong";

  return (
    <div className="m-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm">
      <div className="font-medium">{title}</div>
      <p className="mt-1 opacity-80">{userMessage}</p>

      <button
        onClick={reset}
        className="mt-3 rounded-md border px-3 py-1 text-sm"
      >
        Try again
      </button>

      {/* Dev-only details toggle */}
      {process.env.NODE_ENV !== "production" && (
        <details className="mt-3 opacity-70">
          <summary>Details (dev)</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs">
            {JSON.stringify(
              { code: error?.data?.code, digest: error?.digest },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
