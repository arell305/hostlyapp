import {
  SubscriptionStatus,
  SubscriptionTier,
  subscriptionStatusMap,
} from "../../../../utils/enum";

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
    <div className="border-b border-gray-300 p-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={imageUrl} // Replace with actual image URL
            alt={`${companyName} Avatar`}
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-4">
            <h3 className="text-lg font-medium font-raleway">{companyName}</h3>
            <span className="border border-altGray text-altBlack rounded-3xl px-3 py-1 text-xs">
              {subscriptionStatusMap[status]}
            </span>
          </div>
        </div>
        <div className="text-sm text-altBlack">{tier}</div>
      </div>
    </div>
  );
};

export default CompanyCard;
