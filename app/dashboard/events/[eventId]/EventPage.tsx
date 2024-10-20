"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";
import Link from "next/link";
import { ClerkRoleEnum } from "@/utils/enums";
import { FaPencilAlt, FaSave, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import EventForm from "@/dashboard/components/EventForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ConfirmModal from "@/dashboard/components/ConfirmModal";
import TicketInfo from "@/dashboard/components/TicketInfo";
import EventInfo from "@/dashboard/components/EventInfo";
import PromoterGuestList from "@/dashboard/components/PromoterGuestList";
import EventGuestList from "@/dashboard/components/EventGuestList";
import ModeratorGuestList from "@/dashboard/components/ModeratorGuestList";

type EventProps = {
  eventId: Id<"events">;
};

export default function EventPage({ eventId }: EventProps) {
  const eventData = useQuery(api.events.getEventById, { eventId });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "event" | "guestList" | "ticketInfo"
  >("event");

  const { orgRole, userId: promoterId, isLoaded } = useAuth();

  const canUploadGuestList = orgRole === ClerkRoleEnum.ORG_PROMOTER;
  const canViewAllGuestList = orgRole === ClerkRoleEnum.ORG_MANAGER;
  const canEdit =
    orgRole === ClerkRoleEnum.ORG_ADMIN ||
    orgRole === ClerkRoleEnum.ORG_MANAGER;
  const canCheckInGuests =
    ClerkRoleEnum.ORG_MODERATOR || orgRole === ClerkRoleEnum.ORG_ADMIN;

  const promoCodeUsage = useQuery(
    api.promoCodeUsage.getPromoCodeUsageByPromoterAndEvent,
    canUploadGuestList && promoterId && eventData?.ticketInfo
      ? { clerkPromoterUserId: promoterId, eventId }
      : "skip"
  );

  const updateEvent = useMutation(api.events.updateEvent);
  const updateTicketInfo = useMutation(api.ticketInfo.updateTicketInfo);
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const deleteTicketInfoAndUpdateEvent = useMutation(
    api.ticketInfo.deleteTicketInfoAndUpdateEvent
  );
  const cancelEvent = useMutation(api.events.cancelEvent);
  const { toast } = useToast();
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  useEffect(() => {
    if (
      eventData !== undefined &&
      (promoCodeUsage !== undefined ||
        !canUploadGuestList ||
        !eventData.ticketInfo)
    ) {
      setIsLoading(false);
    }
  }, [eventData, promoCodeUsage, canUploadGuestList]);

  if (isLoading || !isLoaded) {
    return <div>Loading...</div>;
  }

  if (!eventData) {
    return <div>Event not found</div>;
  }

  const { ticketInfo, ...event } = eventData;

  const handleSubmit = async (eventData: any, ticketData: any) => {
    try {
      await updateEvent({
        id: eventId,
        ...eventData,
      });

      if (ticketData) {
        if (ticketInfo) {
          // Update existing ticket info
          await updateTicketInfo({
            eventId,
            ...ticketData,
          });
        } else {
          // Insert new ticket info if it doesn't exist
          await insertTicketInfo({
            eventId,
            ...ticketData,
          });
        }
      }
      toast({
        title: "Event Updated",
        description: "The event has been successfully updated",
      });

      setIsEditingEvent(false);
      // Optionally, you can refetch the event data here to update the UI
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteTicketInfo = async (eventId: Id<"events">) => {
    try {
      await deleteTicketInfoAndUpdateEvent({ eventId });
      // Handle successful deletion (e.g., update UI, show success message)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEvent = async () => {
    try {
      const navigationPromise = router.push("/");
      toast({
        title: "Event Cancelled",
        description: "The event has been successfully cancelled.",
      });
      // Then cancel the event
      await cancelEvent({ eventId });

      // Wait for the navigation to complete
      navigationPromise;
      // Handle successful cancellation (e.g., redirect to events list)
    } catch (error) {
      console.error("Error cancelling event:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setShowCancelConfirmModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {isEditingEvent ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>{" "}
          <EventForm
            initialEventData={event}
            initialTicketData={ticketInfo}
            onSubmit={handleSubmit}
            isEdit={true}
            canAddGuestList={canUploadGuestList}
            deleteTicketInfo={handleDeleteTicketInfo} // Pass the deleteTicketInfo function
            eventId={eventId}
            onCancelEvent={handleCancelEvent}
          />
          <ConfirmModal
            isOpen={showCancelConfirmModal}
            onClose={() => setShowCancelConfirmModal(false)}
            onConfirm={() => {
              setShowCancelConfirmModal(false);
              setIsEditingEvent(false);
              router.back(); // This navigates back to the previous page
            }}
            title="Confirm Cancellation"
            message="Are you sure you want to cancel? Any unsaved changes will be discarded."
            confirmText="Yes, Cancel"
            cancelText="No, Continue Editing"
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            {canEdit && (
              <Button onClick={() => setIsEditingEvent(true)}>
                <FaPencilAlt className="mr-2" /> Edit Event
              </Button>
            )}
          </div>
          <div className="flex space-x-4 mb-4">
            <Button
              variant={activeTab === "event" ? "default" : "outline"}
              onClick={() => setActiveTab("event")}
            >
              Event
            </Button>
            <Button
              variant={activeTab === "ticketInfo" ? "default" : "outline"}
              onClick={() => setActiveTab("ticketInfo")}
            >
              Tickets
            </Button>
            <Button
              variant={activeTab === "guestList" ? "default" : "outline"}
              onClick={() => setActiveTab("guestList")}
            >
              Guest List
            </Button>
          </div>

          {activeTab === "ticketInfo" && (
            <TicketInfo
              ticketInfo={ticketInfo}
              canEdit={canEdit}
              eventId={eventId}
              promoterClerkId={promoterId}
            />
          )}
          {activeTab === "event" && (
            <EventInfo
              event={event}
              ticketInfo={ticketInfo}
              canEdit={canEdit}
            />
          )}

          {activeTab === "guestList" && (
            <>
              {canUploadGuestList && (
                <PromoterGuestList
                  eventId={eventId}
                  promoterId={promoterId || ""}
                />
              )}
              {canViewAllGuestList && (
                <EventGuestList eventId={eventId} />
                // <Link href={`/events/${eventId}/guestlist`}>
                //   <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                //     View Guest List
                //   </Button>
                // </Link>
              )}
              {canCheckInGuests && <ModeratorGuestList eventId={eventId} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
