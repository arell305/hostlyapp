import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useSmsTemplate(
  smsTemplateId?: Id<"smsTemplates"> | null
): Doc<"smsTemplates"> | undefined {
  return useQuery(
    api.smsTemplates.getSmsTemplate,
    smsTemplateId ? { smsTemplateId } : "skip"
  );
}
