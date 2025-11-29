"use client";
import { DateRange } from "react-day-picker";
import TicketAnalyticsContent from "./TicketAnalyticsContent";
import { useTotalRevenueByOrganization } from "@/domain/connectedPayments";
import { useContextOrganization } from "@/shared/hooks/contexts";
import AnalyticsSkeleton from "@/shared/ui/skeleton/AnalyticsSkeleton";

interface AdminTicketsLoaderProps {
  dateRange: DateRange;
}

const AdminTicketsLoader = ({ dateRange }: AdminTicketsLoaderProps) => {
  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const { organization } = useContextOrganization();
  const companyRes = useTotalRevenueByOrganization(
    { organizationId: organization._id, fromTimestamp, toTimestamp },
    true
  );

  if (!companyRes) {
    return <AnalyticsSkeleton />;
  }

  return <TicketAnalyticsContent revenueData={companyRes} />;
};

export default AdminTicketsLoader;
