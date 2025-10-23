"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { api } from "@convex/_generated/api";

export const useCompressAndUploadImage = () => {
  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compressAndUploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: compressedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload image.");
      }

      const { storageId } = await result.json();
      return storageId;
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Unexpected upload error");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { compressAndUploadImage, isUploading, error };
};
