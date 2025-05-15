import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  Gender,
  UserRoleEnum,
  StripeAccountStatus,
  SubscriptionStatus,
  UserRole,
  SubscriptionTier,
} from "@/types/enums";

export const UserRoleEnumConvex = v.union(
  v.literal(UserRoleEnum.APP_ADMIN),
  v.literal(UserRoleEnum.MODERATOR),
  v.literal(UserRoleEnum.PROMOTER),
  v.literal(UserRoleEnum.PROMOTER_ADMIN),
  v.literal(UserRoleEnum.PROMOTER_MANAGER),
  v.null()
);

export const SubscriptionTierConvex = v.union(
  v.literal(SubscriptionTier.ELITE),
  v.literal(SubscriptionTier.PLUS),
  v.literal(SubscriptionTier.STANDARD)
);

export const RoleConvex = v.union(
  v.literal(UserRole.Admin),
  v.literal(UserRole.Moderator),
  v.literal(UserRole.Manager),
  v.literal(UserRole.Promoter),
  v.literal(UserRole.Hostly_Moderator),
  v.literal(UserRole.Hostly_Admin)
);

export const SubscriptionStatusConvex = v.union(
  v.literal(SubscriptionStatus.ACTIVE),
  v.literal(SubscriptionStatus.TRIALING),
  v.literal(SubscriptionStatus.CANCELED),
  v.literal(SubscriptionStatus.INCOMPLETE),
  v.literal(SubscriptionStatus.INCOMPLETE_EXPIRED),
  v.literal(SubscriptionStatus.PAST_DUE),
  v.literal(SubscriptionStatus.UNPAID),
  v.literal(SubscriptionStatus.PENDING_CANCELLATION),
  v.literal(SubscriptionStatus.PAUSED)
);

export const StripeAccountStatusConvex = v.union(
  v.literal(StripeAccountStatus.NOT_ONBOARDED),
  v.literal(StripeAccountStatus.PENDING),
  v.literal(StripeAccountStatus.VERIFIED),
  v.literal(StripeAccountStatus.RESTRICTED),
  v.literal(StripeAccountStatus.REJECTED),
  v.literal(StripeAccountStatus.DISABLED)
);

export const GuestListNames = v.object({
  id: v.string(),
  name: v.string(),
  attended: v.optional(v.boolean()),
  malesInGroup: v.optional(v.number()),
  femalesInGroup: v.optional(v.number()),
  checkInTime: v.optional(v.number()),
  phoneNumber: v.optional(v.string()),
});

