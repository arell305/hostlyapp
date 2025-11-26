"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import { CardHeader } from "@/shared/ui/primitive/card";
import SkeletonLine from "./SkeletonLine";

const TemplateCardSkeleton = () => (
  <CustomCard>
    <CardHeader>
      <div className="flex items-start justify-between gap-4 mb-2">
        <SkeletonLine width="w-56" height="h-7" />
        <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
      </div>

      <SkeletonLine width="w-full" height="h-4" />
      <SkeletonLine width="w-11/12" height="h-4" className="mt-1" />
    </CardHeader>
  </CustomCard>
);

interface TemplatesSkeletonProps {
  count?: number;
  className?: string;
}

const TemplatesSkeleton: React.FC<TemplatesSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default TemplatesSkeleton;
