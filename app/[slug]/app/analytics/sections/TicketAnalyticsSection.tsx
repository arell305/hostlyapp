"use client";

import React from "react";
import { ticketKpis } from "@/types/constants";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import KpiCard from "@/components/shared/KpiCard";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ResponseStatus } from "@/types/enums";
import Loading from "../../components/loading/Loading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import BarChartContainer from "@/components/shared/analytics/BarChart";
import SectionContainer from "@/components/shared/containers/SectionContainer";
interface TicketAnalyticsSectionProps {
  organizationId: Id<"organizations">;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const TicketAnalyticsSection = ({
  organizationId,
  dateRange,
}: TicketAnalyticsSectionProps) => {
  const revenueData = useQuery(
    api.connectedPayments.getTotalRevenueByOrganization,
    {
      organizationId: organizationId,
      fromTimestamp: dateRange.from?.getTime() ?? 0,
      toTimestamp: dateRange.to?.getTime() ?? Date.now(),
    }
  );

  const formatValue = (key: string, value: number) => {
    if (key.toLowerCase().includes("revenue")) {
      return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return value.toLocaleString();
  };
  const data = [
    { date: "2025-04-01", amount: 320 },
    { date: "2025-04-02", amount: 450 },
    { date: "2025-04-03", amount: 600 },
    { date: "2025-04-04", amount: 750 },
    { date: "2025-04-05", amount: 900 },
    { date: "2025-04-06", amount: 1050 },
    { date: "2025-04-07", amount: 1200 },
    { date: "2025-04-08", amount: 1350 },
    { date: "2025-04-01", amount: 320 },
    { date: "2025-04-02", amount: 450 },
    { date: "2025-04-03", amount: 600 },
    { date: "2025-04-04", amount: 750 },
    { date: "2025-04-05", amount: 900 },
    { date: "2025-04-06", amount: 1050 },
    { date: "2025-04-07", amount: 1200 },
    { date: "2025-04-08", amount: 1350 },
  ];

  const isLoading = revenueData === undefined;
  const isError = revenueData?.status === ResponseStatus.ERROR;

  if (isLoading) return <Loading />;
  if (isError) return <ErrorComponent message="Error fetching revenue data" />;

  const revenue = revenueData.data;

  return (
    <SectionContainer>
      <KpiGrid>
        {ticketKpis.map(({ label, key, icon }) => (
          <KpiCard
            key={key}
            label={label}
            value={formatValue(key, revenue[key as keyof typeof revenue] ?? 0)}
            changeText="+10%" // Placeholder – replace with real logic if needed
            icon={React.createElement(icon, { className: "w-5 h-5" })}
          />
        ))}
      </KpiGrid>

      <BarChartContainer
        title="Total Revenue"
        data={data}
        xKey="date"
        yKey="amount"
        barLabel="Revenue"
        tooltipFormatter={(v) => `$${v.toFixed(2)}`}
        valueFormatter={(v) => `$${v}`}
      />

      <BarChartContainer
        title="Total Revenue By Event"
        data={data}
        xKey="date"
        yKey="amount"
        barLabel="Revenue"
        tooltipFormatter={(v) => `$${v.toFixed(2)}`}
        valueFormatter={(v) => `$${v}`}
      />
      <BarChartContainer
        title="Ticket Sales By Gender"
        data={data}
        xKey="date"
        yKey="amount"
        barLabel="Revenue"
        tooltipFormatter={(v) => `$${v.toFixed(2)}`}
        valueFormatter={(v) => `$${v}`}
      />
    </SectionContainer>
  );
};

export default TicketAnalyticsSection;
