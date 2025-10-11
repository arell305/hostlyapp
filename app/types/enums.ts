export enum StripeAccountStatus {
  NOT_ONBOARDED = "Not Onboarded Yet", // User hasn't completed Stripe onboarding
  PENDING = "Pending", // Account created but not yet verified
  VERIFIED = "Verified", // Fully approved, can process payments
  RESTRICTED = "Restricted", // Needs more verification (e.g., missing ID)
  REJECTED = "Rejected", // Permanently rejected by Stripe
  DISABLED = "Disabled", // Manually disabled (optional for admin actions)
  INCOMPLETE = "Incomplete", // Stripe account is incomplete
}

export enum SmsMessageType {
  ALL_DB_GUESTS = "all_guests",
  ATTENDED_EVENT = "attended_event",
  BEFORE_EVENT = "before_event",
  NOT_ATTENDED_EVENT = "not_attended_event",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  PENDING_CANCELLATION = "pending_cancellation",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  PAUSED = "paused",
}

export enum SubscriptionTier {
  STANDARD = "Standard",
  PLUS = "Plus",
  ELITE = "Elite",
}

export const subscriptionBenefits = {
  [SubscriptionTier.STANDARD]: "Unlimited tickets",
  [SubscriptionTier.PLUS]: "Unlimited tickets & 3 guest lists",
  [SubscriptionTier.ELITE]: "Unlimited tickets & guest lists",
};

export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
  PARTIAL_SUCESSS = "partial success",
}

export enum ClerkPermissions {
  MODERATES_APP = "org:app:moderate",
  CHECK_GUESTS = "org:events:check_guests",
  CREATE_EVENT = "org:events:create",
  UPLOAD_GUESTLIST = "org:events:upload_guest_list",
  VIEW_ALL_GUESTLISTS = "org:events:view_all_guestlists",
  VIEW_SUBSCRIPTION = "org:view:subscription",
  EDIT_USER = "org:user:edit",
}

export enum UserRole {
  Promoter = "org:promoter",
  Moderator = "org:moderator",
  Manager = "org:manager",
  Admin = "org:admin",
  Hostly_Admin = "org:hostly_admin",
  Hostly_Moderator = "org:hostly_moderator",
}

export enum SmsMessageDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum AuthorType {
  GUEST = "guest",
  HOST = "host",
  AI = "ai",
}

export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

export const roleMap: Record<UserRole, string> = {
  [UserRole.Promoter]: "Promoter",
  [UserRole.Moderator]: "Moderator",
  [UserRole.Manager]: "Manager",
  [UserRole.Admin]: "Admin",
  [UserRole.Hostly_Admin]: "Hostly Admin",
  [UserRole.Hostly_Moderator]: "Hostly Moderator",
};

export enum ActiveTab {
  VIEW = "view",
  GUEST_LIST = "guestList",
  TICKET_INFO = "ticketInfo",
  SUMMARY = "summary",
}

export enum ActiveStripeTab {
  DOCUMENTS = "document",
  PAYOUTS = "payouts",
  PAYMENTS = "payments",
}

