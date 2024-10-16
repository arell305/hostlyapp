"use client";

import { FC } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { SubscriptionTier } from "../../../utils/enum";
import EventForm from "../components/EventForm"; // Import the EventForm component
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const AddEventPage: FC = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();

  const result = useQuery(api.customers.getCustomerSubscriptionTier, {
    clerkOrganizationId: organization?.id ?? "",
  });
  const addEvent = useMutation(api.events.addEvent);
  const updateCustomerEvents = useMutation(
    api.customers.updateGuestListEventCount
  );
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);

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

  const handleSubmit = async (eventData: any, ticketData: any) => {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Event</h1>
      <EventForm
        onSubmit={handleSubmit}
        isEdit={false}
        canAddGuestList={canAddGuestList}
        subscriptionTier={result.subscriptionTier}
      />
    </div>
  );
};

export default AddEventPage;
