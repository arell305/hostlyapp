import React, { useEffect, useState } from "react";
import {
  EventFormInput,
  GuestListFormInput,
  Tab,
  TicketSoldCountByType,
  TicketUpdateInput,
} from "@/types/types";
import TopRowNav from "./TopRowNav";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import {
  EventSchema,
  EventTicketTypesSchema,
  GuestListInfoSchema,
  SubscriptionSchema,
} from "@/types/schemas-types";
import { ActiveStripeTab, ActiveTab } from "@/types/enums";
import { useUpdateEvent } from "../hooks/useUpdateEvent";
import { Id } from "../../../../../convex/_generated/dataModel";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import SummaryPage from "./summary/SummaryPage";
import { isPast } from "date-fns";
import TicketPage from "../../components/tickets/TicketPage";
import GuestListPage from "../guestList/GuestListPage";
import EventFormWrapper from "../../components/eventForm/EventFormWrapper";
import { useCancelEvent } from "../hooks/useCancelEvent";
import PageContainer from "@/components/shared/containers/PageContainer";

interface EventIdContentProps {
  data: {
    event: EventSchema;
    ticketTypes?: EventTicketTypesSchema[] | null;
    guestListInfo?: GuestListInfoSchema | null;
    ticketSoldCounts?: TicketSoldCountByType[] | null;
  };
  isAppAdmin: boolean;
  isStripeEnabled: boolean;
  subscription: SubscriptionSchema;
  handleNavigateHome: () => void;
  canCheckInGuests: boolean;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  handleBuyCredit: () => void;
  isCompanyAdmin: boolean;
  availableCredits?: number;
  onDeleteSuccess: () => void;
}

const EventIdContent: React.FC<EventIdContentProps> = ({
  data,
  isAppAdmin,
  isStripeEnabled,
  subscription,
  handleNavigateHome,
  canCheckInGuests,
  canUploadGuest,
  canEditEvent,
  handleAddGuestList,
  handleBuyCredit,
  isCompanyAdmin,
  availableCredits,
  onDeleteSuccess,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab | ActiveStripeTab>(
    ActiveTab.SUMMARY
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const {
    updateEvent,
    isLoading: isUpdateEventLoading,
    error: saveEventError,
    setError: setSaveEventError,
  } = useUpdateEvent();

  const {
    cancelEvent,
    isLoading: isDeleteLoading,
    error: deleteError,
  } = useCancelEvent();

  const tabs: Tab[] = [
    { label: "Summary", value: ActiveTab.SUMMARY },
    ...(data.guestListInfo
      ? [{ label: "Guest List", value: ActiveTab.GUEST_LIST }]
      : []),
    ...(data.ticketTypes && data.ticketTypes.length > 0
      ? [{ label: "Tickets", value: ActiveTab.TICKET_INFO }]
      : []),
  ];

  useEffect(() => {
    const availableValues = new Set(tabs.map((t) => t.value));
    if (!availableValues.has(activeTab)) {
      setActiveTab(ActiveTab.SUMMARY);
    }
  }, [tabs, activeTab]);

  const handleCancelEdit = () => {
    if (isEditing) {
      setShowConfirmCancelEdit(true);
    } else {
      handleNavigateHome();
    }
  };

  const handleUpdateEvent = async (
    organizationId: Id<"organizations">,
    updatedEventData: EventFormInput,
    updatedTicketData: TicketUpdateInput[],
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

  let isGuestListOpen: boolean = data.guestListInfo?.guestListCloseTime
    ? !isPast(data.guestListInfo.guestListCloseTime)
    : false;

  const handleShowDeleteConfirmation = () => {
    setShowConfirmDelete(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowConfirmDelete(false);
    setSaveEventError(null);
  };

  const handleConfirmDelete = async () => {
    const success = await cancelEvent(data.event._id);
    if (success) {
      setShowConfirmDelete(false); // optional: close dialog before navigating
      onDeleteSuccess(); // delegate navigation to parent
    }
  };
  return (
    <PageContainer className="pt-0">
      <TopRowNav
        eventData={data.event}
        isAdminOrg={isAppAdmin}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
        handleGoHome={handleNavigateHome}
        canUploadGuest={canUploadGuest}
        canEditEvent={canEditEvent}
        handleAddGuestList={handleAddGuestList}
        isGuestListOpen={isGuestListOpen}
        guestListInfo={data.guestListInfo}
        onDelete={handleShowDeleteConfirmation}
      />
      {isEditing ? (
        <EventFormWrapper
          initialEventData={data.event}
          initialTicketData={data.ticketTypes}
          initialGuestListData={data.guestListInfo}
          onSubmit={handleUpdateEvent}
          isEdit={isEditing}
          onCancelEdit={handleCancelEdit}
          saveEventError={saveEventError}
          isStripeEnabled={isStripeEnabled}
          isUpdateEventLoading={isUpdateEventLoading}
          subscription={subscription}
          organizationId={data.event.organizationId}
          handleBuyCredit={handleBuyCredit}
          isCompanyAdmin={isCompanyAdmin}
          availableCredits={availableCredits}
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
              isPromoter={canUploadGuest}
              ticketInfo={data.ticketTypes}
              canEditEvent={canEditEvent}
              event={data.event}
            />
          )}

          {activeTab === ActiveTab.TICKET_INFO && (
            <TicketPage
              canCheckInGuests={canCheckInGuests}
              eventId={data.event._id}
            />
          )}
          {activeTab === ActiveTab.GUEST_LIST && data.guestListInfo && (
            <GuestListPage
              eventId={data.event._id}
              canUploadGuest={canUploadGuest}
              canCheckInGuests={canCheckInGuests}
              guestListInfo={data.guestListInfo}
            />
          )}
        </>
      )}
      <ResponsiveConfirm
        isOpen={showConfirmCancelEdit}
        title="Confirm Cancellation"
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        content="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmVariant="default"
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
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content="Are you sure you want to delete this event? This action cannot be undone."
        error={deleteError}
        isLoading={isDeleteLoading}
        modalProps={{
          onClose: handleCloseDeleteConfirmation,
          onConfirm: handleConfirmDelete,
        }}
        drawerProps={{
          onSubmit: handleConfirmDelete,
          onOpenChange: handleCloseDeleteConfirmation,
        }}
      />
    </PageContainer>
  );
};

export default EventIdContent;
