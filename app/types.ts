import { SubscriptionStatus, SubscriptionTier } from "../utils/enum";

export interface PricingOption {
  id: string;
  tier: SubscriptionTier;
  price: string;
  description: string;
  isFree: boolean;
  priceId: string;
}

export interface Customer {
  stripeCustomerId: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate?: string | null;
  stripeSubscriptionId: string;
  email: string;
  paymentMethodId: string;
  subscriptionTier: SubscriptionTier;
}
