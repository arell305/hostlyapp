"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const FaqCardSkeleton = () => (
  <CustomCard className="group relative p-4 hover:shadow-md transition-shadow">
    <div className="pr-10 space-y-3">
      {/* Question */}
      <SkeletonLine width="w-4/5" height="h-6" className="font-medium" />

      {/* Answer — 2 lines */}
      <SkeletonLine width="w-full" height="h-4" />
      <SkeletonLine width="w-11/12" height="h-4" />
    </div>

    {/* Actions placeholder (top-right) */}
    <div className="absolute top-4 right-4">
      <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </CustomCard>
);

interface FaqCardsSkeletonProps {
  count?: number;
  className?: string;
}

const FaqCardsSkeleton: React.FC<FaqCardsSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <FaqCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default FaqCardsSkeleton;
