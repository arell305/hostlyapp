import React from "react";
import { DateRange } from "react-day-picker";
import TicketAnalyticsContent from "./TicketAnalyticsContent";
import PromoterTicketAnalyticsContent from "./PromoterTicketAnalyticsContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isManager, isPromoter } from "@/utils/permissions";
import { useTotalRevenueByOrganization } from "@/hooks/convex/connectedPayments";
import AnalyticsSkeleton from "@/components/shared/skeleton/AnalyticsSkeleton";
import { usePromoterTicketKpis } from "@/hooks/convex/tickets/usePromoterTicketKpis";

interface TicketAnalyticsPageProps {
  dateRange: DateRange;
}

const TicketAnalyticsPage = ({ dateRange }: TicketAnalyticsPageProps) => {
  const { organization, orgRole } = useContextOrganization();
  const organizationId = organization._id;

  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const canCompany = !!organizationId && isManager(orgRole);
  const canPromoter = !canCompany && isPromoter(orgRole);

  const companyRes = useTotalRevenueByOrganization(
    { organizationId, fromTimestamp, toTimestamp },
    canCompany
  );
  const promoterRes = usePromoterTicketKpis(
    { fromTimestamp, toTimestamp },
    canPromoter
  );

  if (!companyRes || !promoterRes) {
    return <AnalyticsSkeleton />;
  }

  if (companyRes && canCompany) {
    return <TicketAnalyticsContent revenueData={companyRes} />;
  }

  if (promoterRes && canPromoter) {
    return <PromoterTicketAnalyticsContent promoterTicketData={promoterRes} />;
  }
};

export default TicketAnalyticsPage;
