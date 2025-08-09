import { useQuery } from "convex/react";
import Image from "next/image";
import React, { useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import clsx from "clsx";

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
  aspectRatio = "aspect-[9/16]",
}) => {
  const fileUrl = useQuery(
    api.photo.getFileUrl,
    storageId ? { storageId } : "skip"
  );
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={clsx("relative w-full", aspectRatio)}>
      {(!fileUrl || isLoading) && (
        <div className="absolute inset-0 bg-gray-500 animate-pulse rounded-md" />
      )}
      {fileUrl && (
        <Image
          src={fileUrl}
          alt={alt}
          fill
          onLoadingComplete={() => setIsLoading(false)}
          className={clsx(
            "object-cover rounded-md transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
        />
      )}
    </div>
  );
};

export default EventImagePreview;
