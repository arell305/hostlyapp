"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const MessagePreviewSkeleton = () => (
  <div className="flex gap-3 p-4 rounded-lg hover:bg-cardBackgroundHover -mx-2">
    <div className="w-11 h-11 rounded-full bg-muted/70 animate-pulse flex-shrink-0" />

    <div className="flex-1 min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SkeletonLine width="w-44" />
        <SkeletonLine width="w-20" />
      </div>

      <SkeletonLine width="w-full" className="max-w-lg" />
    </div>
  </div>
);

interface MessagePreviewListSkeletonProps {
  count?: number;
  className?: string;
}

const MessagePreviewListSkeleton: React.FC<MessagePreviewListSkeletonProps> = ({
  count = 3,
  className = "",
}) => {
  return (
    <CustomCard className={className}>
      {Array.from({ length: count }, (_, i) => (
        <MessagePreviewSkeleton key={i} />
      ))}
    </CustomCard>
  );
};

export default MessagePreviewListSkeleton;
