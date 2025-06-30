// components/eventForm/EventPhotoSection.tsx
"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import LabeledImageUploadField from "@/components/shared/fields/LabeledImageUploadField";
import { compressAndUploadImage } from "@/utils/image";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { useEventForm } from "@/contexts/EventFormContext";

interface EventPhotoSectionProps {}

const EventPhotoSection: React.FC<EventPhotoSectionProps> = ({}) => {
  const { photoStorageId, setPhotoStorageId, errors, setErrors } =
    useEventForm();
  const [isPhotoLoading, setIsPhotoLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const displayEventPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsPhotoLoading(true);

    try {
      const response = await compressAndUploadImage(file, generateUploadUrl);
      if (response.ok) {
        const { storageId } = await response.json();
        setPhotoStorageId(storageId as Id<"_storage">);
      } else {
        setError("Photo upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Photo upload failed");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoStorageId(null);
    setErrors((prev: typeof errors) => ({
      ...prev,
      photo: undefined,
    }));
  };

  return (
    <LabeledImageUploadField
      id="photo"
      label="Event Photo*"
      imageUrl={displayEventPhoto}
      isLoading={isPhotoLoading}
      error={error || errors.photo}
      onChange={handlePhotoChange}
      onRemove={handleRemovePhoto}
    />
  );
};

export default EventPhotoSection;
