"use client";

import React from "react";
import Image from "next/image";
import { capitalizeWords } from "@/utils/helpers";

interface ProfileHeaderProps {
  imageUrl?: string | null;
  name?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ imageUrl, name }) => {
  return (
    <div className="flex items-center flex-col my-4">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Profile Image"
          width={100}
          height={100}
          className="rounded-full object-cover aspect-square w-[100px] h-[100px]"
        />
      )}
      <h2 className="mt-2 text-2xl font-semibold">
        {capitalizeWords(name || "Unknown Name")}
      </h2>
    </div>
  );
};

export default ProfileHeader;
