"use client";

import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

export function useSmsThreadMessagesContact(smsThreadId: Id<"smsThreads">):
  | {
      smsThread: Doc<"smsThreads">;
      contact: Doc<"contacts">;
      smsMessages: Doc<"smsMessages">[];
      user: Doc<"users">;
    }
  | undefined {
  return useQuery(api.smsThreads.getSmsThreadMessagesContact, {
    id: smsThreadId,
  });
}
