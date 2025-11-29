import { cn } from "@/shared/lib/utils";

interface AvatarSkeletonProps {
  className?: string;
}
const AvatarSkeleton = ({ className }: AvatarSkeletonProps) => {
  return (
    <div className={cn(` rounded-full bg-gray-700 animate-pulse`, className)} />
  );
};

export default AvatarSkeleton;