export const UserRoleEnum = {
  APP_ADMIN: "admin",
  PROMOTER: "promoter",
  PROMOTER_ADMIN: "promoter_admin",
  MODERATOR: "moderator",
  PROMOTER_MANAGER: "promoter_manager",
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

export const subscriptionStatusMap = {
  [SubscriptionStatus.ACTIVE]: "Active",
  [SubscriptionStatus.TRIALING]: "Trial",
  [SubscriptionStatus.PENDING_CANCELLATION]: "Pending Cancellation",
  [SubscriptionStatus.CANCELED]: "Canceled",
  [SubscriptionStatus.INCOMPLETE]: "Incomplete",
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: "Incomplete Expired",
  [SubscriptionStatus.PAST_DUE]: "Past Due",
  [SubscriptionStatus.UNPAID]: "Unpaid",
  [SubscriptionStatus.PAUSED]: "Paused",
};

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
  CLERK_WEBHOOK_VERIFICATION_FAILED = "Clerk webhook verification error",
  CLERK_WEBHOOK_ORG_INV_ACCEPTED = "Clerk Error handling organizationInvitation.accepted",
  CLERK_WEBHHOOK_CREATE_USER = "Ckerk error handling user.created",
  CLERK_WEBHOOK_UPDATED_USER = "Clerk webhook error handling user.updated",
  CLERK_WEBHOOK_UPDATED_USER_NO_EMAIL = "User updated event received without an email",
  CLERK_USER_METADATA_UPDATE_ERROR = "Error updating user metadata",
  CLERK_USER_NOT_FOUND = "User not found",
  CLERK_USER_NO_CLERK_ID = "User has no Clerk ID",
  COMPANY_DB_QUERY_ERROR = "DB error querying company",
  COMPANY_DB_QUERY_ID_ERROR = "DB error querying company by id",
  COMPANY_DB_UPDATE_ERROR = "DB error updating company",
  COMPANY_INACTIVE = "Company is inactive",
  COMPANY_NOT_FOUND = "Company not found",
  COMPANY_DB_QUERY_FOR_ADMIN_ERROR = "DB error querying company for admin",
  COMPANY_NO_ADMIN_FOUND = "No admin found for company",
  CONNECTED_ACCOUNT_INACTIVE = "Stripe Connected Account is inactive",
  CONNECTED_ACCOUNT_VERIFIED = "Stripe Connected Account is not Verified",
  CONNECTED_ACCOUNT_DEACTIVATE_ERROR = "Stripe Connected Account deactivate error",
  CONNECTED_ACCOUNT_NOT_FOUND = "Stripe Connected Account not found",
  CONNECTED_ACCOUNT_UPDATE_ERROR = "Stripe Connected Account update or create error",
  CONNECTED_ACCOUNT_DB_QUERY_BY_CLERK = "DB error query connected account by clerk id",
  CONNECTED_ACCOUNT_DB_UPDATE_BY_STRIPE = "DB error query connected account by stripe id",
  CONNECTED_ACCOUNT_VERIFICATION = "Connected accound error verifying webhook",
  CONNECTED_ACCOUNT_PAYMENT_INTENT_SUCCEEDED = "Connected account error handling payment_intent.succeeded",
  CUSTOMER_DB_CREATE = "DB error creating customer",
  CUSTOMER_DB_QUERY_ID_ERROR = " DB error fetching customer by id.",
  CUSTOMER_DB_QUERY_CLERK_ERROR = " DB error fetching customer by clerk id.",
  CUSTOMER_DB_QUERY_BY_EMAIL = "DB error fetching customer by email",
  CUSTOMER_DB_UPDATE_ERROR = "DB error updating customer",
  CUSTOMER_ID_NOT_FOUND = "Customer Id not found",
  CUSTOMER_INACTIVE = "Customer is inactive",
  CUSTOMER_NOT_FOUND = "Customer not found",
  ENV_NOT_SET_CLERK_SECRET_KEY = "CLERK_SECRET_KEY environment variable is not set.",
  ENV_NOT_SET_CLERK_WEBHOOK = "CLERK_WEBHOOK_SECRET environmental variable not set",
  ENV_NOT_SET_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable is not set.",
  ENV_NOT_SET_NEXT_PUBLIC_CONVEX_URL = "NEXT_PUBLIC_CONVEX_URL environment variable is not set.",
  ENV_NOT_SET_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable",
  ENV_NOT_SET_STRIPE_KEY = "Missing STRIPE_KEY environment variable",
  ENV_NOT_SET_STRIPE_WEBHOOKS_SECRET = "Missing STRIPE_WEBHOOKS_SECRET",
  ENV_NOT_SET_STRIPE_PLATFORM_WEBHOOKS_SECRET = "Missing STRIPE_PLATFORM_WEBHOOKS_SECRET",
  ENV_NOT_SET_CLERK_ISSUER_DOMAIN = "Missing CLERK_ISSUER_DOMAIN environment variable",
  ENV_NOT_SET_CONNECTED = "Missing STRIPE_CONNECTED_WEBHOOK_SECRET",
  ENV_NOT_SET_PDF_MONKEY = "Missing PDFMONKEY_WEBHOOK_SECRET environment variable",
  EVENT_DB_CREATE_ERROR = "DB error creating event",
  EVENT_INACTIVE = "Event is inactive",
  EVENT_NOT_FOUND = "Event not found",
  EVENT_DB_QUERY = "DB error fetching events by id",
  EVENT_DB_DELETE = "DB error deleing event in rollback",
  FILE_CREATION_ERROR = "Error creating image",
  FOBIDDEN_COMPANY = "User does not belong to company",
  FORBIDDEN = "User does not have permission",
  FORBIDDEN_PERMISSION = "User does not have permission",
  GENERIC_ERROR = "An unexpected error occurred.",
  GUEST_LIST_NOT_FOUND = "Guest list not found",
  GUEST_NOT_FOUND = "Guest not found",
  NOT_BELONG = "User does not belong to the organization of the event.",
  NOT_FOUND = "Not found.",
  ORGANIZATION_DB_CREATE_ERROR = "DB error creating organization",
  ORGANIZATION_DB_QUERY_NAME_ERROR = "DB error fetching organization by name",
  ORGANIZATION_NOT_LOADED = "Organization not loaded",
  PAYMENT_FAILED = "Payment failed",
  PAYMENT_INTENT_FAILED = "Failed to create payment intent",
  PDF_MONKEY_WEBHOOK = "PDF Monkey error verifying webhook",
  PROMOTER_PROMO_CODE_NOT_FOUND = "Promoter Promo Code not found",
  PROMOTER_NOT_BELONG_TO_COMPANY_OF_EVENT = "Promoter does not belong to company of event",
  PROMOTER_NOT_BELONG_TO_GUEST_LIST = "Promoter does not belong to guest list.",
  STRIPE_QUERY_PAYMENT_ERROR = "stripe error fetching payment details",
  STRIPE_CANCEL_PERIOD_END_ERROR = "Stripe error canceling subscription at period end",
  STRIPE_CONNECT_CREATE_ERROR = "Stripe connect error creating account",
  STRIPE_CONNECT_DASHBOARD_ERROR = "Stripe connect error creating dashboard link",
  STRIPE_CONNECT_ONBOARDING_ERROR = "Stripe connect error creating onboarding session",
  STRIPE_CREATE_PRICES = "Stripe error creating prices",
  STRIPE_CREATE_PRODUCT = "Stripe error creating products",
  STRIPE_SECRET_MISSING = "Stripe client secret missing",
  STRIPE_RESUME_ERROR = "Stripe error resuming subscription",
  STRIPE_UPDATE_PAYMENT_ERROR = "Stripe error updating payment",
  STRIPE_UPDATE_SUBSCRIPTION_ERROR = "Stripe error updating subscription",
  TICKET_NOT_FOUND = "Ticket not found.",
  TICKET_INFO_DB_QUERY_BY_EVENT_ID_ERROR = "DB error query ticket info by event Id.",
  TICKET_INFO_NOT_FOUND = "Ticket info not found",
  TICKET_SALES_ENDED = "Ticket sales have ended",
  TICKET_INSERT = "DB error creating tickets",
  TICKET_INFO_DB_DELETE = "DB error deleting ticket info",
  UNAUTHENTICATED = "User is not authenticated.",
  USER_ALREADY_EXISTS = "User with that email already exists",
  USER_DB_CREATE_ERROR = "DB error creating user",
  USER_DB_QUERY_BY_EMAIL_ERROR = "DB error query user by Email",
  USER_DB_QUERY_BY_ID_ERROR = "DB error query user by id",
  USER_DB_UPDATE_BY_ID_ERROR = "DB error update user by id",
  USER_DB_UPDATE_BY_EMAIL = "DB error updating user by email ",
  USER_INACTIVE = "User is inactive",
  USER_NOT_CUSTOMER = "User is not customer",
  USER_NOT_FOUND = "User not found",
  USER_NO_COMPANY = "User does not have a company",
  USER_INTERNAL_QUERY = "Internal error querying for user",
  USER_ALREADY_HAS_COMPANY = "User already has a company",
  CUSTOMER_EXISTING_USER = "Existing user with that email already exists. Please use a different email",
  INTERNAL_ERROR = "Internal Error:",
  SUBSCRIPTION_DB_QUERY_BY_CUSTOMER = "DB error query subscription by customerId",
  STRIPE_CUSTOMER_CREATE = "Stripe error creating a customer",
  STRIPE_ATTACH_PAYMENT = "Stripe error attaching payment method",
  STRIPE_DEFAULT_PAYMENT = "Stripe error setting default payment",
  STRIPE_CREATE_SUBSCRIPTION = "Stripe error creating subscription",
  STRIPE_PAYMENT_INTENT_SUCCEEDED = "Stripe error handling payment_intent.succeeded",
  SUBSCRIPTION_DB_CREATE = "DB error creating subscription",
  SUBSCRIPTION_DB_QUERY = "DB query subscription by customer id",
  SUBSCRIPTION_DB_UPDATE = "DB error updating subscription",
  SUBSCRIPTION_NOT_FOUND = "Subscription not found",
  CONTEXT_ORGANIZATION_PROVER = "useOrganizationContext must be used within a OrganizationProvider",
  CONTEXT_PUBLIC_ORGANIZATION_PROVIDER = "useContextPublicOrganization must be used within a PublicOrganizationProvider",
  DATE_BEFORE_SUBSCRIPTION = "The provided date is before the subscription start date.",
  SUBSCRIPTION_NOT_STARTED = "SUBSCRIPTION_NOT_STARTED",
  STRIPE_MISSING_HEADERS = "Webhook Error: Missing header",
  STRIPE_WEBHOOK_VERIFICATION = "Stripe webhook verification failed",
  STRIPE_MISSING_ID = "Missing stripeSubscriptionId",
  STRIPE_INVOICE_PAYMENT_SUCCEEDED = "Error handling invoice.payment_succeeded",
  STRIPE_SUBSCRIPTION_UPDATED = "Stripe webhook error handling customer.subscription.updated",
  STRIPE_SUBSCRIPTION_DELETED = "Stripe webhook error handling customer.subscription.delete",
  STRIPE_LATEST_UNPAID_INVOICE = "Stripe error fetching latest unpaid invoice",
  STRIPE_RETRY_INVOICE_PAYMENT = "Stripe error retrying invoice payment",
  STRIPE_ACCOUNT_UPDATED = "Stripe webhook error handling account.updated",
  NO_UNPAID_INVOICE = "No unpaid invoice",
  INVOICE_PAYMENT_FAILED = "Invoice payment failed",
  STRIPE_PAYMENT_INTENT_NOT_FOUND = "No payment intent found in checkout session",
  STRIPE_GET_PAYMENT_INTENT = "Stripe error getting payment intent",
  STRIPE_PAYMENT_INTENT_ID_NOT_FOUND = "Stripe payment intent id not found in checkout",
  STRIPE_FETCHING_PAYMENT = "Stripe error fetching payment method details",
  STRIPE_CUSOMTER_UPDATED = "Stripe webhook error handling customer.updated",
  STRIPE_PRODUCT_DELETE = "Stripe error deleting product",
  PDF_MONKEY_GENERATE = "PDF Monkey error generating pdf",
  PDF_MONKEY_MISSING_API_KEY = "Missing PDFMonkey API Key. Please set PDFMONKEY_API_KEY in your environment variables.",
  PDF_MONKEY_NO_DOWNLOAD_URL = "No download URL provided for the generated document.",
  PDF_MONKEY_DOCUMENT_SUCCESS = "PDF Monkey webhooker error handling documents.generation.success",
  SENDGRID_MISSING_API_KEY = "Missing SENDGRID_API_KEY",
  SENDGRID_EMAIL = "Sendgrid error sending email",
  STRIPE_SUBSCRIPTION_NOT_FOUND = "Stripe Subscription not found or has no items.",
  STRIPE_RETRIEVE = "Stripe error retrieving subscription",
  STRIPE_RETRIEVE_INVOICE = "Stripe error retrieving invoice",
  STRIPE_RETRIEVE_PRICE = "Stripe error retrieving price",
  EVENT_DB_UPDATE = "DB error updating event",
  GUEST_LIST_INFO_DB_CREATE = "DB error creating guest list info",
  GUEST_LIST_INFO_DB_UPDATE = "DB error updating guest list info",
  GUEST_LIST_INFO_DB_QUERY = "DB error querying guest list info",
  STRIPE_CONNECTED_CUSTOMER_DB_QUERY = "DB error querying stripe connected customer",
  STRIPE_CONNECTED_CUSTOMER_DB_INSERT = "DB error inserting stripe connected customer",
  TICKET_DB_QUERY = "DB error querying ticket",
  TICKET_INFO_DB_CREATE = "DB error creating ticket info",
  TICKET_INFO_DB_UPDATE = "DB error updating ticket info",
  CONNECTED_ACCOUNT_DB_DELETE = "DB error deleting connected account",
  CONNECTED_ACCOUNT_DB_QUERY = "DB error querying connected account",
  STRIPE_CONNECTED_ONBOARDING_LINK = "Stripe error creating onboarding link",
  GUEST_LIST_CREDIT_TRANSACTION_CREATE_ERROR = "DB error creating guest list credit transaction",
  ORGANIZATION_CREDITS_DB_QUERY = "DB error querying guest list credits",
  ORGANIZATION_CREDIT_NOT_FOUND = "Guest list credit not found",
  ORGANIZATION_CREDIT_DB_USE = "DB error using guest list credit",
  EVENT_TICKET_TYPES_DB_CREATE = "DB error creating event ticket types",
  EVENT_TICKET_TYPES_DB_DELETE = "DB error deleting event ticket types",
  EVENT_TICKET_TYPES_DB_QUERY_BY_EVENT_ID_ERROR = "DB error querying event ticket types by event id",
  EVENT_TICKET_TYPES_DB_UPDATE = "DB error updating event ticket types",
  EVENT_TICKET_TYPE_NOT_FOUND = "Event ticket type not found",
  EVENT_TICKET_TYPES_DB_QUERY = "DB error querying event ticket types",
  TICKETS_DB_QUERY_BY_EVENT_ID_ERROR = "DB error querying tickets by event id",
  NO_FIELDS_PROVIDED_TO_UPDATE = "No fields provided to update",
  CONTEXT_USER_TEMPLATE_PROVIDER = "useContextUserTemplate must be used within a UserTemplateProvider",
}

