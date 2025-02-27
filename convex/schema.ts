import { defineSchema, defineTable } from "convex/server";
import {
  StripeAccountStatus,
  SubscriptionStatus,
  UserRole,
  UserRoleEnum,
} from "../utils/enum";
import { v } from "convex/values";
import { SubscriptionTier } from "../utils/enum";
import { Gender } from "@/types/enums";

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
  v.literal(SubscriptionStatus.UNPAID)
);

export const StripeAccountStatusConvex = v.union(
  v.literal(StripeAccountStatus.NOT_ONBOARDED),
  v.literal(StripeAccountStatus.PENDING),
  v.literal(StripeAccountStatus.VERIFIED),
  v.literal(StripeAccountStatus.RESTRICTED),
  v.literal(StripeAccountStatus.REJECTED),
  v.literal(StripeAccountStatus.DISABLED)
);

// export const Venue = v.object({
//   venueName: v.optional(v.string()),
//   address: v.optional(v.string()),
// });

export const GuestListNames = v.object({
  id: v.string(),
  name: v.string(),
  attended: v.optional(v.boolean()),
  malesInGroup: v.optional(v.number()),
  femalesInGroup: v.optional(v.number()),
  checkInTime: v.optional(v.number()),
});

export default defineSchema({
  subscriptions: defineTable({
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    priceId: v.string(),
    status: v.string(),
    isTrial: v.boolean(),
    trialEnd: v.number(),
    createdAt: v.number(),
    endDate: v.string(),
  }),
  customers: defineTable({
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    subscriptionStatus: SubscriptionStatusConvex,
    subscriptionTier: SubscriptionTierConvex,
    trialEndDate: v.union(v.string(), v.null()),
    cancelAt: v.union(v.string(), v.null()),
    nextPayment: v.union(v.string(), v.null()),
    subscriptionStartDate: v.string(),
    isActive: v.optional(v.boolean()),
  }).index("by_email", ["email"]),
  connectedAccounts: defineTable({
    customerId: v.id("customers"),
    status: StripeAccountStatusConvex,
    chargesEnabled: v.optional(v.boolean()),
    payoutsEnabled: v.optional(v.boolean()),
    lastStripeUpdate: v.optional(v.number()),
    stripeAccountId: v.string(),
  }).index("by_customerId", ["customerId"]),
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
    .index("by_clerkUserId", ["clerkUserId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    customerId: v.id("customers"),
    promoDiscount: v.number(),
    slug: v.string(),
    isActive: v.optional(v.boolean()),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),
  events: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.union(v.id("_storage"), v.null()),
    address: v.string(),
    isActive: v.boolean(),
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_clerkOrganizationId_and_startTime", [
      "clerkOrganizationId",
      "startTime",
    ])
    .index("by_startTime", ["startTime"]),
  guestLists: defineTable({
    names: v.array(GuestListNames),
    eventId: v.id("events"),
    clerkPromoterId: v.string(),
  }),
  promoterPromoCode: defineTable({
    name: v.string(),
    clerkPromoterUserId: v.string(),
  })
    .index("by_name", ["name"])
    .index("by_clerkPromoterUserId", ["clerkPromoterUserId"]),
  promoCodeUsage: defineTable({
    promoCodeId: v.id("promoterPromoCode"),
    clerkPromoterUserId: v.string(),
    eventId: v.id("events"),
    maleUsageCount: v.number(),
    femaleUsageCount: v.number(),
  })
    .index("by_promoCode", ["promoCodeId"])
    .index("by_eventId", ["eventId"])
    .index("by_promoter", ["clerkPromoterUserId"])
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
    email: v.string(), // Reference to the user who made the purchase
    ticketInfoId: v.id("ticketInfo"), // Reference to the ticketInfo table
    purchaseTime: v.number(), // Time of purchase (ISO format)
    tickets: v.array(v.id("tickets")),
  }).index("by_ticketInfoId", ["ticketInfoId"]),
  tickets: defineTable({
    eventId: v.id("events"),
    clerkPromoterId: v.union(v.string(), v.null()),
    email: v.string(),
    gender: v.union(v.literal(Gender.Male), v.literal(Gender.Female)),
    checkInTime: v.optional(v.number()),
    ticketUniqueId: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_ticketUniqueId", ["ticketUniqueId"]),
  connectedPayments: defineTable({
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    email: v.string(),
    totalAmount: v.number(),
    promoCode: v.union(v.string(), v.null()),
    maleCount: v.number(),
    femaleCount: v.number(),
    status: v.string(),
  })
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
});
