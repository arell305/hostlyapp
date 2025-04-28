import React, { useState } from "react";
import {
  EventFormInput,
  GuestListFormInput,
  OrganizationSchema,
  Tab,
  TicketFormInput,
} from "@/types/types";
import TopRowNav from "./TopRowNav";
import EventForm from "@/[slug]/app/components/EventForm";
import GuestListTab from "./GuestListTab";
import ViewTab from "../ViewTab";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import {
  EventSchema,
  GuestListInfoSchema,
  SubscriptionSchema,
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { ActiveStripeTab, ActiveTab } from "@/types/enums";
import TicketTab from "../../components/tickets/TicketTab";
import { useUpdateEvent } from "../hooks/useUpdateEvent";
import { Id } from "../../../../../convex/_generated/dataModel";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import SummaryPage from "./summary/SummaryPage";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface EventIdContentProps {
  data: {
    event: EventSchema;
    ticketInfo?: TicketInfoSchema | null;
    guestListInfo?: GuestListInfoSchema | null;
  };
  isAppAdmin: boolean;
  isStripeEnabled: boolean;
  organization: OrganizationSchema;
  subscription: SubscriptionSchema;
  handleNavigateHome: () => void;
  tickets: TicketSchemaWithPromoter[];
  canCheckInGuests: boolean;
  guestListData: GetEventWithGuestListsData;
  canUploadGuest: boolean;
}

const EventIdContent: React.FC<EventIdContentProps> = ({
  data,
  isAppAdmin,
  isStripeEnabled,
  organization,
  subscription,
  handleNavigateHome,
  tickets,
  canCheckInGuests,
  guestListData,
  canUploadGuest,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [showConfirmHome, setShowConfirmHome] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | ActiveStripeTab>(
    ActiveTab.SUMMARY
  );
  const {
    updateEvent,
    isLoading: isUpdateEventLoading,
    error: saveEventError,
  } = useUpdateEvent();

  const tabs: Tab[] = [
    { label: "Summary", value: ActiveTab.SUMMARY },
    { label: "View", value: ActiveTab.VIEW },
    ...(data.guestListInfo
      ? [{ label: "Guest List", value: ActiveTab.GUEST_LIST }]
      : []),
    ...(data.ticketInfo
      ? [{ label: "Tickets", value: ActiveTab.TICKET_INFO }]
      : []),
  ];

  const handleCancelEdit = () => {
    if (isEditing) {
      setShowConfirmCancelEdit(true);
    } else {
      handleNavigateHome();
    }
  };
  const handleGoHome = () => {
    if (isEditing) {
      setShowConfirmHome(true);
    } else {
      handleNavigateHome();
    }
  };
  const handleUpdateEvent = async (
    organizationId: Id<"organizations">,
    updatedEventData: EventFormInput,
    updatedTicketData: TicketFormInput | null,
    updatedGuestListData: GuestListFormInput | null
  ) => {
    const success = await updateEvent(
      organizationId,
      updatedEventData,
      updatedTicketData,
      updatedGuestListData,
      data.event._id
    );

    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <SectionContainer>
      <TopRowNav
        eventData={data.event}
        isAdminOrg={isAppAdmin}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
        handleGoHome={handleGoHome}
      />
      {isEditing ? (
        <EventForm
          initialEventData={data.event}
          initialTicketData={data.ticketInfo}
          initialGuestListData={data.guestListInfo}
          onSubmit={handleUpdateEvent}
          isEdit={isEditing}
          onCancelEdit={handleCancelEdit}
          saveEventError={saveEventError}
          isStripeEnabled={isStripeEnabled}
          isUpdateEventLoading={isUpdateEventLoading}
          subscription={subscription}
        />
      ) : (
        <>
          <ToggleTabs
            options={tabs}
            value={activeTab}
            onChange={setActiveTab}
          />
          {activeTab === ActiveTab.SUMMARY && (
            <SummaryPage
              guestListInfo={data.guestListInfo}
              ticketData={data.ticketInfo}
              tickets={tickets}
              organizationId={organization._id}
            />
          )}

          {activeTab === ActiveTab.TICKET_INFO && (
            <TicketTab canCheckInGuests={canCheckInGuests} tickets={tickets} />
          )}
          {activeTab === ActiveTab.GUEST_LIST && data.guestListInfo && (
            <GuestListTab
              guestListInfo={data.guestListInfo}
              eventData={data.event}
              guestListData={guestListData}
              canUploadGuest={canUploadGuest}
              canCheckInGuests={canCheckInGuests}
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
      <ResponsiveConfirm
        isOpen={showConfirmHome}
        title="Confirm Home Navigation"
        confirmText="Yes, Go Home"
        cancelText="No, Stay Here"
        content="Are you sure you want to go home? Any unsaved changes will be discarded."
        confirmVariant="destructive"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowConfirmHome(false),
          onConfirm: () => {
            setShowConfirmHome(false);
            setIsEditing(false);
            handleNavigateHome();
          },
        }}
        drawerProps={{
          onSubmit: () => {
            setShowConfirmHome(false);
            setIsEditing(false);
            handleNavigateHome();
          },
          onOpenChange: (open) => setShowConfirmHome(open),
        }}
      />
    </SectionContainer>
  );
};

export default EventIdContent;
