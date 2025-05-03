"use client";

import React from "react";
import { guestListKpis } from "@/types/constants";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import KpiCard from "@/components/shared/KpiCard";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import BarChartContainer from "@/components/shared/analytics/BarChart";
import { GetGuestListKpisData } from "@/types/convex-types";

interface GuestListAnalyticsContentProps {
  guestListKpisData: GetGuestListKpisData;
}

const GuestListAnalyticsContent = ({
  guestListKpisData,
}: GuestListAnalyticsContentProps) => {
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

  return (
    <SectionContainer>
      <KpiGrid>
        {guestListKpis.map(({ label, key }) => (
          <KpiCard key={key} label={label} value="456" changeText="+5%" />
        ))}
      </KpiGrid>
      <BarChartContainer
        title="Event Headcount by Gender"
        data={data}
        xKey="date"
        yKey="amount"
        barLabel="Revenue"
        tooltipFormatter={(v) => `$${v.toFixed(2)}`}
        valueFormatter={(v) => `$${v}`}
      />

      <BarChartContainer
        title="Promoter Leaderboard"
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

export default GuestListAnalyticsContent;
