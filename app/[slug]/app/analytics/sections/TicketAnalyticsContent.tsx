"use client";

import React from "react";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import KpiCard from "@/components/shared/KpiCard";
import BarChartContainer from "@/components/shared/analytics/BarChart";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { GetTotalRevenueByOrganizationData } from "@/types/convex-types";
import { DollarSign } from "lucide-react";
import { Ticket } from "lucide-react";
import HorizontalBarChartContainer from "@/components/shared/analytics/HorizontalBarChartContainer";
import { formatCurrency, formatCurrencyAbbr } from "@/utils/helpers";

interface TicketAnalyticsContentProps {
  revenueData: GetTotalRevenueByOrganizationData;
}

const TicketAnalyticsContent = ({
  revenueData,
}: TicketAnalyticsContentProps) => {
  const ticketKpis = [
    {
      label: "Total Revenue",
      key: "totalRevenue",
      icon: DollarSign,
      value: formatCurrencyAbbr(revenueData.totalRevenue.value, {
        abbreviated: true,
      }),
      change: revenueData.totalRevenue.change,
    },
    {
      label: "Revenue / Day",
      key: "avgDailyRevenue",
      icon: DollarSign,
      value: formatCurrencyAbbr(revenueData.averageDailyRevenue.value, {
        abbreviated: true,
      }),
      change: revenueData.averageDailyRevenue.change,
    },
    {
      label: "Tickets Sold",
      key: "totalTicketsSold",
      icon: Ticket,
      value: revenueData.totalTicketsSold.value,
      change: revenueData.totalTicketsSold.change,
    },
    {
      label: "Tickets / Day",
      key: "averageDailyTicketsSold",
      icon: Ticket,
      value: revenueData.averageDailyTicketsSold.value,
      change: revenueData.averageDailyTicketsSold.change,
    },
  ];

  return (
    <SectionContainer>
      <KpiGrid>
        {ticketKpis.map(({ label, value, change, icon }) => (
          <KpiCard
            key={label}
            label={label}
            value={typeof value === "number" ? value.toFixed(1) : value}
            changeText={`${change.toFixed(1)}%`}
            icon={React.createElement(icon, { className: "w-5 h-5" })}
          />
        ))}
      </KpiGrid>

      <BarChartContainer
        title="Revenue by Day"
        data={revenueData.revenueByDay}
        xKey="date"
        barKeys={["revenue"]}
        tooltipFormatter={(v) =>
          `$${v.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        }
        valueFormatter={(v) =>
          `$${v.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
        }
        emptyDescription="No revenue by day data available"
      />
      <BarChartContainer
        title="Revenue by Event"
        data={revenueData.revenueByEvent}
        xKey="name"
        barKeys={["revenue"]}
        tooltipFormatter={(v) => `${formatCurrency(v)}`}
        valueFormatter={(v) => `${formatCurrency(v)}`}
        emptyDescription="No revenue by event data available"
      />

      <HorizontalBarChartContainer
        title="Promoter Leaderboard (Tickets Sold)"
        data={revenueData.promoterBreakdown.map((p) => ({
          name: p.name,
          ...Object.fromEntries(p.sales.map((s) => [s.name, s.count])),
        }))}
        xKey="name"
        barKeys={Array.from(
          new Set(
            revenueData.promoterBreakdown.flatMap((p) =>
              p.sales.map((s) => s.name)
            )
          )
        )}
        tooltipFormatter={(v) => `${v} tickets`}
        valueFormatter={(v) => `${v}`}
        emptyDescription="No promoter breakdown data available during this period."
      />
    </SectionContainer>
  );
};

export default TicketAnalyticsContent;
