"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";
import { Id } from "@/convex/_generated/dataModel";

interface UseCreateSmsMessage {
  createSmsMessage: (args: {
    message: string;
    threadId: Id<"smsThreads">;
    direction: "inbound" | "outbound";
  }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useCreateSmsMessage(): UseCreateSmsMessage {
  const createSmsMessageAction = useAction(api.smsMessages.createSmsMessage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSmsMessage = async ({
    message,
    threadId,
    direction,
  }: {
    threadId: Id<"smsThreads">;
    direction: "inbound" | "outbound";
    message: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await createSmsMessageAction({ message, threadId, direction });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createSmsMessage, loading, error };
}
