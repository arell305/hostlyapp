"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { FrontendErrorMessages } from "@/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface UpdateContactInput {
  contactId: Id<"contacts">;
  updates: {
    body?: string;
    phoneNumber?: string;
    isActive?: boolean;
    name?: string;
  };
}

interface UpdateContactResult {
  success: boolean;
  contactId?: Id<"contacts">;
}

export const useUpdateContact = () => {
  const [updateContactLoading, setLoading] = useState<boolean>(false);
  const [updateContactError, setError] = useState<string | null>(null);

  const updateContactMutation = useMutation(api.contacts.updateContact);

  const updateContact = async (
    data: UpdateContactInput
  ): Promise<UpdateContactResult> => {
    setLoading(true);
    setError(null);
    const { contactId, updates } = data;
    try {
      const response = await updateContactMutation({
        contactId,
        updates,
      });

      return { success: true, contactId: response };
    } catch (err) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateContact,
    updateContactLoading,
    updateContactError,
    setUpdateContactError: setError,
  };
};
