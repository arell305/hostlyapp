"use client";

import { FC, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../utils/enum";
import EventForm from "../components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  EventFormInput,
  GuestListFormInput,
  TicketFormInput,
} from "@/types/types";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import { ErrorMessages, FrontendErrorMessages } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { Notification } from "../components/ui/Notification";

const AddEventPage: FC = () => {
  const router = useRouter();

  const { toast } = useToast();
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);

  const {
    organization,
    organizationContextError,
    subscription,
    connectedAccountEnabled,
  } = useContextOrganization();

  const addEvent = useAction(api.events.addEvent);

  const handleSubmit = async (
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guestListData: GuestListFormInput | null
  ) => {
    try {
      if (!organization) {
        setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
        console.error(ErrorMessages.ORGANIZATION_NOT_LOADED);
        return;
      }
      const addEventResponse = await addEvent({
        organizationId: organization._id,
        ...eventData,
        ticketData,
        guestListData,
      });

      if (addEventResponse.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Event Created",
          description: "The event has been successfully created",
        });
        const urlEventId: string = addEventResponse.data.eventId as string;
        router.push(`events/${urlEventId}`);
      } else {
        console.error(addEventResponse.error);
        setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error(error);
      setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
      return;
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    router.back();
  };

  if (!subscription || connectedAccountEnabled === undefined || !organization) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  return (
    <div className="justify-center max-w-3xl mx-auto mt-1.5 mb-20">
      <div className="flex justify-between items-baseline pt-4 md:pt-0 px-4">
        <h1 className="font-bold text-3xl">Add Event</h1>
        <p
          className="font-semibold hover:underline hover:cursor-pointer text-customDarkBlue"
          onClick={handleCancel}
        >
          Cancel
        </p>
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
        saveEventError={saveEventError}
        subscription={subscription}
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

export default AddEventPage;
