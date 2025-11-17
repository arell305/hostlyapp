import {
  ErrorMessages,
  ShowErrorMessages,
  UserRole,
} from "@/shared/types/enums";
import {
  UserWithOrganizationId,
  UserWithOrgAndCustomer,
  UserWithCustomerId,
  UserWithClerkId,
  UserWithOrgAndCustomerAndClerkId,
  UserWithOrgAndClerkId,
} from "@/shared/types/schemas-types";
import { DateTime } from "luxon";
import { formatToTimeAndShortDate } from "../../shared/utils/luxon";
import { Doc } from "convex/_generated/dataModel";
import { ConvexError } from "convex/values";

export function validateOrganization(
  organization: Doc<"organizations"> | null,
  checkActive: boolean = true
): Doc<"organizations"> {
  if (!organization) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.COMPANY_NOT_FOUND,
    });
  }

  if (checkActive && !organization.isActive) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.COMPANY_INACTIVE,
    });
  }

  return organization;
}

export function validateCustomer(
  customer: Doc<"customers"> | null,
  checkActive: boolean = true
): Doc<"customers"> {
  if (!customer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.CUSTOMER_NOT_FOUND,
    });
  }

  if (checkActive && !customer.isActive) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.CUSTOMER_INACTIVE,
    });
  }

  return customer;
}

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: true,
  checkClerkUserId?: true
): UserWithOrgAndCustomerAndClerkId;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: true,
  checkClerkUserId?: true
): UserWithOrgAndClerkId;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: boolean,
  checkClerkUserId?: true
): UserWithClerkId;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: true,
  checkClerkUserId?: boolean
): UserWithOrgAndCustomer;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: true,
  checkOrganizationId?: false,
  checkClerkUserId?: boolean
): UserWithCustomerId;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: false,
  checkOrganizationId?: true,
  checkClerkUserId?: boolean
): UserWithOrganizationId;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive?: boolean,
  checkCustomerId?: boolean,
  checkOrganizationId?: boolean,
  checkClerkUserId?: boolean
): Doc<"users">;

export function validateUser(
  user: Doc<"users"> | null,
  checkActive: boolean = true,
  checkCustomerId: boolean = false,
  checkOrganizationId: boolean = false
): Doc<"users"> {
  if (!user) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.USER_NOT_FOUND,
    });
  }

  if (checkActive && !user.isActive) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.USER_INACTIVE,
    });
  }

  if (checkCustomerId && !user.customerId) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.USER_NOT_CUSTOMER,
    });
  }

  if (checkOrganizationId && !user.organizationId) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.USER_NO_COMPANY,
    });
  }

  return user;
}

export function validateConnectedAccount(
  connectedAccount: Doc<"connectedAccounts"> | null,
  checkActive: boolean = true
): Doc<"connectedAccounts"> {
  if (!connectedAccount) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND,
    });
  }

  if (checkActive && connectedAccount.status !== "Verified") {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.CONNECTED_ACCOUNT_INACTIVE,
    });
  }

  return connectedAccount;
}

export function validateEvent(
  event: Doc<"events"> | null,
  checkActive: boolean = true
): Doc<"events"> {
  if (!event) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.EVENT_NOT_FOUND,
    });
  }

  if (checkActive && !event.isActive) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ErrorMessages.EVENT_INACTIVE,
    });
  }

  return event;
}

export function validateGuestList(
  guestList: Doc<"guestListInfo"> | null
): Doc<"guestListInfo"> {
  if (!guestList) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.GUEST_LIST_NOT_FOUND,
    });
  }
  return guestList;
}

export function validateSubscription(
  subscription: Doc<"subscriptions"> | null
): Doc<"subscriptions"> {
  if (!subscription) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.SUBSCRIPTION_NOT_FOUND,
    });
  }
  return subscription;
}

export const validateTicket = (
  ticket: Doc<"tickets"> | null
): Doc<"tickets"> => {
  if (!ticket) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.TICKET_NOT_FOUND,
    });
  }
  return ticket;
};

