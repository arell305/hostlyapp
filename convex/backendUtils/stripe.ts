import { STRIPE_API_VERSION } from "@/types/constants";
import { ErrorMessages } from "@/types/enums";
import Stripe from "stripe";

if (!process.env.STRIPE_KEY) {
  throw new Error(ErrorMessages.ENV_NOT_SET_STRIPE_KEY);
}
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});
