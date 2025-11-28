import { ConvexError, v } from "convex/values";
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
  validateCampaign,
  validateEvent,
  validateUser,
} from "./backendUtils/validation";
import { CampaignPatch } from "@/shared/types/patch-types";
import { AudienceTypeConvex, CampaignStatusConvex } from "./schema";
import { CampaignWithEvent, CampaignWithGuestList } from "@/shared/types/types";
import { throwConvexError } from "./backendUtils/errors";

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
  handler: async (context, argumentsObject): Promise<CampaignWithEvent[]> => {
    const { userId, status, isActive } = argumentsObject;

    const identity = await requireAuthenticatedUser(context);
    const userDocument = validateUser(await context.db.get(userId));
    isUserTheSameAsIdentity(identity, userDocument.clerkUserId);

    let campaignQuery = context.db
      .query("campaigns")
      .withIndex("by_userId_updatedAt", (queryBuilder) =>
        queryBuilder.eq("userId", userId)
      )
      .order("desc");

    if (status !== undefined) {
      campaignQuery = campaignQuery.filter((queryBuilder) =>
        queryBuilder.eq(queryBuilder.field("status"), status)
      );
    }

    if (isActive !== undefined) {
      campaignQuery = campaignQuery.filter((queryBuilder) =>
        queryBuilder.eq(queryBuilder.field("isActive"), isActive)
      );
    }

    const campaignDocuments = await campaignQuery.collect();

    const eventIdList = Array.from(
      new Set(
        campaignDocuments
          .map((campaignDocument) =>
            campaignDocument.eventId ? String(campaignDocument.eventId) : null
          )
          .filter((eventId) => eventId)
      )
    );

    const eventDocuments = await Promise.all(
      eventIdList.map((eventId) => context.db.get(eventId as Id<"events">))
    );

    const eventNameById = new Map();
    eventDocuments.forEach((eventDocument) => {
      if (eventDocument && eventDocument._id && eventDocument.name) {
        eventNameById.set(String(eventDocument._id), eventDocument.name);
      }
    });

    const campaignDocumentsWithEvents = campaignDocuments.map(
      (campaignDocument) => {
        const eventIdString = campaignDocument.eventId
          ? String(campaignDocument.eventId)
          : null;

        return {
          ...campaignDocument,
          eventName: eventIdString
            ? eventNameById.get(eventIdString) || null
            : undefined,
        };
      }
    );

    return campaignDocumentsWithEvents;
  },
});

export const insertCampaign = mutation({
  args: {
    name: v.string(),
    smsBody: v.string(),
    userId: v.id("users"),
    eventId: v.union(v.id("events"), v.null()),
    scheduleTime: v.union(v.number(), v.null()),
    promptResponse: v.optional(v.string()),
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
      promptResponse,
      audienceType,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    } = args;

    const identity = await requireAuthenticatedUser(ctx);

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
      promptResponse,
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
      promptResponse: v.optional(v.string()),
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
      promptResponse,
      status,
      smsBody,
      audienceType,
      stopRepliesAt,
      enableAiReplies,
      includeFaqInAiReplies,
      aiPrompt,
    } = updates;

    const identity = await requireAuthenticatedUser(ctx);

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
      promptResponse,
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

    const identity = await requireAuthenticatedUser(context);

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

    const identity = await requireAuthenticatedUser(ctx);
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
