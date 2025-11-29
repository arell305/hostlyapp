"use client";
import { DateRange } from "react-day-picker";
import { usePromoterTicketKpis } from "@/domain/tickets";
import AnalyticsSkeleton from "@/shared/ui/skeleton/AnalyticsSkeleton";
import PromoterTicketAnalyticsContent from "./PromoterTicketAnalyticsContent";

interface PromoterTicketsLoaderProps {
  dateRange: DateRange;
}

const PromoterTicketsLoader = ({ dateRange }: PromoterTicketsLoaderProps) => {
  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const promoterRes = usePromoterTicketKpis(
    { fromTimestamp, toTimestamp },
    true
  );

  if (!promoterRes) {
    return <AnalyticsSkeleton />;
  }

  return <PromoterTicketAnalyticsContent promoterTicketData={promoterRes} />;
};

export default PromoterTicketsLoader;
