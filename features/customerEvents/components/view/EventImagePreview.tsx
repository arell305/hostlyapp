"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/shared/lib/utils";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div className={cn("relative w-full", aspectRatio)}>
      {(!fileUrl || isLoading) && (
        <div className="absolute inset-0 rounded-md bg-gray-500 animate-pulse" />
      )}
      {fileUrl && (
        <Image
          src={fileUrl}
          alt={alt}
          fill
          sizes="160px"
          onLoad={() => setIsLoading(false)}
          className={cn(
            "rounded-md object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
        />
      )}
    </div>
  );
};

export default EventImagePreview;
