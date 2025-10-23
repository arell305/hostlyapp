"use client";

import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

export function useContacts(
  userId?: Id<"users">
): Doc<"contacts">[] | undefined {
  return useQuery(api.contacts.getContacts, userId ? { userId } : "skip");
}
