"use client";

import { cn } from "@/shared/lib/utils";

interface SkeletonLineProps {
  width?: string;
  className?: string;
  height?: string;
}

const SkeletonLine = ({
  width = "w-full",
  className,
  height = "h-4",
}: SkeletonLineProps) => {
  return (
    <div
      className={cn(
        "h-4 rounded animate-pulse bg-zinc-700",
        width,
        height,
        className
      )}
    />
  );
};

export default SkeletonLine;
