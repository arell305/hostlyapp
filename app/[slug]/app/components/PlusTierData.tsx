import { SubscriptionSchema } from "@/types/schemas-types";
import { formatDateMDY } from "../../../../utils/luxon";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { SubscriptionTier } from "../../../../utils/enum";

interface PlusTierDataProps {
  subscription: SubscriptionSchema;
}

const PlusTierData: React.FC<PlusTierDataProps> = ({ subscription }) => {
  if (subscription.subscriptionTier !== SubscriptionTier.PLUS) {
    return null;
  }
  return (
    <div className="mb-8">
      <h4 className="font-bold text-xl md:text-2xl font-playfair pl-4">
        Plus Tier Data
      </h4>
      <div className="border-b py-3 px-4">
        <p className="font-bold">Subscription Cycle</p>
        <p>
          {formatDateMDY(subscription.currentPeriodStart)} -{" "}
          {formatDateMDY(subscription.currentPeriodEnd)}
        </p>
      </div>
      <div className="py-3 px-4 border-b">
        <p className="font-bold">Guest List Events For Cycle</p>
        <p>
          {subscription.guestListEventsCount} / {PLUS_GUEST_LIST_LIMIT}
        </p>
      </div>
    </div>
  );
};

export default PlusTierData;
