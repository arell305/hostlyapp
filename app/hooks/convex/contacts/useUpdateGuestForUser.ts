"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

interface UpdateContactInput {
  contactId: Id<"contacts">;
  updates: {
    body?: string;
    phoneNumber?: string;
    isActive?: boolean;
    name?: string;
  };
}

export const useUpdateContact = () => {
  const [updateContactLoading, setLoading] = useState<boolean>(false);
  const [updateContactError, setError] = useState<string | null>(null);

  const updateContactMutation = useMutation(api.contacts.updateContact);

  const updateContact = async (data: UpdateContactInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { contactId, updates } = data;
    try {
      return await updateContactMutation({
        contactId,
        updates,
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
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
