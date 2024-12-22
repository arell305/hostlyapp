import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SubscriptionTier, UserRole, roleMap } from "../../../../utils/enum";
import {
  isValidEmail,
  truncatedToTwoDecimalPlaces,
} from "../../../../utils/helpers";
import { changeableRoles } from "@/utils/enums";
import { Loader2 } from "lucide-react";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PricingOption } from "@/types";
import { pricingOptions } from "../../../../constants/pricingOptions";
import EventInfoSkeleton from "../loading/EventInfoSkeleton";

interface UpdateTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  currentTier?: SubscriptionTier;
  onTierUpdate: (newTier: SubscriptionTier) => void;
  discountPercentage?: number;
  clerkOrganizationId?: string | null;
}

type CalculateSubscriptionUpdateResult = {
  success: boolean;
  proratedAmount?: number;
  newMonthlyRate?: number;
  message?: string;
};

const UpdateTierModal: React.FC<UpdateTierModalProps> = ({
  isOpen,
  onClose,
  email,
  currentTier,
  onTierUpdate,
  discountPercentage,
  clerkOrganizationId,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proratingLoading, setProratingLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(null);
  const [prorationDetails, setProrationDetails] = useState<
    Record<SubscriptionTier, CalculateSubscriptionUpdateResult>
  >({
    [SubscriptionTier.STANDARD]: { success: false },
    [SubscriptionTier.PLUS]: { success: false },
    [SubscriptionTier.ELITE]: { success: false },
  });

  const calculateAllSubscriptionUpdates = useAction(
    api.stripe.calculateAllSubscriptionUpdates
  );
  const updateSubscriptionTier = useAction(api.stripe.updateSubscriptionTier);
  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  useEffect(() => {
    const fetchProrationDetails = async () => {
      if (currentTier) {
        setProratingLoading(true);
        try {
          const results = await calculateAllSubscriptionUpdates({
            email,
            currentTier,
            percentageDiscount: discountPercentage,
          });
          setProrationDetails(results);
        } catch (err) {
          setError("Failed to calculate proration details");
        } finally {
          setProratingLoading(false);
        }
      }
    };

    fetchProrationDetails();
  }, [email, currentTier, calculateAllSubscriptionUpdates]);

  useEffect(() => {
    const currentPlan = pricingOptions.find(
      (option) => option.tier === currentTier
    );
    if (currentPlan) {
      setSelectedPlan(currentPlan);
    }
  }, [currentTier]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedPlan?.tier === currentTier) {
      return onClose();
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedPlan && email && clerkOrganizationId) {
        // Create an array of promises
        const promises = [
          updateSubscriptionTier({
            email,
            newTier: selectedPlan.tier,
          }),
          updateOrganizationMetadata({
            clerkOrganizationId,
            params: {
              tier: selectedPlan.tier,
            },
          }),
        ];

        // Use Promise.all to execute both promises
        const [result, orgUpdateResult] = await Promise.all(promises);

        if (result && result.success) {
          onTierUpdate(selectedPlan.tier); // Call the callback with the new tier
        }
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // if (proratingLoading) {
  //   return <div>loading...</div>;
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex">Update Plan</DialogTitle>
        </DialogHeader>
        {proratingLoading ? (
          <EventInfoSkeleton />
        ) : (
          pricingOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                selectedPlan?.id === option.id
                  ? "border-customDarkBlue bg-blue-50 "
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedPlan(option)}
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold">{option.tier}</h3>
                {option.tier === currentTier && (
                  <span className="text-sm text-customDarkBlue">
                    Current Plan
                  </span>
                )}
              </div>
              {option.tier === currentTier && (
                <p className="text-gray-600">${option.price}/month</p>
              )}
              <p className="text-sm text-gray-500">{option.description}</p>
              {option.tier !== currentTier &&
                prorationDetails[option.tier]?.success && (
                  <div className="mt-2 text-sm">
                    <p>
                      Prorated amount: $
                      {prorationDetails[option.tier].proratedAmount?.toFixed(2)}
                    </p>
                    <p>
                      New monthly rate: $
                      {truncatedToTwoDecimalPlaces(
                        prorationDetails[option.tier].newMonthlyRate || 0
                      )}
                    </p>
                  </div>
                )}
            </div>
          ))
        )}
        {error && <p className="text-red-500">{error}</p>}

        <div className="text-xs mb-4">
          {" "}
          If you are currently on a trial period, it will conclude upon updating
          status. Consequently, your next payment date will be adjusted to
          reflect today's date.{" "}
        </div>

        <div className="flex justify-center space-x-10">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTierModal;
