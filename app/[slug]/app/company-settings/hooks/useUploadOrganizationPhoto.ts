import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { ResponseStatus } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { compressAndUploadImage } from "../../../../../utils/image";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUploadOrganizationPhoto = () => {
  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const updateClerkOrganizationPhoto = useAction(
    api.clerk.updateClerkOrganizationPhoto
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadOrganizationPhoto = async (
    file: File,
    organizationId: Id<"organizations">
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await compressAndUploadImage(file, generateUploadUrl);
      if (!response.ok) throw new Error("Photo upload failed");

      const { storageId } = await response.json();

      const updateResponse = await updateClerkOrganizationPhoto({
        organizationId,
        photo: storageId as Id<"_storage">,
      });

      if (updateResponse.status !== ResponseStatus.SUCCESS) {
        throw new Error("Photo update failed");
      }

      return true;
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Photo update failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadOrganizationPhoto,
    isLoading,
    error,
    setError,
  };
};
