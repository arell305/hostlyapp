"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { FrontendErrorMessages, type SmsMessageType } from "@/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface UpdateSmsTemplateInput {
  smsTemplateId: Id<"smsTemplates">;
  updates: {
    body?: string;
    messageType?: SmsMessageType;
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
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
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
