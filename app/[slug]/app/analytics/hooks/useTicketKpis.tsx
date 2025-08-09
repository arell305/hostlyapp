import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";
import { failure, loading, QueryResult, success } from "@/types/types";
import AnalyticsSkeleton from "@/components/shared/skeleton/AnalyticsSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isManager, isPromoter } from "@/utils/permissions";

type DateRange = { from?: Date | null; to?: Date | null };

interface UseTicketKpisArgs {
  dateRange: DateRange;
}

/**
 * Returns KPIs based on permission:
 * - If canViewCompanyAnalytics => calls connectedPayments.getTotalRevenueByOrganization
 * - Else if canViewPromoter     => calls tickets.getPromoterTicketKpis
 * - Else                        => skips
 */
export const useTicketKpis = ({
  dateRange,
}: UseTicketKpisArgs): QueryResult<{
  mode: "company" | "promoter";
  data: any;
}> => {
  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const { organization, orgRole } = useContextOrganization();
  const organizationId = organization._id;

  const useCompany = isManager(orgRole) && !!organizationId;
  const usePromoter = !useCompany && isPromoter(orgRole);

  const response = useCompany
    ? useQuery(api.connectedPayments.getTotalRevenueByOrganization, {
        organizationId,
        fromTimestamp,
        toTimestamp,
      })
    : usePromoter
      ? useQuery(api.tickets.getPromoterTicketKpis, {
          fromTimestamp,
          toTimestamp,
        })
      : undefined; // "skip"

  if (!response) {
    return loading(<AnalyticsSkeleton />);
  }

  if (response.status === ResponseStatus.ERROR || !response.data) {
    return failure(
      <ErrorComponent message={`${response.error || "An error occurred"}.`} />
    );
  }

  return success({
    mode: useCompany ? "company" : "promoter",
    data: response.data,
  });
};
