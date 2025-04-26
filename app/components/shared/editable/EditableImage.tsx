"use client";

import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RiImageAddFill } from "react-icons/ri";
import Loading from "@/[slug]/app/components/loading/Loading";

interface EditableImageProps {
  displayImage: string | null | undefined;
  isEditing: boolean;
  canEdit: boolean;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({
  displayImage,
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
            className="rounded-md object-cover"
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
        <div className="relative w-[100px] h-[100px] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
          {canEdit && isEditing && (
            <Label className="block w-full h-full cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={onChange}
                className="hidden"
              />
              {isLoading ? (
                <Loading />
              ) : (
                <RiImageAddFill className="text-4xl text-gray-500" />
              )}
            </Label>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableImage;
