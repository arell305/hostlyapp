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
  [SubscriptionTier.PLUS]: "Unlimited tickets & 3 guest list events",
  [SubscriptionTier.ELITE]: "Unlimited tickets & Unlimited guest list events",
};

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

export enum UserRole {
  Promoter = "org:promoter",
  Moderator = "org:moderator",
  Manager = "org:manager",
  Admin = "org:admin",
  Hostly_Admin = "org:hostly_admin",
  Hostly_Moderator = "org:hostly_moderator",
}

export const roleMap: Record<UserRole, string> = {
  [UserRole.Promoter]: "Promoter",
  [UserRole.Moderator]: "Moderator",
  [UserRole.Manager]: "Manager",
  [UserRole.Admin]: "Admin",
  [UserRole.Hostly_Admin]: "Hostly Admin",
  [UserRole.Hostly_Moderator]: "Hostly Moderator",
};

export enum ClerkPermissions {
  MODERATES_APP = "org:app:moderate",
  CHECK_GUESTS = "org:events:check_guests",
  CREATE_EVENT = "org:events:create",
  UPLOAD_GUESTLIST = "org:events:upload_guest_list",
  VIEW_ALL_GUESTLISTS = "org:events:view_all_guestlists",
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
