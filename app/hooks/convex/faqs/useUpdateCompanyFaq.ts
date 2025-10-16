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
export const useUpdateCompanyFaq = () => {
  const [updateCompanyFaqLoading, setLoading] = useState<boolean>(false);
  const [updateCompanyFaqError, setError] = useState<string | null>(null);

  const updateCompanyFaqMutation = useMutation(api.faq.updateCompanyFaq);

  const updateCompanyFaq = async (
    data: UpdateCompanyFaqInput
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      return await updateCompanyFaqMutation(data);
    } catch (err) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
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
