import React, { useState } from "react";
import {
  EventFormInput,
  GuestListFormInput,
  OrganizationSchema,
  TicketFormInput,
} from "@/types/types";
import { SubscriptionSchema } from "@/types/schemas-types";
import { useAddEvent } from "./hooks/useAddEvent";
import { Button } from "@/components/ui/button";
import { Notification } from "../components/ui/Notification";
import EventForm from "../components/EventForm";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import { useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";

const AddEventContent: React.FC<{
  organization: OrganizationSchema;
  subscription: SubscriptionSchema;
  connectedAccountEnabled: boolean;
  isCompanyAdmin: boolean;
  availableCredits: number;
}> = ({
  organization,
  subscription,
  connectedAccountEnabled,
  isCompanyAdmin,
  availableCredits,
}) => {
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const { addEvent, isLoading, error } = useAddEvent();
  const router = useRouter();

  const handleSubmit = async (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guestListData: GuestListFormInput | null
  ) => {
    const result = await addEvent(
      organizationId,
      eventData,
      ticketData,
      guestListData
    );
    if (result.success) {
      router.push(`/${organization.slug}/app/events/${result.eventId}`);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    router.back();
  };

  const handleBuyCredit = () => {
    if (organization?.slug) {
      router.push(`/${organization.slug}/app/subscription`);
    }
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

      <EventForm
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
        confirmVariant="destructive"
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
