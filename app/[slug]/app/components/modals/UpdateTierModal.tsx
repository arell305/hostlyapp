import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, SubscriptionTier } from "../../../../../utils/enum";
import { truncatedToTwoDecimalPlaces } from "../../../../../utils/helpers";
import { PricingOption, ProratedPrice } from "@/types/types";
import { pricingOptions } from "../../../../../constants/pricingOptions";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "../drawer/BaseDrawer";
import { FrontendErrorMessages } from "@/types/enums";
import { toast } from "@/hooks/use-toast";
import FullLoading from "../loading/FullLoading";
import ErrorComponent from "../errors/ErrorComponent";

interface UpdateTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  currentTier?: SubscriptionTier;
  discountPercentage?: number;
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
  discountPercentage,
}) => {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isUpdateTierLoading, setIsUpdateTierLoading] =
    useState<boolean>(false);
  const [updateTierError, setUpdateTierError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(null);
  const [prorationDetails, setProrationDetails] = useState<
    ProratedPrice[] | null
  >(null);

  const getProratedPrices = useAction(api.stripe.getProratedPrices);
  const updateSubscriptionTier = useAction(api.stripe.updateSubscriptionTier);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const fetchProrationDetails = async () => {
      setIsPageLoading(true);
      try {
        const results = await getProratedPrices();
        if (results.status === ResponseStatus.SUCCESS) {
          setProrationDetails(results.data.proratedPrices);
        } else {
          setPageError(results.error);
        }
      } catch (err) {
        console.error(err);
        setPageError(FrontendErrorMessages.GENERIC_ERROR);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProrationDetails();
  }, [getProratedPrices]);
  console.log("prices", prorationDetails);
  useEffect(() => {
    const currentPlan = pricingOptions.find(
      (option) => option.tier === currentTier
    );
    if (currentPlan) {
      setSelectedPlan(currentPlan);
    }
  }, [currentTier]);

  const handleSubmit = async () => {
    if (!selectedPlan) {
      setUpdateTierError("Plan not selected");
      return;
    }

    if (selectedPlan.tier === currentTier) {
      return onClose();
    }

    setIsUpdateTierLoading(true);
    setUpdateTierError(null);

    try {
      const response = await updateSubscriptionTier({
        newTier: selectedPlan.tier,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Subscription tier updated.",
        });
        onClose();
      } else {
        console.error(response.error);
        setUpdateTierError(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (err) {
      console.error(err);
      setUpdateTierError(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setIsUpdateTierLoading(false);
    }
  };

  if (pageError) {
    return <ErrorComponent message={pageError} />;
  }

  if (isPageLoading) {
    return <FullLoading />;
  }

  if (!isDesktop) {
    return (
      <BaseDrawer
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Update Plan"
        description="Update your subscription"
        confirmText={isUpdateTierLoading ? "Saving..." : "Save"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        error={updateTierError}
        isLoading={isUpdateTierLoading}
      >
        {pricingOptions.map((option) => (
          <div
            key={option.id}
            className={`mx-4 mb-2 p-4 border rounded-lg cursor-pointer h-[130px] hover:bg-gray-100 ${
              selectedPlan?.id === option.id
                ? "border-customDarkBlue bg-blue-50"
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
            {/* {option.tier !== currentTier &&
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
              )} */}
          </div>
        ))}
      </BaseDrawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex">Update Plan</DialogTitle>
        </DialogHeader>
        <div>
          {pricingOptions.map((option) => (
            <div
              key={option.id}
              className={`mb-3 h-[130px] p-4 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                selectedPlan?.id === option.id
                  ? "border-customDarkBlue bg-blue-50"
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
          ))}
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="px-4 py-2 rounded-md border border-gray-400 bg-gray-100 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white ${
              isUpdateTierLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-customDarkBlue hover:bg-blue-700"
            }`}
            onClick={handleSubmit}
            disabled={isUpdateTierLoading}
          >
            {isUpdateTierLoading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTierModal;
