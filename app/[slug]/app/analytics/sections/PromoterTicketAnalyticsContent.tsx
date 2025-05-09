import React from "react";
import { GetPromoterTicketKpisData } from "@/types/convex-types";
import KpiCard from "@/components/shared/KpiCard";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import KpiGrid from "@/components/shared/containers/KpiGrid";
import BarChartContainer from "@/components/shared/analytics/BarChart";
import { UserCheck } from "lucide-react";
import { Users } from "lucide-react";

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

  const promoterTicketsKpis = [
    {
      label: "Females / Day",
      key: "avgFemalesPerDay",
      icon: Users,
      value: promoterTicketData.avgFemalePerDay.value,
      change: promoterTicketData.avgFemalePerDay.change,
    },
    {
      label: "Males / Day",
      key: "avgMalesPerDay",
      icon: UserCheck,
      value: promoterTicketData.avgMalePerDay.value,
      change: promoterTicketData.avgMalePerDay.change,
    },
    {
      label: "Total Females",
      key: "totalFemales",
      icon: Users,
      value: promoterTicketData.totalFemale.value,
      change: promoterTicketData.totalFemale.change,
    },
    {
      label: "Total Males",
      key: "totalMales",
      icon: Users,
      value: promoterTicketData.totalMale.value,
      change: promoterTicketData.totalMale.change,
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
        title="Ticket Sales"
        data={promoterTicketData.dailyTicketSales}
        xKey="date"
        yKey="male"
        barKeys={["male", "female"]}
        barLabel="Ticket Sales"
      />
    </SectionContainer>
  );
};

export default PromoterTicketAnalyticsContent;
