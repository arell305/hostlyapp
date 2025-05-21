"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Elements } from "@stripe/react-stripe-js";
import { DESKTOP_WIDTH, GUEST_LIST_CREDIT_PRICE } from "@/types/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useCreateGuestListPaymentIntent } from "../../hooks/useCreatePaymentIntent";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import { stripePromise } from "../../../../../utils/stripe";
import { PaymentForm } from "./PaymentForm";
import { Minus, Plus } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { stripeAppearance } from "@/utils/frontend-stripe/stripeAppearance";

interface GuestListCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestListCheckout: React.FC<GuestListCheckoutProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    createPaymentIntent,
    loading: createPaymentIntentLoading,
    error: createPaymentIntentError,
    setError: setCreatePaymentIntentError,
  } = useCreateGuestListPaymentIntent();

  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [step, setStep] = useState<1 | 2>(1);

  const { amountInCents } = GUEST_LIST_CREDIT_PRICE;
  const totalAmount = (amountInCents * quantity) / 100;

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setQuantity(1);
    setCreatePaymentIntentError(null);
    setClientSecret(null);
  };

  const handleContinue = async () => {
    const clientSecret = await createPaymentIntent({ quantity });

    if (clientSecret) {
      setClientSecret(clientSecret);
      setStep(2);
    }
  };

  const QuantityStep = (
    <div className="space-y-6 mt-2">
      <div className="flex items-center justify-center gap-4">
        <IconButton
          icon={<Minus />}
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity <= 1}
        />

        <span className="text-xl font-semibold">{quantity}</span>

        <IconButton
          icon={<Plus />}
          onClick={() => handleQuantityChange(1)}
          disabled={quantity >= 10}
        />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">
          Total: ${totalAmount.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          (${(amountInCents / 100).toFixed(2)} per credit)
        </p>
      </div>

      <FormActions
        onCancel={handleClose}
        onSubmit={handleContinue}
        cancelText="Cancel"
        submitText="Continue to Payment"
        loadingText="Continuing"
        isSubmitDisabled={quantity < 1}
        isLoading={createPaymentIntentLoading}
        error={createPaymentIntentError}
        submitVariant="default"
      />
    </div>
  );

  const PaymentStep = clientSecret && (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: stripeAppearance,
      }}
    >
      <PaymentForm
        onCancel={handleClose}
        clientSecret={clientSecret}
        totalAmount={totalAmount}
        onSuccess={handleClose}
      />
    </Elements>
  );

  const Content = step === 1 ? QuantityStep : PaymentStep;

  return isDesktop ? (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Select Quantity" : "Purchase Guest List Credits"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select the number of guest list credits you want to purchase."
              : "Enter your payment information to purchase guest list credits."}
          </DialogDescription>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent
        scrollContent
        className="max-w-md mx-auto pb-8 h-[100dvh] flex flex-col"
      >
        <DrawerHeader>
          <DrawerTitle>
            {step === 1 ? "Select Quantity" : "Purchase Guest List Credits"}
          </DrawerTitle>
          <DrawerDescription>
            {step === 1
              ? "Select the number of guest list credits you want to purchase."
              : "Enter your payment information to purchase guest list credits."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">{Content}</div>
      </DrawerContent>
    </Drawer>
  );
};
