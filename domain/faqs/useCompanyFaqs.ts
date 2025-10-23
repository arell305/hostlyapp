import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCompanyFaqs(
  organizationId: Id<"organizations">
): Doc<"faq">[] | undefined {
  return useQuery(api.faq.getCompanyFaqs, { organizationId });
}
