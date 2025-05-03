"use client";
import React from "react";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import ErrorComponent from "../components/errors/ErrorComponent";
import AnalyticsContent from "./AnalyticsContent";
import { useUser } from "@clerk/nextjs";
import { isManager, isPromoter } from "@/utils/permissions";

const AnalyticsPage = () => {
  const { organization, organizationContextError, subscription } =
    useContextOrganization();
  const { user } = useUser();

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  if (!subscription) {
    return <ErrorComponent message="No subscription found" />;
  }

  if (!organization) {
    return <ErrorComponent message="No organization found" />;
  }

  const orgRole = user?.publicMetadata.role as string;
  const canViewPromoter = isPromoter(orgRole);
  const canViewCompanyAnalytics = isManager(orgRole);

  return (
    <AnalyticsContent
      subscription={subscription}
      organizationId={organization._id}
      canViewPromoter={canViewPromoter}
      canViewCompanyAnalytics={canViewCompanyAnalytics}
    />
  );
};

export default AnalyticsPage;
