import { UserRole } from "../../utils/enum";

export const UserRoleEnum = {
  APP_ADMIN: "admin",
  PROMOTER: "promoter",
  PROMOTER_ADMIN: "promoter_admin",
  MODERATOR: "moderator",
};

export const ClerkRoleEnum = {
  ORG_ADMIN: "org:admin",
  ORG_MANAGER: "org:manager",
  ORG_MODERATOR: "org:moderator",
  ORG_PROMOTER: "org:promoter",
};

export const ClerkPermissionsEnum = {
  ORG_EVENTS_VIEW_ALL_GUESTLIST: "org:events:view_all_guestlists",
  ORG_EVENTS_CREATE: "org:events:create",
};

export const changeableRoles = Object.values(UserRole).filter(
  (role) =>
    role !== UserRole.Admin &&
    role !== UserRole.Hostly_Admin &&
    role !== UserRole.Hostly_Moderator
);

export enum TeamSettingsModalType {
  TeamName = "teamName",
  PromoDiscount = "promoDiscount",
}

export enum ErrorMessages {
  ALREADY_CHECKED_IN = "Already checked in",
  CLERK_INVITATION_ERROR = "Clerk error inviting user",
  CLERK_ORGANIZATION_CREATE_ERROR = "Error creating Clerk organization",
  CLERK_ORGANIZATION_UPDATE_MEMBERSHIP_ERROR = "Error updating clerk membership",
  CLERK_ORGANIZATION_METADATA_UPDATE_ERROR = "Error updating Clerk metadata",
  CLERK_ORGANIZATION_UPDATE_ERROR = "Error updating Clerk organization",
  CLERK_REVOKE_ERROR = "Error revoking clerk user",
  CLERK_SET_LOGO_ERROR = "Error updating organization logo",
  COMPANY_DB_QUERY_ERROR = "DB error querying company",
  COMPANY_DB_QUERY_ID_ERROR = "DB error querying company by id",
  COMPANY_DB_UPDATE_ERROR = "DB error updating company",
  COMPANY_INACTIVE = "Company is inactive",
  COMPANY_NOT_FOUND = "Company not found",
  COMPANY_NAME_ALREADY_EXISTS = "Company name already exists.",
  CONNECTED_ACCOUNT_INACTIVE = "Stripe Connected Account is inactive",
  CONNECTED_ACCOUNT_DEACTIVATE_ERROR = "Stripe Connected Account deactivate error",
  CONNECTED_ACCOUNT_NOT_FOUND = "Stripe Connected Account not found",
  CONNECTED_ACCOUNT_UPDATE_ERROR = "Stripe Connected Account update or create error",
  CONNECTED_ACCOUNT_DB_QUERY_BY_CLERK = "DB error query connected account by clerk id",
  CUSTOMER_DB_QUERY_ID_ERROR = " DB error fetching customer by id.",
  CUSTOMER_DB_QUERY_CLERK_ERROR = " DB error fetching customer by clerk id.",
  CUSTOMER_DB_UPDATE_ERROR = "DB error updating customer",
  CUSTOMER_ID_NOT_FOUND = "Customer Id not found",
  CUSTOMER_INACTIVE = "Customer is inactive",
  CUSTOMER_NOT_FOUND = "Customer not found",
  ENV_NOT_SET_CLERK_SECRET_KEY = "LERK_SECRET_KEYY environment variable is not set.",
  ENV_NOT_SET_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable is not set.",
  ENV_NOT_SET_NEXT_PUBLIC_CONVEX_URL = "NEXT_PUBLIC_CONVEX_URL environment variable is not set.",
  ENV_NOT_SET_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable",
  ENV_NOT_SET_STRIPE_KEY = "Missing STRIPE_KEY environment variable",
  EVENT_DB_CREATE_ERROR = "DB error creating event",
  EVENT_INACTIVE = "Event is inactive",
  EVENT_NOT_FOUND = "Event not found",
  FILE_CREATION_ERROR = "Error creating image",
  FOBIDDEN_COMPANY = "User does not belong to company",
  FORBIDDEN = "User does not have permission",
  FORBIDDEN_PERMISSION = "User does not have permission",
  GENERIC_ERROR = "An unexpected error occurred.",
  GUEST_LIST_NOT_FOUND = "Guest list not found",
  GUEST_NOT_FOUND = "Guest not found",
  INVALID_PROMO_CODE = "Invalid promoter code",
  NOT_BELONG = "User does not belong to the organization of the event.",
  NOT_FOUND = "Not found.",
  ORGANIZATION_DB_CREATE_ERROR = "DB error creating organization",
  ORGANIZATION_DB_QUERY_SLUG_ERROR = "DB error fetching organization by slug",
  PAYMENT_FAILED = "Payment failed",
  PAYMENT_INTENT_FAILED = "Failed to create payment intent",
  PROMOTER_PROMO_CODE_NAME_EXISTS = "Promoter promo code already exits.",
  PROMOTER_PROMO_CODE_NOT_FOUND = "Promoter Promo Code not found",
  PROMOTER_NOT_BELONG_TO_COMPANY_OF_EVENT = "Promoter does not belong to company of event",
  PROMOTER_NOT_BELONG_TO_GUEST_LIST = "Promoter does not belong to guest list.",
  STRIPE_QUERY_PAYMENT_ERROR = "stripe error fetching payment details",
  STRIPE_CANCEL_PERIOD_END_ERROR = "Stripe error canceling subscription at period end",
  STRIPE_CONNECT_CREATE_ERROR = "Stripe connect error creating account",
  STRIPE_CONNECT_DASHBOARD_ERROR = "Stripe connect error creating dashboard link",
  STRIPE_CONNECT_ONBOARDING_ERROR = "Stripe connect error creating onboarding session",
  STRIPE_RESUME_ERROR = "Stripe error resuming subscription",
  STRIPE_UPDATE_PAYMENT_ERROR = "Stripe error updating payment",
  STRIPE_UPDATE_SUBSCRIPTION_ERROR = "Stripe error updating subscription",
  TICKET_NOT_FOUND = "Ticket not found.",
  TICKET_INFO_DB_QUERY_BY_EVENT_ID_ERROR = "DB error query ticket info by event Id.",
  TICKET_INFO_NOT_FOUND = "Ticket info not found",
  TICKET_SALES_ENDED = "Ticekt sales have ended",
  UNAUTHENTICATED = "User is not authenticated.",
  USER_ALREADY_EXISTS = "User with that email already exists",
  USER_DB_CREATE_ERROR = "DB error creating user",
  USER_DB_QUERY_BY_EMAIL_ERROR = "DB error query user by Email",
  USER_DB_UPDATE_BY_ID_ERROR = "DB error update user by id",
  USER_INACTIVE = "User is inactive",
  USER_NOT_CUSTOMER = "User is not customer",
  USER_NOT_FOUND = "User not found",
  USER_NO_COMPANY = "User does not have a company",
  USER_INTERNAL_QUERY = "Internal error querying for user",
  USER_ALREADY_HAS_COMPANY = "User already has a company",
}

