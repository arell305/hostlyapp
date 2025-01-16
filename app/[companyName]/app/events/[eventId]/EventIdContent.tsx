import React, { useState } from "react";
import { UserResource, OrganizationResource } from "@clerk/types";
import {
  EventData,
  EventFormInput,
  EventSchema,
  GuestListFormInput,
  GuestListInfo,
  TicketFormInput,
  TicketInfo,
} from "@/types/types";
import TopRowNav from "./TopRowNav";
import TabsNav from "./TabsNav";
import { ActiveTab, ResponseStatus, UserRole } from "../../../../../utils/enum";
import EventForm from "@/[companyName]/app/components/EventForm";
import TicketInfoTab from "@/[companyName]/app/components/TicketInfoTab";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "@/hooks/use-toast";
import GuestListTab from "./GuestListTab";
import ViewTab from "../ViewTab";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import { UpdateEventResponse } from "@/types/convex-types";

interface EventIdContentProps {
  data: {
    event: EventSchema;
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
  const updateEvent = useMutation(api.events.updateEvent);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);

  const handleCancelEdit = () => {
    if (isEditing) {
      setShowConfirmCancelEdit(true);
    } else {
      setIsEditing(false);
    }
  };
  const handleUpdateEvent = async (
    updatedEventData: EventFormInput,
    updatedTicketData: TicketFormInput | null,
    updatedGuestListData: GuestListFormInput | null
  ) => {
    if (!organization) {
      setSaveEventError("company not loaded");
    }
    try {
      const response: UpdateEventResponse = await updateEvent({
        ...updatedEventData,
        clerkOrganizationId: organization.id,
        ticketData: updatedTicketData,
        guestListData: updatedGuestListData,
        eventId: data.event._id,
      });

      if (response.status === ResponseStatus.ERROR) {
        setSaveEventError(response.error); // Access the error from ErrorResponse
      } else {
        setIsEditing(false);
        toast({
          title: "Event Updated",
          description: "The event has been successfully updated",
        });
      }
    } catch (error) {
      console.error(error);
      setSaveEventError("Internal Error saving event.");
    }
  };

  let promoterId: string | null = null;
  if (has({ role: UserRole.Promoter })) {
    promoterId = user.id;
  }

  return (
    <section className="container mx-auto md:border-2 max-w-3xl md:p-6 rounded-lg">
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
          onSubmit={handleUpdateEvent}
          isEdit={isEditing}
          onCancelEdit={handleCancelEdit}
          canAddGuestListOption={true}
          saveEventError={saveEventError}
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
          {activeTab === ActiveTab.GUEST_LIST && (
            <GuestListTab
              guestListInfo={data.guestListInfo}
              has={has}
              eventData={data.event}
              promoterClerkId={promoterId}
            />
          )}
          {activeTab === ActiveTab.VIEW && (
            <ViewTab eventData={data.event} ticketData={data.ticketInfo} />
          )}
        </>
      )}

      <ResponsiveConfirm
        isOpen={showConfirmCancelEdit}
        title="Confirm Cancellation"
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        content="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmVariant="destructive"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowConfirmCancelEdit(false),
          onConfirm: () => {
            setShowConfirmCancelEdit(false);
            setIsEditing(false);
          },
        }}
        drawerProps={{
          onSubmit: () => {
            setShowConfirmCancelEdit(false);
            setIsEditing(false);
          },
          onOpenChange: (open) => setShowConfirmCancelEdit(open),
        }}
      />
    </section>
  );
};

export default EventIdContent;