export default defineSchema({
  subscriptions: defineTable({
    stripeSubscriptionId: v.string(),
    priceId: v.string(),
    trialEnd: v.union(v.number(), v.null()),
    currentPeriodEnd: v.number(),
    currentPeriodStart: v.number(),
    stripeBillingCycleAnchor: v.number(),
    subscriptionStatus: SubscriptionStatusConvex,
    subscriptionTier: SubscriptionTierConvex,
    guestListEventsCount: v.number(),
    customerId: v.id("customers"),
    discount: v.optional(
      v.object({
        stripePromoCodeId: v.optional(v.string()),
        discountPercentage: v.optional(v.number()),
      })
    ),
    amount: v.number(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  customers: defineTable({
    stripeCustomerId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    isActive: v.boolean(),
    last4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),
  connectedAccounts: defineTable({
    customerId: v.id("customers"),
    status: StripeAccountStatusConvex,
    chargesEnabled: v.optional(v.boolean()),
    payoutsEnabled: v.optional(v.boolean()),
    lastStripeUpdate: v.optional(v.number()),
    stripeAccountId: v.string(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_stripeAccountId", ["stripeAccountId"]),
  promoCodes: defineTable({
    promoCode: v.string(),
    promoId: v.string(),
    discount: v.number(),
  }),
  users: defineTable({
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
    customerId: v.optional(v.id("customers")),
    role: v.union(RoleConvex, v.null()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_organizationId", ["organizationId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    customerId: v.id("customers"),
    promoDiscount: v.number(),
    slug: v.string(),
    isActive: v.boolean(),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_customerId", ["customerId"])
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),
  events: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.id("_storage"),
    address: v.string(),
    isActive: v.boolean(),
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_and_startTime", ["organizationId", "startTime"])
    .index("by_startTime", ["startTime"]),

  guestListEntries: defineTable({
    eventId: v.id("events"),
    userPromoterId: v.id("users"),
    name: v.string(),
    checkInTime: v.optional(v.number()),
    malesInGroup: v.optional(v.number()),
    femalesInGroup: v.optional(v.number()),
    attended: v.optional(v.boolean()),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    isActive: v.boolean(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userPromoterId", ["userPromoterId"])
    .index("by_eventId_and_user", ["eventId", "userPromoterId"]),

  promoterPromoCode: defineTable({
    name: v.string(),
    promoterUserId: v.id("users"),
  })
    .index("by_name", ["name"])
    .index("by_promoterUserId", ["promoterUserId"]),
  promoCodeUsage: defineTable({
    promoCodeId: v.id("promoterPromoCode"),
    promoterUserId: v.id("users"),
    eventId: v.id("events"),
    maleUsageCount: v.number(),
    femaleUsageCount: v.number(),
  })
    .index("by_promoCode", ["promoCodeId"])
    .index("by_eventId", ["eventId"])
    .index("by_promoter", ["promoterUserId"])
    .index("by_promoCode_and_event", ["promoCodeId", "eventId"]),
  ticketInfo: defineTable({
    eventId: v.id("events"),
    ticketSalesEndTime: v.number(),
    stripeProductId: v.string(),
    ticketTypes: v.object({
      male: v.object({
        price: v.number(),
        capacity: v.number(),
        stripePriceId: v.string(),
      }),
      female: v.object({
        price: v.number(),
        capacity: v.number(),
        stripePriceId: v.string(),
      }),
    }),
  }).index("by_eventId", ["eventId"]),

  guestListInfo: defineTable({
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
  }).index("by_eventId", ["eventId"]),
  ticketPurchase: defineTable({
    email: v.string(),
    ticketInfoId: v.id("ticketInfo"),
    purchaseTime: v.number(),
    tickets: v.array(v.id("tickets")),
  }).index("by_ticketInfoId", ["ticketInfoId"]),
  tickets: defineTable({
    organizationId: v.id("organizations"),
    eventId: v.id("events"),
    promoterUserId: v.union(v.id("users"), v.null()),
    email: v.string(),
    gender: v.union(v.literal(Gender.Male), v.literal(Gender.Female)),
    checkInTime: v.optional(v.number()),
    ticketUniqueId: v.string(),
    connectedPaymentId: v.optional(v.id("connectedPayments")),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_eventId", ["eventId"])
    .index("by_ticketUniqueId", ["ticketUniqueId"])
    .index("by_eventId_and_promoterUserId", ["eventId", "promoterUserId"]),
  connectedPayments: defineTable({
    organizationId: v.id("organizations"),
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    email: v.string(),
    totalAmount: v.number(),
    promoCode: v.union(v.string(), v.null()),
    maleCount: v.number(),
    femaleCount: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_eventId", ["eventId"])
    .index("by_email", ["email"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"]),
  stripeConnectedCustomers: defineTable({
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeAccountId: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeAccountId", ["stripeAccountId"]),
  guestListCreditTransactions: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    type: v.union(
      v.literal("added"), // when credits are purchased or gifted
      v.literal("used") // when a guest list is created
    ),
    credits: v.number(),
    amountPaid: v.optional(v.number()), // only for "added"
    stripePaymentIntentId: v.optional(v.string()), // only for "added"
    eventId: v.optional(v.id("events")), // only for "used"
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"]),
  organizationCredits: defineTable({
    organizationId: v.id("organizations"),
    totalCredits: v.number(), // all added
    creditsUsed: v.number(), // cumulative total used
    lastUpdated: v.number(), // for cache validation or auditing
  }).index("by_organizationId", ["organizationId"]),
});
