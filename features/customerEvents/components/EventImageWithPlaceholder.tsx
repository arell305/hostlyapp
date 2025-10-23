"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface EventImageWithPlaceholderProps {
  src?: string | null;
  alt?: string;
  priority?: boolean;
}

const EventImageWithPlaceholder: React.FC<EventImageWithPlaceholderProps> = ({
  src,
  alt = "Event Image",
  priority = false,
}) => {
  const initialLoading = useMemo<boolean>(() => Boolean(src), [src]);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);

  return (
    <div className="relative w-full aspect-[9/16] overflow-hidden rounded-md bg-gray-200">
      {(!src || isLoading) && (
        <div className="absolute inset-0 rounded-md bg-gray-500 animate-pulse" />
      )}
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="160px"
          priority={priority}
          onLoad={() => setIsLoading(false)}
          className={cn(
            "object-cover rounded-md transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      )}
    </div>
  );
};

export default EventImageWithPlaceholder;
