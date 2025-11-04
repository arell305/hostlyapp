"use client";

import { useState } from "react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

type BulkUpsertRow = { name: string; phoneNumber: string };

export function useBulkUpsertContacts() {
  const bulkUpsertMutation = useMutation(api.contacts.bulkUpsertContacts);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpsert = async (args: {
    userId: Id<"users">;
    rows: BulkUpsertRow[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      return await bulkUpsertMutation(args);
    } catch (caughtError: unknown) {
      setErrorFromConvexError(caughtError, setError);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { bulkUpsert, loading, error, setError };
}
