import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import { internal } from "../../../convex/_generated/api";
import schema from "../../../convex/schema";
import { SubscriptionStatus, SubscriptionTier } from "../../../utils/enum";

const args = {
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  email: "test@example.com",
  paymentMethodId: "pm_123",
  subscriptionTier: SubscriptionTier.STANDARD,
  trialEndDate: "2024-10-17T23:07:15.000Z",
  subscriptionStatus: SubscriptionStatus.ACTIVE,
};

test("inserting customers with subscription", async () => {
  const t = convexTest(schema);
  const customerId = await t.mutation(
    internal.customers.insertCustomerAndSubscription,
    args
  );

  expect(typeof customerId).toBe("string");
});

test("get customber by Email", async () => {
  const t = convexTest(schema);
  await t.mutation(internal.customers.insertCustomerAndSubscription, args);

  const customer = await t.query(internal.customers.findCustomerByEmail, {
    email: "test@example.com",
  });

  expect(customer).toMatchObject(args);
});

test("update customer subscription", async () => {
  const t = convexTest(schema);
  const customerId = await t.mutation(
    internal.customers.insertCustomerAndSubscription,
    args
  );
  await t.mutation(internal.customers.updateCustomer, {
    id: customerId,
    updates: {
      subscriptionStatus: SubscriptionStatus.TRIALING,
    },
  });

  const customer = await t.query(internal.customers.findCustomerByEmail, {
    email: "test@example.com",
  });

  expect(customer).toMatchObject({
    ...args,
    subscriptionStatus: SubscriptionStatus.TRIALING,
  });
});
