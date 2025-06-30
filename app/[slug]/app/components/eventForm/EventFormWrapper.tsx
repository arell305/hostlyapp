"use client";

import React from "react";
import { EventFormInput, GuestListFormInput, TicketType } from "@/types/types";
import {
  EventSchema,
  GuestListInfoSchema,
  SubscriptionSchema,
} from "@/types/schemas-types";
import { Id } from "convex/_generated/dataModel";
import { EventFormProvider } from "@/contexts/EventFormContext";
import EventFormContent from "./EventFormContent";

export interface EventFormProps {
  initialEventData?: EventSchema;
  initialTicketData?: TicketType[] | null;
  initialGuestListData?: GuestListInfoSchema | null;
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
  subscription: SubscriptionSchema;
  organizationId?: Id<"organizations">;
  isSubmitLoading?: boolean;
  submitError?: string | null;
  handleBuyCredit: () => void;
  isCompanyAdmin: boolean;
  availableCredits?: number;
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
