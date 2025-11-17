"use client";

import { useMemo, useState } from "react";
import { SubscriptionTier } from "@shared/types/enums";
import ToggleTabs from "@shared/ui/toggle/ToggleTabs";
import PageHeading from "@shared/ui/headings/PageHeading";
import PresetRangeDropdown from "@shared/ui/containers/date-filters/PresetRangeDropdown";
import SingleDatePickerModal from "@shared/ui/containers/date-filters/DateRange";
import { PresetOption } from "@shared/types/constants";
import { getDateRangeFromPreset } from "@shared/utils/luxon";
import TicketAnalyticsPage from "./tickets/TicketAnalyticsPage";
import GuestListAnalyticsPage from "./guestList/GuestListAnalyticsPage";
import { useContextOrganization } from "@/shared/hooks/contexts";
import PageContainer from "@shared/ui/containers/PageContainer";

const AnalyticsContent = () => {
  const { subscription } = useContextOrganization();
  const { subscriptionTier } = subscription;
  const hasGuestListAccess =
    subscriptionTier === "Plus" || subscriptionTier === "Elite";

  const [selectedTab, setSelectedTab] = useState<"tickets" | "guestlist">(
    "tickets"
  );
  const [preset, setPreset] = useState<PresetOption>("Last 7 Days");

  const defaultRange = getDateRangeFromPreset("Last 7 Days");

  const [startDate, setStartDate] = useState<Date | null>(
    defaultRange.from ?? null
  );
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.to ?? null);

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
