"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EventFormInput,
  GuestListFormInput,
  Tab,
  TicketSoldCountByType,
  TicketUpdateInput,
} from "@shared/types/types";
import TopRowNav from "./TopRowNav";
import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import { ActiveStripeTab, ActiveTab } from "@shared/types/enums";
import { useUpdateEvent } from "@/domain/events";
import { Doc, Id } from "@convex/_generated/dataModel";
import ToggleTabs from "@shared/ui/toggle/ToggleTabs";
import { isPast } from "date-fns";
import TicketPage from "@/features/tickets/components/TicketPage";
import GuestListPage from "./guestList/GuestListPage";
import EventFormWrapper from "./eventForm/EventFormWrapper";
import { useCancelEvent } from "@/domain/events";
import PageContainer from "@shared/ui/containers/PageContainer";
import GetEventSummary from "@/features/events/components/summary/SummaryContent";

interface EventIdContentProps {
  data: {
    event: Doc<"events">;
    ticketTypes?: Doc<"eventTicketTypes">[] | null;
    guestListInfo?: Doc<"guestListInfo"> | null;
    ticketSoldCounts?: TicketSoldCountByType[] | null;
  };
  isAppAdmin: boolean;
  isStripeEnabled: boolean;
  subscription: Doc<"subscriptions">;
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
    "summary"
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

  const tabs: Tab[] = useMemo(() => {
    const base: Tab[] = [{ label: "Summary", value: "summary" }];
    if (data.guestListInfo) {
      base.push({ label: "Guest List", value: "guestList" });
    }
    if (data.ticketTypes && data.ticketTypes.length > 0) {
      base.push({ label: "Tickets", value: "ticketInfo" });
    }
    return base;
  }, [data.guestListInfo, data.ticketTypes]);

  useEffect(() => {
    const availableValues = new Set(tabs.map((t) => t.value));
    if (!availableValues.has(activeTab)) {
      setActiveTab("summary");
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
      setShowConfirmDelete(false);
      onDeleteSuccess();
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
          {activeTab === "summary" && (
            // Check if this is correct
            <GetEventSummary
              guestListInfo={data.guestListInfo}
              isPromoter={canUploadGuest}
              ticketInfo={data.ticketTypes}
              canEditEvent={canEditEvent}
              event={data.event}
              promoterGuestStats={[]}
              ticketSalesByPromoterData={null}
            />
          )}

          {activeTab === "ticketInfo" && (
            <TicketPage
              canCheckInGuests={canCheckInGuests}
              eventId={data.event._id}
            />
          )}
          {activeTab === "guestList" && data.guestListInfo && (
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
