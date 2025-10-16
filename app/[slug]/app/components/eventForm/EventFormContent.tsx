import React, { useState } from "react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { EventFormInput, GuestListFormInput, TicketType } from "@/types/types";
import EventDetailsSection from "./EventDetailsSection";
import GuestListToggleSection from "./GuestListToggleSection";
import TicketToggleSection from "./TicketToggleSection";
import EventFormActionController from "./EventFormActionController";
import Backdrop from "./Backdrop";

interface EventFormContentProps {
  initialTicketData?: TicketType[] | null;
  initialGuestListData?: Doc<"guestListInfo"> | null;
  onSubmit: (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketType[],
    guesListData: GuestListFormInput | null
  ) => Promise<void>;
  isEdit: boolean;
  onCancelEdit?: () => void;
  saveEventError?: string | null;
  isStripeEnabled: boolean;
  isUpdateEventLoading?: boolean;
  subscription: Doc<"subscriptions">;
  organizationId?: Id<"organizations">;
  submitError?: string | null;
  handleBuyCredit: () => void;
  isCompanyAdmin: boolean;
  availableCredits?: number;
}

const EventFormContent: React.FC<EventFormContentProps> = ({
  initialTicketData,
  initialGuestListData,
  onSubmit,
  isEdit,
  onCancelEdit,
  saveEventError,
  isStripeEnabled,
  isUpdateEventLoading,
  subscription,
  organizationId,
  submitError,
  handleBuyCredit,
  isCompanyAdmin,
  availableCredits = 0,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  return (
    <>
      {isCalendarOpen && <Backdrop onClick={() => setIsCalendarOpen(false)} />}
      <div className=" py-4 w-full">
        <EventDetailsSection isEdit={isEdit} />

        <GuestListToggleSection
          isCompanyAdmin={isCompanyAdmin}
          handleBuyCredit={handleBuyCredit}
          isEdit={isEdit}
          initialGuestListData={initialGuestListData}
          subscription={subscription}
          availableCredits={availableCredits}
        />

        <TicketToggleSection
          isStripeEnabled={isStripeEnabled}
          isEdit={isEdit}
          initialTicketData={initialTicketData}
        />

        <EventFormActionController
          isEdit={isEdit}
          isUpdateEventLoading={isUpdateEventLoading}
          saveError={saveEventError}
          submitError={submitError}
          onCancelEdit={onCancelEdit}
          organizationId={organizationId}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
};

export default EventFormContent;
