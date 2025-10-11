import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useSmsTemplates(
  userId: Id<"users">
): Doc<"smsTemplates">[] | undefined {
  return useQuery(api.smsTemplates.getSmsTemplates, { userId });
}
