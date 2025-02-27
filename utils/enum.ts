export const UserRoleEnum = {
  APP_ADMIN: "admin",
  PROMOTER: "promoter",
  PROMOTER_ADMIN: "promoter_admin",
  MODERATOR: "moderator",
  PROMOTER_MANAGER: "promoter_manager",
};

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
}

export enum SubscriptionTier {
  STANDARD = "Standard",
  PLUS = "Plus",
  ELITE = "Elite",
}

export const subscriptionBenefits = {
  [SubscriptionTier.STANDARD]: "Unlimited tickets",
  [SubscriptionTier.PLUS]: "Unlimited tickets & 3 guest list events",
  [SubscriptionTier.ELITE]: "Unlimited tickets & Unlimited guest list events",
};

export const subscriptionStatusMap = {
  active: "Active",
  trialing: "Trial",
  canceled: "Canceled",
  incomplete: "Incomplete",
  incomplete_expired: "Expired Trial",
  past_due: "Past Due",
  unpaid: "Unpaid",
};

export const roleMap: Record<string, string> = {
  "org:promoter": "Promoter",
  "org:moderator": "Moderator",
  "org:manager": "Manager",
  "org:admin": "Admin",
  "org:hostly_admin": "Hostly Admin",
  "org:hostly_moderator": "Hostly Moderator",
};

export enum UserRole {
  Promoter = "org:promoter",
  Moderator = "org:moderator",
  Manager = "org:manager",
  Admin = "org:admin",
  Hostly_Admin = "org:hostly_admin",
  Hostly_Moderator = "org:hostly_moderator",
}

export enum ClerkPermissions {
  MODERATES_APP = "org:app:moderate",
  CHECK_GUESTS = "org:events:check_guests",
  CREATE_EVENT = "org:events:create",
  UPLOAD_GUESTLIST = "org:events:upload_guest_list",
  VIEW_ALL_GUESTLISTS = "org:events:upload_guest_list",
  VIEW_SUBSCRIPTION = "org:view:subscription",
}

export enum ActiveTab {
  VIEW = "view",
  GUEST_LIST = "guestList",
  TICKET_INFO = "ticketInfo",
}

export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
  PARTIAL_SUCESSS = "partial success",
}

export enum StripeAccountStatus {
  NOT_ONBOARDED = "Not Onboarded Yet", // User hasn't completed Stripe onboarding
  PENDING = "Pending", // Account created but not yet verified
  VERIFIED = "Verified", // Fully approved, can process payments
  RESTRICTED = "Restricted", // Needs more verification (e.g., missing ID)
  REJECTED = "Rejected", // Permanently rejected by Stripe
  DISABLED = "Disabled", // Manually disabled (optional for admin actions)
}

export enum ActiveStripeTab {
  DOCUMENTS = "document",
  PAYOUTS = "payouts",
  PAYMENTS = "payments",
}
