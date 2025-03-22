import React, { useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import {
  Elements,
  useElements,
  useStripe,
  CardElement,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../../../../../utils/stripe";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import BaseDrawer from "../drawer/BaseDrawer";
import { useAction } from "convex/react";
import { toast } from "@/hooks/use-toast";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { DESKTOP_WIDTH } from "@/types/constants";

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
        onOpenChange(false); // Close the modal/drawer after success
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
        "rounded-none w-full border-b-2 bg-transparent py-1 focus-within:outline-none",
        editPaymentError ? "border-red-500" : "border-gray-300",
        "focus-within:border-customDarkBlue"
      )}
    >
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#2d3748",
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
        </DialogHeader>
        {CardInput}
        <p
          className={`text-sm mt-1 ${editPaymentError ? "text-red-500" : "text-transparent"}`}
        >
          {editPaymentError || "Placeholder to maintain height"}
        </p>
        <div className="flex justify-center space-x-10">
          <Button
            disabled={isEditPaymentLoading}
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-semibold w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={handleEditPayment}
            disabled={isEditPaymentLoading}
          >
            {isEditPaymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
