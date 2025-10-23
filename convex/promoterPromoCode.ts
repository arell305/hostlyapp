import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

export const addOrUpdatePromoterPromoCode = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { name } = args;

    const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
    const clerkUserId = identity.id as string;

    const user = validateUser(
      await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first()
    );

    const normalizedInputName = name.toLowerCase();

    const existingPromoCodeWithName = await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
      .unique();

    if (existingPromoCodeWithName) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ShowErrorMessages.PROMOTER_PROMO_CODE_NAME_EXISTS,
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
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.EVENT_NOT_FOUND,
      });
    }
    const promoterPromoCode = await ctx.db
      .query("promoterPromoCode")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (!promoterPromoCode) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ShowErrorMessages.INVALID_PROMO_CODE,
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
