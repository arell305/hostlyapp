import { CustomerSchema } from "@/types/schemas-types";
import { SubscriptionSchema } from "@/types/schemas-types";
import React, { useState } from "react";
import { useCancelSubscription } from "./hooks/useCancelSubscription";
import { useResumeSubscription } from "./hooks/useResumeSubscription";
import InfoRow from "../components/UserInfoRow";
import { GoPencil } from "react-icons/go";
import {
  subscriptionBenefits,
  SubscriptionStatus,
  subscriptionStatusMap,
} from "@/types/enums";
import { Button } from "@/components/ui/button";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import ResponsivePayment from "../components/responsive/ResponsivePayment";
import UpdateTierModal from "../components/modals/UpdateTierModal";
import { formatDateMDY } from "../../../../utils/luxon";
import CustomCard from "@/components/shared/cards/CustomCard";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import ButtonEndContainer from "@/components/shared/buttonContainers/ButtonEndContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import StaticField from "@/components/shared/fields/StaticField";
import EditToggleButton from "@/components/shared/buttonContainers/EditToggleButton";

interface SubscriptionContentProps {
  customer: CustomerSchema;
  subscription: SubscriptionSchema;
  canEditSettings: boolean;
}

const SubscriptionContent = ({
  customer,
  subscription,
  canEditSettings,
}: SubscriptionContentProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // Cancel Subscription
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showEditPaymentModal, setShowEditPaymentModal] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    cancelSubscription,
    isLoading: isCancelLoading,
    error: cancelError,
    setError: setCancelError,
  } = useCancelSubscription();
  const {
    resumeSubscription,
    isLoading: isResumeLoading,
    error: resumeError,
  } = useResumeSubscription();
  const closeModal = () => {
    setActiveModal(null);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setCancelError(null);
  };

  const handleEditPaymentModalOpenChange = (open: boolean) => {
    if (open) {
      setShowEditPaymentModal(true);
    } else {
      setShowEditPaymentModal(false);
    }
  };

  const handleResume = async () => {
    await resumeSubscription();
  };
  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setShowConfirmModal(false);
    }
  };

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

  return (
    <section>
      <SectionHeaderWithAction
        title="Subscription"
        actions={
          <EditToggleButton
            isEditing={isEditing}
            onToggle={() => setIsEditing((prev) => !prev)}
          />
        }
      />
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

        <div
          onClick={() => canEditSettings && setActiveModal("update_tier")}
          className={`px-4 flex items-center justify-between border-b py-3 ${
            canEditSettings
              ? "cursor-pointer hover:bg-gray-100 hover:rounded-md"
              : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tier</h3>
              <p className="text-lg font-semibold">
                {subscription.subscriptionTier}
                <span className="pl-2 text-gray-600 text-base">
                  ({subscriptionBenefits[subscription.subscriptionTier]})
                </span>
              </p>
            </div>
          </div>
          <div>{canEditSettings && <GoPencil className="text-2xl" />}</div>
        </div>

        <div
          className={`px-4 flex justify-between items-center border-b py-3 ${
            canEditSettings
              ? "cursor-pointer hover:bg-gray-100 hover:rounded-md"
              : ""
          }`}
          onClick={() => canEditSettings && setShowEditPaymentModal(true)}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Payment Details
            </h3>
            <p className="text-lg font-semibold">
              {customer.last4
                ? `**** **** **** ${customer.last4}`
                : "No details available"}
            </p>
          </div>
          <div className={`relative ${canEditSettings ? "ml-auto" : ""}`}>
            {canEditSettings && <GoPencil className="text-2xl" />}
          </div>
        </div>

        <ResponsiveConfirm
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
        />
      </CustomCard>

      {/* Cancel or Resume Subscription Button */}
      {canEditSettings && (
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
      )}
    </section>
  );
};

export default SubscriptionContent;
