import { defineSchema, defineTable } from "convex/server";
import { UserRoleEnum } from "../utils/enum";
import { v } from "convex/values";

export const UserRoleEnumConvex = v.union(
  v.literal(UserRoleEnum.APP_ADMIN),
  v.literal(UserRoleEnum.MODERATOR),
  v.literal(UserRoleEnum.PROMOTER),
  v.literal(UserRoleEnum.PROMOTER_ADMIN),
  v.literal(UserRoleEnum.PROMOTER_MANAGER),
  v.null()
);

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
    subscriptionStatus: v.string(),
    subscriptionTier: v.string(),
    trialEndDate: v.union(v.string(), v.null()),
    cancelAt: v.union(v.string(), v.null()),
    nextPayment: v.string(),
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
    customerId: v.optional(v.string()),
    role: UserRoleEnumConvex,
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    clerkUserIds: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    eventIds: v.array(v.id("events")),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_name", ["name"]),
  events: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    date: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.union(v.string(), v.null()),
    endTime: v.union(v.string(), v.null()),
    guestListUploadTime: v.union(v.string(), v.null()),
    maleTicketPrice: v.union(v.string(), v.null()),
    femaleTicketPrice: v.union(v.string(), v.null()),
    maleTicketCapacity: v.union(v.string(), v.null()),
    femaleTicketCapacity: v.union(v.string(), v.null()),
    photo: v.union(v.string(), v.null()),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_date", ["date"]),
});
