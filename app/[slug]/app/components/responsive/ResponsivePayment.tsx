import React, { useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import {
  Elements,
  useElements,
  useStripe,
  CardElement,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../../../../../utils/stripe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import BaseDrawer from "../drawer/BaseDrawer";
import { useAction } from "convex/react";
import { toast } from "@/hooks/use-toast";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { DESKTOP_WIDTH } from "@/types/constants";
import FormActions from "@/components/shared/buttonContainers/FormActions";

type ResponsivePaymentProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const PaymentForm: React.FC<ResponsivePaymentProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isEditPaymentLoading, setIsEditPaymentLoading] = useState(false);
  const [editPaymentError, setEditPaymentError] = useState<string | null>(null);

  const updateSubscriptionPaymentMethod = useAction(
    api.stripe.updateSubscriptionPaymentMethod
  );

  const handleClose = () => {
    setEditPaymentError(null);
    onOpenChange(false);
  };

  const handleEditPayment = async () => {
    setEditPaymentError(null);
    setIsEditPaymentLoading(true);

    if (!stripe || !elements) {
      setEditPaymentError("Stripe has not loaded yet. Please try again.");
      setIsEditPaymentLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setEditPaymentError("Card not valid");
      setIsEditPaymentLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setEditPaymentError(error.message || "Error processing payment");
        setIsEditPaymentLoading(false);
        return;
      }

      const response = await updateSubscriptionPaymentMethod({
        newPaymentMethodId: paymentMethod.id,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Payment Updated",
          description: "Your payment method has been updated",
        });
        handleClose();
      } else {
        console.error(response.error);
        setEditPaymentError(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error(error);
      setEditPaymentError(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setIsEditPaymentLoading(false);
    }
  };

  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const CardInput = (
    <div
      className={cn(
        " w-full border rounded-md  bg-transparent p-3 focus-within:outline-none mb-4",
        editPaymentError ? "border-red-500" : "",
        "focus-within:border-customDarkBlue"
      )}
    >
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#F9FAFA",
              backgroundColor: "transparent",
              "::placeholder": { color: "#a0aec0" },
            },
            invalid: { color: "#e53e3e" },
          },
        }}
      />
    </div>
  );

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex">Update Payment</DialogTitle>
          <DialogDescription>
            Update the payment information for your subscription.
          </DialogDescription>
        </DialogHeader>
        {CardInput}
        <FormActions
          onCancel={handleClose}
          onSubmit={handleEditPayment}
          cancelText="Cancel"
          submitText="Save"
          loadingText="Saving"
          isLoading={isEditPaymentLoading}
          isSubmitDisabled={isEditPaymentLoading}
          error={editPaymentError}
          cancelVariant="secondary"
          submitVariant="default"
        />
      </DialogContent>
    </Dialog>
  ) : (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Update Payment"
      description="Enter a new payment method"
      confirmText={isEditPaymentLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={handleEditPayment}
      error={editPaymentError}
      isLoading={isEditPaymentLoading}
    >
      {CardInput}
    </BaseDrawer>
  );
};

const ResponsivePayment: React.FC<ResponsivePaymentProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm isOpen={isOpen} onOpenChange={onOpenChange} />
    </Elements>
  );
};

export default ResponsivePayment;
