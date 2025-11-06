"use client";

import { DateRange } from "react-day-picker";
import TicketAnalyticsContent from "./TicketAnalyticsContent";
import PromoterTicketAnalyticsContent from "./PromoterTicketAnalyticsContent";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { isManager, isPromoter } from "@/shared/utils/permissions";
import { useTotalRevenueByOrganization } from "@/domain/connectedPayments";
import AnalyticsSkeleton from "@shared/ui/skeleton/AnalyticsSkeleton";
import { usePromoterTicketKpis } from "@/domain/tickets";

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
