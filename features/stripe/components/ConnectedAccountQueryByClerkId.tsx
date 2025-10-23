"use client";

import StripeContent from "@/features/stripe/components/StripeContent";
import { Skeleton } from "@shared/ui/primitive/skeleton";
import { useConnectedAccountByClerkUserId } from "@/domain/connectedAccounts";

const ConnectedAccountQueryByClerkId = () => {
  const connectedAccountData = useConnectedAccountByClerkUserId();

  if (connectedAccountData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return <StripeContent connectedAccount={connectedAccountData} />;
};

export default ConnectedAccountQueryByClerkId;
