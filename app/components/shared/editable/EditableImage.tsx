"use client";

import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RiImageAddFill } from "react-icons/ri";
import Loading from "@/[slug]/app/components/loading/Loading";
import { getInitial } from "@/utils/helpers";
import InitialAvatar from "../avatars/InitialAvatar";

interface EditableImageProps {
  displayImage: string | null | undefined;
  companyName?: string | null;
  isEditing: boolean;
  canEdit: boolean;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({
  displayImage,
  companyName = "",
  isEditing,
  canEdit,
  isLoading,
  onChange,
}) => {
  return (
    <div className="relative">
      {displayImage ? (
        <div className="relative w-[200px] h-[200px]">
          <Image
            src={displayImage}
            alt="Image"
            fill
            sizes="200px"
            className="rounded-full object-cover"
          />
          {canEdit && isEditing && (
            <Label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-md">
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
      ) : (
        <div>
          <InitialAvatar
            initial={getInitial(companyName)}
            size={140}
            textSize="text-4xl"
            bgColor="bg-gray-600"
          />

          {canEdit && isEditing && (
            <Label className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-full">
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
      )}
    </div>
  );
};

export default EditableImage;
