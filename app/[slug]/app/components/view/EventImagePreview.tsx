import { useQuery } from "convex/react";
import Image from "next/image";
import React from "react";
import EventFormSkeleton from "../loading/EventFormSkeleton";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface EventImagePreviewProps {
  storageId?: Id<"_storage"> | null;
  alt?: string;
  className?: string;
  aspectRatio?: string;
}

const EventImagePreview: React.FC<EventImagePreviewProps> = ({
  storageId,
  alt = "Event Image",
  className,
  aspectRatio = "aspect-[4/5]",
}) => {
  const fileUrl = useQuery(
    api.photo.getFileUrl,
    storageId ? { storageId } : "skip"
  );

  if (!fileUrl || typeof fileUrl !== "string") {
    return <EventFormSkeleton />;
  }

  return (
    <div className={`relative w-full ${aspectRatio}`}>
      <Image
        src={fileUrl}
        alt={alt}
        fill
        className={`object-cover rounded-md ${className}`}
      />
    </div>
  );
};

export default EventImagePreview;
