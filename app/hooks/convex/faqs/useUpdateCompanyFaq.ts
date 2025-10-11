"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { FrontendErrorMessages } from "@/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface UpdateCompanyFaqInput {
  faqId: Id<"faq">;
  updates: {
    question?: string;
    answer?: string;
    isActive?: boolean;
  };
}

interface UpdateCompanyFaqResult {
  success: boolean;
  faqId?: Id<"faq">;
}

export const useUpdateCompanyFaq = () => {
  const [updateCompanyFaqLoading, setLoading] = useState<boolean>(false);
  const [updateCompanyFaqError, setError] = useState<string | null>(null);

  const updateCompanyFaqMutation = useMutation(api.faq.updateCompanyFaq);

  const updateCompanyFaq = async (
    data: UpdateCompanyFaqInput
  ): Promise<UpdateCompanyFaqResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateCompanyFaqMutation(data);

      return { success: true, faqId: response };
    } catch (err) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCompanyFaq,
    updateCompanyFaqLoading,
    updateCompanyFaqError,
    setUpdateCompanyFaqError: setError,
  };
};
