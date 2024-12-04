"use client";

import { FC, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { SubscriptionTier } from "../../../utils/enum";
import EventForm from "../components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConfirmModal from "../components/ConfirmModal";
import EventInfoSkeleton from "../components/loading/EventInfoSkeleton";
import { PLUS_GUEST_LIST_LIMIT } from "@/constants";

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
    eventData: any,
    ticketData: any,
    guestListData: any
  ) => {
    try {
      const eventId = await addEvent({
        clerkOrganizationId: organizationId,
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

      if (result.subscriptionTier === SubscriptionTier.PLUS && guestListData) {
        updateCustomerEvents({ customerId: result.customerId });
      }
      toast({
        title: "Event Created",
        description: "The event has been successfully created",
      });
      router.push(`events/${eventId}`);
      console.log("Event added successfully with ID:", eventId);
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

  return (
    <div className="container mx-auto p-4 md:border-2 max-w-3xl md:p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="font-semibold"
          onClick={handleCancel}
        >
          Back
        </Button>
        <h1 className="text-xl font-raleway font-bold text-center flex-grow">
          Add Event
        </h1>
      </div>
      <EventForm
        onSubmit={handleSubmit}
        isEdit={false}
        canAddGuestListOption={canAddGuestListOption}
        subscriptionTier={result.subscriptionTier}
        onCancel={handleCancel}
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
