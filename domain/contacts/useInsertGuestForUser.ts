"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

interface InsertContactInput {
  name: string;
  userId: Id<"users">;
  phoneNumber: string;
}

export const useInsertContact = () => {
  const [insertContactLoading, setLoading] = useState<boolean>(false);
  const [insertContactError, setError] = useState<string | null>(null);

  const insertContactMutation = useMutation(api.contacts.insertContact);

  const insertContact = async (data: InsertContactInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await insertContactMutation(data);
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    insertContact,
    insertContactLoading,
    insertContactError,
    setInsertContactError: setError,
  };
};
