import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";
import { failure, loading, QueryResult, success } from "@/types/types";
import { GetGuestListKpisData } from "@/types/convex-types";
import AnalyticsSkeleton from "@/components/shared/skeleton/AnalyticsSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";

type DateRange = { from?: Date | null; to?: Date | null };

export const useGuestListKpis = (
  dateRange: DateRange
): QueryResult<GetGuestListKpisData> => {
  const { organization } = useContextOrganization();
  const organizationId = organization._id;

  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const response = useQuery(
    api.guestListEntries.getGuestListKpis,
    organizationId ? { organizationId, fromTimestamp, toTimestamp } : "skip"
  );

  if (!response) {
    return loading(<AnalyticsSkeleton />);
  }

  if (response.status === ResponseStatus.ERROR || !response.data) {
    return failure(
      <ErrorComponent message={`${response.error || "An error occurred"}.`} />
    );
  }

  return success(response.data);
};
