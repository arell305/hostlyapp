"use client";

import { FC, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { SubscriptionTier } from "../../../../utils/enum";
import EventForm from "../components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConfirmModal from "../components/ConfirmModal";
import EventInfoSkeleton from "../components/loading/EventInfoSkeleton";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import {
  AddEventResponse,
  EventFormInput,
  GuestListFormInput,
  TicketFormInput,
} from "@/types/types";
import { Id } from "../../../../convex/_generated/dataModel";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";

const AddEventPage: FC = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  // Retrieve organizationID from query params if it exists
  const queryOrgId = searchParams.get("organizationId");
  const organizationId = queryOrgId || organization?.id;
  const result = useQuery(api.customers.getCustomerSubscriptionTier, {
    clerkOrganizationId: organizationId ?? "",
  });
  const addEvent = useMutation(api.events.addEvent);
  const updateCustomerEvents = useMutation(
    api.customers.updateGuestListEventCount
  );
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const insertGuestListInfo = useMutation(
    api.guestListInfo.insertGuestListInfo
  );

  if (!orgLoaded || !organization || result === undefined) {
    return <EventInfoSkeleton />;
  }

  let canAddGuestListOption = false;
  if (result.subscriptionTier === SubscriptionTier.ELITE) {
    canAddGuestListOption = true;
  } else if (result.subscriptionTier === SubscriptionTier.PLUS) {
    const eventCount = result.guestListEventCount ?? 0;
    canAddGuestListOption = eventCount <= PLUS_GUEST_LIST_LIMIT;
  }

  const handleSubmit = async (
    eventData: EventFormInput,
    ticketData: TicketFormInput,
    guestListData: GuestListFormInput
  ) => {
    try {
      if (!organizationId) {
        toast({
          title: "Error",
          description: "Failed to create event. Please try again",
          variant: "destructive",
        });
        return;
      }
      const addEventResponse: AddEventResponse = await addEvent({
        clerkOrganizationId: organizationId,
        ...eventData,
      });

      const eventId: Id<"events"> | null = addEventResponse.data; // This should be a string
      if (addEventResponse.error && eventId !== null) {
        console.log("error", addEventResponse.error);
        toast({
          title: "Error",
          description: "Failed to create event. Please try again",
          variant: "destructive",
        });
        return;
      }

      if (ticketData && eventId) {
        await insertTicketInfo({
          eventId,
          ...ticketData,
        });
      }

      if (guestListData && eventId) {
        await insertGuestListInfo({
          eventId,
          ...guestListData,
        });
      }

      if (result.subscriptionTier === SubscriptionTier.PLUS && guestListData) {
        updateCustomerEvents({ customerId: result.customerId });
      }

      toast({
        title: "Event Created",
        description: "The event has been successfully created",
      });
      const urlEventId: string = eventId as string;

      // Ensure you're pushing a string to the router
      router.push(`events/${urlEventId}`);

      console.log("Event added successfully with ID:", urlEventId);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again",
        variant: "destructive",
      });
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
      />
      {/* <ConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Editing"
      /> */}
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
