import React, { useState } from "react";
import { UserResource, OrganizationResource } from "@clerk/types";
import {
  EventData,
  EventFormData,
  GuestListInfo,
  GuestListInfoWithoutEventId,
  TicketInfo,
  TicketInfoWithoutEventId,
} from "@/types";
import TopRowNav from "./TopRowNav";
import ConfirmModal from "@/dashboard/components/ConfirmModal";
import TabsNav from "./TabsNav";
import { ActiveTab, UserRole } from "../../../../utils/enum";
import EventForm from "@/dashboard/components/EventForm";
import EventInfo from "@/dashboard/components/EventInfo";
import TicketInfoTab from "@/dashboard/components/TicketInfoTab";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "@/hooks/use-toast";

interface EventIdContentProps {
  data: {
    event: EventData;
    ticketInfo?: TicketInfo | null;
    guestListInfo?: GuestListInfo | null;
  };
  isAppAdmin: boolean;
  organization: OrganizationResource;
  user: UserResource;
  has: any;
}

const EventIdContent: React.FC<EventIdContentProps> = ({
  data,
  isAppAdmin,
  organization,
  user,
  has,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.VIEW);
  const updateTicketInfo = useMutation(api.ticketInfo.updateTicketInfo);
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const updateEvent = useMutation(api.events.updateEvent);
  const updateGuestListCloseTime = useMutation(
    api.guestListInfo.updateGuestListCloseTime
  );
  const insertGuestListInfo = useMutation(
    api.guestListInfo.insertGuestListInfo
  );

  const handleCancelEdit = () => {
    if (isEditing) {
      setShowConfirmCancelEdit(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveEvent = async (
    updatedEventData: EventData,
    updatedTicketData: TicketInfo,
    updatedGuestListData: GuestListInfo
  ) => {
    try {
      await updateEventInfo(
        data.event._id,
        data.event,
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
    updatedEventData: Partial<EventData>,
    updatedTicketData: TicketInfo | TicketInfoWithoutEventId,
    updatedGuestListData: GuestListInfo | GuestListInfoWithoutEventId
  ) {
    // Handle ticket info
    await handleInfoUpdate(
      updatedTicketData,
      eventData.ticketInfoId,
      () =>
        updateTicketInfo({
          ticketInfoId: eventData.ticketInfoId,
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
          guestListInfoId: eventData.guestListInfoId,
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

  let promoterId: string | null = null;
  if (has({ role: UserRole.Promoter })) {
    promoterId = user.id;
  }

  return (
    <section className="container mx-auto p-4 md:border-2 max-w-3xl md:p-6 rounded-lg">
      <TopRowNav
        eventData={data.event}
        isAdminOrg={isAppAdmin}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
      />
      {isEditing ? (
        <EventForm
          initialEventData={data.event}
          initialTicketData={data.ticketInfo}
          initialGuestListData={data.guestListInfo}
          onSubmit={handleSaveEvent}
          isEdit={isEditing}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <>
          <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === ActiveTab.TICKET_INFO && (
            <TicketInfoTab
              ticketData={data.ticketInfo}
              has={has}
              eventId={data.event._id}
              promoterClerkId={promoterId}
              clerkOrganizationId={organization.id}
            />
          )}
        </>
      )}

      {/* cancel edit confirm */}
      <ConfirmModal
        isOpen={showConfirmCancelEdit}
        onClose={() => setShowConfirmCancelEdit(false)}
        onConfirm={() => {
          setShowConfirmCancelEdit(false);
          setIsEditing(false);
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Editing"
      />
    </section>
  );
};

export default EventIdContent;
