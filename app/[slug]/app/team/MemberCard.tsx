"use client";
import { RiArrowRightSLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { UserRole, roleMap } from "@/types/enums";
import { UserSchema } from "@/types/schemas-types";

interface MemberCardProps {
  user: UserSchema;
}

const MemberCard: React.FC<MemberCardProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}/app/team/${user._id}`;
    router.push(newUrl);
  };

  return (
    <div
      className="h-[95px] border-b w-full hover:bg-cardBackgroundHover cursor-pointer "
      onClick={handleClick}
    >
      <div className="h-full flex items-center justify-between px-4">
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
            <h2 className="text-lg font-semibold">{`${user.name}`} </h2>

            <p className="text-grayText">
              {roleMap[user.role as UserRole] || "No Role"}
            </p>
          </div>
        </div>
        <div className=" relative">
          <RiArrowRightSLine className="text-3xl text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
