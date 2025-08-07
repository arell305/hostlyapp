"use client";
import { RiArrowRightSLine } from "react-icons/ri";
import Image from "next/image";
import { UserRole, roleMap } from "@/types/enums";
import { UserSchema } from "@/types/schemas-types";
import { capitalizeWords } from "@/utils/helpers";
import ClickableRow from "@/components/shared/cards/ClickableRow";
import Link from "next/link";
import NProgress from "nprogress";
import { useState } from "react";
import clsx from "clsx";

interface MemberCardProps {
  user: UserSchema;
  slug: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ user, slug }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/${slug}/app/team/${user._id}`}>
      <ClickableRow
        onClick={() => {
          NProgress.start();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="relative w-16 h-16 mr-4">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse rounded-full" />
            )}
            <Image
              src={user.imageUrl || "https://avatar.iran.liara.run/public"}
              alt={`${user.name}`}
              className={clsx(
                "rounded-full object-cover",
                !imageLoaded && "opacity-0"
              )}
              fill
              onLoadingComplete={() => setImageLoaded(true)}
            />
          </div>

          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {`${capitalizeWords(user.name || "Unknown Name")}`}
            </h2>
            <p className="text-grayText">
              {roleMap[user.role as UserRole] || "No Role"}
            </p>
          </div>
        </div>

        <div className="relative">
          <RiArrowRightSLine className="text-3xl text-gray-600" />
        </div>
      </ClickableRow>
    </Link>
  );
};

export default MemberCard;
