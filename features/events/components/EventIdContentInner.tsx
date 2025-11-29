"use client";

import { useState, useMemo, useEffect } from "react";
import { Doc, Id } from "@convex/_generated/dataModel";
import {
  EventFormInput,
  GuestListFormInput,
  Tab,
  TicketSoldCountByType,
  TicketUpdateInput,
} from "@shared/types/types";
import TopRowNav from "./TopRowNav";
import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import { ActiveTab } from "@shared/types/enums";
import { useUpdateEvent } from "@/domain/events";
import ToggleTabs from "@shared/ui/toggle/ToggleTabs";
import { isPast } from "date-fns";
import { useCancelEvent } from "@/domain/events";
import PageContainer from "@shared/ui/containers/PageContainer";
import GetEventSummary from "@/features/events/components/summary/SummaryContent";
import CampaignLoaderByEvent from "./campaigns/CampaignLoaderByEvent";
import EventFormContent from "./eventForm/EventFormContent";
import { useEventForm } from "@/shared/hooks/contexts";
import GuestListLoader from "./guestList/GuestListLoader";
import TicketsLoader from "@/features/tickets/components/TicketsLoader";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";

interface EventIdContentInnerProps {
  data: {
    event: Doc<"events">;
    ticketTypes?: Doc<"eventTicketTypes">[] | null;
    guestListInfo?: Doc<"guestListInfo"> | null;
    ticketSoldCounts?: TicketSoldCountByType[] | null;
  };
  isAppAdmin: boolean;
  isStripeEnabled: boolean;
  subscription: Doc<"subscriptions">;
  handleGoBack: () => void;
  canCheckInGuests: boolean;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  handleBuyCredit: () => void;
  isCompanyAdmin: boolean;
  availableCredits?: number;
  onDeleteSuccess: () => void;
  canCreateCampaign: boolean;
  onAddCampaign: () => void;
}

const EventIdContentInner: React.FC<EventIdContentInnerProps> = ({
  data,
  isAppAdmin,
  isStripeEnabled,
  subscription,
  handleGoBack,
  canCheckInGuests,
  canUploadGuest,
  canEditEvent,
  handleAddGuestList,
  handleBuyCredit,
  isCompanyAdmin,
  availableCredits,
  onDeleteSuccess,
  canCreateCampaign,
  onAddCampaign,
}) => {
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const { hasChanges, isEditing, setIsEditing } = useEventForm();
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
    if (data.guestListInfo && isDesktop)
      base.push({ label: "Guest List", value: "guestList" });
    if (data.guestListInfo && !isDesktop)
      base.push({ label: "GL", value: "guestList" });
    if (data.ticketTypes && data.ticketTypes.length > 0)
      base.push({ label: "Tickets", value: "ticketInfo" });
    if (canCreateCampaign)
      base.push({ label: "Campaigns", value: "campaigns" });
    return base;
  }, [data.guestListInfo, data.ticketTypes, canCreateCampaign]);

  useEffect(() => {
    const available = new Set(tabs.map((t) => t.value));
    if (!available.has(activeTab)) setActiveTab("summary");
  }, [tabs, activeTab]);

  const handleCancelEdit = () => {
    if (isEditing && hasChanges) {
      setShowConfirmCancelEdit(true);
    } else {
      setIsEditing?.(false);
    }
  };

  const handleGoBackFromEdit = () => {
    if (isEditing && hasChanges) {
      setShowConfirmCancelEdit(true);
    } else {
      setIsEditing?.(false);
      handleGoBack();
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
    if (success) setIsEditing?.(false);
  };

  const isGuestListOpen = data.guestListInfo?.guestListCloseTime
    ? !isPast(data.guestListInfo.guestListCloseTime)
    : false;

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
        onCancelEdit={handleCancelEdit}
        handleGoBack={handleGoBackFromEdit}
        canUploadGuest={canUploadGuest}
        canEditEvent={canEditEvent}
        handleAddGuestList={handleAddGuestList}
        isGuestListOpen={isGuestListOpen}
        guestListInfo={data.guestListInfo}
        onDelete={() => setShowConfirmDelete(true)}
        onAddCampaign={onAddCampaign}
      />

      {isEditing ? (
        <EventFormContent
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
          submitError={null}
        />
      ) : (
        <>
          <ToggleTabs
            options={tabs}
            value={activeTab}
            onChange={(value) => setActiveTab(value as ActiveTab)}
          />

          {activeTab === "summary" && (
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
            <TicketsLoader
              canCheckInGuests={canCheckInGuests}
              eventId={data.event._id}
            />
          )}

          {activeTab === "guestList" && data.guestListInfo && (
            <GuestListLoader
              eventId={data.event._id}
              canUploadGuest={canUploadGuest}
              canCheckInGuests={canCheckInGuests}
              guestListInfo={data.guestListInfo}
            />
          )}

          {activeTab === "campaigns" && (
            <CampaignLoaderByEvent eventId={data.event._id} />
          )}
        </>
      )}

      <ResponsiveConfirm
        isOpen={showConfirmCancelEdit}
        title="Discard Changes?"
        confirmText="Yes, Discard"
        cancelText="Continue Editing"
        content="You have unsaved changes. They will be lost if you leave."
        confirmVariant="destructive"
        modalProps={{
          onClose: () => setShowConfirmCancelEdit(false),
          onConfirm: () => {
            setShowConfirmCancelEdit(false);
            setIsEditing?.(false);
          },
        }}
        error={null}
        isLoading={false}
      />

      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Delete Event?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        content="This action cannot be undone."
        error={deleteError}
        isLoading={isDeleteLoading}
        modalProps={{
          onClose: () => {
            setShowConfirmDelete(false);
            setSaveEventError(null);
          },
          onConfirm: handleConfirmDelete,
        }}
      />
    </PageContainer>
  );
};

export default EventIdContentInner;
