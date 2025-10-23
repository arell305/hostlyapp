import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser2 } from "@/shared/utils/auth";
import { validateSmsTemplate, validateUser } from "./backendUtils/validation";
import {
  isEmptyObject,
  isUserTheSameAsIdentity,
  pickDefined,
} from "./backendUtils/helper";
import { SmsMessageTypeConvex } from "./schema";
import { SmsTemplatePatch } from "@/types/patch-types";
import { Doc } from "./_generated/dataModel";

export const getSmsTemplates = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"smsTemplates">[]> => {
    const { userId } = args;

    const identity = await requireAuthenticatedUser2(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const smsTemplates = await ctx.db
      .query("smsTemplates")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return smsTemplates;
  },
});

export const insertSmsTemplate = mutation({
  args: {
    body: v.string(),
    messageType: SmsMessageTypeConvex,
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { body, messageType, name, userId } = args;

    const identity = await requireAuthenticatedUser2(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    await ctx.db.insert("smsTemplates", {
      body,
      messageType,
      name,
      userId,
      isActive: true,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const updateSmsTemplate = mutation({
  args: {
    smsTemplateId: v.id("smsTemplates"),
    updates: v.object({
      body: v.optional(v.string()),
      messageType: v.optional(SmsMessageTypeConvex),
      name: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { smsTemplateId, updates } = args;
    const { body, messageType, name, isActive } = updates;

    const idenitity = await requireAuthenticatedUser2(ctx);

    const smsTemplate = validateSmsTemplate(await ctx.db.get(smsTemplateId));
    const user = validateUser(await ctx.db.get(smsTemplate.userId));
    isUserTheSameAsIdentity(idenitity, user.clerkUserId);

    const patch = pickDefined<SmsTemplatePatch>({
      body,
      messageType,
      name,
      isActive,
    });

    isEmptyObject(patch);

    await ctx.db.patch(smsTemplateId, { ...patch, updatedAt: Date.now() });

    return true;
  },
});
