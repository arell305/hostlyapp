"use client";

import KpiGrid from "@shared/ui/containers/KpiGrid";
import KpiCard from "@/features/analytics/components/shared/KpiCard";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import BarChartContainer from "@/features/analytics/components/shared/BarChartContainer";
import HorizontalBarChartContainer from "@/features/analytics/components/shared/HorizontalBarChartContainer";
import { isManager } from "@/shared/utils/permissions";
import { getBarColor } from "@shared/lib/frontendHelper";
import { GetGuestListKpisData } from "@/shared/types/convex-types";
import { useContextOrganization } from "@/shared/hooks/contexts";

interface GuestListAnalyticsContentProps {
  guestListKpisData: GetGuestListKpisData;
}

const GuestListAnalyticsContent = ({
  guestListKpisData,
}: GuestListAnalyticsContentProps) => {
  const { orgRole } = useContextOrganization();
  const canViewCompanyAnalytics = isManager(orgRole);

  const kpis = [
    {
      label: "Avg RSVPs per Event",
      value: guestListKpisData.avgRsvpPerEvent.value,
      change: guestListKpisData.avgRsvpPerEvent.change,
    },
    {
      label: "Avg Check-ins per Event",
      value: guestListKpisData.avgCheckinsPerEvent.value,
      change: guestListKpisData.avgCheckinsPerEvent.change,
    },
    {
      label: "Avg Check-in Rate",
      value: `${(guestListKpisData.avgCheckinRate.value * 100).toFixed(1)}%`,
      change: guestListKpisData.avgCheckinRate.change,
    },
    ...(canViewCompanyAnalytics
      ? [
          {
            label: "Avg Check-ins per Promoter",
            value: guestListKpisData.avgCheckinsPerPromoter.value,
            change: guestListKpisData.avgCheckinsPerPromoter.change,
          },
        ]
      : []),
  ];

  return (
    <SectionContainer>
      <KpiGrid>
        {kpis.map(({ label, value, change }) => (
          <KpiCard
            key={label}
            label={label}
            value={typeof value === "number" ? value.toFixed(1) : value}
            changeText={`${change.toFixed(1)}%`}
          />
        ))}
      </KpiGrid>

      <BarChartContainer
        title="Event Headcount by Gender"
        data={guestListKpisData.eventCheckInData}
        xKey="name"
        barKeys={["male", "female"]}
        tooltipFormatter={(v) => `${v}`}
        valueFormatter={(v) => `${v}`}
        emptyDescription="No event check-in data available."
      />
      {canViewCompanyAnalytics && (
        <HorizontalBarChartContainer
          title="Promoter Leaderboard (Check-ins)"
          data={guestListKpisData.promoterLeaderboard}
          xKey="name"
          barKeys={["male", "female"]}
          tooltipFormatter={(v) => `${v} check-ins`}
          valueFormatter={(v) => `${v}`}
          emptyDescription="No promoter breakdown data available during this period."
          getBarColor={getBarColor}
        />
      )}
    </SectionContainer>
  );
};

export default GuestListAnalyticsContent;
