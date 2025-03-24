"use client";
import { useAuth } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UpdateTierModal from "../components/modals/UpdateTierModal";
import { GoPencil } from "react-icons/go";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import ResponsivePayment from "../components/responsive/ResponsivePayment";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { FrontendErrorMessages } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { formatDateMDY } from "../../../../utils/luxon";
import { CustomerSchema } from "@/types/schemas-types";
import {
  ResponseStatus,
  SubscriptionStatus,
  UserRole,
  subscriptionBenefits,
  subscriptionStatusMap,
} from "@/types/enums";
import InfoRow from "../components/UserInfoRow";

const SubscriptionTab = () => {
  const [resumeLoading, setResumeLoading] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { orgRole } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);

  // Cancel Subscription
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isCancelSubscriptionLoading, setIsCancelSubscriptionLoading] =
    useState<boolean>(false);
  const [cancelSubscriptionError, setCancelSubscriptionError] = useState<
    string | null
  >(null);

  // Update Payment
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setRefreshKey((prev) => prev + 1);
  };

  const {
    organization,
    organizationContextLoading,
    organizationContextError,
    subscription,
  } = useContextOrganization();

  const customerDetails = useQuery(
    api.customers.getCustomerDetails,
    organization
      ? {
          organizationId: organization._id,
        }
      : "skip"
  );

  useEffect(() => {}, [, refreshKey]);

  const handleEditPaymentModalOpenChange = (open: boolean) => {
    if (open) {
      setShowEditPaymentModal(true);
    } else {
      setShowEditPaymentModal(false);
    }
  };

  const cancelSubscription = useAction(api.customers.cancelSubscription);
  const resumeSubscription = useAction(api.customers.resumeSubscription);

  const handleResume = async () => {
    setResumeError(null);
    setResumeLoading(true);

    try {
      const response = await resumeSubscription();

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Subscription Resumed",
          description: "Your subscription has been resume.",
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        setResumeError(FrontendErrorMessages.GENERIC_ERROR);
        console.error(response.error);
      }
    } catch (error) {
      setResumeError(FrontendErrorMessages.GENERIC_ERROR);
      console.error(error);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelSubscriptionError(null);
    setIsCancelSubscriptionLoading(true);
    try {
      const result = await cancelSubscription();
      if (result.status === ResponseStatus.SUCCESS) {
        setShowConfirmModal(false);
        toast({
          title: "Cancellation successful",
          description: "Your subscription has been cancelled.",
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        console.error(result.error);
        setCancelSubscriptionError(
          "Failed to cancel subscription. Please try again"
        );
      }
    } catch (error) {
      console.error(error);
      setCancelSubscriptionError(
        "Failed to cancel subscription. Please try again"
      );
    } finally {
      setIsCancelSubscriptionLoading(false);
    }
  };

  const canEditSettings = orgRole === UserRole.Admin;

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
  // const isDiscount =
  //   customerDetails.discountPercentage &&
  //   customerDetails.discountPercentage > 0 &&
  //   customerDetails.currentSubscriptionAmount;
  // let dicsountedPrice = "0";
  // if (
  //   customerDetails.currentSubscriptionAmount &&
  //   customerDetails.discountPercentage
  // ) {
  //   dicsountedPrice = truncatedToTwoDecimalPlaces(
  //     customerDetails.currentSubscriptionAmount *
  //       (1 - customerDetails.discountPercentage / 100)
  //   );
  // }

  if (
    organizationContextLoading ||
    !subscription ||
    !organization ||
    !customerDetails
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  if (customerDetails.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={customerDetails.error} />;
  }
  const customer: CustomerSchema = customerDetails.data?.customer;

  return (
    <>
      <div className="justify-center mx-auto max-w-2xl mt-1.5 md:mt-0 overflow-hidden">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 pt-6 md:pt-0 pl-4">
          Subscription
        </h1>

        <InfoRow label="Status" value={subscriptionStatusText} />

        <InfoRow
          label={nextPaymentText}
          value={
            subscription.currentPeriodEnd
              ? formatDateMDY(subscription.currentPeriodEnd)
              : "N/A"
          }
        />

        <div className="border-b py-3 px-4">
          <h3 className="text-sm font-medium text-gray-500">Amount</h3>
          {subscription.discount ? (
            <>
              <p className="text-lg font-semibold">
                ${subscription.amount.toFixed(2)}/month
              </p>
              <p className="text-sm text-green-600">
                {subscription.discount.discountPercentage}% Discount Applied
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold">
              ${subscription.amount.toFixed(2)}/month
            </p>
          )}
        </div>

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

        {/* Cancel or Resume Subscription Button */}
        {canEditSettings && (
          <div className="mt-6 flex mb-8">
            {subscription.subscriptionStatus ===
            SubscriptionStatus.PENDING_CANCELLATION ? (
              <>
                <Button
                  disabled={resumeLoading}
                  onClick={handleResume}
                  className="pl-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {resumeLoading ? "Loading..." : " Resume"}
                </Button>
                <p
                  className={`pl-4 text-sm mt-1 ${resumeError ? "text-red-500" : "text-transparent"}`}
                >
                  {resumeError || "Placeholder to maintain height"}
                </p>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  className="text-red-600 pl-4 w-auto"
                  variant="navGhost"
                >
                  Cancel Subscription
                </Button>
                <p
                  className={`pl-4 text-sm mt-1 ${cancelSubscriptionError ? "text-red-500" : "text-transparent"}`}
                >
                  {cancelSubscriptionError || "Placeholder to maintain height"}
                </p>
              </>
            )}
          </div>
        )}

        <ResponsiveConfirm
          isOpen={showConfirmModal}
          title="Confirm Subscription Cancellation"
          confirmText="Cancel"
          cancelText="Keep Subscription"
          content="Are you sure you want to cancel? You will have access to your account until your next Payment Date."
          confirmVariant="destructive"
          modalProps={{
            onClose: () => setShowConfirmModal(false),
            onConfirm: handleCancelSubscription,
          }}
          drawerProps={{
            onOpenChange: (open: boolean) => setShowConfirmModal(open),
            onSubmit: handleCancelSubscription,
          }}
          error={cancelSubscriptionError}
          isLoading={isCancelSubscriptionLoading}
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
      </div>
    </>
  );
};

export default SubscriptionTab;
