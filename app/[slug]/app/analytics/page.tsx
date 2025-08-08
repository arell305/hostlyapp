"use client";
import React from "react";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AnalyticsContent from "./AnalyticsContent";
import { isManager, isPromoter } from "@/utils/permissions";

const AnalyticsPage = () => {
  const { organization, subscription, orgRole } = useContextOrganization();

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
