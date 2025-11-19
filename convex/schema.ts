import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { SubscriptionStatus, UserRole } from "@/shared/types/enums";

export const UserRoleEnumConvex = v.union(
  v.literal(UserRole.Admin),
  v.literal(UserRole.Moderator),
  v.literal(UserRole.Promoter),
  v.literal(UserRole.Hostly_Admin),
  v.literal(UserRole.Hostly_Moderator)
);

export const SubscriptionTierTypeConvex = v.union(
  v.literal("Standard"),
  v.literal("Plus"),
  v.literal("Elite")
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
  v.literal("Not Onboarded Yet"),
  v.literal("Pending"),
  v.literal("Verified"),
  v.literal("Restricted"),
  v.literal("Rejected"),
  v.literal("Disabled"),
  v.literal("Incomplete")
);

export const SmsMessageTypeConvex = v.union(
  v.literal("all_guests"),
  v.literal("attended_event"),
  v.literal("not_attended_event"),
  v.literal("before_event")
);

export const SmsMessageDirectionConvex = v.union(
  v.literal("inbound"),
  v.literal("outbound")
);

export const AuthorTypeConvex = v.union(
  v.literal("guest"),
  v.literal("host"),
  v.literal("ai")
);

export const MessageStatusConvex = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed")
);

export const ConsentStatusConvex = v.union(
  v.literal("active"),
  v.literal("stopped")
);

