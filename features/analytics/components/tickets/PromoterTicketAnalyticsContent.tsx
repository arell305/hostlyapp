"use client";

import React from "react";
import { GetPromoterTicketKpisData } from "@/shared/types/convex-types";
import KpiCard from "@/features/analytics/components/shared/KpiCard";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import KpiGrid from "@shared/ui/containers/KpiGrid";
import BarChartContainer from "@/features/analytics/components/shared/BarChartContainer";
import { Ticket } from "lucide-react";

interface PromoterTicketAnalyticsContentProps {
  promoterTicketData: GetPromoterTicketKpisData;
}

const PromoterTicketAnalyticsContent = ({
  promoterTicketData,
}: PromoterTicketAnalyticsContentProps) => {
  // Flatten the data into one object per date, with keys as ticket type names
  const flattenedSales = promoterTicketData.dailyTicketSales.map((day) => {
    const base: Record<string, number | string> = { date: day.date };
    day.counts.forEach(({ name, count }) => {
      base[name] = count;
    });
    return base;
  });

  // Dynamically extract ticket type names for barKeys
  const ticketTypeNames = Array.from(
    new Set(
      promoterTicketData.dailyTicketSales.flatMap((d) =>
        d.counts.map((c) => c.name)
      )
    )
  );

  const promoterTicketsKpis = [
    {
      label: "Tickets / Day",
      key: "avgTicketsPerDay",
      icon: Ticket,
      value: promoterTicketData.avgTicketsPerDay.value,
      change: promoterTicketData.avgTicketsPerDay.change,
    },
    {
      label: "Total Tickets",
      key: "totalTickets",
      icon: Ticket,
      value: promoterTicketData.totalTickets.value,
      change: promoterTicketData.totalTickets.change,
    },
  ];

  return (
    <SectionContainer>
      <KpiGrid>
        {promoterTicketsKpis.map(({ label, value, change, icon }) => (
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
        title="Ticket Sales by Type"
        data={flattenedSales}
        xKey="date"
        barKeys={ticketTypeNames}
        tooltipFormatter={(v) => `${v} tickets`}
        valueFormatter={(v) => `${v}`}
        emptyDescription="No ticket sales data available"
      />
    </SectionContainer>
  );
};

export default PromoterTicketAnalyticsContent;
