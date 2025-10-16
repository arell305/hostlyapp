import React, { useState } from "react";
import { EventFormInput, GuestListFormInput, TicketType } from "@/types/types";
import { useAddEvent } from "./hooks/useAddEvent";
import { Button } from "@/components/ui/button";
import { Notification } from "../components/ui/Notification";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import { Id } from "../../../../convex/_generated/dataModel";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import EventFormWrapper from "../components/eventForm/EventFormWrapper";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin } from "@/utils/permissions";

interface AddEventContentProps {
  onCancel: () => void;
  onSubmitSuccess: (eventId: string) => void;
  onBuyCredit: () => void;
}

const AddEventContent: React.FC<AddEventContentProps> = ({
  onCancel,
  onSubmitSuccess,
  onBuyCredit,
}) => {
  const {
    orgRole,
    organization,
    subscription,
    connectedAccountEnabled,
    availableCredits,
  } = useContextOrganization();

  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const { addEvent, isLoading, error } = useAddEvent();

  const isCompanyAdmin = isAdmin(orgRole);

  const handleSubmit = async (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketType[],
    guestListData: GuestListFormInput | null
  ) => {
    const result = await addEvent(
      organizationId,
      eventData,
      ticketData,
      guestListData
    );
    if (result.eventId) {
      onSubmitSuccess(result.eventId);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    onCancel();
  };

  const handleBuyCredit = () => {
    onBuyCredit();
  };

  return (
    <div>
      <SectionHeaderWithAction
        title="Add Event"
        actions={
          <Button
            variant="navGhost"
            size="nav"
            className="text-whiteText hover:text-whiteText/80 underline w-auto text-base"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        }
      />

      {!connectedAccountEnabled && (
        <div className="">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to create ticket events."
            route="stripe"
          />
        </div>
      )}

      <EventFormWrapper
        isStripeEnabled={connectedAccountEnabled}
        onSubmit={handleSubmit}
        isEdit={false}
        onCancelEdit={handleCancel}
        saveEventError={error}
        subscription={subscription}
        organizationId={organization._id}
        isSubmitLoading={isLoading}
        submitError={error}
        handleBuyCredit={handleBuyCredit}
        isCompanyAdmin={isCompanyAdmin}
        availableCredits={availableCredits}
      />
      <ResponsiveConfirm
        isOpen={showCancelConfirmModal}
        title="Confirm Cancellation"
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        content="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmVariant="default"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowCancelConfirmModal(false),
          onConfirm: handleConfirmCancel,
        }}
        drawerProps={{
          onSubmit: handleConfirmCancel,
          onOpenChange: (open) => setShowCancelConfirmModal(open),
        }}
      />
    </div>
  );
};

export default AddEventContent;
