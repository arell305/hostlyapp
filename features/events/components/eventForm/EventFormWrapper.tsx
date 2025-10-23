"use client";

import {
  EventFormInput,
  GuestListFormInput,
  TicketType,
} from "@shared/types/types";
import { Doc, Id } from "convex/_generated/dataModel";
import { EventFormProvider } from "@/contexts/EventFormContext";
import EventFormContent from "./EventFormContent";

export interface EventFormProps {
  initialEventData?: Doc<"events">;
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
  isSubmitLoading?: boolean;
  submitError?: string | null;
  handleBuyCredit: () => void;
  availableCredits?: number;
  isCompanyAdmin: boolean;
}

const EventForm = (props: EventFormProps) => {
  return (
    <EventFormProvider
      initialEventData={props.initialEventData}
      initialTicketData={props.initialTicketData}
      initialGuestListData={props.initialGuestListData}
    >
      <EventFormContent {...props} />
    </EventFormProvider>
  );
};

export default EventForm;
