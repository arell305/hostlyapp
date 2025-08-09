import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";
import { failure, loading, QueryResult, success } from "@/types/types";
import AnalyticsSkeleton from "@/components/shared/skeleton/AnalyticsSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isManager, isPromoter } from "@/utils/permissions";
import {
  GetTotalRevenueByOrganizationData,
  GetPromoterTicketKpisData,
} from "@/types/convex-types";

type DateRange = { from?: Date | null; to?: Date | null };

type TicketKpisResult =
  | { mode: "company"; data: GetTotalRevenueByOrganizationData }
  | { mode: "promoter"; data: GetPromoterTicketKpisData };

interface UseTicketKpisArgs {
  dateRange: DateRange;
}

export const useTicketKpis = ({
  dateRange,
}: UseTicketKpisArgs): QueryResult<TicketKpisResult> => {
  const { organization, orgRole } = useContextOrganization();
  const organizationId = organization?._id;

  const fromTimestamp = dateRange.from?.getTime() ?? 0;
  const toTimestamp = dateRange.to?.getTime() ?? Date.now();

  const canCompany = !!organizationId && isManager(orgRole);
  const canPromoter = !canCompany && isPromoter(orgRole); // company takes priority

  const companyRes = useQuery(
    api.connectedPayments.getTotalRevenueByOrganization,
    canCompany ? { organizationId, fromTimestamp, toTimestamp } : "skip"
  );

  const promoterRes = useQuery(
    api.tickets.getPromoterTicketKpis,
    canPromoter ? { fromTimestamp, toTimestamp } : "skip"
  );

  if (!canCompany && !canPromoter) {
    return failure(
      <ErrorComponent message="You don’t have permission to view analytics." />
    );
  }

  const activeRes = canCompany ? companyRes : promoterRes;

  if (!activeRes) {
    return loading(<AnalyticsSkeleton />);
  }

  if (activeRes.status === ResponseStatus.ERROR || !activeRes.data) {
    return failure(
      <ErrorComponent message={`${activeRes.error || "An error occurred"}.`} />
    );
  }

  return success(
    canCompany
      ? {
          mode: "company",
          data: activeRes.data as GetTotalRevenueByOrganizationData,
        }
      : { mode: "promoter", data: activeRes.data as GetPromoterTicketKpisData }
  );
};
