import { test, expect, vi, describe, beforeEach } from "vitest";
import { api } from "../../../convex/_generated/api";
import Stripe from "stripe";
import { convexTest } from "convex-test";
import schema from "../../../convex/schema";
import { SubscriptionStatus, SubscriptionTier } from "../../../utils/enum";
import { ERROR_MESSAGES } from "../../../constants/errorMessages";

const mockStripe = {
  promotionCodes: {
    list: vi.fn(),
  },
  customers: {
    create: vi.fn().mockResolvedValue({ id: "cus_123" }),
    update: vi.fn().mockResolvedValue({}),
  },
  paymentMethods: {
    attach: vi.fn().mockResolvedValue({ id: "pm_123" }),
  },
  subscriptions: {
    create: vi.fn(),
  },
};

vi.mock("stripe", () => ({
  default: vi.fn(() => mockStripe),
}));

vi.mock("@clerk/backend", () => ({
  createClerkClient: vi.fn(() => ({
    invitations: {
      createInvitation: vi.fn(),
    },
  })),
}));

describe("validatePromoCode Stripe tests", () => {
  let stripe: Stripe;
  let t = convexTest(schema);

  beforeEach(() => {
    stripe = new Stripe("fake_api_key", { apiVersion: "2024-06-20" });
    t = convexTest(schema);
  });

  test("should return valid response when promo code is active", async () => {
    mockStripe.promotionCodes.list.mockResolvedValue({
      data: [
        {
          id: "PROMO123",
          active: true,
          coupon: {
            percent_off: 20,
            redeem_by: Math.floor(Date.now() / 1000) + 10000, // valid future redeem date
          },
        },
      ],
      has_more: false,
      object: "list",
      url: "/v1/promotion_codes",
    });

    await t.run(async (ctx) => {
      await ctx.db.insert("promoCodes", {
        promoCode: "PROMO123",
        promoId: "PROMOID",
        discount: 20,
      });
    });

    stripe.promotionCodes.list();

    const promo = await t.action(api.stripe.validatePromoCode, {
      promoCode: "PROMO123",
    });

    expect(promo).toEqual({
      isValid: true,
      promoCodeId: "PROMO123",
      discount: 20,
    });
  });

  test("should handle promo code not found in internal database", async () => {
    mockStripe.promotionCodes.list.mockResolvedValue({
      data: [
        {
          id: "PROMO123",
          active: true,
          coupon: {
            percent_off: 20,
            redeem_by: Math.floor(Date.now() / 1000) + 10000, // valid future redeem date
          },
        },
      ],
      has_more: false,
      object: "list",
      url: "/v1/promotion_codes",
    });

    const promo = await t.action(api.stripe.validatePromoCode, {
      promoCode: "PROMO123",
    });
    expect(promo).toEqual({
      isValid: false,
      promoCodeId: null,
      discount: null,
    });
  });

  test("should handle promo code not found in stribe", async () => {
    mockStripe.promotionCodes.list.mockResolvedValue({
      data: [],
      has_more: false,
      object: "list",
      url: "/v1/promotion_codes",
    });

    const promo = await t.action(api.stripe.validatePromoCode, {
      promoCode: "PROMO123",
    });
    expect(promo).toEqual({
      isValid: false,
      promoCodeId: null,
      discount: null,
    });
  });

  test("should handle inactive promo code ", async () => {
    mockStripe.promotionCodes.list.mockResolvedValue({
      data: [
        {
          id: "PROMO123",
          active: false,
          coupon: {
            percent_off: 20,
            redeem_by: Math.floor(Date.now() / 1000) + 10000, // valid future redeem date
          },
        },
      ],
      has_more: false,
      object: "list",
      url: "/v1/promotion_codes",
    });

    const promo = await t.action(api.stripe.validatePromoCode, {
      promoCode: "PROMO123",
    });
    expect(promo).toEqual({
      isValid: false,
      promoCodeId: null,
      discount: null,
    });
  });
});

