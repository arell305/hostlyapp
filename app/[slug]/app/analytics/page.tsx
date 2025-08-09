"use client";
import React from "react";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AnalyticsContent from "./AnalyticsContent";
import { isManager, isPromoter } from "@/utils/permissions";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const AnalyticsPage = () => {
  const { orgRole } = useContextOrganization();

  const canViewCompanyAnalytics = isManager(orgRole) || isPromoter(orgRole);

  if (!canViewCompanyAnalytics) {
    return (
      <MessagePage
        title="You do not have permission to view this page."
        description="Please contact your administrator to request access."
      />
    );
  }

  return <AnalyticsContent />;
};

export default AnalyticsPage;
