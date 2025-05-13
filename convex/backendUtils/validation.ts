import { ErrorMessages, ShowErrorMessages, UserRole } from "@/types/enums";
import {
  ConnectedAccountsSchema,
  CustomerSchema,
  EventSchema,
  SubscriptionSchema,
  TicketInfoSchema,
  UserSchema,
  TicketSchema,
  UserWithOrganizationId,
  UserWithOrgAndCustomer,
  UserWithCustomerId,
  UserWithClerkId,
  UserWithOrgAndCustomerAndClerkId,
  UserWithOrgAndClerkId,
  GuestListEntrySchema,
  OrganizationCreditSchema,
} from "@/types/schemas-types";
import { GuestListSchema, OrganizationSchema } from "@/types/types";
import { DateTime } from "luxon";
import { formatToTimeAndShortDate } from "../../utils/luxon";
import { StripeAccountStatus } from "@/types/enums";
export function validateOrganization(
  organization: OrganizationSchema | null,
  checkActive: boolean = true
): OrganizationSchema {
  if (!organization) {
    throw new Error(ShowErrorMessages.COMPANY_NOT_FOUND);
  }

  if (checkActive && !organization.isActive) {
    throw new Error(ErrorMessages.COMPANY_INACTIVE);
  }

  return organization;
}

export function validateCustomer(
  customer: CustomerSchema | null,
  checkActive: boolean = true
): CustomerSchema {
  if (!customer) {
    throw new Error(ErrorMessages.CUSTOMER_NOT_FOUND);
  }

  if (checkActive && !customer.isActive) {
    throw new Error(ErrorMessages.CUSTOMER_INACTIVE);
  }

  return customer;
}

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: true,
  checkClerkUserId?: true
): UserWithOrgAndCustomerAndClerkId;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: true,
  checkClerkUserId?: true
): UserWithOrgAndClerkId;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: boolean,
  checkClerkUserId?: true
): UserWithClerkId;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: true,
  checkClerkUserId?: boolean
): UserWithOrgAndCustomer;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: false,
  checkClerkUserId?: boolean
): UserWithCustomerId;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: false,
  checkOrganizationId?: true,
  checkClerkUserId?: boolean
): UserWithOrganizationId;

export function validateUser(
  user: UserSchema | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: boolean,
  checkClerkUserId?: boolean
): UserSchema;

// --- Implementation ---

export function validateUser(
  user: UserSchema | null,
  checkActive: boolean = true,
  checkCustomerId: boolean = false,
  checkOrganizationId: boolean = false
): UserSchema {
  if (!user) {
    throw new Error(ErrorMessages.USER_NOT_FOUND);
  }

  if (checkActive && !user.isActive) {
    throw new Error(ErrorMessages.USER_INACTIVE);
  }

  if (checkCustomerId && !user.customerId) {
    throw new Error(ErrorMessages.USER_NOT_CUSTOMER);
  }

  if (checkOrganizationId && !user.organizationId) {
    throw new Error(ErrorMessages.USER_NO_COMPANY);
  }

  return user;
}

export function validateConnectedAccount(
  connectedAccount: ConnectedAccountsSchema | null,
  checkActive: boolean = true
): ConnectedAccountsSchema {
  if (!connectedAccount) {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
  }

  if (checkActive && connectedAccount.status !== StripeAccountStatus.VERIFIED) {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_INACTIVE);
  }

  return connectedAccount;
}

export function validateEvent(
  event: EventSchema | null,
  checkActive: boolean = true
): EventSchema {
  if (!event) {
    throw new Error(ErrorMessages.EVENT_NOT_FOUND);
  }

  if (checkActive && !event.isActive) {
    throw new Error(ErrorMessages.EVENT_INACTIVE);
  }

  return event;
}

export function validateGuestList(
  guestList: GuestListSchema | null
): GuestListSchema {
  if (!guestList) {
    throw new Error(ErrorMessages.GUEST_LIST_NOT_FOUND);
  }
  return guestList;
}

export function validateSubscription(
  subscription: SubscriptionSchema | null
): SubscriptionSchema {
  if (!subscription) {
    throw new Error(ErrorMessages.SUBSCRIPTION_NOT_FOUND);
  }
  return subscription;
}

export function validateTicketInfo(
  ticketInfo: TicketInfoSchema | null
): TicketInfoSchema {
  if (!ticketInfo) {
    throw new Error(ErrorMessages.TICKET_INFO_NOT_FOUND);
  }
  return ticketInfo;
}

export const validateTicket = (ticket: TicketSchema | null): TicketSchema => {
  if (!ticket) {
    throw new Error(ShowErrorMessages.TICKET_NOT_FOUND);
  }
  return ticket;
};

export const validateTicketCheckIn = (
  ticket: TicketSchema,
  event: EventSchema
): void => {
  if (ticket.checkInTime) {
    throw new Error(
      `Ticket already checked in on ${formatToTimeAndShortDate(ticket.checkInTime)}`
    );
  }

  const now = DateTime.now().toMillis();
  const eventStartTime = DateTime.fromMillis(event.startTime).toMillis();
  const eventEndTime = DateTime.fromMillis(event.endTime).toMillis();

  if (now < eventStartTime || now > eventEndTime) {
    throw new Error(
      `Invalid check-in. Ticket is for ${event.name} on ${formatToTimeAndShortDate(
        event.startTime
      )}`
    );
  }
};

export function validateGuestEntry(
  guestEntry: GuestListEntrySchema | null,
  requireActive: boolean = true
): GuestListEntrySchema {
  if (!guestEntry) {
    throw new Error(ShowErrorMessages.GUEST_NOT_FOUND);
  }

  if (requireActive && guestEntry.isActive === false) {
    throw new Error(ShowErrorMessages.GUEST_INACTIVE);
  }

  return guestEntry;
}

export function validateGuestEntryOwnership(
  guestEntry: GuestListEntrySchema,
  user: UserSchema
): void {
  const isHostlyUser =
    user.role === UserRole.Hostly_Moderator ||
    user.role === UserRole.Hostly_Admin;

  const isOwner = guestEntry.userPromoterId === user._id;

  if (!isOwner && !isHostlyUser) {
    if (user.role === UserRole.Promoter) {
      throw new Error(ShowErrorMessages.GUEST_DOES_NOT_BELONG_TO_PROMOTER);
    }
    throw new Error(ShowErrorMessages.FORBIDDEN_PRIVILEGES);
  }
}

export function validateOrganizationCredit(
  organizationCredit: OrganizationCreditSchema | null
): OrganizationCreditSchema {
  if (!organizationCredit) {
    throw new Error(ErrorMessages.ORGANIZATION_CREDIT_NOT_FOUND);
  }
  return organizationCredit;
}
