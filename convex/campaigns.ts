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
} from "./backendUtils/helper";
import { validateCampaign, validateUser } from "./backendUtils/validation";
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
    const { userId, status } = args;

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
      eventId: v.optional(v.id("events")),
      scheduleTime: v.optional(v.union(v.number(), v.null())),
      promptResponse: v.optional(v.string()),
      status: v.optional(CampaignStatusConvex),
    }),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const { campaignId, updates } = args;
    const { name, isActive, eventId, scheduleTime, promptResponse, status } =
      updates;

    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const patch = pickDefined<CampaignPatch>({
      name,
      isActive,
      eventId,
      scheduleTime,
      promptResponse,
      status,
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
