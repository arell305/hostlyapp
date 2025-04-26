import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";

export interface GetProratedPricesResponse {
  status: ResponseStatus;
  error?: string;
  data?: {
    proratedPrices: Record<string, number>; // Example: { "PLUS": 700, "ELITE": 1200 }
  };
}
export const useGetProratedPrices = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [proratedPrices, setProratedPrices] = useState<Record<
    string,
    number
  > | null>(null);

  const getProratedPricesAction = useAction(api.stripe.getProratedPrices);

  const getProratedPrices = async (): Promise<Record<
    string,
    number
  > | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProratedPricesAction({});

      if (
        response.status === ResponseStatus.SUCCESS &&
        response.data?.proratedPrices
      ) {
        return proratedPrices;
      }

      setError("Unable to retrieve prorated prices.");
      return null;
    } catch (err) {
      console.error(err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getProratedPrices,
    proratedPrices,
    isLoading,
    error,
  };
};
