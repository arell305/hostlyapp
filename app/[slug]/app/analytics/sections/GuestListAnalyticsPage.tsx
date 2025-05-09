"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { GetGuestListKpisData } from "@/types/convex-types";
import { QueryState } from "@/types/enums";
import GuestListAnalyticsContent from "./GuestListAnalyticsContent";

interface GuestListAnalyticsPageProps {
  organizationId: Id<"organizations">;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  canViewCompanyAnalytics: boolean;
}

const GuestListAnalyticsPage = ({
  organizationId,
  dateRange,
  canViewCompanyAnalytics,
}: GuestListAnalyticsPageProps) => {
  const guestListData = useQuery(api.guestListEntries.getGuestListKpis, {
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
    <GuestListAnalyticsContent
      canViewCompanyAnalytics={canViewCompanyAnalytics}
      guestListKpisData={guestListKpisData}
    />
  );
};

export default GuestListAnalyticsPage;
