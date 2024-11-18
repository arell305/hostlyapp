import { useOrganization, useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import EventInfoSkeleton from "../loading/EventInfoSkeleton";
import { CustomerWithPayment } from "@/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import {
  subscriptionStatusMap,
  SubscriptionStatus,
  SubscriptionTier,
} from "../../../../utils/enum";
import ConfirmModal from "../ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { FaPencilAlt } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import UpdatePaymentForm from "./UpdatePaymentForm";
import UpdateTierForm from "./UpdateTierForm";
import { truncatedToTwoDecimalPlaces } from "../../../../utils/helpers";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const SubscriptionTab = () => {
  const { user, isLoaded } = useUser();
  const getCustomerDetails = useAction(api.customers.getCustomerDetails);
  const [customerDetails, setCustomerDetails] =
    useState<CustomerWithPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const { toast } = useToast();
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingTier, setIsEditingTier] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => Promise<void>;
  }>({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: async () => {},
  });

  const cancelSubscription = useAction(api.customers.cancelSubscription);
  const resumeSubscription = useAction(api.customers.resumeSubscription);

  useEffect(() => {
    setLoading(true);
    const fetchCustomerDetails = async () => {
      try {
        const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
        // Call the action on page load
        const result = await getCustomerDetails({
          customerEmail,
        });
        setCustomerDetails(result); // Save result to state
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
    } else {
      setLoading(false); // If no user email is provided, stop loading
    }
  }, [getCustomerDetails, user, triggerUpdate]);

  const resumeText = buttonLoading ? "Loading..." : "Resume";
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

  const onCancelSubscription = async () => {
    const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
    try {
      await cancelSubscription({
        customerEmail,
      });
      toast({
        title: "Cancellation successful",
        description: "Your subscription has been cancelled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again",
        variant: "destructive",
      });
    } finally {
      setTriggerUpdate((prev) => prev + 1);
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setModalConfig({
      title: "Confirm Subscription Cancellation",
      message:
        "Are you sure you want to cancel? You will have access to your account until your next Payment Date.",
      confirmText: "Cancel Subscription",
      cancelText: "Keep Subscription",
      onConfirm: onCancelSubscription,
    });
    setShowConfirmModal(true);
  };

  const handleEditPayment = () => {
    setIsEditingPayment(!isEditingPayment);
  };

  const handleEditTier = () => {
    setIsEditingTier(!isEditingTier);
  };

  const handleTierUpdate = (newTier: SubscriptionTier) => {
    if (customerDetails) {
      setCustomerDetails({
        ...customerDetails,
        subscriptionTier: newTier,
      });
    }
    setIsEditingTier(false);
    toast({
      title: "Subscription Updated",
      description: `Your subscription has been updated to ${newTier}.`,
    });
    // Trigger a refetch of customer details
    setTriggerUpdate((prev) => prev + 1);
  };

  if (!isLoaded || loading || !customerDetails) {
    return <EventInfoSkeleton />;
  }
  if (error) {
    return <div>Error loading subscription</div>;
  }
  const subscriptionStatusText =
    subscriptionStatusMap[customerDetails.subscriptionStatus] ||
    "Unknown Status";

  let nextPaymentText: string = "Next Payment";
  if (customerDetails.subscriptionStatus === SubscriptionStatus.CANCELED) {
    nextPaymentText = "Last Access Date";
  }
  console.log("customer details", customerDetails);
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
      <div className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Subscription</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-lg font-semibold">{subscriptionStatusText}</p>
          </div>

          <div>
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
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>

            {isDiscount && customerDetails.discountPercentage ? (
              <>
                <p className="text-lg font-semibold">
                  ${dicsountedPrice}/month
                </p>
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

          {isEditingTier ? (
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tier</h3>
                <Elements stripe={stripePromise}>
                  <UpdateTierForm
                    setIsEditingTier={setIsEditingTier}
                    email={user?.emailAddresses?.[0]?.emailAddress || ""}
                    currentTier={customerDetails.subscriptionTier}
                    onTierUpdate={handleTierUpdate}
                    discountPercentage={customerDetails.discountPercentage}
                  />
                </Elements>
              </div>
              <MdOutlineCancel onClick={handleEditTier} />
            </div>
          ) : (
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tier</h3>
                <p className="text-lg font-semibold">
                  {customerDetails.subscriptionTier}
                </p>
              </div>
              <FaPencilAlt
                onClick={handleEditTier}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
              />
            </div>
          )}

          {/* Payment Details Section */}
          <h3 className="text-sm font-medium text-gray-500">Payment Details</h3>
          {isEditingPayment ? (
            <div className="flex justify-between">
              <Elements stripe={stripePromise}>
                <UpdatePaymentForm
                  setIsEditingPayment={setIsEditingPayment}
                  email={user?.emailAddresses?.[0]?.emailAddress || ""}
                />
              </Elements>
              <MdOutlineCancel onClick={handleEditPayment} />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">
                  {customerDetails.last4
                    ? `**** **** **** ${customerDetails.last4}`
                    : "No details available"}
                </p>
              </div>
              <FaPencilAlt
                onClick={handleEditPayment}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
              />
            </div>
          )}

          {/* Cancel or Resume Subscription Button */}
          <div className="mt-8 flex space-x-4">
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
                onClick={handleCancel}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </>
  );
};

export default SubscriptionTab;

{
  /* <div className="mb-4">
<div>Card Details</div>
<div className="p-2 border rounded md:w-[400px] ">
  <CardElement
    options={{
      style: {
        base: {
          fontSize: "16px",
        },
      },
    }}
  />
</div>
</div> */
}
