"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FrontendErrorMessages } from "@/types/enums";

interface InsertContactInput {
  name: string;
  userId: Id<"users">;
  phoneNumber: string;
}

interface InsertContactResult {
  success: boolean;
  contactId?: Id<"contacts">;
}

export const useInsertContact = () => {
  const [insertContactLoading, setLoading] = useState<boolean>(false);
  const [insertContactError, setError] = useState<string | null>(null);

  const insertContactMutation = useMutation(api.contacts.insertContact);

  const insertContact = async (
    data: InsertContactInput
  ): Promise<InsertContactResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await insertContactMutation(data);
      return { success: true, contactId: response };
    } catch (error) {
      console.error(error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
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
