import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const addPromoterPromoCode = mutation({
  args: {
    name: v.string(),
    clerkOrganizationId: v.string(),
    clerkPromoterUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, clerkOrganizationId, clerkPromoterUserId } = args;

    try {
      // Check if the promo code name already exists in the entire table
      const existingPromoCode = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", name))
        .unique();

      if (existingPromoCode) {
        throw new Error(
          "This promo code name already exists. Please choose a different name."
        );
      }

      // If no existing promo code found, create a new one
      const promoCodeId = await ctx.db.insert("promoterPromoCode", {
        name,
        clerkOrganizationId,
        clerkPromoterUserId,
      });

      return {
        success: true,
        promoCodeId,
        promoCodeName: name,
        message: "Promo code added successfully",
      };
    } catch (error) {
      console.error("Error adding promo code:", error);
      throw new Error(
        `Failed to add promo code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const updatePromoterPromoCode = mutation({
  args: {
    promoCodeId: v.id("promoterPromoCode"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { promoCodeId, name } = args;

    try {
      // Check if the promo code exists
      const existingPromoCode = await ctx.db.get(promoCodeId);
      if (!existingPromoCode) {
        throw new Error("Promo code not found");
      }

      // Check if the new name already exists (excluding the current promo code)
      const nameExists = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", name))
        .filter((q) => q.neq(q.field("_id"), promoCodeId))
        .unique();

      if (nameExists) {
        throw new Error(
          "This promo code name already exists. Please choose a different name."
        );
      }

      // Update the promo code
      await ctx.db.patch(promoCodeId, { name });

      return {
        promoCodeId,
        success: true,
        promoCodeName: name,
        message: "Promo code updated successfully",
      };
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw new Error(
        `Failed to update promo code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});
