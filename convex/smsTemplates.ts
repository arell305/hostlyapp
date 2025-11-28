import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "@/shared/utils/auth";
import {
  validateSmsLength,
  validateSmsTemplate,
  validateUser,
} from "./backendUtils/validation";
import {
  isEmptyObject,
  isUserTheSameAsIdentity,
  pickDefined,
} from "./backendUtils/helper";
import { SmsTemplatePatch } from "@/shared/types/patch-types";
import { Doc } from "./_generated/dataModel";
import { UserRole } from "@/shared/types/enums";

export const getSmsTemplates = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"smsTemplates">[]> => {
    const { userId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);

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

export const getSmsTemplate = query({
  args: { smsTemplateId: v.id("smsTemplates") },
  handler: async (ctx, args): Promise<Doc<"smsTemplates">> => {
    const { smsTemplateId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);

    const smsTemplate = validateSmsTemplate(await ctx.db.get(smsTemplateId));
    const user = validateUser(await ctx.db.get(smsTemplate.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    return smsTemplate;
  },
});

export const insertSmsTemplate = mutation({
  args: {
    body: v.string(),
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { body, name, userId } = args;

    validateSmsLength({ sms: body });

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    await ctx.db.insert("smsTemplates", {
      body,
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
      name: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { smsTemplateId, updates } = args;
    const { body, name, isActive } = updates;
    validateSmsLength({ sms: body });

    const idenitity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Promoter,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
    ]);

    const smsTemplate = validateSmsTemplate(await ctx.db.get(smsTemplateId));
    const user = validateUser(await ctx.db.get(smsTemplate.userId));
    isUserTheSameAsIdentity(idenitity, user.clerkUserId);

    const patch = pickDefined<SmsTemplatePatch>({
      body,
      name,
      isActive,
    });

    isEmptyObject(patch);

    await ctx.db.patch(smsTemplateId, { ...patch, updatedAt: Date.now() });

    return true;
  },
});
