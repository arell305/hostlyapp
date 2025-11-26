"use client";

import { cn } from "@/shared/lib/utils";
import SkeletonLine from "./SkeletonLine";

const EventCardSkeleton = () => (
  <div className="relative flex border rounded-md  animate-pulse">
    <div className="space-x-6 flex w-full">
      <div className="px-2 py-1 rounded text-center w-20 flex flex-col items-center justify-center gap-1">
        <SkeletonLine width="w-12" height="h-4" />
        <SkeletonLine width="w-10" height="h-8" className="font-bold" />
      </div>

      <div className="flex flex-col py-2 gap-2 flex-1">
        <SkeletonLine width="w-72" height="h-8" />
        <SkeletonLine width="w-32" height="h-4" />
      </div>
    </div>
  </div>
);

interface EventCardsSkeletonProps {
  count?: number;
  className?: string;
}

const EventCardsSkeleton: React.FC<EventCardsSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-4 ", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default EventCardsSkeleton;
