"use client";

import { useState } from "react";
import {
  subscriptionBenefits,
  SubscriptionStatus,
  subscriptionStatusMap,
  SubscriptionTier,
} from "@shared/types/enums";
import { formatDateMDY } from "@shared/utils/luxon";
import CustomCard from "@shared/ui/cards/CustomCard";
import StaticField from "@shared/ui/fields/StaticField";
import { Plus } from "lucide-react";
import ClickableField from "@shared/ui/fields/ClickableField";
import { GuestListCheckout } from "@shared/ui/modals/GuestListCheckoutContent";
import { CONTACT_EMAIL, PLUS_GUEST_LIST_LIMIT } from "@shared/types/constants";
import { formatSubscriptionAmount } from "@/shared/utils/helpers";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { isAdmin } from "@/shared/utils/permissions";
import { Doc } from "convex/_generated/dataModel";

interface SubscriptionContentProps {
  customer: Doc<"customers">;
}

const SubscriptionPageContent = ({ customer }: SubscriptionContentProps) => {
  const { subscription, availableCredits, orgRole } = useContextOrganization();
  const [showGuestListCheckout, setShowGuestListCheckout] =
    useState<boolean>(false);

  let subscriptionStatusText: string = "Unknown Status";
  if (subscription) {
    subscriptionStatusText =
      subscriptionStatusMap[subscription.subscriptionStatus];
  }

  let nextPaymentText: string = "Next Payment";
  if (
    subscription?.subscriptionStatus === SubscriptionStatus.PENDING_CANCELLATION
  ) {
    nextPaymentText = "Last Access Date";
  }

  const subscriptionTier = subscription.subscriptionTier;
  const canEditSettings = isAdmin(orgRole);
  const showGuestEventsCredit =
    subscriptionTier === "PLUS" || subscriptionTier === "STANDARD";
  const showGuestEventsThisCycle = subscriptionTier === "PLUS";

  const amount = formatSubscriptionAmount(subscription);
  return (
    <div>
      <CustomCard>
        <StaticField label="Status" value={subscriptionStatusText} />
        <StaticField
          label={nextPaymentText}
          value={
            subscription.currentPeriodEnd
              ? formatDateMDY(subscription.currentPeriodEnd)
              : "N/A"
          }
        />
        <StaticField label="Amount" value={`${amount}/month`} />
        {showGuestEventsThisCycle && (
          <StaticField
            label="Guest Events This Cycle"
            value={`${subscription.guestListEventsCount}/${PLUS_GUEST_LIST_LIMIT}`}
          />
        )}

        <StaticField
          label="Tier"
          value={`${subscriptionTier} (${subscriptionBenefits[subscriptionTier]})`}
        />

        <StaticField
          label="Payment Details"
          value={
            customer?.last4
              ? `**** **** **** ${customer?.last4}`
              : "No details available"
          }
        />
        {showGuestEventsCredit && canEditSettings && (
          <ClickableField
            label="Guest Events Credit"
            value={`${availableCredits ?? 0} Credits`}
            onClick={() => setShowGuestListCheckout(true)}
            actionIcon={<Plus className="text-2xl" />}
          />
        )}

        <GuestListCheckout
          open={showGuestListCheckout && showGuestEventsCredit}
          onOpenChange={setShowGuestListCheckout}
        />
      </CustomCard>

      <p className="text-sm text-muted-foreground mt-6  w-full overflow-hidden">
        Please email{" "}
        <a
          className="underline hover:opacity-80"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>{" "}
        to update your subscription.
      </p>
    </div>
  );
};

export default SubscriptionPageContent;
