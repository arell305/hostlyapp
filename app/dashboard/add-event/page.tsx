"use client";

import { FC, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { SubscriptionTier } from "../../../utils/enum";
import EventForm from "../components/EventForm"; // Import the EventForm component
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConfirmModal from "../components/ConfirmModal";

const AddEventPage: FC = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  const result = useQuery(api.customers.getCustomerSubscriptionTier, {
    clerkOrganizationId: organization?.id ?? "",
  });
  const addEvent = useMutation(api.events.addEvent);
  const updateCustomerEvents = useMutation(
    api.customers.updateGuestListEventCount
  );
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const insertGuestListInfo = useMutation(
    api.guestListInfo.insertGuestListInfo
  );

  if (!orgLoaded || !organization) {
    return <div>Loading organization...</div>;
  }

  if (result === undefined) {
    return <div>Loading subscription information...</div>;
  }

  let canAddGuestList = false;
  if (result.subscriptionTier === SubscriptionTier.ELITE) {
    canAddGuestList = true;
  } else if (result.subscriptionTier === SubscriptionTier.PLUS) {
    const eventCount = result.guestListEventCount ?? 0;
    canAddGuestList = eventCount < 4;
  }

  const handleSubmit = async (
    eventData: any,
    ticketData: any,
    guestListData: any
  ) => {
    try {
      const eventId = await addEvent({
        clerkOrganizationId: organization.id,
        ...eventData,
      });

      if (ticketData) {
        await insertTicketInfo({
          eventId,
          ...ticketData,
        });
      }

      if (guestListData) {
        await insertGuestListInfo({
          eventId,
          ...guestListData,
        });
      }

      if (
        result.subscriptionTier === SubscriptionTier.PLUS &&
        eventData.guestListCloseTime
      ) {
        updateCustomerEvents({ customerId: result.customerId });
      }
      toast({
        title: "Event Created",
        description: "The event has been successfully created",
      });
      router.push(`events/${eventId}`);
      console.log("Event added successfully with ID:", eventId);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again",
        variant: "destructive",
      });
      // Handle error (e.g., show an error message)
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Event</h1>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <EventForm
        onSubmit={handleSubmit}
        isEdit={false}
        canAddGuestList={canAddGuestList}
        subscriptionTier={result.subscriptionTier}
      />
      <ConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={() => {
          setShowCancelConfirmModal(false);
          router.back(); // This navigates back to the previous page
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Editing"
      />
    </div>
  );
};

export default AddEventPage;
