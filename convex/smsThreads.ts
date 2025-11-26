import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  validateCampaign,
  validateContact,
  validateSmsThread,
  validateUser,
} from "./backendUtils/validation";
import { isUserTheSameAsIdentity } from "./backendUtils/helper";
import { Doc } from "./_generated/dataModel";
import { SmsThreadWithContactAndLastMessage } from "@/shared/types/convex-types";

export const getSmsThreadsForCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (
    ctx,
    { campaignId }
  ): Promise<SmsThreadWithContactAndLastMessage[]> => {
    const identity = await requireAuthenticatedUser(ctx);

    const campaign = validateCampaign(await ctx.db.get(campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const threads = await ctx.db
      .query("smsThreads")
      .withIndex("by_campaign_updatedAt", (q) => q.eq("campaignId", campaignId))
      .order("desc")
      .collect();

    if (threads.length === 0) {
      return [];
    }
    const [contacts, lastMessages] = await Promise.all([
      Promise.all(threads.map((thread) => ctx.db.get(thread.contactId))),
      Promise.all(threads.map((thread) => ctx.db.get(thread.lastMessageId))),
    ]);

    return threads.map((thread, i) => {
      const contact = contacts[i];
      const lastMessage = lastMessages[i];

      if (!contact) throw new Error(`Contact missing for thread ${thread._id}`);
      if (!lastMessage)
        throw new Error(`Last message missing for thread ${thread._id}`);

      return { thread, contact, lastMessage };
    });
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

export const getSmsThreadMessagesContact = query({
  args: { id: v.id("smsThreads") },
  handler: async (
    ctx,
    args
  ): Promise<{
    smsThread: Doc<"smsThreads">;
    contact: Doc<"contacts">;
    smsMessages: Doc<"smsMessages">[];
    user: Doc<"users">;
  }> => {
    const { id } = args;
    const identity = await requireAuthenticatedUser(ctx);

    const smsThread = validateSmsThread(await ctx.db.get(id));
    const campaign = validateCampaign(await ctx.db.get(smsThread.campaignId));
    const user = validateUser(await ctx.db.get(campaign.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const contact = validateContact(await ctx.db.get(smsThread.contactId));
    const smsMessages = await ctx.db
      .query("smsMessages")
      .withIndex("by_threadId_sentAt", (q) => q.eq("threadId", id))
      .order("desc")
      .collect();

    return {
      smsThread,
      contact,
      smsMessages,
      user,
    };
  },
});