export const validateTicketCheckIn = (
  ticket: Doc<"tickets">,
  event: Doc<"events">
): void => {
  if (ticket.checkInTime) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `Ticket already checked in on ${formatToTimeAndShortDate(ticket.checkInTime)}`,
    });
  }

  const now = DateTime.now().toMillis();
  const eventStartTime = DateTime.fromMillis(event.startTime).toMillis();
  const eventEndTime = DateTime.fromMillis(event.endTime).toMillis();

  if (now < eventStartTime || now > eventEndTime) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `Invalid check-in. Ticket is for ${event.name} on ${formatToTimeAndShortDate(
        event.startTime
      )}`,
    });
  }
};

export function validateGuestEntry(
  guestEntry: Doc<"guestListEntries"> | null,
  requireActive: boolean = true
): Doc<"guestListEntries"> {
  if (!guestEntry) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.GUEST_NOT_FOUND,
    });
  }

  if (requireActive && guestEntry.isActive === false) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: ShowErrorMessages.GUEST_INACTIVE,
    });
  }

  return guestEntry;
}

export function validateGuestEntryOwnership(
  guestEntry: Doc<"guestListEntries">,
  user: Doc<"users">
): void {
  const isHostlyUser =
    user.role === UserRole.Hostly_Moderator ||
    user.role === UserRole.Hostly_Admin;

  const isOwner = guestEntry.userPromoterId === user._id;

  if (!isOwner && !isHostlyUser) {
    if (user.role === UserRole.Promoter) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: ShowErrorMessages.GUEST_DOES_NOT_BELONG_TO_PROMOTER,
      });
    }
    throw new ConvexError({
      code: "FORBIDDEN",
      message: ShowErrorMessages.FORBIDDEN_PRIVILEGES,
    });
  }
}

export function validateOrganizationCredit(
  organizationCredit: Doc<"organizationCredits"> | null
): Doc<"organizationCredits"> {
  if (!organizationCredit) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.ORGANIZATION_CREDIT_NOT_FOUND,
    });
  }
  return organizationCredit;
}

export const validateGuestListInfo = (
  guestListInfo: Doc<"guestListInfo"> | null
): Doc<"guestListInfo"> => {
  if (!guestListInfo) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.GUEST_LIST_NOT_FOUND,
    });
  }
  return guestListInfo;
};

export const validateEventTicketType = (
  eventTicketType: Doc<"eventTicketTypes"> | null
): Doc<"eventTicketTypes"> => {
  if (!eventTicketType) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.EVENT_TICKET_TYPE_NOT_FOUND,
    });
  }
  return eventTicketType;
};

export const validateFaq = (faq: Doc<"faq"> | null): Doc<"faq"> => {
  if (!faq) {
    throw new Error(ShowErrorMessages.FAQ_NOT_FOUND);
  }
  return faq;
};

export const validateSmsTemplate = (
  smsTemplate: Doc<"smsTemplates"> | null
): Doc<"smsTemplates"> => {
  if (!smsTemplate) {
    throw new Error(ShowErrorMessages.SMS_TEMPLATE_NOT_FOUND);
  }
  return smsTemplate;
};

export const validateCampaign = (
  campaign: Doc<"campaigns"> | null
): Doc<"campaigns"> => {
  if (!campaign) {
    throw new Error(ShowErrorMessages.CAMPAIGN_NOT_FOUND);
  }
  return campaign;
};

export const validateContact = (
  contact: Doc<"contacts"> | null
): Doc<"contacts"> => {
  if (!contact) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.CONTACT_DB_NOT_FOUND,
    });
  }
  return contact;
};

export const validateThread = (
  thread: Doc<"smsThreads"> | null
): Doc<"smsThreads"> => {
  if (!thread) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ShowErrorMessages.THREAD_NOT_FOUND,
    });
  }
  return thread;
};

export const validateUser2 = (user: Doc<"users"> | null): Doc<"users"> => {
  if (!user) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: ErrorMessages.USER_NOT_FOUND,
    });
  }
  return user;
};
