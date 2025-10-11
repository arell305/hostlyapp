"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FrontendErrorMessages } from "@/types/enums";

interface InsertCompanyFaqInput {
  organizationId: Id<"organizations">;
  question: string;
  answer: string;
}

interface InsertCompanyFaqResult {
  success: boolean;
  faqId?: Id<"faq">;
}

export const useInsertCompanyFaq = () => {
  const [insertCompanyFaqLoading, setLoading] = useState<boolean>(false);
  const [insertCompanyFaqError, setError] = useState<string | null>(null);

  const insertCompanyFaqMutation = useMutation(api.faq.insertCompanyFaq);

  const insertCompanyFaq = async (
    data: InsertCompanyFaqInput
  ): Promise<InsertCompanyFaqResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await insertCompanyFaqMutation(data);

      return { success: true, faqId: response };
    } catch (error) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    insertCompanyFaq,
    insertCompanyFaqLoading,
    insertCompanyFaqError,
    setInsertCompanyFaqError: setError,
  };
};
