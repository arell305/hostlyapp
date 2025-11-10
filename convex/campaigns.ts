import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { Doc, Id } from "./_generated/dataModel";
import {
  isUserTheSameAsIdentity,
  pickDefined,
  isEmptyObject,
} from "./backendUtils/helper";
import { validateCampaign, validateUser } from "./backendUtils/validation";
import { CampaignPatch } from "@/shared/types/patch-types";

export const getCampaigns = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"campaigns">[]> => {
    const { userId } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return campaigns;
  },
});

export const insertCampaign = mutation({
  args: {
    name: v.string(),
    smsBody: v.string(),
    userId: v.id("users"),
    eventId: v.union(v.id("events"), v.null()),
    scheduleTime: v.optional(v.number()),
    relativeOffsetMinutes: v.optional(v.number()),
    promptResponse: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const {
      name,
      smsBody,
      userId,
      eventId,
      scheduleTime,
      relativeOffsetMinutes,
      promptResponse,
    } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const campaignId: Id<"campaigns"> = await ctx.db.insert("campaigns", {
      name,
      smsBody,
      isActive: true,
      userId,
      eventId,
      scheduleTime,
      relativeOffsetMinutes,
      promptResponse,
      updatedAt: Date.now(),
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
      scheduleTime: v.optional(v.number()),
      relativeOffsetMinutes: v.optional(v.number()),
      promptResponse: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"campaigns">> => {
    const { campaignId, updates } = args;
    const {
      name,
      isActive,
      eventId,
      scheduleTime,
      relativeOffsetMinutes,
      promptResponse,
    } = updates;

    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const patch = pickDefined<CampaignPatch>({
      name,
      isActive,
      eventId,
      scheduleTime,
      relativeOffsetMinutes,
      promptResponse,
    });

    isEmptyObject(patch);

    await ctx.db.patch(campaignId, { ...patch, updatedAt: Date.now() });

    return campaignId;
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
