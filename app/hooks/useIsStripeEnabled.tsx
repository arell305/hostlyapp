import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponseStatus, StripeAccountStatus } from "../../utils/enum";

interface UseIsStripeEnabledProps {
  slug: string;
}

interface UseIsStripeEnabledResponse {
  isStripeEnabled: boolean;
  connectedAccountId?: string | null;
  isLoading: boolean;
  connectedAccountError?: string | null;
}

export function useIsStripeEnabled({
  slug,
}: UseIsStripeEnabledProps): UseIsStripeEnabledResponse {
  const connectedAccountData = useQuery(
    api.connectedAccounts.getConnectedAccountBySlug,
    slug ? { slug } : "skip"
  );

  const isStripeEnabled =
    connectedAccountData?.data?.connectedAccount?.status ===
    StripeAccountStatus.VERIFIED;

  const connectedAccountId =
    connectedAccountData?.data?.connectedAccount?.stripeAccountId || null;

  const isLoading: boolean = !connectedAccountData;
  let connectedAccountError: string | null = null;
  if (connectedAccountData?.status === ResponseStatus.ERROR) {
    connectedAccountError = connectedAccountData.error;
  }

  return {
    isStripeEnabled,
    connectedAccountId,
    isLoading,
    connectedAccountError,
  };
}
