"use client";

import React from "react";
import GuestListAnalyticsContent from "./GuestListAnalyticsContent";
import { useGuestListKpis } from "../hooks/useGuestListKpis";
import { isError, isLoading } from "@/types/types";

interface GuestListAnalyticsPageProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const GuestListAnalyticsPage = ({ dateRange }: GuestListAnalyticsPageProps) => {
  const result = useGuestListKpis(dateRange);

  if (isLoading(result) || isError(result)) {
    return result.component;
  }

  const guestListKpisData = result.data;

  return <GuestListAnalyticsContent guestListKpisData={guestListKpisData} />;
};

export default GuestListAnalyticsPage;
