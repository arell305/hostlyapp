import { Skeleton } from "@/components/ui/skeleton";

const SkeletonMemberCard: React.FC = () => {
  return (
    <div className="border-b border-gray-300 p-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Skeleton for profile image */}
          <Skeleton className="w-16 h-16 rounded-full mr-4" />

          <div>
            {/* Skeleton for name */}
            <Skeleton className="h-5 w-36 mb-2" />
            {/* Skeleton for role */}
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Skeleton for menu button */}
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
};

export default SkeletonMemberCard;
