"use client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useAction } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { CustomerWithPayment } from "@/types/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import {
  subscriptionStatusMap,
  SubscriptionStatus,
  ResponseStatus,
  UserRole,
  subscriptionBenefits,
} from "../../../../utils/enum";
import { useToast } from "@/hooks/use-toast";
import { truncatedToTwoDecimalPlaces } from "../../../../utils/helpers";
import UpdateTierModal from "../components/modals/UpdateTierModal";
import { GoPencil } from "react-icons/go";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import ResponsivePayment from "../components/responsive/ResponsivePayment";
import { useParams } from "next/navigation";
import { ERROR_MESSAGES } from "../../../../constants/errorMessages";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { FrontendErrorMessages } from "@/types/enums";

const SubscriptionTab = () => {
  const { user } = useClerk();
  const [customerDetails, setCustomerDetails] = useState<
    CustomerWithPayment | null | undefined
  >(null);

  const [resumeLoading, setResumeLoading] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { orgRole } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);

  const { slug } = useParams();

  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<null | string>(null);

  const closeModal = () => {
    setActiveModal(null);
    setRefreshKey((prev) => prev + 1);
  };

  const getCustomerDetailsBySlug = useAction(
    api.customers.getCustomerDetailsBySlug
  );

  // Cancel Subscription
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isCancelSubscriptionLoading, setIsCancelSubscriptionLoading] =
    useState<boolean>(false);
  const [cancelSubscriptionError, setCancelSubscriptionError] = useState<
    string | null
  >(null);

  // Update Payment
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);

  const handleEditPaymentModalOpenChange = (open: boolean) => {
    if (open) {
      setShowEditPaymentModal(true);
    } else {
      setShowEditPaymentModal(false);
    }
  };

  const cancelSubscription = useAction(api.customers.cancelSubscription);
  const resumeSubscription = useAction(api.customers.resumeSubscription);

  useEffect(() => {
    fetchCustomerDetails();
  }, [cleanSlug, refreshKey]);

  const fetchCustomerDetails = async () => {
    if (cleanSlug === "") {
      return;
    }
    setIsPageLoading(true);
    setPageError(null);
    try {
      const response = await getCustomerDetailsBySlug({ slug: cleanSlug });

      if (response.status === ResponseStatus.SUCCESS) {
        setCustomerDetails(response.data?.customerData);
      } else {
        console.error(response.error);
        setPageError(ERROR_MESSAGES.GENERIC_ERROR);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setPageError(ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsPageLoading(false);
    }
  };

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

  if (isPageLoading || !customerDetails || !orgRole) {
    return <FullLoading />;
  }

  const subscriptionStatusText =
    subscriptionStatusMap[customerDetails.subscriptionStatus] ||
    "Unknown Status";
  let nextPaymentText: string = "Next Payment";
  if (customerDetails.subscriptionStatus === SubscriptionStatus.CANCELED) {
    nextPaymentText = "Last Access Date";
  }
  const isDiscount =
    customerDetails.discountPercentage &&
    customerDetails.discountPercentage > 0 &&
    customerDetails.currentSubscriptionAmount;
  let dicsountedPrice = "0";
  if (
    customerDetails.currentSubscriptionAmount &&
    customerDetails.discountPercentage
  ) {
    dicsountedPrice = truncatedToTwoDecimalPlaces(
      customerDetails.currentSubscriptionAmount *
        (1 - customerDetails.discountPercentage / 100)
    );
  }

  if (pageError) {
    return <ErrorComponent message={pageError} />;
  }

  return (
    <>
      <div className="justify-center  max-w-3xl  mx-auto mt-1.5  ">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 pt-6 md:pt-0 pl-4">
          Subscription
        </h1>

        <div className="border-b py-3 px-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-lg font-semibold">{subscriptionStatusText}</p>
          </div>
        </div>

        <div className="border-b py-3 px-4">
          <h3 className="text-sm font-medium text-gray-500">
            {nextPaymentText}
          </h3>
          <p className="text-lg font-semibold">
            {customerDetails.nextPayment
              ? DateTime.fromISO(customerDetails.nextPayment).toLocaleString(
                  DateTime.DATE_FULL
                )
              : "N/A"}
          </p>
        </div>

        {/* Display Current Subscription Amount */}
        <div className="border-b py-3 px-4">
          <h3 className="text-sm font-medium text-gray-500">Amount</h3>

          {isDiscount && customerDetails.discountPercentage ? (
            <>
              <p className="text-lg font-semibold">${dicsountedPrice}/month</p>
              <p className="text-sm text-green-600">
                {customerDetails.discountPercentage}% Discount Applied
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold">
              {customerDetails.currentSubscriptionAmount !== undefined
                ? `$${customerDetails.currentSubscriptionAmount.toFixed(2)}/month`
                : "N/A"}
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
                {customerDetails.subscriptionTier}
                <span className="pl-2 text-gray-600 text-base">
                  ({subscriptionBenefits[customerDetails.subscriptionTier]})
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
              {customerDetails.last4
                ? `**** **** **** ${customerDetails.last4}`
                : "No details available"}
            </p>
          </div>
          <div className={`relative ${canEditSettings ? "ml-auto" : ""}`}>
            {canEditSettings && <GoPencil className="text-2xl" />}
          </div>
        </div>

        {/* Cancel or Resume Subscription Button */}
        {canEditSettings && (
          <div className="mt-6 flex space-x-4 mb-8">
            {customerDetails.subscriptionStatus ===
            SubscriptionStatus.PENDING_CANCELLATION ? (
              <>
                <Button
                  disabled={resumeLoading}
                  onClick={handleResume}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {resumeLoading ? "Loading..." : " Resume"}
                  Resume
                </Button>
                <p
                  className={`pl-4 text-sm mt-1 ${resumeError ? "text-red-500" : "text-transparent"}`}
                >
                  {resumeError || "Placeholder to maintain height"}
                </p>{" "}
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  className=" text-red-600 bg-white hover:bg-red-50"
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
          email={user?.emailAddresses?.[0]?.emailAddress || ""}
          currentTier={customerDetails.subscriptionTier}
          discountPercentage={customerDetails.discountPercentage}
        />
      </div>
    </>
  );
};

export default SubscriptionTab;
