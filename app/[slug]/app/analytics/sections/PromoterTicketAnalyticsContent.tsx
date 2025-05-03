import React from "react";
import { GetPromoterTicketKpisData } from "@/types/convex-types";
import { promoterTicketsKpis } from "@/types/constants";
import KpiCard from "@/components/shared/KpiCard";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import BarChartContainer from "@/components/shared/analytics/BarChart";

interface PromoterTicketAnalyticsContentProps {
  promoterTicketData: GetPromoterTicketKpisData;
}

const PromoterTicketAnalyticsContent = ({
  promoterTicketData,
}: PromoterTicketAnalyticsContentProps) => {
  console.log(promoterTicketData);
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
  return (
    <SectionContainer>
      <KpiGrid>
        {promoterTicketsKpis.map(({ label, key, icon }) => (
          <KpiCard
            key={key}
            label={label}
            value={formatValue(
              key,
              promoterTicketData[key as keyof typeof promoterTicketData] ?? 0
            )}
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
    </SectionContainer>
  );
};

export default PromoterTicketAnalyticsContent;
