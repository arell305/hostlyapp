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

export const subscriptionStatusMap = {
  active: "Active",
  trialing: "Trial Period",
  canceled: "Canceled",
  incomplete: "Incomplete",
  incomplete_expired: "Expired Trial",
  past_due: "Past Due",
  unpaid: "Unpaid",
};
