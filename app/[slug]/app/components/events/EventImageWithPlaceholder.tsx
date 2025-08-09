import React, { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

interface EventImageWithPlaceholderProps {
  src?: string | null;
  alt?: string;
}

const EventImageWithPlaceholder: React.FC<EventImageWithPlaceholderProps> = ({
  src,
  alt = "Event Image",
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative rounded-md w-full aspect-[9/16] bg-gray-200 overflow-hidden">
      {/* Skeleton placeholder */}
      {(!src || isLoading) && (
        <div className="absolute inset-0 bg-gray-500 animate-pulse rounded-md" />
      )}

      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="160px"
          onLoadingComplete={() => setIsLoading(false)}
          className={clsx(
            "object-cover rounded-md transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      )}
    </div>
  );
};

export default EventImageWithPlaceholder;
