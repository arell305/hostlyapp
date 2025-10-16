import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useConnectedAccountByClerkUserId():
  | Doc<"connectedAccounts">
  | undefined
  | null {
  return useQuery(api.connectedAccounts.getConnectedAccountByClerkUserId, {});
}
