import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { StripeConnectedCustomersSchema } from "@/types/schemas-types";
import { ErrorMessages } from "@/types/enums";

export const getStripeConnectedCustomerByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (
    ctx,
    { email }
  ): Promise<StripeConnectedCustomersSchema | null> => {
    try {
      const customer = await ctx.db
        .query("stripeConnectedCustomers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      return customer || null;
    } catch (error) {
      console.error("Error fetching Stripe customer by email:", error);
      throw new Error(ErrorMessages.STRIPE_CONNECTED_CUSTOMER_DB_QUERY);
    }
  },
});

export const insertStripeConnectedCustomer = internalMutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const { email, stripeCustomerId, stripeAccountId } = args;
    try {
      const existingCustomer = await ctx.db
        .query("stripeConnectedCustomers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingCustomer) {
        console.log(`Stripe customer already exists for email: ${email}`);
        return existingCustomer;
      }

      const newCustomer = await ctx.db.insert("stripeConnectedCustomers", {
        email,
        stripeCustomerId,
        stripeAccountId,
      });

      return newCustomer;
    } catch (error) {
      console.error("Error inserting Stripe connected customer:", error);
      throw new Error(ErrorMessages.STRIPE_CONNECTED_CUSTOMER_DB_INSERT);
    }
  },
});
