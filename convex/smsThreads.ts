// convex/smsThreads.ts
import { requireAuthenticatedUser } from "@/utils/auth";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateCampaign, validateUser } from "./backendUtils/validation";
import { isUserTheSameAsIdentity } from "./backendUtils/helper";

export const getSmsThreadsForCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    return await ctx.db
      .query("smsThreads")
      .withIndex("by_campaignId_updatedAt", (q) =>
        q.eq("campaignId", campaignId)
      )
      .order("desc")
      .collect();
  },
});

export const insertSmsThread = internalMutation({
  args: {
    smsThread: v.object({
      campaignId: v.id("campaigns"),
    }),
  },
  handler: async (ctx, args) => {
    const { smsThread } = args;

    // TODO: Implement
  },
});
