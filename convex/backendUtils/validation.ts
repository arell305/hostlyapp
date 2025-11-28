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
import { throwConvexError } from "./errors";
import { MAX_PROMPT_LENGTH, MAX_SMS_LENGTH } from "@/shared/types/constants";

export function validateOrganization(
  organization: Doc<"organizations"> | null,
  checkActive: boolean = true
): Doc<"organizations"> {
  if (!organization) {
    throwConvexError(ShowErrorMessages.COMPANY_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (checkActive && !organization.isActive) {
    throwConvexError(ErrorMessages.COMPANY_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  return organization;
}

export function validateCustomer(
  customer: Doc<"customers"> | null,
  checkActive: boolean = true
): Doc<"customers"> {
  if (!customer) {
    throwConvexError(ErrorMessages.CUSTOMER_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (checkActive && !customer.isActive) {
    throwConvexError(ErrorMessages.CUSTOMER_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
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
    throwConvexError(ErrorMessages.USER_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (checkActive && !user.isActive) {
    throwConvexError(ErrorMessages.USER_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  if (checkCustomerId && !user.customerId) {
    throwConvexError(ErrorMessages.USER_NOT_CUSTOMER, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  if (checkOrganizationId && !user.organizationId) {
    throwConvexError(ErrorMessages.USER_NO_COMPANY, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  return user;
}

export function validateConnectedAccount(
  connectedAccount: Doc<"connectedAccounts"> | null,
  checkActive: boolean = true
): Doc<"connectedAccounts"> {
  if (!connectedAccount) {
    throwConvexError(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (checkActive && connectedAccount.status !== "Verified") {
    throwConvexError(ErrorMessages.CONNECTED_ACCOUNT_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  return connectedAccount;
}

export function validateEvent(
  event: Doc<"events"> | null,
  checkActive: boolean = true
): Doc<"events"> {
  if (!event) {
    throwConvexError(ErrorMessages.EVENT_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (checkActive && !event.isActive) {
    throwConvexError(ErrorMessages.EVENT_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }

  return event;
}

export function validateGuestList(
  guestList: Doc<"guestListInfo"> | null
): Doc<"guestListInfo"> {
  if (!guestList) {
    throwConvexError(ErrorMessages.GUEST_LIST_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return guestList;
}

export function validateSubscription(
  subscription: Doc<"subscriptions"> | null
): Doc<"subscriptions"> {
  if (!subscription) {
    throwConvexError(ErrorMessages.SUBSCRIPTION_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return subscription;
}

export const validateTicket = (
  ticket: Doc<"tickets"> | null
): Doc<"tickets"> => {
  if (!ticket) {
    throwConvexError(ShowErrorMessages.TICKET_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return ticket;
};

export const validateTicketCheckIn = (
  ticket: Doc<"tickets">,
  event: Doc<"events">
): void => {
  if (ticket.checkInTime) {
    throwConvexError(
      `Ticket already checked in on ${formatToTimeAndShortDate(ticket.checkInTime)}`,
      {
        code: "BAD_REQUEST",
        showToUser: true,
      }
    );
  }

  const now = DateTime.now().toMillis();
  const eventStartTime = DateTime.fromMillis(event.startTime).toMillis();
  const eventEndTime = DateTime.fromMillis(event.endTime).toMillis();

  if (now < eventStartTime || now > eventEndTime) {
    throwConvexError(
      `Invalid check-in. Ticket is for ${event.name} on ${formatToTimeAndShortDate(event.startTime)}`,
      {
        code: "BAD_REQUEST",
        showToUser: true,
      }
    );
  }
};

export function validateGuestEntry(
  guestEntry: Doc<"guestListEntries"> | null,
  requireActive: boolean = true
): Doc<"guestListEntries"> {
  if (!guestEntry) {
    throwConvexError(ShowErrorMessages.GUEST_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }

  if (requireActive && guestEntry.isActive === false) {
    throwConvexError(ShowErrorMessages.GUEST_INACTIVE, {
      code: "BAD_REQUEST",
      showToUser: true,
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
      throwConvexError(ShowErrorMessages.GUEST_DOES_NOT_BELONG_TO_PROMOTER, {
        code: "FORBIDDEN",
        showToUser: true,
      });
    }
    throwConvexError(ShowErrorMessages.FORBIDDEN_PRIVILEGES, {
      code: "FORBIDDEN",
      showToUser: true,
    });
  }
}

export function validateOrganizationCredit(
  organizationCredit: Doc<"organizationCredits"> | null
): Doc<"organizationCredits"> {
  if (!organizationCredit) {
    throwConvexError(ErrorMessages.ORGANIZATION_CREDIT_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return organizationCredit;
}

export const validateGuestListInfo = (
  guestListInfo: Doc<"guestListInfo"> | null
): Doc<"guestListInfo"> => {
  if (!guestListInfo) {
    throwConvexError(ShowErrorMessages.GUEST_LIST_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return guestListInfo;
};

export const validateEventTicketType = (
  eventTicketType: Doc<"eventTicketTypes"> | null
): Doc<"eventTicketTypes"> => {
  if (!eventTicketType) {
    throwConvexError(ErrorMessages.EVENT_TICKET_TYPE_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return eventTicketType;
};

export const validateFaq = (faq: Doc<"faq"> | null): Doc<"faq"> => {
  if (!faq) {
    throwConvexError(ShowErrorMessages.FAQ_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return faq;
};

export const validateSmsTemplate = (
  smsTemplate: Doc<"smsTemplates"> | null
): Doc<"smsTemplates"> => {
  if (!smsTemplate) {
    throwConvexError(ShowErrorMessages.SMS_TEMPLATE_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return smsTemplate;
};

export const validateCampaign = (
  campaign: Doc<"campaigns"> | null
): Doc<"campaigns"> => {
  if (!campaign) {
    throwConvexError(ShowErrorMessages.CAMPAIGN_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return campaign;
};

export const validateContact = (
  contact: Doc<"contacts"> | null
): Doc<"contacts"> => {
  if (!contact) {
    throwConvexError(ShowErrorMessages.CONTACT_DB_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return contact;
};

export const validateThread = (
  thread: Doc<"smsThreads"> | null
): Doc<"smsThreads"> => {
  if (!thread) {
    throwConvexError(ShowErrorMessages.THREAD_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return thread;
};

export const validateUser2 = (user: Doc<"users"> | null): Doc<"users"> => {
  if (!user) {
    throwConvexError(ErrorMessages.USER_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return user;
};

export const validateSmsThread = (
  smsThread: Doc<"smsThreads"> | null
): Doc<"smsThreads"> => {
  if (!smsThread) {
    throwConvexError(ShowErrorMessages.THREAD_NOT_FOUND, {
      code: "NOT_FOUND",
      showToUser: true,
    });
  }
  return smsThread;
};

export function validateAiPromptLength({
  aiPrompt,
  maxLength = MAX_PROMPT_LENGTH,
}: {
  aiPrompt?: string | null;
  maxLength?: number;
}): void {
  if (aiPrompt && aiPrompt.length > maxLength) {
    throwConvexError(`AI prompt cannot exceed ${maxLength} characters`, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }
}

export function validateSmsLength({
  sms,
  maxLength = MAX_SMS_LENGTH,
}: {
  sms?: string | null;
  maxLength?: number;
}): void {
  if (sms && sms.length > maxLength) {
    throwConvexError(`SMS cannot exceed ${maxLength} characters`, {
      code: "BAD_REQUEST",
      showToUser: true,
    });
  }
}
