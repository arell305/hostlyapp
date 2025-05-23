"use client";

import React, { useState } from "react";
import { SubscriptionSchema } from "@/types/schemas-types";
import { SubscriptionTier } from "@/types/enums";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import PageHeading from "@/components/shared/PageHeading";
import PresetRangeDropdown from "@/components/shared/containers/date-filters/PresetRangeDropdown";
import SingleDatePickerModal from "@/components/shared/containers/date-filters/DateRange";
import { PresetOption } from "@/types/constants";
import { getDateRangeFromPreset } from "../../../../utils/luxon";
import { Id } from "../../../../convex/_generated/dataModel";
import TicketAnalyticsPage from "./sections/TicketAnalyticsPage";
import GuestListAnalyticsPage from "./sections/GuestListAnalyticsPage";

const AnalyticsContent = ({
  subscription,
  organizationId,
  canViewPromoter,
  canViewCompanyAnalytics,
}: {
  subscription: SubscriptionSchema;
  organizationId: Id<"organizations">;
  canViewPromoter: boolean;
  canViewCompanyAnalytics: boolean;
}) => {
  const { subscriptionTier } = subscription;
  const hasGuestListAccess =
    subscriptionTier === SubscriptionTier.PLUS ||
    subscriptionTier === SubscriptionTier.ELITE;

  const [selectedTab, setSelectedTab] = useState<"tickets" | "guestlist">(
    "tickets"
  );
  const [preset, setPreset] = useState<PresetOption>("Last 7 Days");

  // Load default range from preset
  const defaultRange = getDateRangeFromPreset("Last 7 Days");

  const [startDate, setStartDate] = useState<Date | null>(
    defaultRange.from ?? null
  );
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.to ?? null);

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: defaultRange.from,
    to: defaultRange.to ?? undefined,
  });

  const handlePresetChange = (newPreset: PresetOption) => {
    setPreset(newPreset);

    if (newPreset !== "Custom") {
      const newRange = getDateRangeFromPreset(newPreset);
      const from = newRange.from;
      const to = newRange.to ?? undefined;

      setStartDate(from ?? null);
      setEndDate(to ?? null);
      setDateRange({ from, to });
    }
  };

  return (
    <section>
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
              onDateChange={(date) => {
                setStartDate(date);
                setPreset("Custom");
              }}
              otherDate={endDate}
              className="rounded-none rounded-l-md border-r border-borderGray"
            />
            <SingleDatePickerModal
              type="end"
              date={endDate}
              onDateChange={(date) => {
                setEndDate(date);
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
        <TicketAnalyticsPage
          organizationId={organizationId}
          dateRange={dateRange}
          canViewPromoter={canViewPromoter}
          canViewCompanyAnalytics={canViewCompanyAnalytics}
        />
      )}
      {selectedTab === "guestlist" && hasGuestListAccess && (
        <GuestListAnalyticsPage
          organizationId={organizationId}
          dateRange={dateRange}
          canViewCompanyAnalytics={canViewCompanyAnalytics}
        />
      )}
    </section>
  );
};

export default AnalyticsContent;
