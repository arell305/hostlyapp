"use client";

import CustomCard from "../cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const GuestCardSkeleton = () => (
  <div className="border-b p-4 w-full flex justify-between items-center">
    <div className="flex items-center gap-4">
      <SkeletonLine width="w-56" height="h-7" className="font-semibold" />
      <SkeletonLine width="w-40" height="h-6" className="opacity-70" />
    </div>

    <div className="w-10 h-10" />
  </div>
);

interface GuestListSkeletonProps {
  count?: number;
}

const GuestListSkeleton: React.FC<GuestListSkeletonProps> = ({ count = 3 }) => {
  return (
    <CustomCard>
      {Array.from({ length: count }).map((_, i) => (
        <GuestCardSkeleton key={i} />
      ))}
    </CustomCard>
  );
};

export default GuestListSkeleton;
