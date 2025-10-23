"use client";

import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import LabelWrapper from "./LabelWrapper";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";
import { BsFillXCircleFill } from "react-icons/bs";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface LabeledImageUploadFieldProps {
  label: string;
  id: string;
  imageUrl?: string | null;
  isLoading: boolean;
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isEdit?: boolean;
}

const LabeledImageUploadField: React.FC<LabeledImageUploadFieldProps> = ({
  label,
  id,
  imageUrl,
  isLoading,
  error,
  onChange,
  onRemove,
  isEdit = false,
}) => {
  // Show skeleton if loading OR in edit mode with no image
  const showSkeleton = isLoading || (isEdit && !imageUrl);

  return (
    <div>
      <LabelWrapper className="relative">
        <Label htmlFor={id} className="font-bold">
          {label}
        </Label>
        <p className="text-xs text-gray-400 mt-0.5">
          Recommended: 9:16 vertical image (portrait)
        </p>

        {/* Hidden file input */}
        <Input
          type="file"
          id={id}
          onChange={onChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex">
          <Label
            htmlFor={id}
            className={`focus:border-white w-[200px] aspect-[9/16] flex justify-center items-center cursor-pointer relative rounded-lg hover:bg-cardBackgroundHover ${
              imageUrl ? "" : "border-2 border-dashed"
            }`}
          >
            {showSkeleton ? (
              <div className="absolute inset-0 bg-gray-500 animate-pulse rounded-lg" />
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt="Uploaded Preview"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                width={450} // keeps resolution sharp for portrait
                height={800}
              />
            ) : (
              <RiImageAddFill className="text-4xl text-gray-500" />
            )}
          </Label>

          {imageUrl && (
            <BsFillXCircleFill
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-grayText text-3xl rounded-full p-1 cursor-pointer z-10 -ml-3 -mt-4"
            />
          )}
        </div>
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledImageUploadField;
