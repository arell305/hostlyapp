import { convexTest } from "convex-test";
import { test } from "vitest";
import { internal } from "../../../convex/_generated/api";
import schema from "../../../convex/schema";

test("inserting customers with subscription", async () => {
  const args = {
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    email: "test@example.com",
    paymentMethodId: "pm_123",
  };

  const t = convexTest(schema);
  await t.mutation(internal.customers.insertCustomerAndSubscription, args);
});
