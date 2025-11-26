import type { Id } from "convex/_generated/dataModel";

export function normalizeParam<T extends string = string>(
  raw: string | string[] | undefined
): T | undefined {
  if (typeof raw === "string") {
    return raw as T;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return raw[0] as T;
  }
  return undefined;
}

export function normalizeUserId(
  raw: string | string[] | undefined
): Id<"users"> | undefined {
  return normalizeParam<Id<"users">>(raw);
}

export function normalizeCampaignId(
  raw: string | string[] | undefined
): Id<"campaigns"> | undefined {
  return normalizeParam<Id<"campaigns">>(raw);
}

export function normalizeSlug(
  raw: string | string[] | undefined
): string | undefined {
  return normalizeParam<string>(raw);
}

export function normalizeEventId(
  raw: string | string[] | undefined
): Id<"events"> | undefined {
  return normalizeParam<Id<"events">>(raw);
}

export function normalizeSmsThreadId(
  raw: string | string[] | undefined
): Id<"smsThreads"> | undefined {
  return normalizeParam<Id<"smsThreads">>(raw);
}
