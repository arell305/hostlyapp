import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { PricingOption } from "../app/types/types";
import { SubscriptionTier } from "@/types/enums";
export const pricingOptions: PricingOption[] = [
  {
    id: "prod_QpJqLkwhLCLZfN",
    tier: SubscriptionTier.STANDARD,
    price: "39.99",
    description: "Unlimited Tickets",
    isFree: true,
    priceId: "price_1PxexNRv8MX5Pza1YpAG3Znt",
  },
  {
    id: "prod_QpJo0GlbKBCugX",
    tier: SubscriptionTier.PLUS,
    price: "99.99",
    description: `Unlimited Tickets & ${PLUS_GUEST_LIST_LIMIT} Guest List Events`,
    isFree: true,
    priceId: "price_1PxfAnRv8MX5Pza1kFwM4gmI",
  },
  {
    id: "prod_SqWluQ6a2eiIhq",
    tier: SubscriptionTier.ELITE,
    price: "299.99",
    description: "Unlimited Tickets & Guest List",
    isFree: false,
    priceId: "price_1Rupi4Rv8MX5Pza1FVIlr1Id",
  },
];