describe("createStripeSubscription tests", () => {
  let stripe: Stripe;
  let t = convexTest(schema);

  beforeEach(() => {
    stripe = new Stripe("fake_api_key", { apiVersion: "2024-06-20" });
    t = convexTest(schema);
  });

  test("should handle existing customer with active subscription", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.STANDARD,
    };

    const customerArgs = {
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      subscriptionTier: SubscriptionTier.STANDARD,
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelAt: null,
      nextPayment: "2024-09-18T14:30:00.000Z",
    };

    await t.run(async (ctx) => {
      await ctx.db.insert("customers", customerArgs);
    });

    await expect(
      t.action(api.stripe.createStripeSubscription, args)
    ).rejects.toThrowError(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS);
  });

  test("should handle existing customer with trial subscription", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.STANDARD,
    };

    const customerArgs = {
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      subscriptionTier: SubscriptionTier.STANDARD,
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.TRIALING,
      cancelAt: null,
      nextPayment: "2024-09-18T14:30:00.000Z",
    };

    await t.run(async (ctx) => {
      await ctx.db.insert("customers", customerArgs);
    });

    await expect(
      t.action(api.stripe.createStripeSubscription, args)
    ).rejects.toThrowError(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS);
  });
  test("should handle customer choosing elite (no trial)", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.ELITE,
    };

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
    });

    await t.action(api.stripe.createStripeSubscription, args);

    const customer = await t.run(async (ctx) => {
      return await ctx.db.query("customers").first();
    });
    expect(customer).toMatchObject({
      subscriptionTier: SubscriptionTier.ELITE,
      stripeSubscriptionId: "sub_123",
      stripeCustomerId: "cus_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelAt: null,
      nextPayment: expect.stringMatching(/.*/),
    });
  });
  test("should have trial with standard", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.STANDARD,
    };

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
      trial_end: "1700000000",
    });

    await t.action(api.stripe.createStripeSubscription, args);

    const customer = await t.run(async (ctx) => {
      return await ctx.db.query("customers").first();
    });
    expect(customer).toMatchObject({
      subscriptionTier: SubscriptionTier.STANDARD,
      stripeSubscriptionId: "sub_123",
      stripeCustomerId: "cus_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      trialEndDate: expect.stringMatching(/.*/),
      subscriptionStatus: SubscriptionStatus.TRIALING,
      cancelAt: null,
      nextPayment: expect.stringMatching(/.*/),
    });
  });
  test("should have trial with plus", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.PLUS,
    };

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
      trial_end: "1700000000",
    });

    await t.action(api.stripe.createStripeSubscription, args);

    const customer = await t.run(async (ctx) => {
      return await ctx.db.query("customers").first();
    });
    expect(customer).toMatchObject({
      subscriptionTier: SubscriptionTier.PLUS,
      stripeSubscriptionId: "sub_123",
      stripeCustomerId: "cus_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      trialEndDate: expect.stringMatching(/.*/),
      subscriptionStatus: SubscriptionStatus.TRIALING,
      cancelAt: null,
      nextPayment: expect.stringMatching(/.*/),
    });
  });
  test("should not have trial with standard on existing customers", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.STANDARD,
    };

    const customerArgs = {
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      subscriptionTier: SubscriptionTier.STANDARD,
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.CANCELED,
      cancelAt: null,
      nextPayment: "2024-09-18T14:30:00.000Z",
    };

    await t.run(async (ctx) => {
      await ctx.db.insert("customers", customerArgs);
    });

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
    });

    await t.action(api.stripe.createStripeSubscription, args);

    const customer = await t.run(async (ctx) => {
      return await ctx.db.query("customers").first();
    });
    expect(customer).toMatchObject({
      subscriptionTier: SubscriptionTier.STANDARD,
      stripeSubscriptionId: "sub_123",
      stripeCustomerId: "cus_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelAt: null,
      nextPayment: expect.stringMatching(/.*/),
    });
  });
  test("should not have trial with plus on existing customers", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.PLUS,
    };

    const customerArgs = {
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      subscriptionTier: SubscriptionTier.PLUS,
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.CANCELED,
      cancelAt: null,
      nextPayment: "2024-09-18T14:30:00.000Z",
    };

    await t.run(async (ctx) => {
      await ctx.db.insert("customers", customerArgs);
    });

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
    });

    await t.action(api.stripe.createStripeSubscription, args);

    const customer = await t.run(async (ctx) => {
      return await ctx.db.query("customers").first();
    });
    expect(customer).toMatchObject({
      subscriptionTier: SubscriptionTier.PLUS,
      stripeSubscriptionId: "sub_123",
      stripeCustomerId: "cus_123",
      email: "test@example.com",
      paymentMethodId: "pm_123",
      trialEndDate: null,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      cancelAt: null,
      nextPayment: expect.stringMatching(/.*/),
    });
  });
  test("should create stripe subscription", async () => {
    const args = {
      email: "test@example.com",
      paymentMethodId: "pm_123",
      priceId: "price_123",
      promoCodeId: null,
      subscriptionTier: SubscriptionTier.PLUS,
    };

    mockStripe.subscriptions.create.mockResolvedValue({
      id: "sub_123",
    });

    const result = await t.action(api.stripe.createStripeSubscription, args);

    expect(result).toMatchObject({
      customerId: "cus_123",
      subscriptionId: "sub_123",
    });
  });
});
