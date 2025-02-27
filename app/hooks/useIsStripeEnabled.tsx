import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StripeAccountStatus } from "../../utils/enum";
import { GetConnectedAccountByClerkUserIdResponse } from "@/types/convex-types";

interface UseIsStripeEnabledProps {
  companyName?: string;
}

export function useIsStripeEnabled({ companyName }: UseIsStripeEnabledProps) {
  const connectedAccountData:
    | GetConnectedAccountByClerkUserIdResponse
    | undefined = useQuery(
    api.connectedAccounts.getConnectedAccountByCompanyName,
    companyName ? { companyName } : "skip" // Skip execution if companyName is undefined
  );

  console.log(" connectedAccountData", connectedAccountData);
  const isStripeEnabled =
    connectedAccountData?.data?.connectedAccount?.status ===
    StripeAccountStatus.VERIFIED;

  return { isStripeEnabled, connectedAccountData };
}
