import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  ResponseStatus,
  ErrorMessages,
  ShowErrorMessages,
  UserRole,
} from "@/types/enums";
import {
  PromoterPromoCodeSchema,
  PromoterPromoCodeWithDiscount,
} from "@/types/schemas-types";
import {
  UpdatePromoterPromoCodeResponse,
  ValidatePromoterPromoCodeResponse,
} from "@/types/convex-types";
import {
  validateEvent,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { handleError, isUserInCompanyOfEvent } from "./backendUtils/helper";
import { requireAuthenticatedUser } from "../utils/auth";

export const addOrUpdatePromoterPromoCode = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args): Promise<UpdatePromoterPromoCodeResponse> => {
    const { name } = args;

    try {
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
        throw new Error(ShowErrorMessages.PROMOTER_PROMO_CODE_NAME_EXISTS);
      }

      const existingPromoCodeForUser: PromoterPromoCodeSchema | null =
        await ctx.db
          .query("promoterPromoCode")
          .withIndex("by_promoterUserId", (q) =>
            q.eq("promoterUserId", user._id)
          )
          .unique();

      if (existingPromoCodeForUser) {
        await ctx.db.patch(existingPromoCodeForUser._id, { name });
        return {
          status: ResponseStatus.SUCCESS,
          data: { promoCodeId: existingPromoCodeForUser._id },
        };
      }

      const promoCodeId = await ctx.db.insert("promoterPromoCode", {
        name,
        promoterUserId: user._id,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { promoCodeId },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const validatePromoterPromoCode = query({
  args: {
    name: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args): Promise<ValidatePromoterPromoCodeResponse> => {
    const normalizedId = ctx.db.normalizeId("events", args.eventId);
    if (!normalizedId) {
      throw new Error(ErrorMessages.EVENT_NOT_FOUND);
    }
    try {
      const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .unique();

      if (!promoterPromoCode) {
        throw new Error(ShowErrorMessages.INVALID_PROMO_CODE);
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
      return {
        status: ResponseStatus.SUCCESS,
        data: { promoterPromoCode: PromoterPromoCodeWithDiscount },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
