"use client";

import Image from "next/image";
import { Label } from "@shared/ui/primitive/label";
import { Input } from "@shared/ui/primitive/input";
import { RiImageAddFill } from "react-icons/ri";
import Loading from "@shared/ui/loading/Loading";
import { getInitial, capitalizeWords } from "@/shared/utils/helpers";
import InitialAvatar from "../avatars/InitialAvatar";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface EditableImageProps {
  displayImage: string | null | undefined;
  companyName?: string | null;
  isEditing: boolean;
  canEdit: boolean;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

const EditableImage: React.FC<EditableImageProps> = ({
  displayImage,
  companyName = "",
  isEditing,
  canEdit,
  isLoading,
  onChange,
  error,
}) => {
  return (
    <div className="flex items-center flex-col">
      <div className="relative w-[100px] h-[100px]">
        {displayImage === undefined ? (
          // Skeleton placeholder when image is loading
          <div className="w-full h-full rounded-full bg-gray-300 animate-pulse" />
        ) : displayImage ? (
          <Image
            src={displayImage}
            alt="Company Logo"
            fill
            sizes="100px"
            className="rounded-full object-cover aspect-square"
            loading="eager"
          />
        ) : (
          <InitialAvatar
            initial={getInitial(companyName)}
            size={100}
            textSize="text-2xl"
            bgColor="bg-gray-600"
          />
        )}

        {canEdit && isEditing && (
          <Label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-full z-10">
            <Input
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
            />
            {isLoading ? (
              <Loading />
            ) : (
              <RiImageAddFill className="text-4xl text-white" />
            )}
          </Label>
        )}
      </div>

      {!isEditing && (
        <h2 className="mt-2 text-2xl font-semibold">
          {capitalizeWords(companyName || "Unknown Company")}
        </h2>
      )}

      {error && <FieldErrorMessage error={error} />}
    </div>
  );
};

export default EditableImage;
