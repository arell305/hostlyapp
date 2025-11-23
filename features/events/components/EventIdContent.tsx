"use client";

import { Doc } from "@convex/_generated/dataModel";
import { EventFormProvider } from "@/contexts/EventFormContext";
import EventIdContentInner from "./EventIdContentInner";
import { TicketSoldCountByType } from "@shared/types/types";
import { useState } from "react";

interface EventIdPageProps {
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

const EventIdPage: React.FC<EventIdPageProps> = (props) => {
  const {
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
  } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <EventFormProvider
      initialEventData={data.event}
      initialTicketData={data.ticketTypes}
      initialGuestListData={data.guestListInfo}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    >
      <EventIdContentInner
        data={data}
        isAppAdmin={isAppAdmin}
        isStripeEnabled={isStripeEnabled}
        subscription={subscription}
        handleGoBack={handleGoBack}
        canCheckInGuests={canCheckInGuests}
        canUploadGuest={canUploadGuest}
        canEditEvent={canEditEvent}
        handleAddGuestList={handleAddGuestList}
        handleBuyCredit={handleBuyCredit}
        isCompanyAdmin={isCompanyAdmin}
        availableCredits={availableCredits}
        onDeleteSuccess={onDeleteSuccess}
        canCreateCampaign={canCreateCampaign}
        onAddCampaign={onAddCampaign}
      />
    </EventFormProvider>
  );
};

export default EventIdPage;
