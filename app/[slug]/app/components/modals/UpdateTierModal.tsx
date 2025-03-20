import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, SubscriptionTier } from "../../../../../utils/enum";
import { PricingOption, ProratedPrice } from "@/types/types";
import { pricingOptions } from "../../../../../constants/pricingOptions";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "../drawer/BaseDrawer";
import { FrontendErrorMessages } from "@/types/enums";
import { toast } from "@/hooks/use-toast";
import FullLoading from "../loading/FullLoading";
import ErrorComponent from "../errors/ErrorComponent";
import { DESKTOP_WIDTH } from "@/types/constants";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpdateTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: SubscriptionTier;
}

const UpdateTierModal: React.FC<UpdateTierModalProps> = ({
  isOpen,
  onClose,
  currentTier,
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

  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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

  const renderPlanOption = (option: PricingOption) => {
    const prorationDetail = prorationDetails?.find(
      (detail) => detail.tier === option.tier
    );

    return (
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
            <span className="text-sm text-customDarkBlue">Current Plan</span>
          )}
        </div>
        <p className="text-gray-600">${option.price}/month</p>
        <p className="text-sm text-gray-500">{option.description}</p>
        {option.tier !== currentTier && prorationDetail && (
          <div className="mt-2 text-sm">
            <p>Prorated amount: ${prorationDetail.proratedAmount}</p>
            <p>New monthly rate: ${prorationDetail.monthlyAmount}</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => <>{pricingOptions.map(renderPlanOption)}</>;

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex">Update Plan</DialogTitle>
        </DialogHeader>
        {renderContent()}
        <p
          className={`text-sm mt-1 ${
            updateTierError ? "text-red-500" : "text-transparent"
          }`}
        >
          {updateTierError || "Placeholder to maintain height"}
        </p>
        <DialogFooter>
          <Button
            disabled={isUpdateTierLoading}
            onClick={onClose}
            className="font-semibold w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={handleSubmit}
            disabled={isUpdateTierLoading}
          >
            {isUpdateTierLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
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
      {renderContent()}
    </BaseDrawer>
  );
};

export default UpdateTierModal;