export const CampaignStatusConvex = v.union(
  v.literal("Scheduled"),
  v.literal("Sent"),
  v.literal("Failed"),
  v.literal("Cancelled")
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
  campaigns: defineTable({
    eventId: v.union(v.id("events"), v.null()),
    isActive: v.boolean(),
    name: v.string(),
    templateId: v.optional(v.id("smsTemplates")),
    smsBody: v.string(),
    promptResponse: v.optional(v.string()),
    scheduleTime: v.union(v.number(), v.null()),
    sentAt: v.optional(v.number()),
    status: CampaignStatusConvex,
    updatedAt: v.number(),
    userId: v.id("users"),
  }).index("by_userId_updatedAt", ["userId", "updatedAt"]),
  connectedAccounts: defineTable({
    chargesEnabled: v.optional(v.boolean()),
    customerId: v.id("customers"),
    lastStripeUpdate: v.optional(v.number()),
    payoutsEnabled: v.optional(v.boolean()),
    status: StripeAccountStatusConvex,
    stripeAccountId: v.string(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_stripeAccountId", ["stripeAccountId"]),

  connectedPayments: defineTable({
    email: v.string(),
    eventId: v.id("events"),
    organizationId: v.id("organizations"),
    promoCode: v.union(v.string(), v.null()),
    stripePaymentIntentId: v.string(),
    ticketCounts: v.array(
      v.object({
        eventTicketTypeId: v.id("eventTicketTypes"),
        quantity: v.number(),
      })
    ),
    totalAmount: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_eventId", ["eventId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"]),
  contacts: defineTable({
    consentStatus: ConsentStatusConvex,
    isActive: v.boolean(),
    name: v.string(),
    phoneNumber: v.string(),
    updatedAt: v.number(),
    userId: v.id("users"),
  })
    .index("by_userId_phoneNumber", ["userId", "phoneNumber"])
    .index("by_phoneNumber", ["phoneNumber"])
    .index("by_userId", ["userId"]),
  customers: defineTable({
    cardBrand: v.optional(v.string()),
    email: v.string(),
    isActive: v.boolean(),
    last4: v.optional(v.string()),
    paymentMethodId: v.string(),
    stripeCustomerId: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),
  events: defineTable({
    address: v.string(),
    description: v.union(v.string(), v.null()),
    endTime: v.number(),
    isActive: v.boolean(),
    name: v.string(),
    organizationId: v.id("organizations"),
    photo: v.id("_storage"),
    startTime: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_and_startTime", ["organizationId", "startTime"])
    .index("by_startTime", ["startTime"]),
  eventTicketTypes: defineTable({
    activeUntil: v.optional(v.number()),
    description: v.optional(v.union(v.string(), v.null())),
    capacity: v.number(),
    eventId: v.id("events"),
    isActive: v.boolean(),
    name: v.string(),
    price: v.number(),
    stripePriceId: v.string(),
    stripeProductId: v.string(),
    ticketSalesEndTime: v.number(),
  }).index("by_eventId", ["eventId"]),
  faq: defineTable({
    answer: v.string(),
    isActive: v.boolean(),
    organizationId: v.id("organizations"),
    question: v.string(),
    updatedAt: v.number(),
  }).index("by_organizationId", ["organizationId"]),
  guestListCreditTransactions: defineTable({
    amountPaid: v.optional(v.number()),
    credits: v.number(),
    eventId: v.optional(v.id("events")),
    organizationId: v.id("organizations"),
    stripePaymentIntentId: v.optional(v.string()),
    type: v.union(v.literal("added"), v.literal("used")),
    userId: v.id("users"),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"]),
  guestListEntries: defineTable({
    attended: v.optional(v.boolean()),
    checkInTime: v.optional(v.number()),
    eventId: v.id("events"),
    femalesInGroup: v.optional(v.number()),
    isActive: v.boolean(),
    malesInGroup: v.optional(v.number()),
    name: v.string(),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    userPromoterId: v.optional(v.id("users")),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userPromoterId", ["userPromoterId"])
    .index("by_eventId_and_user", ["eventId", "userPromoterId"]),
  guestListInfo: defineTable({
    checkInCloseTime: v.number(),
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    guestListRules: v.string(),
  }).index("by_eventId", ["eventId"]),
  organizationCredits: defineTable({
    creditsUsed: v.number(),
    lastUpdated: v.number(),
    organizationId: v.id("organizations"),
    totalCredits: v.number(),
  }).index("by_organizationId", ["organizationId"]),
  organizations: defineTable({
    clerkOrganizationId: v.string(),
    customerId: v.id("customers"),
    isActive: v.boolean(),
    name: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    promoDiscount: v.number(),
    slug: v.string(),
  })
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_customerId", ["customerId"])
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),
  promoCodeUsage: defineTable({
    eventId: v.id("events"),
    femaleUsageCount: v.number(),
    maleUsageCount: v.number(),
    promoCodeId: v.id("promoterPromoCode"),
    promoterUserId: v.id("users"),
  })
    .index("by_promoCode", ["promoCodeId"])
    .index("by_eventId", ["eventId"])
    .index("by_promoter", ["promoterUserId"])
    .index("by_promoCode_and_event", ["promoCodeId", "eventId"]),
  promoterPromoCode: defineTable({
    name: v.string(),
    promoterUserId: v.id("users"),
  })
    .index("by_name", ["name"])
    .index("by_promoterUserId", ["promoterUserId"]),
  promoCodes: defineTable({
    discount: v.number(),
    promoCode: v.string(),
    promoId: v.string(),
  }),
  smsMessages: defineTable({
    authorType: AuthorTypeConvex,
    campaignId: v.id("campaigns"),
    direction: SmsMessageDirectionConvex,
    guestId: v.id("guests"),
    message: v.string(),
    providerMessageId: v.optional(v.string()),
    sentAt: v.number(),
    status: MessageStatusConvex,
    threadId: v.id("smsThreads"),
    toPhoneE164: v.string(),
    updatedAt: v.number(),
    userId: v.id("users"),
  })
    .index("by_threadId_sentAt", ["threadId", "sentAt"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"])
    .index("by_providerMessageId", ["providerMessageId"]),
  smsTemplates: defineTable({
    body: v.string(),
    isActive: v.boolean(),
    messageType: SmsMessageTypeConvex,
    name: v.string(),
    updatedAt: v.number(),
    userId: v.id("users"),
  }).index("by_userId_updatedAt", ["userId", "updatedAt"]),
  smsThreads: defineTable({
    awaitingResponse: v.boolean(),
    campaignId: v.id("campaigns"),
    createdAt: v.number(),
    guestId: v.id("guests"),
    lastAiOutboundAt: v.optional(v.number()),
    lastHumanOutboundAt: v.optional(v.number()),
    lastMessageAt: v.number(),
    lastMessageDirection: SmsMessageDirectionConvex,
    lastMessageId: v.optional(v.id("smsMessages")),
    updatedAt: v.number(),
    userId: v.id("users"),
  }).index("by_campaignId_updatedAt", ["campaignId", "updatedAt"]),
  stripeConnectedCustomers: defineTable({
    email: v.string(),
    stripeAccountId: v.string(),
    stripeCustomerId: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeAccountId", ["stripeAccountId"]),
  subscriptions: defineTable({
    amount: v.number(),
    currentPeriodEnd: v.number(),
    currentPeriodStart: v.number(),
    customerId: v.id("customers"),
    discount: v.optional(
      v.object({
        discountPercentage: v.optional(v.number()),
        stripePromoCodeId: v.optional(v.string()),
      })
    ),
    guestListEventsCount: v.number(),
    priceId: v.string(),
    stripeBillingCycleAnchor: v.number(),
    stripeSubscriptionId: v.string(),
    subscriptionStatus: SubscriptionStatusConvex,
    subscriptionTier: SubscriptionTierTypeConvex,
    trialEnd: v.union(v.number(), v.null()),
  })
    .index("by_customerId", ["customerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),
  ticketPurchase: defineTable({
    email: v.string(),
    purchaseTime: v.number(),
    ticketInfoId: v.id("ticketInfo"),
    tickets: v.array(v.id("tickets")),
  }).index("by_ticketInfoId", ["ticketInfoId"]),
  tickets: defineTable({
    checkInTime: v.optional(v.number()),
    connectedPaymentId: v.optional(v.id("connectedPayments")),
    email: v.string(),
    eventId: v.id("events"),
    eventTicketTypeId: v.id("eventTicketTypes"),
    organizationId: v.id("organizations"),
    promoterUserId: v.union(v.id("users"), v.null()),
    ticketUniqueId: v.string(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_eventId", ["eventId"])
    .index("by_ticketUniqueId", ["ticketUniqueId"])
    .index("by_eventId_and_promoterUserId", ["eventId", "promoterUserId"]),
  users: defineTable({
    clerkUserId: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    name: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    role: v.union(RoleConvex, v.null()),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_organizationId", ["organizationId"]),
});
