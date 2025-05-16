"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import StripeContent from "./StripeContent";
import { handleQueryState } from "../../../../utils/handleQueryState";

const StripePage = () => {
  const connectedAccountData = useQuery(
    api.connectedAccounts.getConnectedAccountByClerkUserId
  );

  const result = handleQueryState(connectedAccountData);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const connectedAccount = result.data?.connectedAccount;

  return <StripeContent connectedAccount={connectedAccount} />;
};

export default StripePage;
