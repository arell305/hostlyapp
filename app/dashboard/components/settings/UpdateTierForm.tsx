import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { pricingOptions } from "../../../../constants/pricingOptions";
import { PricingOption } from "@/types";
import { SubscriptionTier } from "../../../../utils/enum";
import { truncatedToTwoDecimalPlaces } from "../../../../utils/helpers";

interface UpdateTierFormProps {
  setIsEditingTier: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  currentTier?: SubscriptionTier;
  onTierUpdate: (newTier: SubscriptionTier) => void;
  discountPercentage?: number;
}

type CalculateSubscriptionUpdateResult = {
  success: boolean;
  proratedAmount?: number;
  newMonthlyRate?: number;
  message?: string;
};

const UpdateTierForm: React.FC<UpdateTierFormProps> = ({
  setIsEditingTier,
  email,
  currentTier,
  onTierUpdate,
  discountPercentage,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
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
      setIsEditingTier(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedPlan) {
        const result = await updateSubscriptionTier({
          email,
          newTier: selectedPlan.tier,
        });
        if (result.success) {
          onTierUpdate(selectedPlan.tier); // Call the callback with the new tier
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditingTier(false);
  };

  if (proratingLoading) {
    return <div>loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <Label>Select Your Plan</Label>
        {pricingOptions.map((option) => (
          <div
            key={option.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPlan?.id === option.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedPlan(option)}
          >
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold">{option.tier}</h3>
              {option.tier === currentTier && (
                <span className="text-sm text-blue-500">Current Plan</span>
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
        ))}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <div className="text-xs mb-4">
          {" "}
          If you are currently on a trial period, it will conclude upon updating
          status. Consequently, your next payment date will be adjusted to
          reflect today's date.{" "}
        </div>
        <Button
          type="submit"
          disabled={loading || selectedPlan?.tier === currentTier}
          className="shadow-md w-full bg-customLightBlue font-semibold hover:bg-customDarkerBlue h-[45px] md:w-[200px] text-black"
        >
          {loading ? "Processing..." : "Update"}
        </Button>
        <Button type="button" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UpdateTierForm;
