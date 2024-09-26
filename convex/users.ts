import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
      });
      return userId;
    } catch (error) {
      console.error("Error inserting user into the database:", error);
      throw new Error("Failed to insert user");
    }
  },
});
