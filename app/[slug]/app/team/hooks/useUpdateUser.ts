import { useMutation } from "convex/react";
import { UserRole } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { setErrorFromConvexError } from "@/lib/errorHelper";

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
      return await updateUser({ userId, update });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUserById, error, isLoading, setError };
};
