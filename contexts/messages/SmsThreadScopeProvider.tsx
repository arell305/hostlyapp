"use client";

import { createContext, type ReactNode } from "react";
import type { Id } from "convex/_generated/dataModel";

export type SmsThreadScope = {
  smsThreadId: Id<"smsThreads">;
};

export const SmsThreadScopeContext = createContext<SmsThreadScope | null>(null);

export function SmsThreadScopeProvider({
  smsThreadId,
  children,
}: {
  smsThreadId: Id<"smsThreads">;
  children: ReactNode;
}) {
  return (
    <SmsThreadScopeContext.Provider value={{ smsThreadId }}>
      {children}
    </SmsThreadScopeContext.Provider>
  );
}
