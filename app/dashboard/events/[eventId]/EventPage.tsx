"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FaPencilAlt } from "react-icons/fa";
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

// To do update types
type EventProps = {
  eventData: any;
  promoterId: string;
  permissions: any;
};

export default function EventPage({
  eventData,
  promoterId,
  permissions,
}: EventProps) {
  const router = useRouter();
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "event" | "guestList" | "ticketInfo"
  >("event");

  const updateEvent = useMutation(api.events.updateEvent);
  const updateTicketInfo = useMutation(api.ticketInfo.updateTicketInfo);
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const cancelEvent = useMutation(api.events.cancelEvent);
  const { toast } = useToast();
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const updateGuestListCloseTime = useMutation(
    api.guestListInfo.updateGuestListCloseTime
  );
  const insertGuestListInfo = useMutation(
    api.guestListInfo.insertGuestListInfo
  );

  const { ticketInfo, guestListInfo, ...event } = eventData;

  // Updating event
  const handleSubmit = async (
    updatedEventData: any,
    updatedTicketData: any,
    updatedGuestListData: any
  ) => {
    try {
      await updateEventInfo(
        eventData._id,
        eventData,
        updatedEventData,
        updatedTicketData,
        updatedGuestListData
      );

      toast({
        title: "Event Updated",
        description: "The event has been successfully updated",
      });

      setIsEditingEvent(false);
      // Optionally, you can refetch the event data here to update the UI
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  async function updateEventInfo(
    eventId: Id<"events">,
    eventData: any,
    updatedEventData: any,
    updatedTicketData: any,
    updatedGuestListData: any
  ) {
    // Handle ticket info
    await handleInfoUpdate(
      updatedTicketData,
      eventData.ticketInfoId,
      () =>
        updateTicketInfo({
          ticketInfoId: ticketInfo?._id,
          ...updatedTicketData,
        }),
      () => insertTicketInfo({ eventId, ...updatedTicketData })
    );

    // Handle guest list info
    await handleInfoUpdate(
      updatedGuestListData,
      eventData.guestListInfoId,
      () =>
        updateGuestListCloseTime({
          guestListInfoId: guestListInfo?._id,
          ...updatedGuestListData,
        }),
      () => insertGuestListInfo({ eventId, ...updatedGuestListData })
    );

    // Update event
    await updateEvent({
      id: eventData._id,
      ...updatedEventData,
      ...(updatedTicketData ? {} : { ticketInfoId: null }),
      ...(updatedGuestListData ? {} : { guestListInfoId: null }),
    });
  }

  async function handleInfoUpdate(
    updatedData: any,
    infoId: any,
    updateFn: () => Promise<any>,
    insertFn: () => Promise<any>
  ) {
    if (updatedData) {
      if (infoId) {
        await updateFn();
      } else {
        await insertFn();
      }
    }
  }

  const handleCancelEvent = async () => {
    try {
      const navigationPromise = router.push("/");

      // Then cancel the event
      await cancelEvent({ eventId: eventData._id });
      toast({
        title: "Event Cancelled",
        description: "The event has been successfully cancelled.",
      });
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

  const now = new Date();
  let isGuestListOpen = false;

  if (guestListInfo?.guestListCloseTime) {
    // Parse the guestListCloseTime string into a Date object
    const guestListCloseDate = new Date(guestListInfo.guestListCloseTime);

    // Compare the current time with the guest list close time
    isGuestListOpen = now < guestListCloseDate;
  }
  let isCheckInOpen = now < new Date(event.endTime);
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
            initialGuestListData={guestListInfo}
            onSubmit={handleSubmit}
            isEdit={true}
            canAddGuestList={permissions.canUploadGuestList}
            // deleteTicketInfo={handleDeleteTicketInfo}
            eventId={eventData._id}
            onCancelEvent={handleCancelEvent}
            // deleteGuestListInfo={handleDeleteGuestListInfo}
          />
          <ConfirmModal
            isOpen={showCancelConfirmModal}
            onClose={() => setShowCancelConfirmModal(false)}
            onConfirm={() => {
              setShowCancelConfirmModal(false);
              setIsEditingEvent(false);
              router.back();
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
            {permissions.canEdit && (
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
              canEdit={permissions.canEdit}
              eventId={eventData._id}
              promoterClerkId={promoterId}
            />
          )}
          {activeTab === "event" && (
            <EventInfo
              event={event}
              ticketInfo={ticketInfo}
              canEdit={permissions.canEdit}
              guestListInfo={guestListInfo}
            />
          )}

          {activeTab === "guestList" &&
            (guestListInfo ? (
              <>
                {permissions.canUploadGuestList && (
                  <PromoterGuestList
                    eventId={eventData._id}
                    promoterId={promoterId || ""}
                    isGuestListOpen={isGuestListOpen}
                  />
                )}
                {permissions.canViewAllGuestList && (
                  <EventGuestList eventId={eventData._id} />
                )}
                {permissions.canCheckInGuests && (
                  <ModeratorGuestList
                    eventId={eventData._id}
                    isCheckInOpen={isCheckInOpen}
                  />
                )}
              </>
            ) : (
              <p>No guest list option for this event.</p>
            ))}
        </>
      )}
    </div>
  );
}
