import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateThread, validateUser } from "./backendUtils/validation";
import { isUserTheSameAsIdentity } from "./backendUtils/helper";
import { internal } from "./_generated/api";

export const insertSmsMessage = internalMutation({
  args: {
    threadId: v.id("smsThreads"),
    message: v.string(),
    direction: v.string(),
  },
  handler: async (ctx, args) => {
    const { threadId, message, direction } = args;

    // TODO: Implement
  },
});

export const createSmsMessage = action({
  args: {
    threadId: v.id("smsThreads"),
    message: v.string(),
    direction: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { threadId, message, direction } = args;

    const smsId = await ctx.runMutation(internal.smsMessages.insertSmsMessage, {
      threadId,
      message,
      direction,
    });

    return true;
  },
});
