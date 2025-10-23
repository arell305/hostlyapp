import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCustomer(
  organizationId: Id<"organizations">
): Doc<"customers"> | undefined {
  return useQuery(api.customers.getCustomerDetails, { organizationId });
}
