import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import type { EventWithExtras } from "@/types/convex-types";
import CalendarSwitcherLoading from "@/components/shared/skeleton/ CalendarSwitcherLoading";

export const useMonthlyEvents = (
  opts: { month: number; year: number },
  isWeekView: boolean
) => {
  const { organization } = useContextOrganization();
  const { month, year } = opts;

  const res = useQuery(api.events.getEventsByMonth, {
    organizationId: organization._id,
    year,
    month,
  });

  if (res === undefined) {
    return {
      component: (
        <CalendarSwitcherLoading isWeekView={isWeekView} date={new Date()} />
      ),
      events: null as EventWithExtras[] | null,
    };
  }

  if (res.status === ResponseStatus.ERROR) {
    return {
      component: (
        <ErrorComponent message={`${res.error || "Failed to load events"}. `} />
      ),
      events: null as EventWithExtras[] | null,
    };
  }

  return {
    component: null,
    events: (res.data?.eventData ?? []) as EventWithExtras[],
  };
};
