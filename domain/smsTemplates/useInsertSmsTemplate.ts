"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import {
  FrontendErrorMessages,
  type SmsMessageType,
} from "@shared/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface InsertSmsTemplateInput {
  body: string;
  messageType: SmsMessageType;
  name: string;
  userId: Id<"users">;
}

export const useInsertSmsTemplate = () => {
  const [insertSmsTemplateLoading, setLoading] = useState<boolean>(false);
  const [insertSmsTemplateError, setError] = useState<string | null>(null);

  const insertSmsTemplateMutation = useMutation(
    api.smsTemplates.insertSmsTemplate
  );

  const insertSmsTemplate = async (
    data: InsertSmsTemplateInput
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await insertSmsTemplateMutation(data);
    } catch (error) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
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
