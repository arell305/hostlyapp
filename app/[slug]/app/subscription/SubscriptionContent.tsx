import { CustomerSchema } from "@/types/schemas-types";
import { SubscriptionSchema } from "@/types/schemas-types";
import React, { useState } from "react";
// import { useCancelSubscription } from "./hooks/useCancelSubscription";
// import { useResumeSubscription } from "./hooks/useResumeSubscription";
// import { GoPencil } from "react-icons/go";
import {
  subscriptionBenefits,
  SubscriptionStatus,
  subscriptionStatusMap,
  SubscriptionTier,
} from "@/types/enums";
// import { Button } from "@/components/ui/button";
// import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
// import ResponsivePayment from "../components/responsive/ResponsivePayment";
// import UpdateTierModal from "../components/modals/UpdateTierModal";
import { formatDateMDY } from "../../../../utils/luxon";
import CustomCard from "@/components/shared/cards/CustomCard";
// import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
// import ButtonEndContainer from "@/components/shared/buttonContainers/ButtonEndContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import StaticField from "@/components/shared/fields/StaticField";
import { Plus } from "lucide-react";
import ClickableField from "@/components/shared/fields/ClickableField";
import { GuestListCheckout } from "../components/modals/GuestListCheckoutContent";
import { CONTACT_EMAIL, PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface SubscriptionContentProps {
  customer: CustomerSchema;
  subscription: SubscriptionSchema;
  canEditSettings: boolean;
  availableCredits?: number;
}

const SubscriptionContent = ({
  customer,
  subscription,
  availableCredits,
}: SubscriptionContentProps) => {
  // const [activeModal, setActiveModal] = useState<string | null>(null);
  // Cancel Subscription
  // const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  // const [showEditPaymentModal, setShowEditPaymentModal] =
  //   useState<boolean>(false);
  const [showGuestListCheckout, setShowGuestListCheckout] =
    useState<boolean>(false);

  // const {
  //   cancelSubscription,
  //   isLoading: isCancelLoading,
  //   error: cancelError,
  //   setError: setCancelError,
  // } = useCancelSubscription();
  // const {
  //   resumeSubscription,
  //   isLoading: isResumeLoading,
  //   error: resumeError,
  // } = useResumeSubscription();
  // const closeModal = () => {
  //   setActiveModal(null);
  // };

  // const handleCloseConfirmModal = () => {
  //   setShowConfirmModal(false);
  //   setCancelError(null);
  // };

  // const handleEditPaymentModalOpenChange = (open: boolean) => {
  //   if (open) {
  //     setShowEditPaymentModal(true);
  //   } else {
  //     setShowEditPaymentModal(false);
  //   }
  // };

  // const handleResume = async () => {
  //   await resumeSubscription();
  // };
  // const handleCancelSubscription = async () => {
  //   const success = await cancelSubscription();
  //   if (success) {
  //     setShowConfirmModal(false);
  //   }
  // };

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
    subscriptionTier === SubscriptionTier.PLUS ||
    subscriptionTier === SubscriptionTier.STANDARD;
  const showGuestEventsThisCycle = subscriptionTier === SubscriptionTier.PLUS;
  return (
    <SectionContainer>
      <SectionHeaderWithAction title="Subscription" />

      <CustomCard className="p-0">
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
          value={`$${subscription.amount.toFixed(2)}/month`}
          secondaryValue={
            subscription.discount
              ? `${subscription.discount.discountPercentage}% Discount Applied`
              : undefined
          }
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
        {/* 
<ClickableField
  label="Tier"
  value={`${subscriptionTier} (${subscriptionBenefits[subscriptionTier]})`}
  onClick={() => {
    if (canEditSettings) setActiveModal("update_tier");
  }}
  className={
    canEditSettings ? "cursor-pointer rounded-md" : "cursor-default"
  }
  actionIcon={
    canEditSettings ? <GoPencil className="text-2xl" /> : undefined
  }
/>
*/}

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
        {/* 
<ClickableField
  label="Payment Details"
  value={
    customer.last4
      ? `**** **** **** ${customer.last4}`
      : "No details available"
  }
  onClick={() => {
    if (canEditSettings) setShowEditPaymentModal(true);
  }}
  className={
    canEditSettings ? "cursor-pointer rounded-md" : "cursor-default"
  }
  actionIcon={
    canEditSettings ? <GoPencil className="text-2xl" /> : undefined
  }
/>
*/}

        {/* <ResponsiveConfirm
          isOpen={showConfirmModal}
          title="Confirm Subscription Cancellation"
          confirmText="Cancel"
          cancelText="Keep Subscription"
          content="Are you sure you want to cancel? You will have access to your account until your next Payment Date."
          confirmVariant="destructive"
          modalProps={{
            onClose: handleCloseConfirmModal,
            onConfirm: handleCancelSubscription,
          }}
          drawerProps={{
            onOpenChange: handleCloseConfirmModal,
            onSubmit: handleCancelSubscription,
          }}
          error={cancelError}
          isLoading={isCancelLoading}
        />
        <ResponsivePayment
          isOpen={showEditPaymentModal}
          onOpenChange={handleEditPaymentModalOpenChange}
        />
        <UpdateTierModal
          isOpen={activeModal === "update_tier"}
          onClose={closeModal}
          currentTier={subscription.subscriptionTier}
        /> */}
        <GuestListCheckout
          open={showGuestListCheckout && showGuestEventsCredit}
          onOpenChange={setShowGuestListCheckout}
        />
      </CustomCard>

      <p className="text-sm text-muted-foreground mt-6 pl-2">
        Please email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        to update your subscription.
      </p>
      {/* Cancel or Resume Subscription Button */}
      {/* {canEditSettings && (
        <ButtonEndContainer>
          {subscription.subscriptionStatus ===
          SubscriptionStatus.PENDING_CANCELLATION ? (
            <div className="flex flex-col items-end">
              <SingleSubmitButton
                isLoading={isResumeLoading}
                error={resumeError}
                onClick={handleResume}
                label="Resume"
              />
            </div>
          ) : (
            <Button
              onClick={() => setShowConfirmModal(true)}
              className="text-whiteText hover:text-whiteText/80 underline w-auto text-base"
              variant="navGhost"
            >
              Cancel Subscription
            </Button>
          )}
        </ButtonEndContainer>
      )} */}
    </SectionContainer>
  );
};

export default SubscriptionContent;
