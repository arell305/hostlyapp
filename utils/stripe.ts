import { loadStripe } from "@stripe/stripe-js";
import { ErrorMessages } from "@/types/enums";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(ErrorMessages.ENV_NOT_SET_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);
