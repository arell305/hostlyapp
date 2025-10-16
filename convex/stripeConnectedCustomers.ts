import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getStripeConnectedCustomerByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (
    ctx,
    { email }
  ): Promise<Doc<"stripeConnectedCustomers"> | null> => {
    const customer = await ctx.db
      .query("stripeConnectedCustomers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    return customer;
  },
});

export const insertStripeConnectedCustomer = internalMutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeAccountId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"stripeConnectedCustomers">> => {
    const { email, stripeCustomerId, stripeAccountId } = args;

    const existingCustomer = await ctx.db
      .query("stripeConnectedCustomers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingCustomer) {
      console.log(`Stripe customer already exists for email: ${email}`);
      return existingCustomer._id;
    }

    const newCustomer = await ctx.db.insert("stripeConnectedCustomers", {
      email,
      stripeCustomerId,
      stripeAccountId,
    });

    return newCustomer;
  },
});
