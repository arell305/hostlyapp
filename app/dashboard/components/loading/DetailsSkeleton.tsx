import { Skeleton } from "@/components/ui/skeleton";

const DetailsSkeleton = () => {
  return (
    <div className="space-y-2 p-4 ">
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
    </div>
  );
};

export default DetailsSkeleton;
