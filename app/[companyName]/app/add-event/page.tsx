"use client";

import { FC, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { ResponseStatus, SubscriptionTier } from "../../../../utils/enum";
import EventForm from "../components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import EventInfoSkeleton from "../components/loading/EventInfoSkeleton";
import {
  EventFormInput,
  GuestListFormInput,
  TicketFormInput,
} from "@/types/types";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";

const AddEventPage: FC = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);

  const result = useQuery(api.customers.getCustomerSubscriptionTier, {
    clerkOrganizationId: organization?.id ?? "",
  });
  const addEvent = useMutation(api.events.addEvent);

  if (!orgLoaded || !organization || result === undefined) {
    return <EventInfoSkeleton />;
  }

  const canAddGuestListOption =
    result.subscriptionTier === SubscriptionTier.ELITE ||
    result.subscriptionTier === SubscriptionTier.PLUS;

  const handleSubmit = async (
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guestListData: GuestListFormInput | null
  ) => {
    try {
      if (!organization) {
        toast({
          title: "Error",
          description: "Failed to create event. Please try again",
          variant: "destructive",
        });
        return;
      }
      if (result.subscriptionTier === SubscriptionTier.PLUS && guestListData) {
      }
      const addEventResponse = await addEvent({
        clerkOrganizationId: organization?.id,
        ...eventData,
        ticketData,
        guestListData,
      });

      if (addEventResponse.status === ResponseStatus.ERROR) {
        setSaveEventError(addEventResponse.error);
        return;
      }

      toast({
        title: "Event Created",
        description: "The event has been successfully created",
      });
      const urlEventId: string = addEventResponse.data.eventId as string;

      router.push(`events/${urlEventId}`);

      console.log("Event added successfully with ID:", urlEventId);
    } catch (error) {
      setSaveEventError("Failed to create an event: Internal Error");
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
      <EventForm
        onSubmit={handleSubmit}
        isEdit={false}
        canAddGuestListOption={canAddGuestListOption}
        subscriptionTier={result.subscriptionTier}
        onCancelEdit={handleCancel}
        saveEventError={saveEventError}
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