export enum ShowErrorMessages {
  COMPANY_NAME_ALREADY_EXISTS = "Company name already exists.",
  FORBIDDEN_PRIVILEGES = "User does not have permission",
  FORBIDDEN_TIER = "Account does not have tier for this functionality",
  GUEST_LIST_LIMIT_REACHED = "Guest list limit reached for this subscription period.",
  SUBSCRIPTION_ACTIVE = "An active subscription for this user already exists",
  CUSTOMER_EXISTS = "Customer already exists. Please sign in",
  ACTIVE_SUBSCRIPTION_EXISTS = " An active subscription with this email already exists.",
  GUEST_NOT_FOUND = "Guest not found in the list",
  PROMOTER_PROMO_CODE_NAME_EXISTS = "Promoter promo code already exits.",
  PROMOTER_PROMO_CODE_NOT_FOUND = "Promoter promo code not found",
  INVALID_PROMO_CODE = "Invalid promoter code",
  TICKET_NOT_FOUND = "Ticket not found",
  USER_ALREADY_EXISTS = "User already exists",
  USER_ALREADY_HAS_COMPANY = "User already has a company",
  USER_NOT_CUSTOMER = "User is not customer",
  COMPANY_NOT_FOUND = "Company not found",
  EVENT_NOT_FOUND = "Event not found",
  NOT_ENOUGH_MALE_TICKETS = "Not enough male tickets available.",
  NOT_ENOUGH_FEMALE_TICKETS = "Not enough female tickets available.",
  USER_NOT_FOUND = "User not found",
  GUEST_INACTIVE = "Guest is inactive",
  GUEST_DOES_NOT_BELONG_TO_PROMOTER = "Guest does not belong to promoter",
  NOT_ENOUGH_GUEST_LIST_CREDITS = "Not enough guest list credits available.",
  GUEST_LIST_CLOSED = "Guest list is closed",
  GUEST_LIST_NOT_FOUND = "Guest list not found",
  FAQ_NOT_FOUND = "FAQ not found",
  SMS_TEMPLATE_NOT_FOUND = "SMS template not found",
  CAMPAIGN_NOT_FOUND = "Campaign not found",
  GUEST_DB_NOT_FOUND = "Guest not found",
  THREAD_NOT_FOUND = "Thread not found",
  CONTACT_DB_NOT_FOUND = "Contact not found",
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
  PAYMENT_PROCESSING = "There was a problem processing your payment. Please try again.",
  ENTER_CARD = "Please enter your card details.",
  ROLE_REQUIRED = "Role is required",
  COMPANY_NAME_REQUIRED = "Company name is required",
  PHONE_NUMBER_FORMAT = "Phone number must be a valid 10-digit number.",
  NO_GUEST_SELECTED = "No guest selected",
  PHONE_NUMBER_EMPTY = "Phone number cannot be empty",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export enum StripePaymentType {
  CARD = "card",
}
export enum QueryState {
  Loading = "loading",
  Error = "error",
  Success = "success",
}
