"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import {
  FrontendErrorMessages,
  ResponseStatus,
  type SmsMessageType,
} from "@/types/enums";
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

interface UpdateSmsTemplateResult {
  success: boolean;
  smsTemplateId?: Id<"smsTemplates">;
}

export const useUpdateSmsTemplate = () => {
  const [updateSmsTemplateLoading, setLoading] = useState<boolean>(false);
  const [updateSmsTemplateError, setError] = useState<string | null>(null);

  const updateSmsTemplateMutation = useMutation(
    api.smsTemplates.updateSmsTemplate
  );

  const updateSmsTemplate = async (
    data: UpdateSmsTemplateInput
  ): Promise<UpdateSmsTemplateResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateSmsTemplateMutation(data);

      if (response?.status === ResponseStatus.SUCCESS) {
        return { success: true, smsTemplateId: response.data.smsTemplateId };
      }

      console.error(response?.data);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } catch (err) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
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
