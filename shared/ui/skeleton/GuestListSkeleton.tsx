"use client";

import CustomCard from "../cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const GuestCardSkeleton = () => (
  <div className="border-b p-4 w-full flex justify-between items-center">
    <div className="flex flex-col flex-1 min-w-0 gap-2">
      {/* Name — will truncate properly */}
      <SkeletonLine className="h-7 max-w-[70%] md:max-w-[50%]" />

      {/* Phone / email — smaller */}
      <SkeletonLine className="h-6 max-w-[60%] opacity-70" />
    </div>

    {/* Placeholder for check-in button */}
    <div className="w-10 h-10 flex-shrink-0" />
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
