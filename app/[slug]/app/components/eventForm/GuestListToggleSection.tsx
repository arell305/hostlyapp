"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ToggleSectionCard from "@/components/shared/toggle/ToggleSectionCard";
import GuestListSection from "./GuestListSection";
import { useEventForm } from "@/contexts/EventFormContext";
import ResponsiveConfirm from "../responsive/ResponsiveConfirm";
import { SubscriptionTier } from "@/types/enums";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { Doc } from "convex/_generated/dataModel";

interface GuestListToggleSectionProps {
  isCompanyAdmin: boolean;
  handleBuyCredit: () => void;
  isEdit: boolean;
  initialGuestListData?: Doc<"guestListInfo"> | null;
  subscription: Doc<"subscriptions">;
  availableCredits?: number;
}

const GuestListToggleSection: React.FC<GuestListToggleSectionProps> = ({
  isCompanyAdmin,
  handleBuyCredit,
  isEdit,
  initialGuestListData,
  subscription,
  availableCredits = 0,
}) => {
  const { isGuestListSelected, setIsGuestListSelected } = useEventForm();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const guestListLimitReached =
    (subscription.subscriptionTier === SubscriptionTier.PLUS &&
      subscription.guestListEventsCount === PLUS_GUEST_LIST_LIMIT &&
      availableCredits <= 0) ||
    (subscription.subscriptionTier === SubscriptionTier.STANDARD &&
      availableCredits <= 0);

  const creditLabel = availableCredits === 1 ? "credit" : "credits";

  const guestListSubtitle =
    subscription.subscriptionTier === SubscriptionTier.PLUS
      ? `(${subscription.guestListEventsCount}/${PLUS_GUEST_LIST_LIMIT} events this cycle | ${availableCredits} ${creditLabel} available)`
      : subscription.subscriptionTier === SubscriptionTier.STANDARD
        ? `${availableCredits} ${creditLabel} available`
        : undefined;

  const handleToggle = () => {
    if (isGuestListSelected) {
      if (isEdit && initialGuestListData) {
        setShowConfirm(true);
      } else {
        setIsGuestListSelected(false);
      }
    } else {
      setIsGuestListSelected(true);
    }
  };

  return (
    <>
      <ToggleSectionCard
        label="GUEST LIST OPTION"
        isActive={isGuestListSelected}
        onToggle={handleToggle}
        subtitle={guestListSubtitle}
      />

      {isGuestListSelected &&
        (guestListLimitReached ? (
          <div className="flex flex-col space-y-2 mb-4 px-4">
            <p className="text-red-500">Guest list limit reached.</p>
            {isCompanyAdmin && (
              <Button type="button" variant="nav" onClick={handleBuyCredit}>
                Buy Credit
              </Button>
            )}
          </div>
        ) : (
          <GuestListSection />
        ))}

      <ResponsiveConfirm
        isOpen={showConfirm}
        title="Confirm Guest List Removal"
        content="Are you sure you want to remove the guest list? This action cannot be undone."
        confirmText="Remove Guest List"
        cancelText="Cancel"
        confirmVariant="destructive"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowConfirm(false),
          onConfirm: () => {
            setIsGuestListSelected(false);
            setShowConfirm(false);
          },
        }}
        drawerProps={{
          onOpenChange: (open) => setShowConfirm(open),
          onSubmit: () => {
            setIsGuestListSelected(false);
            setShowConfirm(false);
          },
        }}
      />
    </>
  );
};

export default GuestListToggleSection;
