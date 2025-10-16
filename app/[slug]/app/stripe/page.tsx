"use client";
import React from "react";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin } from "@/utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";
import ConnectedAccountQueryByClerkId from "@/components/connectedAccount/queries/ConnectedAccountQueryByClerkId";

const StripePage = () => {
  const { orgRole } = useContextOrganization();

  const isCompanymin = isAdmin(orgRole);

  if (!isCompanymin) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }
  return <ConnectedAccountQueryByClerkId />;
};

export default StripePage;
