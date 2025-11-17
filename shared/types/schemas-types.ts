import { Doc, Id } from "../../convex/_generated/dataModel";

export interface UserWithCustomerId extends Doc<"users"> {
  customerId: Id<"customers">;
}

export interface UserWithOrganizationId extends Doc<"users"> {
  organizationId: Id<"organizations">;
}
export interface UserWithClerkId extends Doc<"users"> {
  clerkUserId: string;
}

export interface UserWithOrgAndCustomer extends Doc<"users"> {
  organizationId: Id<"organizations">;
  customerId: Id<"customers">;
}

export interface UserWithOrgAndCustomerAndClerkId extends Doc<"users"> {
  customerId: Id<"customers">;
  organizationId: Id<"organizations">;
  clerkUserId: string;
}

export interface UserWithOrgAndClerkId extends Doc<"users"> {
  organizationId: Id<"organizations">;
  clerkUserId: string;
}

export interface CustomerTicket {
  _id: Id<"tickets">;
  _creationTime: number;
  eventId: Id<"events">;
  organizationId: Id<"organizations">;
  eventTicketTypeId: Id<"eventTicketTypes">;
  promoterUserId: Id<"users"> | null;
  email: string;
  ticketUniqueId: string;
  checkInTime?: number;
  eventTicketTypeName: string;
  name: string;
  startTime: number;
  endTime: number;
  address: string;
  connectedPaymentId?: Id<"connectedPayments">;
  description: string | null;
}

export interface TicketSchemaWithPromoter extends Doc<"tickets"> {
  promoterName: string | null;
  ticketTypeName: string;
}

export interface PromoterPromoCodeWithDiscount
  extends Doc<"promoterPromoCode"> {
  promoDiscount: number;
}

export interface EventWithTicketTypes extends Doc<"events"> {
  ticketTypes: Doc<"eventTicketTypes">[];
}

export interface CustomerWithCompanyName extends Doc<"customers"> {
  companyName: string;
}

export interface GuestListEntryWithPromoter extends Doc<"guestListEntries"> {
  promoterName: string;
}
