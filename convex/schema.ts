import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    name: v.string(),
    clerkUserIds: v.array(v.string()),
  }).index("by_clerkOrganizationId", ["clerkOrganizationId"]),
});
