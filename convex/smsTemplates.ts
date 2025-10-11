import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireAuthenticatedUser,
  requireAuthenticatedUser2,
} from "@/utils/auth";
import { validateSmsTemplate, validateUser } from "./backendUtils/validation";
import {
  handleError,
  isEmptyObject,
  isUserTheSameAsIdentity,
  pickDefined,
} from "./backendUtils/helper";
import { ResponseStatus } from "@/types/enums";
import { UpdateSmsTemplateResponse } from "@/types/convex-types";
import { SmsMessageTypeConvex } from "./schema";
import { SmsTemplatePatch } from "@/types/patch-types";
import { Doc, Id } from "./_generated/dataModel";

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
  handler: async (ctx, args): Promise<Id<"smsTemplates">> => {
    const { body, messageType, name, userId } = args;

    const identity = await requireAuthenticatedUser2(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const smsTemplateId = await ctx.db.insert("smsTemplates", {
      body,
      messageType,
      name,
      userId,
      isActive: true,
      updatedAt: Date.now(),
    });

    return smsTemplateId;
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
  handler: async (ctx, args): Promise<UpdateSmsTemplateResponse> => {
    const { smsTemplateId, updates } = args;
    const { body, messageType, name, isActive } = updates;

    try {
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

      return {
        status: ResponseStatus.SUCCESS,
        data: { smsTemplateId },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
