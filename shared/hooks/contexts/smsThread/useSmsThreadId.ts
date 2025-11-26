import {
  SmsThreadScope,
  SmsThreadScopeContext,
} from "@/contexts/messages/SmsThreadScopeProvider";
import { useContext } from "react";

export function useSmsThreadId(): SmsThreadScope {
  const context = useContext(SmsThreadScopeContext);
  if (!context) {
    throw new Error("SmsThreadScopeProvider missing");
  }

  return context;
}
