import React, { useState } from "react";
import {
  EventFormInput,
  GuestListFormInput,
  Tab,
  TicketFormInput,
} from "@/types/types";
import TopRowNav from "./TopRowNav";
import TabsNav from "./TabsNav";
import {
  ActiveStripeTab,
  ActiveTab,
  ResponseStatus,
  UserRole,
} from "../../../../../utils/enum";
import EventForm from "@/[slug]/app/components/EventForm";
import TicketInfoTab from "@/[slug]/app/components/TicketInfoTab";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "@/hooks/use-toast";
import GuestListTab from "./GuestListTab";
import ViewTab from "../ViewTab";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import { UpdateEventResponse } from "@/types/convex-types";
import {
  EventSchema,
  GuestListInfoSchema,
  TicketInfoSchema,
  UserSchema,
} from "@/types/schemas-types";
import { FrontendErrorMessages } from "@/types/enums";
import { Id } from "../../../../../convex/_generated/dataModel";

interface EventIdContentProps {
  data: {
    event: EventSchema;
    ticketInfo?: TicketInfoSchema | null;
    guestListInfo?: GuestListInfoSchema | null;
  };
  isAppAdmin: boolean;
  user: UserSchema;
  has: any;
  isStripeEnabled: boolean;
  slug: string;
}

const EventIdContent: React.FC<EventIdContentProps> = ({
  data,
  isAppAdmin,
  user,
  has,
  isStripeEnabled,
  slug,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | ActiveStripeTab>(
    ActiveTab.VIEW
  );
  const updateEvent = useAction(api.events.updateEvent);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);
  const [isUpdateEventLoading, setIsUpdateEventLoading] =
    useState<boolean>(false);

  const tabs: Tab[] = [
    { label: "View", value: ActiveTab.VIEW },
    { label: "Guest List", value: ActiveTab.GUEST_LIST },
    { label: "Ticket Info", value: ActiveTab.TICKET_INFO },
  ];

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
    setSaveEventError(null);
    setIsUpdateEventLoading(true);

    try {
      const response: UpdateEventResponse = await updateEvent({
        slug,
        ...updatedEventData,
        ticketData: updatedTicketData,
        guestListData: updatedGuestListData,
        eventId: data.event._id,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Event Updated",
          description: "The event has been successfully updated",
        });
        setIsEditing(false);
      } else {
        console.error(response.error);
        setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error(error);
      setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setIsUpdateEventLoading(false);
    }
  };

  let promoterId: Id<"users"> | null = null;
  if (has({ role: UserRole.Promoter })) {
    promoterId = user._id;
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
          isStripeEnabled={isStripeEnabled}
          isUpdateEventLoading={isUpdateEventLoading}
        />
      ) : (
        <>
          <TabsNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />
          {activeTab === ActiveTab.TICKET_INFO && (
            <TicketInfoTab
              ticketData={data.ticketInfo}
              has={has}
              eventId={data.event._id}
              promoterUserId={promoterId}
              slug={slug}
            />
          )}
          {activeTab === ActiveTab.GUEST_LIST && (
            <GuestListTab
              guestListInfo={data.guestListInfo}
              has={has}
              eventData={data.event}
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
