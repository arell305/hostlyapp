"use client";

import CustomCard from "../cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const TicketCardSkeleton = () => (
  <div className="border-b p-4 w-full flex justify-between items-center">
    <div className="flex flex-col flex-1 min-w-0 gap-2">
      <SkeletonLine width="w-48" height="h-6" className="font-semibold" />

      <div className="flex items-center gap-3">
        <SkeletonLine
          width="w-40"
          height="h-5"
          className="text-sm opacity-70"
        />
      </div>
    </div>

    <div className="w-10 h-10" />
  </div>
);

interface TicketsSkeletonProps {
  count?: number;
  className?: string;
}
const TicketsSkeleton: React.FC<TicketsSkeletonProps> = ({
  count = 4,
  className,
}) => {
  return (
    <CustomCard className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </CustomCard>
  );
};

export default TicketsSkeleton;
