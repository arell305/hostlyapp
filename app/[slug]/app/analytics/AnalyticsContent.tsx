"use client";

import React, { useMemo, useState } from "react";
import { SubscriptionTier } from "@/types/enums";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import PageHeading from "@/components/shared/PageHeading";
import PresetRangeDropdown from "@/components/shared/containers/date-filters/PresetRangeDropdown";
import SingleDatePickerModal from "@/components/shared/containers/date-filters/DateRange";
import { PresetOption } from "@/types/constants";
import { getDateRangeFromPreset } from "../../../../utils/luxon";
import TicketAnalyticsPage from "./sections/TicketAnalyticsPage";
import GuestListAnalyticsPage from "./sections/GuestListAnalyticsPage";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import PageContainer from "@/components/shared/containers/PageContainer";

const AnalyticsContent = () => {
  const { subscription } = useContextOrganization();
  const { subscriptionTier } = subscription;
  const hasGuestListAccess =
    subscriptionTier === SubscriptionTier.PLUS ||
    subscriptionTier === SubscriptionTier.ELITE;

  const [selectedTab, setSelectedTab] = useState<"tickets" | "guestlist">(
    "tickets"
  );
  const [preset, setPreset] = useState<PresetOption>("Last 7 Days");

  // Default range from preset
  const defaultRange = getDateRangeFromPreset("Last 7 Days");

  const [startDate, setStartDate] = useState<Date | null>(
    defaultRange.from ?? null
  );
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.to ?? null);

  // 👉 Derive dateRange so it always updates when start/end change
  const dateRange = useMemo(
    () => ({
      from: startDate ?? undefined,
      to: endDate ?? undefined,
    }),
    [startDate, endDate]
  );

  const handlePresetChange = (newPreset: PresetOption) => {
    setPreset(newPreset);

    if (newPreset !== "Custom") {
      const newRange = getDateRangeFromPreset(newPreset);
      const from = newRange.from ?? null;
      const to = newRange.to ?? null;

      setStartDate(from);
      setEndDate(to);
      // no setDateRange needed — it's derived from start/end
    }
  };

  return (
    <PageContainer>
      <PageHeading
        title="Analytics"
        presetDropdown={
          <PresetRangeDropdown value={preset} onChange={handlePresetChange} />
        }
        datePicker={
          <div className="inline-flex rounded-md overflow-hidden border border-borderGray">
            <SingleDatePickerModal
              type="start"
              date={startDate}
              onDateChange={(d) => {
                setStartDate(d);
                setPreset("Custom");
              }}
              otherDate={endDate}
              className="rounded-none rounded-l-md border-r border-borderGray"
            />
            <SingleDatePickerModal
              type="end"
              date={endDate}
              onDateChange={(d) => {
                setEndDate(d);
                setPreset("Custom");
              }}
              otherDate={startDate}
              className="rounded-none rounded-r-md"
            />
          </div>
        }
      />

      <div className="mb-4">
        {hasGuestListAccess && (
          <ToggleTabs
            options={[
              { label: "Tickets", value: "tickets" },
              { label: "Guest Lists", value: "guestlist" },
            ]}
            value={selectedTab}
            onChange={setSelectedTab}
          />
        )}
      </div>

      {selectedTab === "tickets" && (
        <TicketAnalyticsPage dateRange={dateRange} />
      )}
      {selectedTab === "guestlist" && hasGuestListAccess && (
        <GuestListAnalyticsPage dateRange={dateRange} />
      )}
    </PageContainer>
  );
};

export default AnalyticsContent;
