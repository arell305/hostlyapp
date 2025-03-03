import { useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  SubscriptionStatus,
  SubscriptionTier,
  subscriptionStatusMap,
} from "../../../../../utils/enum";
import Image from "next/image";
import { api } from "../../../../../convex/_generated/api";
import SkeletonMemberCard from "../loading/MemberCardSkeleton";

interface CompanyCardProps {
  photoStorageId: Id<"_storage"> | null;
  companyName: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  photoStorageId,
  companyName,
  status,
  tier,
}) => {
  const displayCompanyPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });

  if (displayCompanyPhoto === undefined) {
    return <SkeletonMemberCard />;
  }
  return (
    <div className="border-b border-gray-300 p-4 w-full hover:bg-gray-100 cursor-pointer hover:rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src={displayCompanyPhoto || "https://via.placeholder.com/50"}
            alt={`${companyName} Avatar`}
            className="w-16 h-16 \ rounded-md"
          />
          <div className="ml-4">
            <h3 className="text-lg font-medium font-raleway">{companyName}</h3>
            <span className="border border-altGray text-altBlack rounded-3xl px-3 py-1 text-xs">
              {subscriptionStatusMap[status]}
            </span>
          </div>
        </div>
        <div className=" text-altBlack">{tier}</div>
      </div>
    </div>
  );
};

export default CompanyCard;
