"use client";
import { RiArrowRightSLine } from "react-icons/ri";
import Image from "next/image";
import { UserRole, roleMap } from "@/types/enums";
import { UserSchema } from "@/types/schemas-types";
import { capitalizeWords } from "@/utils/helpers";
import ClickableRow from "@/components/shared/cards/ClickableRow";
import Link from "next/link";

interface MemberCardProps {
  user: UserSchema;
  slug: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ user, slug }) => {
  return (
    <Link href={`/${slug}/app/team/${user._id}`}>
      <ClickableRow>
        {" "}
        <div className="flex items-center justify-between">
          <Image
            src={user.imageUrl || "https://avatar.iran.liara.run/public"}
            alt={`${user.name}`}
            className="rounded-full w-16 h-16 object-cover mr-4"
            width={64}
            height={64}
          />
          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {`${capitalizeWords(user.name || "Unknown Name")}`}
            </h2>

            <p className="text-grayText">
              {roleMap[user.role as UserRole] || "No Role"}
            </p>
          </div>
        </div>
        <div className=" relative">
          <RiArrowRightSLine className="text-3xl text-gray-600" />
        </div>
      </ClickableRow>
    </Link>
  );
};

export default MemberCard;
