"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

interface DeleteSmsTemplateInput {
  smsTemplateId: Id<"smsTemplates">;
}

export const useDeleteSmsTemplate = () => {
  const [deleteSmsTemplateLoading, setLoading] = useState<boolean>(false);
  const [deleteSmsTemplateError, setError] = useState<string | null>(null);

  const deleteSmsTemplateMutation = useMutation(
    api.smsTemplates.updateSmsTemplate
  );

  const deleteSmsTemplate = async (
    data: DeleteSmsTemplateInput
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await deleteSmsTemplateMutation({
        smsTemplateId: data.smsTemplateId,
        updates: { isActive: false },
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteSmsTemplate,
    deleteSmsTemplateLoading,
    deleteSmsTemplateError,
    setDeleteSmsTemplateError: setError,
  };
};
