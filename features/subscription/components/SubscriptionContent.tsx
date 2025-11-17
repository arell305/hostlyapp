import React, { useState } from "react";
import {
  subscriptionBenefits,
  SubscriptionStatus,
  subscriptionStatusMap,
  SubscriptionTier,
} from "@shared/types/enums";
import { formatDateMDY } from "@shared/utils/luxon";
import CustomCard from "@shared/ui/cards/CustomCard";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import StaticField from "@shared/ui/fields/StaticField";
import { Plus } from "lucide-react";
import ClickableField from "@shared/ui/fields/ClickableField";
import { GuestListCheckout } from "@shared/ui/modals/GuestListCheckoutContent";
import { CONTACT_EMAIL, PLUS_GUEST_LIST_LIMIT } from "@shared/types/constants";
import { formatCurrency } from "@shared/utils/helpers";
import { Doc } from "convex/_generated/dataModel";

interface SubscriptionContentProps {
  customer: Doc<"customers">;
  subscription: Doc<"subscriptions">;
  canEditSettings: boolean;
  availableCredits?: number;
}

const SubscriptionContent = ({
  customer,
  subscription,
  availableCredits,
}: SubscriptionContentProps) => {
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
  const showGuestEventsCredit =
    subscriptionTier === "PLUS" || subscriptionTier === "STANDARD";
  const showGuestEventsThisCycle = subscriptionTier === "PLUS";
  return (
    <section>
      <SectionHeaderWithAction title="Subscription" />

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
        <StaticField
          label="Amount"
          value={`${formatCurrency(subscription.amount)}/month`}
        />
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
            customer.last4
              ? `**** **** **** ${customer.last4}`
              : "No details available"
          }
        />
        {showGuestEventsCredit && (
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
    </section>
  );
};

export default SubscriptionContent;
