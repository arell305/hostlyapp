import { defineSchema, defineTable } from "convex/server";
import { SubscriptionStatus, UserRole, UserRoleEnum } from "../utils/enum";
import { v } from "convex/values";
import { SubscriptionTier } from "../utils/enum";

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
  checkInTime: v.optional(v.string()),
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
  }).index("by_email", ["email"]),
  promoCodes: defineTable({
    promoCode: v.string(),
    promoId: v.string(),
    discount: v.number(),
  }),
  users: defineTable({
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    clerkOrganizationId: v.optional(v.string()),
    acceptedInvite: v.boolean(),
    customerId: v.optional(v.id("customers")),
    role: v.union(RoleConvex, v.null()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    promoterPromoCode: v.optional(
      v.object({
        promoCodeId: v.id("promoterPromoCode"),
        name: v.string(),
      })
    ),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    clerkUserIds: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    eventIds: v.array(v.id("events")),
    customerId: v.id("customers"),
    promoDiscount: v.number(),
    isActive: v.optional(v.boolean()),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_name", ["name"]),
  events: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.string(),
    endTime: v.string(),
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    photo: v.union(v.id("_storage"), v.null()),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
    address: v.string(),
    isActive: v.boolean(),
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
    clerkOrganizationId: v.string(),
    clerkPromoterUserId: v.string(),
  }).index("by_name", ["name"]),
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
    maleTicketPrice: v.number(),
    femaleTicketPrice: v.number(),
    maleTicketCapacity: v.number(),
    femaleTicketCapacity: v.number(),
    totalMaleTicketsSold: v.number(),
    totalFemaleTicketsSold: v.number(),
    ticketSalesEndTime: v.string(),
  }).index("by_eventId", ["eventId"]),
  guestListInfo: defineTable({
    eventId: v.id("events"),
    guestListCloseTime: v.string(),
    checkInCloseTime: v.string(),
    guestListIds: v.array(v.id("guestLists")),
  }).index("by_eventId", ["eventId"]),
});
