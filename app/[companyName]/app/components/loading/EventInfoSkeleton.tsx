import { Skeleton } from "@/components/ui/skeleton";

const EventInfoSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-64 w-full rounded-lg mt-4" />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </div>
    </div>
  );
};

export default EventInfoSkeleton;
