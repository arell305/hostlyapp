import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { ResponseStatus, UserRole } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import {
  EventSchema,
  PromoterPromoCodeSchema,
  PromoterPromoCodeWithDiscount,
} from "@/types/schemas-types";
import {
  UpdatePromoterPromoCodeResponse,
  ValidatePromoterPromoCodeResponse,
} from "@/types/convex-types";
import { OrganizationsSchema, UserSchema } from "@/types/types";
import { Id } from "./_generated/dataModel";
import {
  validateEvent,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { isUserInCompanyOfEvent } from "./backendUtils/helper";
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

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();

      const validatedUser = validateUser(user);

      const normalizedInputName = name.toLowerCase();

      const existingPromoCodeWithName = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
        .unique();

      if (existingPromoCodeWithName) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.PROMOTER_PROMO_CODE_NAME_EXISTS,
        };
      }

      const existingPromoCodeForUser: PromoterPromoCodeSchema | null =
        await ctx.db
          .query("promoterPromoCode")
          .withIndex("by_promoterUserId", (q) =>
            q.eq("promoterUserId", validatedUser._id)
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
        promoterUserId: validatedUser._id,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { promoCodeId },
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: ErrorMessages.GENERIC_ERROR,
      };
    }
  },
});

export const getPromoterPromoCodeById = internalQuery({
  handler: async (
    ctx,
    { promoterPromoCodeId }: { promoterPromoCodeId: Id<"promoterPromoCode"> }
  ): Promise<PromoterPromoCodeSchema | null> => {
    try {
      const promoCode = await ctx.db.get(promoterPromoCodeId);

      if (!promoCode) {
        throw new Error(ErrorMessages.PROMOTER_PROMO_CODE_NOT_FOUND);
      }

      return promoCode as PromoterPromoCodeSchema;
    } catch (error) {
      console.error("Error fetching promoter promo code:", error);
      throw new Error("Failed to fetch promoter promo code.");
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
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: ErrorMessages.EVENT_NOT_FOUND,
      };
    }
    try {
      const normalizedInputName = args.name.toLowerCase();

      const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
        .unique();

      if (!promoterPromoCode) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.INVALID_PROMO_CODE,
        };
      }

      const user: UserSchema | null = await ctx.db.get(
        promoterPromoCode.promoterUserId
      );

      const validatedUser = validateUser(user, true, false, true);

      const organization: OrganizationsSchema | null = await ctx.db.get(
        validatedUser.organizationId!
      );
      const validatedOrganization = validateOrganization(organization);

      const event: EventSchema | null = await ctx.db.get(normalizedId);
      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const PromoterPromoCodeWithDiscount: PromoterPromoCodeWithDiscount = {
        ...promoterPromoCode,
        promoDiscount: validatedOrganization.promoDiscount,
      };
      return {
        status: ResponseStatus.SUCCESS,
        data: { promoterPromoCode: PromoterPromoCodeWithDiscount },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
