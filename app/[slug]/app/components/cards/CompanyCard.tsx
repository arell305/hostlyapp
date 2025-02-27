import {
  SubscriptionStatus,
  SubscriptionTier,
  subscriptionStatusMap,
} from "../../../../../utils/enum";

interface CompanyCardProps {
  imageUrl: string;
  companyName: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  imageUrl,
  companyName,
  status,
  tier,
}) => {
  return (
    <div className="border-b border-gray-300 p-4 w-full hover:bg-gray-100 cursor-pointer hover:rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={imageUrl} // Replace with actual image URL
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
