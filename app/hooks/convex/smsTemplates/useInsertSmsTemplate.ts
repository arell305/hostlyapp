"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { FrontendErrorMessages, type SmsMessageType } from "@/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface InsertSmsTemplateInput {
  body: string;
  messageType: SmsMessageType;
  name: string;
  userId: Id<"users">;
}

interface InsertSmsTemplateResult {
  success: boolean;
  smsTemplateId?: Id<"smsTemplates">;
}

export const useInsertSmsTemplate = () => {
  const [insertSmsTemplateLoading, setLoading] = useState<boolean>(false);
  const [insertSmsTemplateError, setError] = useState<string | null>(null);

  const insertSmsTemplateMutation = useMutation(
    api.smsTemplates.insertSmsTemplate
  );

  const insertSmsTemplate = async (
    data: InsertSmsTemplateInput
  ): Promise<InsertSmsTemplateResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await insertSmsTemplateMutation(data);

      return { success: true, smsTemplateId: response };
    } catch (error) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    insertSmsTemplate,
    insertSmsTemplateLoading,
    insertSmsTemplateError,
    setInsertSmsTemplateError: setError,
  };
};
