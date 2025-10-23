"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { GetPromoterTicketKpisData } from "@/shared/types/convex-types";

type PromoterTicketKpisParams = {
  fromTimestamp: number;
  toTimestamp: number;
};

export function usePromoterTicketKpis(
  params: PromoterTicketKpisParams,
  enabled: boolean
): GetPromoterTicketKpisData | undefined {
  const { fromTimestamp, toTimestamp } = params;

  return useQuery(
    api.tickets.getPromoterTicketKpis,
    enabled ? { fromTimestamp, toTimestamp } : "skip"
  );
}
