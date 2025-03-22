import { SubscriptionSchema } from "@/types/schemas-types";
import { formatDateMDY } from "../../../../utils/luxon";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { SubscriptionTier } from "@/types/enums";
import InfoRow from "./UserInfoRow";

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
      <InfoRow
        label="Subscription Cycle"
        value={`${formatDateMDY(subscription.currentPeriodStart)} - ${formatDateMDY(subscription.currentPeriodEnd)}`}
      />
      <InfoRow
        label="Guest List Events For Cycle"
        value={`${subscription.guestListEventsCount} / ${PLUS_GUEST_LIST_LIMIT}`}
      />
    </div>
  );
};

export default PlusTierData;
