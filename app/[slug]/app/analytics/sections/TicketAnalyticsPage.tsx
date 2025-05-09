import { handleQueryState } from "@/utils/handleQueryState";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";
import { DateRange } from "react-day-picker";
import TicketAnalyticsContent from "./TicketAnalyticsContent";
import PromoterTicketAnalyticsContent from "./PromoterTicketAnalyticsContent";
import { QueryState } from "@/types/enums";

interface TicketAnalyticsPageProps {
  organizationId: Id<"organizations">;
  dateRange: DateRange;
  canViewPromoter: boolean;
  canViewCompanyAnalytics: boolean;
}

const TicketAnalyticsPage = ({
  organizationId,
  dateRange,
  canViewPromoter,
  canViewCompanyAnalytics,
}: TicketAnalyticsPageProps) => {
  const revenueResponse = useQuery(
    api.connectedPayments.getTotalRevenueByOrganization,
    canViewCompanyAnalytics
      ? {
          organizationId: organizationId,
          fromTimestamp: dateRange.from?.getTime() ?? 0,
          toTimestamp: dateRange.to?.getTime() ?? Date.now(),
        }
      : "skip"
  );

  const promoterTicketResponse = useQuery(
    api.tickets.getPromoterTicketKpis,
    canViewPromoter
      ? {
          fromTimestamp: dateRange.from?.getTime() ?? 0,
          toTimestamp: dateRange.to?.getTime() ?? Date.now(),
        }
      : "skip"
  );

  const resultRevenueData = handleQueryState(revenueResponse);
  const resultPromoterTicketData = handleQueryState(promoterTicketResponse);

  if (
    (canViewCompanyAnalytics &&
      resultRevenueData.type === QueryState.Loading) ||
    resultRevenueData.type === QueryState.Error
  ) {
    return resultRevenueData.element;
  }

  if (
    (canViewPromoter && resultPromoterTicketData.type === QueryState.Loading) ||
    resultPromoterTicketData.type === QueryState.Error
  ) {
    return resultPromoterTicketData.element;
  }

  const revenueData =
    canViewCompanyAnalytics && resultRevenueData.type === QueryState.Success
      ? resultRevenueData.data
      : null;
  const promoterTicketData =
    canViewPromoter && resultPromoterTicketData.type === QueryState.Success
      ? resultPromoterTicketData.data
      : null;
  if (canViewCompanyAnalytics && revenueData) {
    return <TicketAnalyticsContent revenueData={revenueData} />;
  }
  if (canViewPromoter && promoterTicketData) {
    return (
      <PromoterTicketAnalyticsContent promoterTicketData={promoterTicketData} />
    );
  }
  return null;
};

export default TicketAnalyticsPage;
