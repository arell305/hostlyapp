import { ErrorMessages } from "@/types/enums";
import {
  ConnectedAccountsSchema,
  CustomerSchema,
  EventSchema,
  SubscriptionSchema,
  TicketInfoSchema,
  UserSchema,
} from "@/types/schemas-types";
import { GuestListSchema, OrganizationSchema } from "@/types/types";
import { StripeAccountStatus } from "../../utils/enum";

export function validateOrganization(
  organization: OrganizationSchema | null,
  checkActive: boolean = true
): OrganizationSchema {
  if (!organization) {
    throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
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
