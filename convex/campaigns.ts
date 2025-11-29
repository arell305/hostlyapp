import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { Doc, Id } from "./_generated/dataModel";
import {
  isUserTheSameAsIdentity,
  pickDefined,
  isEmptyObject,
  isUserInCompanyOfEvent,
} from "./backendUtils/helper";
import {
  validateAiPromptLength,
  validateCampaign,
  validateEvent,
  validateSmsLength,
  validateUser,
} from "./backendUtils/validation";
import { CampaignPatch } from "@/shared/types/patch-types";
import { AudienceTypeConvex, CampaignStatusConvex } from "./schema";
import { CampaignWithEvent, CampaignWithGuestList } from "@/shared/types/types";
import { throwConvexError } from "./backendUtils/errors";
import { UserRole } from "@/shared/types/enums";

export const getCampaignsArgs = {
  userId: v.id("users"),
  isActive: v.optional(v.boolean()),
  status: v.optional(
    v.union(
      v.literal("Scheduled"),
      v.literal("Sent"),
      v.literal("Failed"),
      v.literal("Cancelled")
    )
  ),
};

export const getCampaigns = query({
  args: getCampaignsArgs,
  handler: async (ctx, args): Promise<CampaignWithEvent[]> => {
    const { userId, status, isActive } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);
    const userDoc = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, userDoc.clerkUserId);

    let q = ctx.db
      .query("campaigns")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", userId))
      .order("desc");

    if (status !== undefined)
      q = q.filter((q) => q.eq(q.field("status"), status));
    if (isActive !== undefined)
      q = q.filter((q) => q.eq(q.field("isActive"), isActive));

    const campaigns = await q.collect();
    if (campaigns.length === 0) return [];

    const eventIds = Array.from(
      new Set(
        campaigns.map((c) => c.eventId).filter((id): id is Id<"events"> => !!id)
      )
    );
    const events = await Promise.all(eventIds.map((id) => ctx.db.get(id)));
    const eventNameMap = new Map<string, string>();
    events.forEach((e) => e && eventNameMap.set(e._id, e.name));

    const replyCountMap = new Map<string, number>();
    for (const campaign of campaigns) {
      const threads = await ctx.db
        .query("smsThreads")
        .withIndex("by_campaign_needsReview", (q) =>
          q.eq("campaignId", campaign._id)
        )
        .filter((q) => q.eq(q.field("needsHumanReview"), true))
        .collect();

      replyCountMap.set(campaign._id, threads.length);
    }

    return campaigns.map((campaign) => ({
      ...campaign,
      eventName: campaign.eventId
        ? (eventNameMap.get(campaign.eventId) ?? null)
        : null,
      awaitingReplies: replyCountMap.get(campaign._id) ?? 0,
    }));
  },
});

export const insertCampaign = mutation({
  args: {
    name: v.string(),
    smsBody: v.string(),
    userId: v.id("users"),
    eventId: v.union(v.id("events"), v.null()),
    scheduleTime: v.union(v.number(), v.null()),
    audienceType: AudienceTypeConvex,
    enableAiReplies: v.boolean(),
    includeFaqInAiReplies: v.optional(v.boolean()),
    aiPrompt: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const {
      name,
      smsBody,
      userId,
      eventId,
      scheduleTime,
      audienceType,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);
    validateAiPromptLength({ aiPrompt });
    validateSmsLength({ sms: smsBody });

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const finalScheduleTime = scheduleTime ?? Date.now() + 30_000;

    const campaignId: Id<"campaigns"> = await ctx.db.insert("campaigns", {
      name,
      smsBody,
      isActive: true,
      userId,
      eventId,
      scheduleTime: finalScheduleTime,
      updatedAt: Date.now(),
      status: "Scheduled",
      audienceType,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    });

    return campaignId;
  },
});

export const updateCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    updates: v.object({
      name: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      scheduleTime: v.optional(v.union(v.number(), v.null())),
      status: v.optional(CampaignStatusConvex),
      smsBody: v.optional(v.string()),
      audienceType: v.optional(AudienceTypeConvex),
      stopRepliesAt: v.optional(v.number()),
      enableAiReplies: v.optional(v.boolean()),
      includeFaqInAiReplies: v.optional(v.boolean()),
      aiPrompt: v.optional(v.union(v.string(), v.null())),
    }),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const { campaignId, updates } = args;
    const {
      name,
      isActive,
      scheduleTime,
      status,
      smsBody,
      audienceType,
      stopRepliesAt,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    } = updates;

    validateAiPromptLength({ aiPrompt });
    validateSmsLength({ sms: smsBody });

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    if (
      campaign.status === "Sent" &&
      (smsBody !== undefined || scheduleTime !== undefined)
    ) {
      throwConvexError(
        "Cannot update sms body or schedule time after campaign has been sent",
        {
          code: "BAD_REQUEST",
          showToUser: true,
        }
      );
    }

    const patch = pickDefined<CampaignPatch>({
      name,
      isActive,
      scheduleTime,
      status,
      smsBody,
      audienceType,
      stopRepliesAt,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    });

    isEmptyObject(patch);

    await ctx.db.patch(campaignId, { ...patch, updatedAt: Date.now() });

    return campaignId;
  },
});

export const updateCampaignInternal = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    updates: v.object({
      status: v.optional(CampaignStatusConvex),
      sentAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    const { campaignId, updates } = args;

    await ctx.db.patch(campaignId, { ...updates, updatedAt: Date.now() });
  },
});

export const getCampaignById = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (context, argumentsObject): Promise<CampaignWithGuestList> => {
    const { campaignId } = argumentsObject;

    const identity = await requireAuthenticatedUser(context, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);

    const campaignDocument = validateCampaign(await context.db.get(campaignId));
    const userDocument = validateUser(
      await context.db.get(campaignDocument.userId)
    );
    isUserTheSameAsIdentity(identity, userDocument.clerkUserId);

    let hasGuestList: boolean = false;

    if (campaignDocument.eventId) {
      const guestListRecords = await context.db
        .query("guestListInfo")
        .withIndex("by_eventId", (queryBuilder) =>
          queryBuilder.eq("eventId", campaignDocument.eventId as Id<"events">)
        )
        .collect();

      if (guestListRecords.length > 0) {
        hasGuestList = true;
      }
    }

    return {
      ...campaignDocument,
      hasGuestList,
    };
  },
});

export const getCampaignsByIdInternal = internalQuery({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args): Promise<Doc<"campaigns"> | null> => {
    const { campaignId } = args;

    return await ctx.db.get(campaignId);
  },
});

export const getCampaignsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<Doc<"campaigns">[]> => {
    const { eventId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);
    const convexUserId = identity.convexUserId as Id<"users">;
    const user = validateUser(await ctx.db.get(convexUserId));

    const event = validateEvent(await ctx.db.get(eventId));
    isUserInCompanyOfEvent(user, event);

    return await ctx.db
      .query("campaigns")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});
