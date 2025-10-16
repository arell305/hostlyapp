"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useStripeDashboardLink = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getStripeDashboardLink = useAction(api.stripe.getStripeDashboardUrl);

  const fetchDashboardLink = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      return await getStripeDashboardLink();
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return null;
    }
  };

  return {
    fetchDashboardLink,
    isLoading,
    error,
    setError,
  };
};
