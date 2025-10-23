"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";

const MemberCardSkeleton = () => {
  return (
    <CustomCard className="flex-row items-center gap-4 p-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-zinc-700 animate-pulse" />

      {/* Name & Role */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="w-32 h-4 rounded bg-zinc-700 animate-pulse" />
        <div className="w-20 h-3 rounded bg-zinc-800 animate-pulse" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
      </div>
    </CustomCard>
  );
};

export default MemberCardSkeleton;
