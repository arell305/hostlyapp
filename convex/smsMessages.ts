import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateThread, validateUser } from "./backendUtils/validation";
import { isUserTheSameAsIdentity } from "./backendUtils/helper";

export const getSmsMessagesForThread = query({
  args: { threadId: v.id("smsThreads") },
  handler: async (ctx, { threadId }) => {
    const identity = await requireAuthenticatedUser(ctx);

    const thread = validateThread(await ctx.db.get(threadId));
    const user = validateUser(await ctx.db.get(thread.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    return await ctx.db
      .query("smsMessages")
      .withIndex("by_threadId_sentAt", (q) => q.eq("threadId", threadId))
      .order("desc")
      .collect();
  },
});

export const insertSmsMessage = internalMutation({
  args: {
    smsMessage: v.object({
      threadId: v.id("smsThreads"),
      message: v.string(),
      direction: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { smsMessage } = args;

    // TODO: Implement
  },
});