export enum FrontendErrorMessages {
  COMPANY_NOT_LOADED = "Company not loaded",
  CHECKOUT_FAILED = "Error creating checkout",
  EMAIL_REQUIRED = "Valid email required.",
  ERROR_PURCHASING_TICKET = "Error purchasing ticket",
  GENERIC_ERROR = "Something went wrong. Please try again later.",
  GUESTLIST_BY_PROMOTER_LOAD_ERROR = "Error loading guest list by promoter",
  NAME_EMPTY = "Name cannot be empty",
  PAYMENT_FAILED = "Payment failed",
  PAYMENT_METHOD_FAILED = "Failed to create payment method.",
  PAYMENT_METHOD_UNAVAILABLE = "Payment method is not available.",
  PROMO_CODE_FAILED = "Failed to apply promo code. Please try again.",
  PROMO_CODE_REQUIRED = "Please enter a promo code",
  STRIPE_NOT_INITALIZED = "Stripe is not initialized.",
  USER_NOT_LOADED = "User unable to load. Please try again.",
  USE_ORGANIZATION_LIST_NOT_LOADED = "useOrganizationList unable to load.",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export enum Permission {
  VIEW_ALL_GUESTLISTS = "org:events:view_all_guestlists",
  CHECK_GUESTS = "org:events:check_guests",
  UPLOAD_GUESTLIST = "org:events:upload_guest_list",
  CREATE_EVENT = "org:events:create",
  MODERATE_APP = "org:app:moderate",
}

export enum StripePaymentType {
  CARD = "card",
}
