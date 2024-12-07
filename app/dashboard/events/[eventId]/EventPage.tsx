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
import { ActiveTab } from "../../../../utils/enum";
import TabsNav from "./TabsNav";
// To do update types
type EventProps = {
  eventData: any;
  promoterId: string;
  permissions: any;
  displayEventPhoto?: string | null;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
};

export default function EventPage({
  eventData,
  promoterId,
  permissions,
  displayEventPhoto,
  isEditing,
  setIsEditing,
  onCancelEdit,
}: EventProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.VIEW);

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

      setIsEditing(false);
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
      {isEditing ? (
        <div>
          <EventForm
            initialEventData={event}
            initialTicketData={ticketInfo}
            initialGuestListData={guestListInfo}
            onSubmit={handleSubmit}
            isEdit={true}
            canAddGuestListOption={permissions.canEdit}
            // deleteTicketInfo={handleDeleteTicketInfo}

            onCancelEdit={onCancelEdit}
            // deleteGuestListInfo={handleDeleteGuestListInfo}
          />
        </div>
      ) : (
        <>
          <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === ActiveTab.TICKET_INFO && (
            <TicketInfo
              ticketInfo={ticketInfo}
              canViewAllTickets={permissions.canViewAllGuestList}
              eventId={eventData._id}
              promoterClerkId={promoterId}
              hasPromoCode={permissions.canUploadGuestList}
            />
          )}
          {activeTab === ActiveTab.VIEW && (
            <EventInfo
              event={event}
              ticketInfo={ticketInfo}
              canEdit={permissions.canEdit}
              guestListInfo={guestListInfo}
              displayEventPhoto={displayEventPhoto}
            />
          )}

          {activeTab === ActiveTab.GUEST_LIST &&
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
