"use client";
import { RiArrowRightSLine } from "react-icons/ri";
import Image from "next/image";
import { UserRole, roleMap } from "@/shared/types/enums";
import { capitalizeWords } from "@/shared/utils/helpers";
import ClickableRow from "@shared/ui/cards/ClickableRow";
import Link from "next/link";
import NProgress from "nprogress";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Doc } from "convex/_generated/dataModel";

interface MemberCardProps {
  user: Doc<"users">;
  slug: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ user, slug }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <Link href={`/${slug}/app/team/${user._id}`}>
      <ClickableRow
        onClick={() => {
          NProgress.start();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="relative mr-4 h-16 w-16">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-gray-300" />
            )}
            <Image
              src={user.imageUrl || "https://avatar.iran.liara.run/public"}
              alt={`${user.name}`}
              fill
              sizes="64px"
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "rounded-full object-cover",
                !imageLoaded && "opacity-0"
              )}
            />
          </div>

          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {capitalizeWords(user.name || "Unknown Name")}
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
