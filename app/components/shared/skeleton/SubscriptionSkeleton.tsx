"use client";

import clsx from "clsx";

export default function SubscriptionSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "w-full max-w-2xl mx-auto rounded-xl border border-neutral-800 bg-neutral-900 p-4 md:p-6",
        "animate-pulse",
        className
      )}
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i}>
          <div className="flex flex-col gap-2 py-3">
            {/* label placeholder */}
            <div className="h-3 w-24 rounded-md bg-neutral-800" />
            {/* value placeholder */}
            <div
              className={clsx(
                "h-5 rounded-md bg-neutral-700",
                i === 3 || i === 6 ? "w-16" : i === 5 ? "w-40" : "w-3/5"
              )}
            />
          </div>
          {i < 6 && <div className="h-px bg-neutral-800 my-1" />}
        </div>
      ))}
    </div>
  );
}
