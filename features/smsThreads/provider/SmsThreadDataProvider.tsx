"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSmsThreadMessagesContact } from "@/domain/smsMessages";
import { useSmsThreadId } from "@/shared/hooks/contexts/smsThread/useSmsThreadId";
import FullLoading from "@/shared/ui/loading/FullLoading";

type SmsThreadData = NonNullable<
  ReturnType<typeof useSmsThreadMessagesContact>
>;

const SmsThreadDataContext = createContext<SmsThreadData | undefined>(
  undefined
);

export function SmsThreadDataProvider({ children }: { children: ReactNode }) {
  const { smsThreadId } = useSmsThreadId();
  const data = useSmsThreadMessagesContact(smsThreadId);

  if (!data) {
    return <FullLoading />;
  }

  return (
    <SmsThreadDataContext.Provider value={data}>
      {children}
    </SmsThreadDataContext.Provider>
  );
}

export function useSmsThreadData(): SmsThreadData {
  const context = useContext(SmsThreadDataContext);
  if (!context) {
    throw new Error(
      "useSmsThreadData must be used within SmsThreadDataProvider"
    );
  }
  return context;
}
