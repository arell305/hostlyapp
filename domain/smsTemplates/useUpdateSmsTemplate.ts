"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

interface UpdateSmsTemplateInput {
  smsTemplateId: Id<"smsTemplates">;
  updates: {
    body?: string;
    name?: string;
    isActive?: boolean;
  };
}

export const useUpdateSmsTemplate = () => {
  const [updateSmsTemplateLoading, setLoading] = useState<boolean>(false);
  const [updateSmsTemplateError, setError] = useState<string | null>(null);

  const updateSmsTemplateMutation = useMutation(
    api.smsTemplates.updateSmsTemplate
  );

  const updateSmsTemplate = async (
    data: UpdateSmsTemplateInput
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await updateSmsTemplateMutation(data);
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateSmsTemplate,
    updateSmsTemplateLoading,
    updateSmsTemplateError,
    setUpdateSmsTemplateError: setError,
  };
};
