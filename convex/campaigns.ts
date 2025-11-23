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
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { CampaignPatch } from "@/shared/types/patch-types";
import { CampaignStatusConvex } from "./schema";

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
  handler: async (ctx, args): Promise<Doc<"campaigns">[]> => {
    const { userId, status, isActive } = args;

    const identity = await requireAuthenticatedUser(ctx);
    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    let query = ctx.db
      .query("campaigns")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", userId))
      .order("desc");

    if (status !== undefined) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }
    if (isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), isActive));
    }

    return await query.collect();
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
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const { name, smsBody, userId, eventId, scheduleTime, promptResponse } =
      args;

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
    }),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const { campaignId, updates } = args;
    const { name, isActive, scheduleTime, promptResponse, status, smsBody } =
      updates;

    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    if (
      campaign.status === "Sent" &&
      (smsBody !== undefined || scheduleTime !== undefined)
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message:
          "Cannot update sms body or schedule time after campaign has been sent",
      });
    }

    const patch = pickDefined<CampaignPatch>({
      name,
      isActive,
      scheduleTime,
      promptResponse,
      status,
      smsBody,
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
  handler: async (ctx, args): Promise<Doc<"campaigns">> => {
    const { campaignId } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    return campaign;
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
