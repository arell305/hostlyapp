import React, { useState } from "react";
import {
  subscriptionBenefits,
  SubscriptionStatus,
  subscriptionStatusMap,
  SubscriptionTier,
} from "@/types/enums";
import { formatDateMDY } from "../../../../utils/luxon";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { Plus } from "lucide-react";
import ClickableField from "@/components/shared/fields/ClickableField";
import { GuestListCheckout } from "../components/modals/GuestListCheckoutContent";
import { CONTACT_EMAIL, PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { formatSubscriptionAmount } from "@/utils/helpers";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useGetCustomer } from "./hooks/useGetCustomer";
import { isAdmin } from "@/utils/permissions";

const SubscriptionContent = () => {
  const { subscription, availableCredits, orgRole } = useContextOrganization();
  const [showGuestListCheckout, setShowGuestListCheckout] =
    useState<boolean>(false);
  const { component: customerComponent, customer: customerDetails } =
    useGetCustomer();

  if (customerComponent) {
    return customerComponent;
  }

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
    subscriptionTier === SubscriptionTier.PLUS ||
    subscriptionTier === SubscriptionTier.STANDARD;
  const showGuestEventsThisCycle = subscriptionTier === SubscriptionTier.PLUS;

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
            customerDetails?.last4
              ? `**** **** **** ${customerDetails?.last4}`
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

export default SubscriptionContent;
