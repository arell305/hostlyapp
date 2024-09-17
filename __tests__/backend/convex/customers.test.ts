import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import { internal } from "../../../convex/_generated/api";
import schema from "../../../convex/schema";
import { SubscriptionStatus, SubscriptionTier } from "../../../utils/enum";

test("inserting customers with subscription", async () => {
  const args = {
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    email: "test@example.com",
    paymentMethodId: "pm_123",
    subscriptionTier: SubscriptionTier.STANDARD,
    trialEndDate: "2024-10-17T23:07:15.000Z",
    subscriptionStatus: SubscriptionStatus.ACTIVE,
  };

  const t = convexTest(schema);
  await t.mutation(internal.customers.insertCustomerAndSubscription, args);

  const customer = await t.query(internal.customers.findCustomerByEmail, {
    email: "test@example.com",
  });

  expect(customer).toMatchObject({
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    email: "test@example.com",
    paymentMethodId: "pm_123",
    subscriptionTier: SubscriptionTier.STANDARD,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    trialEndDate: "2024-10-17T23:07:15.000Z",
  });
});
