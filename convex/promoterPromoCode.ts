import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { ResponseStatus } from "../utils/enum";
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

export const addOrUpdatePromoterPromoCode = mutation({
  args: {
    name: v.string(),
    clerkPromoterUserId: v.string(),
  },
  handler: async (ctx, args): Promise<UpdatePromoterPromoCodeResponse> => {
    const { name, clerkPromoterUserId } = args;

    try {
      // Check if the promo code name already exists in the entire table
      const normalizedInputName = name.toLowerCase();

      // check for unique name
      const existingPromoCodeWithName = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
        .unique();

      if (existingPromoCodeWithName) {
        throw new Error(
          "This promo code name already exists. Please choose a different name."
        );
      }

      // check if user has promocode laready
      const existingPromoCodeForUser: PromoterPromoCodeSchema | null =
        await ctx.db
          .query("promoterPromoCode")
          .withIndex("by_clerkPromoterUserId", (q) =>
            q.eq("clerkPromoterUserId", clerkPromoterUserId)
          )
          .unique();

      if (existingPromoCodeForUser) {
        await ctx.db.patch(existingPromoCodeForUser._id, { name });
        return {
          status: ResponseStatus.SUCCESS,
          data: { promoCodeId: existingPromoCodeForUser._id },
        };
      }

      // If no existing promo code found, create a new one
      const promoCodeId = await ctx.db.insert("promoterPromoCode", {
        name,
        clerkPromoterUserId,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { promoCodeId },
      };
    } catch (error) {
      console.error("Error adding promo code:", error);
      throw new Error(
        `Failed to add promo code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const getPromoterPromoCodeById = internalQuery({
  handler: async (
    ctx,
    { promoterPromoCodeId }: { promoterPromoCodeId: Id<"promoterPromoCode"> }
  ) => {
    return (await ctx.db.get(
      promoterPromoCodeId
    )) as PromoterPromoCodeSchema | null;
  },
});

// export const updatePromoterPromoCode = mutation({
//   args: {
//     promoCodeId: v.id("promoterPromoCode"),
//     name: v.string(),
//   },
//   handler: async (ctx, args): Promise<UpdatePromoterPromoCodeResponse> => {
//     const { promoCodeId, name } = args;

//     try {
//       // Check if the promo code exists
//       const existingPromoCode = await ctx.db.get(promoCodeId);
//       if (!existingPromoCode) {
//         throw new Error("Promo code not found");
//       }

//       const normalizedInputName = name.toLowerCase();

//       // Check if the new name already exists (excluding the current promo code)
//       const nameExists = await ctx.db
//         .query("promoterPromoCode")
//         .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
//         .filter((q) => q.neq(q.field("_id"), promoCodeId))
//         .unique();

//       if (nameExists) {
//         throw new Error(
//           "This promo code name already exists. Please choose a different name."
//         );
//       }

//       // Update the promo code
//       await ctx.db.patch(promoCodeId, { name });

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: { promoCodeId },
//       };
//     } catch (error) {
//       console.error("Error updating promo code:", error);
//       throw new Error(
//         `Failed to update promo code: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   },
// });

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
        error: ErrorMessages.NOT_FOUND,
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

      const user: UserSchema | null = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", promoterPromoCode.clerkPromoterUserId)
        )
        .unique();

      if (!user || !user.clerkOrganizationId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", user.clerkOrganizationId as string)
        )
        .unique();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const event: EventSchema | null = await ctx.db.get(normalizedId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (event.clerkOrganizationId !== organization.clerkOrganizationId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.INVALID_PROMO_CODE,
        };
      }

      const PromoterPromoCodeWithDiscount: PromoterPromoCodeWithDiscount = {
        ...promoterPromoCode,
        promoDiscount: organization.promoDiscount,
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
