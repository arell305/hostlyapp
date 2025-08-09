"use client";

import React from "react";

const SkeletonBox = ({
  w,
  h,
  className = "",
}: {
  w: string;
  h: string;
  className?: string;
}) => (
  <div className={`${w} ${h} bg-zinc-700 rounded animate-pulse ${className}`} />
);

interface AnalyticsSkeletonProps {
  className?: string;
}

const AnalyticsSkeleton: React.FC<AnalyticsSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPI cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonBox w="w-full" h="h-20" />
        <SkeletonBox w="w-full" h="h-20" />
        <SkeletonBox w="w-full" h="h-20" />
        <SkeletonBox w="w-full" h="h-20" />
      </div>

      {/* Chart placeholder */}
      <SkeletonBox w="w-full" h="h-64" />

      {/* Optional second chart */}
      <SkeletonBox w="w-full" h="h-64" />
    </div>
  );
};

export default AnalyticsSkeleton;
