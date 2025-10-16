import StripeContent from "@/[slug]/app/stripe/StripeContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectedAccountByClerkUserId } from "@/hooks/convex/connectedAccounts";
import React from "react";

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
