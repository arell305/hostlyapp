import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { compressAndUploadImage } from "../../../../../utils/image";
import { Id } from "../../../../../convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

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
      if (!response.ok) {
        throw new Error("Photo upload failed");
      }
      const { storageId } = await response.json();

      return await updateClerkOrganizationPhoto({
        organizationId,
        photo: storageId as Id<"_storage">,
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
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
