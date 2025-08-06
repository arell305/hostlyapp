import React, { useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BaseDrawer from "../drawer/BaseDrawer";
import { DESKTOP_WIDTH } from "@/types/constants";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import CountInputField from "@/components/shared/fields/CountInputField";
import CountInputContainer from "@/components/shared/containers/CountInputContainer";
import { GuestListEntryWithPromoter } from "@/types/schemas-types";
import { Id } from "convex/_generated/dataModel";

interface ResponsiveGuestCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestListEntryWithPromoter;
  onSave: (
    guestId: Id<"guestListEntries">,
    maleCount: number,
    femaleCount: number
  ) => void;
  isLoading: boolean;
  error: string | null;
}

const ResponsiveGuestCheckIn: React.FC<ResponsiveGuestCheckInProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
  isLoading,
  error,
}) => {
  const [maleCount, setMaleCount] = useState<number>(guest.malesInGroup || 0);
  const [femaleCount, setFemaleCount] = useState<number>(
    guest.femalesInGroup || 0
  );
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const handleSave = () => {
    onSave(guest._id, maleCount, femaleCount);
  };

  const renderCheckInForm = () => (
    <CountInputContainer>
      <CountInputField
        label="Males:"
        value={maleCount}
        onChange={setMaleCount}
      />
      <CountInputField
        label="Females:"
        value={femaleCount}
        onChange={setFemaleCount}
      />
    </CountInputContainer>
  );

  const description = "Enter the amount of males and females in group.";

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col">
              {`${guest.name || "Guest"}`}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {renderCheckInForm()}
          <FormActions
            onCancel={onClose}
            onSubmit={handleSave}
            isLoading={isLoading}
            cancelText="Cancel"
            submitText="Save"
            submitVariant="default"
            error={error}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onClose}
      title={`${guest.name || "Guest"}`}
      description={description}
      confirmText="Save"
      cancelText="Cancel"
      onSubmit={handleSave}
      error={error}
      isLoading={isLoading}
    >
      {renderCheckInForm()}
    </BaseDrawer>
  );
};

export default ResponsiveGuestCheckIn;
