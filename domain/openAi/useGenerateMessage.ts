import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

export const useGenerateMessage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const generateMessageAction = useAction(api.openAi.generateMessage);
  const generateMessage = async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await generateMessageAction({ prompt });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateMessage, isLoading, error };
};
