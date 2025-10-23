"use client";

import GuestListAnalyticsContent from "./GuestListAnalyticsContent";
import { useGuestListKpis } from "@/domain/guestListEntries";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AnalyticsSkeleton from "@shared/ui/skeleton/AnalyticsSkeleton";

interface GuestListAnalyticsPageProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const GuestListAnalyticsPage = ({ dateRange }: GuestListAnalyticsPageProps) => {
  const { organization } = useContextOrganization();
  const organizationId = organization._id;
  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const result = useGuestListKpis(organizationId, fromTimestamp, toTimestamp);

  if (!result) {
    return <AnalyticsSkeleton />;
  }

  return <GuestListAnalyticsContent guestListKpisData={result} />;
};

export default GuestListAnalyticsPage;
