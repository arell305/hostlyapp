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

const AddEventContent: React.FC<{
  organization: OrganizationSchema;
  subscription: SubscriptionSchema;
  connectedAccountEnabled: boolean;
}> = ({ organization, subscription, connectedAccountEnabled }) => {
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
    if (result) {
      router.push(`/${organization.slug}/app/events`);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    router.back();
  };

  return (
    <div>
      <div className="flex justify-between items-baseline pt-4 md:pt-0 px-4">
        <h1 className="">Add Event</h1>
        <Button
          variant="navGhost"
          size="nav"
          className=""
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
      {!connectedAccountEnabled && (
        <div className="p-1">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to create ticket events."
            variant="customDarkBlue"
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
