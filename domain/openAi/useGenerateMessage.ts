import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { UserRole } from "@/shared/types/enums";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

export const useGenerateMessage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateMessage = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      return "Hello, world!";
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  return { generateMessage, isLoading, error, setError };
};
