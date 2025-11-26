"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import { CardHeader } from "@/shared/ui/primitive/card";
import SkeletonLine from "./SkeletonLine";

const CampaignCardSkeleton = () => (
  <CustomCard className="hover:shadow-glow-white min-h-[80px]">
    <CardHeader className="flex flex-row items-start justify-between space-y-0">
      <div className="flex flex-col gap-y-2">
        <SkeletonLine width="w-64" />
        <div className="flex gap-2">
          <SkeletonLine width="w-20" />
          <SkeletonLine width="w-28" />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
      </div>
    </CardHeader>
  </CustomCard>
);

interface CampaignCardsSkeletonProps {
  count?: number;
  className?: string;
}

const CampaignCardsSkeleton: React.FC<CampaignCardsSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default CampaignCardsSkeleton;
