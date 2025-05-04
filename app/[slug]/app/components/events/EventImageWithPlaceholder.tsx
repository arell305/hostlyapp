import React from "react";
import Image from "next/image";

interface EventImageWithPlaceholderProps {
  src?: string | null;
  alt?: string;
}

const EventImageWithPlaceholder: React.FC<EventImageWithPlaceholderProps> = ({
  src,
  alt = "Event Image",
}) => {
  return (
    <div className="relative rounded-md w-full aspect-[4/5] bg-gray-200 overflow-hidden">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-md transition-opacity duration-300"
          sizes="160px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
          Loading image...
        </div>
      )}
    </div>
  );
};

export default EventImageWithPlaceholder;
