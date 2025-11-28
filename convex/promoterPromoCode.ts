import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  ErrorMessages,
  ShowErrorMessages,
  UserRole,
} from "@/shared/types/enums";
import { PromoterPromoCodeWithDiscount } from "@/shared/types/schemas-types";
import {
  validateEvent,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { isUserInCompanyOfEvent } from "./backendUtils/helper";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import { Doc, Id } from "./_generated/dataModel";
import { throwConvexError } from "./backendUtils/errors";

export const addOrUpdatePromoterPromoCode = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { name } = args;

    const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
    const userId = identity.convexUserId as Id<"users">;

    const user = validateUser(await ctx.db.get(userId));

    const normalizedInputName = name.toLowerCase();

    const existingPromoCodeWithName = await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
      .unique();

    if (existingPromoCodeWithName) {
      throwConvexError(ShowErrorMessages.PROMOTER_PROMO_CODE_NAME_EXISTS, {
        code: "BAD_REQUEST",
        showToUser: true,
      });
    }

    const existingPromoCodeForUser = await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_promoterUserId", (q) => q.eq("promoterUserId", user._id))
      .unique();

    if (existingPromoCodeForUser) {
      await ctx.db.patch(existingPromoCodeForUser._id, { name });
      return true;
    }

    await ctx.db.insert("promoterPromoCode", {
      name,
      promoterUserId: user._id,
    });

    return true;
  },
});

export const validatePromoterPromoCode = query({
  args: {
    name: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args): Promise<PromoterPromoCodeWithDiscount> => {
    const normalizedId = ctx.db.normalizeId("events", args.eventId);
    if (!normalizedId) {
      throwConvexError(ShowErrorMessages.EVENT_NOT_FOUND, {
        code: "NOT_FOUND",
        showToUser: true,
      });
    }
    const promoterPromoCode = await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (!promoterPromoCode) {
      throwConvexError(ShowErrorMessages.INVALID_PROMO_CODE, {
        code: "BAD_REQUEST",
        showToUser: true,
      });
    }

    const user = validateUser(
      await ctx.db.get(promoterPromoCode.promoterUserId),
      true,
      false,
      true
    );

    const organization = validateOrganization(
      await ctx.db.get(user.organizationId!)
    );

    const event = validateEvent(await ctx.db.get(normalizedId));

    isUserInCompanyOfEvent(user, event);

    const PromoterPromoCodeWithDiscount: PromoterPromoCodeWithDiscount = {
      ...promoterPromoCode,
      promoDiscount: organization.promoDiscount,
    };
    return PromoterPromoCodeWithDiscount;
  },
});

export const getPromoterPromoCodeByUserIdInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"promoterPromoCode"> | null> => {
    return await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_promoterUserId", (q) =>
        q.eq("promoterUserId", args.userId)
      )
      .unique();
  },
});
