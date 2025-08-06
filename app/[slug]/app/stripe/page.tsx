"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import StripeContent from "./StripeContent";
import { handleQueryState } from "../../../../utils/handleQueryState";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin } from "@/utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";

const StripePage = () => {
  const connectedAccountData = useQuery(
    api.connectedAccounts.getConnectedAccountByClerkUserId
  );

  const { orgRole } = useContextOrganization();

  const isCompanymin = isAdmin(orgRole);

  const result = handleQueryState(connectedAccountData);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const connectedAccount = result.data?.connectedAccount;

  if (!isCompanymin) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }

  return <StripeContent connectedAccount={connectedAccount} />;
};

export default StripePage;
