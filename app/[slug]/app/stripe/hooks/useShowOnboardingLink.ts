"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { ResponseStatus } from "@/types/enums";
import { FrontendErrorMessages } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";

export const useShowOnboardingLink = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createStripeOnboardingLinkAction = useAction(
    api.stripe.createStripeOnboardingLink
  );

  const getOnboardingLink = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const response = await createStripeOnboardingLinkAction({ origin });

      if (response.status === ResponseStatus.SUCCESS && response.data) {
        return response.data.url;
      }

      console.error(response.error);
      setError(response.error || FrontendErrorMessages.GENERIC_ERROR);
      return null;
    } catch (error) {
      console.error(error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getOnboardingLink,
    isLoading,
    error,
    setError,
  };
};
