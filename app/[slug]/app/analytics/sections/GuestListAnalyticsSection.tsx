"use client";

import React from "react";
import { guestListKpis } from "@/types/constants";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import KpiCard from "@/components/shared/KpiCard";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import BarChartContainer from "@/components/shared/analytics/BarChart";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { GetGuestListKpisData } from "@/types/convex-types";
import { QueryState } from "@/types/enums";

interface GuestListAnalyticsSectionProps {
  organizationId: Id<"organizations">;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const GuestListAnalyticsSection = ({
  organizationId,
  dateRange,
}: GuestListAnalyticsSectionProps) => {
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

  const guestListData = useQuery(api.guestLists.getGuestListKpis, {
    organizationId,
    fromTimestamp: dateRange.from?.getTime() ?? 0,
    toTimestamp: dateRange.to?.getTime() ?? Date.now(),
  });

  const result = handleQueryState(guestListData);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const guestListKpisData: GetGuestListKpisData = result.data;
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

export default GuestListAnalyticsSection;
