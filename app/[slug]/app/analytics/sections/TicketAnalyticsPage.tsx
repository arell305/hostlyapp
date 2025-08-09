import React from "react";
import { DateRange } from "react-day-picker";
import TicketAnalyticsContent from "./TicketAnalyticsContent";
import PromoterTicketAnalyticsContent from "./PromoterTicketAnalyticsContent";
import { useTicketKpis } from "../hooks/useTicketKpis";
import { isError, isLoading } from "@/types/types";

interface TicketAnalyticsPageProps {
  dateRange: DateRange;
}

const TicketAnalyticsPage = ({ dateRange }: TicketAnalyticsPageProps) => {
  const result = useTicketKpis({ dateRange });

  if (isLoading(result) || isError(result)) {
    return result.component;
  }

  const { mode, data } = result.data;

  if (mode === "company") {
    return <TicketAnalyticsContent revenueData={data} />;
  }

  if (mode === "promoter") {
    return <PromoterTicketAnalyticsContent promoterTicketData={data} />;
  }
};

export default TicketAnalyticsPage;
