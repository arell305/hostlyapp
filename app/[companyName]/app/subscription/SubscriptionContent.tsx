"use client";
import {
  useAuth,
  useClerk,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import EventInfoSkeleton from "../components/loading/EventInfoSkeleton";
import { CustomerWithPayment } from "@/types/types";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import {
  subscriptionStatusMap,
  SubscriptionStatus,
  SubscriptionTier,
  ResponseStatus,
  UserRole,
} from "../../../../utils/enum";
import { useToast } from "@/hooks/use-toast";
import { StripeCardElement, loadStripe } from "@stripe/stripe-js";
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { truncatedToTwoDecimalPlaces } from "../../../../utils/helpers";
import UpdateTierModal from "../components/modals/UpdateTierModal";
import { GoPencil } from "react-icons/go";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import ResponsivePayment from "../components/responsive/ResponsivePayment";
import { useParams } from "next/navigation";

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
  const { orgRole, isLoaded: isAuthLoaded } = useAuth();
  const { isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });

  const { companyName: companyNameParams } = useParams();

  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";
  const organizationData = useQuery(
    api.organizations.getOrganizationByNameQuery,
    cleanCompanyName ? { name: cleanCompanyName } : "skip"
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [organization, organizationData, user, cleanCompanyName]);

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

  const cancelSubscription = useAction(api.customers.cancelSubscription);
  const resumeSubscription = useAction(api.customers.resumeSubscription);
  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!organizationData?.data?.organization.customerId) {
        return;
      }
      setLoading(true);
      try {
        console.log("id", organizationData?.data?.organization.customerId);
        const getCustomerDetailsResponse = await getCustomerDetails({
          customerId: organizationData?.data?.organization.customerId,
        });
        console.log("response", getCustomerDetailsResponse);
        setCustomerDetails(getCustomerDetailsResponse.data?.customerData); // Save result to state
      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError("Failed to fetch customer details.");
      } finally {
        setLoading(false); // Set loading to false once the fetch is done
      }
    };

    // Trigger the action on page load
    if (organizationData?.data?.organization.customerId) {
      fetchCustomerDetails();
    }
  }, [organizationData, organization]);

  const handleResume = async () => {
    setButtonLoading(true);

    const customerEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

    try {
      const result = await resumeSubscription({
        customerEmail,
      });
      if (result.status === ResponseStatus.SUCCESS && setActive) {
        await setActive({ organization: result.data?.id });
        toast({
          title: "Subscription Resumed",
          description: "Your subscription has been resume.",
        });
      }
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
      if (result[0].status === ResponseStatus.SUCCESS && setActive) {
        await setActive({ organization: result[1].data?.clerkOrgId });
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

  const handleTierUpdate = (newTier: SubscriptionTier) => {
    if (setActive && organization) {
      setActive({ organization: organization.id });
    }

    toast({
      title: "Subscription Updated",
      description: `Your subscription has been updated to ${newTier}.`,
    });
  };
  if (!organization || isLoading || customerDetails === undefined) {
    return <EventInfoSkeleton />;
  }

  if (customerDetails === null) {
    return <p>Error loading customer details</p>;
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
  const canEditSettings = orgRole === UserRole.Admin;

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
          className={`px-4 flex justify-between border-b py-3 ${
            canEditSettings
              ? "cursor-pointer hover:bg-gray-100 hover:rounded-md"
              : ""
          }`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tier</h3>
            <p className="text-lg font-semibold">
              {customerDetails.subscriptionTier}
            </p>
          </div>
          {canEditSettings && <GoPencil className="text-2xl" />}
        </div>

        <div
          className={`px-4 flex justify-between border-b py-3 ${
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
          {canEditSettings && <GoPencil className="text-2xl  " />}
        </div>

        {/* Cancel or Resume Subscription Button */}
        {canEditSettings && (
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
        <Elements stripe={stripePromise}>
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
            setActive={setActive}
          />
        </Elements>
      </div>
    </>
  );
};

export default SubscriptionTab;
