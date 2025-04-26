import { useMutation } from "convex/react";
import { FrontendErrorMessages, ResponseStatus, UserRole } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";

export const useUpdateUser = () => {
  const updateUser = useMutation(api.users.updateUserById);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserById = async (
    userId: Id<"users">,
    update: {
      role?: UserRole;
      isActive?: boolean;
    }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateUser({ userId, update });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error);
      return false;
    } catch (error) {
      console.error(error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUserById, error, isLoading, setError };
};
