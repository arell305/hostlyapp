"use client";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AnalyticsContent from "./components/AnalyticsContent";
import { isManager, isPromoter } from "@/shared/utils/permissions";
import MessagePage from "@shared/ui/shared-page/MessagePage";

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
