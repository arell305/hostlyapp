"use client";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

import EventInfoSkeleton from "../components/loading/EventInfoSkeleton";
import { CustomerWithPayment } from "@/types/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import {
  subscriptionStatusMap,
  SubscriptionStatus,
  SubscriptionTier,
  ResponseStatus,
} from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { StripeCardElement, loadStripe } from "@stripe/stripe-js";
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { FaPencilAlt } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { truncatedToTwoDecimalPlaces } from "../../../utils/helpers";
import { RiArrowRightSLine } from "react-icons/ri";
// import EditingPaymentModal from "../components/modals/EditingPaymentModal";
import UpdateTierModal from "../components/modals/UpdateTierModal";
import { GoPencil } from "react-icons/go";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import ResponsiveUpdatePayment from "../components/responsive/ResponsivePayment";
import ResponsivePayment from "../components/responsive/ResponsivePayment";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const SubscriptionTab = () => {
  const { user, organization, loaded } = useClerk();
  const getCustomerDetails = useAction(api.customers.getCustomerDetails);
  const [customerDetails, setCustomerDetails] = useState<
    CustomerWithPayment | null | undefined
  >(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => {
    setActiveModal(null);
  };

  // Cancel Subscription
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCancelSubscriptionLoading, setIsCancelSubscriptionLoading] =
    useState<boolean>(false);
  const [cancelSubscriptionError, setCancelSubscriptionError] = useState<
    string | null
  >(null);

  // Update Payment
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [isEditPaymentLoading, setIsEditPaymentLoading] =
    useState<boolean>(false);
  const [editPaymentError, setEditPaymentError] = useState<string | null>(null);
  const [stripeCardElement, setStripeCardElement] =
    useState<StripeCardElement | null>(null);
  const updateSubscriptionPaymentMethod = useAction(
    api.stripe.updateSubscriptionPaymentMethod
  );
  const handleCardChange = (event: any) => {
    if (event.error) {
      setEditPaymentError(event.error.message);
    } else {
      setEditPaymentError(null);
    }
    setStripeCardElement(event.complete ? event : null);
  };

  const handleEditPaymentModalOpenChange = (open: boolean) => {
    if (open) {
      setShowEditPaymentModal(true);
    } else {
      setStripeCardElement(null);
      setEditPaymentError(null);
      setShowEditPaymentModal(false);
    }
  };

  const stripe = useStripe();
  const elements = useElements();

  const handleEditPayment = async () => {
    if (!stripe || !elements) {
      setEditPaymentError("Stripe has not loaded yet. Please try again.");
      return;
    }
    const email = user?.emailAddresses[0].emailAddress;
    if (!email) {
      setEditPaymentError("Email not found");
      return;
    }

    if (!stripeCardElement) {
      setEditPaymentError("Card not valid");
      return;
    }

    try {
      setIsEditPaymentLoading(true);
      setEditPaymentError(null);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: stripeCardElement,
      });

      if (error) {
        setEditPaymentError(error.message || "error processing payment");
        return;
      }

      await updateSubscriptionPaymentMethod({
        email,
        newPaymentMethodId: paymentMethod.id,
      });
    } catch {}
  };

  // const [modalConfig, setModalConfig] = useState<{
  //   title: string;
  //   message: string;
  //   confirmText: string;
  //   cancelText: string;
  //   onConfirm: () => Promise<void>;
  // }>({
  //   title: "",
  //   message: "",
  //   confirmText: "",
  //   cancelText: "",
  //   onConfirm: async () => {},
  // });

  const cancelSubscription = useAction(api.customers.cancelSubscription);
  const resumeSubscription = useAction(api.customers.resumeSubscription);
  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
        // Call the action on page load
        const getCustomerDetailsResponse = await getCustomerDetails({
          customerEmail,
        });
        setCustomerDetails(getCustomerDetailsResponse.data?.customerData); // Save result to state
      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError("Failed to fetch customer details.");
      } finally {
        setLoading(false); // Set loading to false once the fetch is done
      }
    };

    // Trigger the action on page load
    if (user?.emailAddresses) {
      fetchCustomerDetails();
    }
  }, [getCustomerDetails, user, triggerUpdate]);

  const handleResume = async () => {
    setButtonLoading(true);

    const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

    try {
      await resumeSubscription({
        customerEmail,
      });
      toast({
        title: "Subscription Resumed",
        description: "Your subscription has been resume.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed resume subscription. Please try again",
        variant: "destructive",
      });
    } finally {
      setTriggerUpdate((prev) => prev + 1);
      setButtonLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!organization) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again",
        variant: "destructive",
      });
      return;
    }
    const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
    try {
      setIsCancelSubscriptionLoading(true);
      const result = await Promise.all([
        cancelSubscription({ customerEmail }),
        updateOrganizationMetadata({
          clerkOrganizationId: organization.id,
          params: {
            status: SubscriptionStatus.CANCELED,
          },
        }),
      ]);
      if (result[0].status === ResponseStatus.SUCCESS) {
        setShowConfirmModal(false);
        toast({
          title: "Cancellation successful",
          description: "Your subscription has been cancelled.",
        });
      }
    } catch (error) {
      setCancelSubscriptionError(
        "Failed to cancel subscription. Please try again"
      );
    } finally {
      setTriggerUpdate((prev) => prev + 1);
      setIsCancelSubscriptionLoading(false);
    }
  };

  // const handleCancel = () => {
  //   setModalConfig({
  //     title: "Confirm Subscription Cancellation",
  //     message:
  //       "Are you sure you want to cancel? You will have access to your account until your next Payment Date.",
  //     confirmText: "Cancel",
  //     cancelText: "Keep Subscription",
  //     onConfirm: onCancelSubscription,
  //   });
  //   setShowConfirmModal(true);
  // };

  const handleTierUpdate = (newTier: SubscriptionTier) => {
    if (customerDetails) {
      setCustomerDetails({
        ...customerDetails,
        subscriptionTier: newTier,
      });
    }

    toast({
      title: "Subscription Updated",
      description: `Your subscription has been updated to ${newTier}.`,
    });
    // Trigger a refetch of customer details
    setTriggerUpdate((prev) => prev + 1);
  };
  if (!customerDetails || !loaded || !organization) {
    return <EventInfoSkeleton />;
  }

  // if (error) {
  //   return <div>Error loading subscription</div>;
  // }
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
          onClick={() => setActiveModal("update_tier")}
          className="px-4 flex justify-between border-b py-3 items-center hover:bg-gray-100 cursor-pointer"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tier</h3>
            <p className="text-lg font-semibold">
              {customerDetails.subscriptionTier}
            </p>
          </div>
          <GoPencil className="text-2xl" />
        </div>

        <div
          className="px-4 flex justify-between items-center border-b py-3 cursor-pointer hover:bg-gray-100"
          onClick={() => setShowEditPaymentModal(true)}
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
          <GoPencil className="text-2xl  " />
        </div>

        {/* Cancel or Resume Subscription Button */}
        <div className="mt-6 flex space-x-4 mb-8">
          {customerDetails.subscriptionStatus ===
          SubscriptionStatus.CANCELED ? (
            <Button
              onClick={handleResume}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Resume
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmModal(true)}
              className=" text-red-600 bg-white hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
        {/* Confirmation Modal */}
        {/* <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
        /> */}
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
        <Elements stripe={stripePromise}>
          {/* <EditingPaymentModal
            isOpen={activeModal === "editing_payment"}
            onClose={closeModal}
            email={user?.emailAddresses?.[0]?.emailAddress}
          /> */}

          <ResponsivePayment
            isOpen={showEditPaymentModal}
            onOpenChange={handleEditPaymentModalOpenChange}
            error={editPaymentError}
            isLoading={isEditPaymentLoading}
            onEditPayment={handleEditPayment}
            onChange={handleCardChange}
          />
          <UpdateTierModal
            isOpen={activeModal === "update_tier"}
            onClose={closeModal}
            email={user?.emailAddresses?.[0]?.emailAddress || ""}
            currentTier={customerDetails.subscriptionTier}
            onTierUpdate={handleTierUpdate}
            discountPercentage={customerDetails.discountPercentage}
            clerkOrganizationId={organization.id}
          />
        </Elements>
      </div>
    </>
  );
};

export default SubscriptionTab;
