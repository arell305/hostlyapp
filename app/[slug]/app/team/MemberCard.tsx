"use client";
import { RiArrowRightSLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { UserRole, roleMap } from "@/types/enums";

interface MemberCardProps {
  name?: string;
  role: UserRole;
  imageUrl?: string;
  clerkUserId: string;
  isCurrentUser: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  role,
  imageUrl,
  clerkUserId,
  isCurrentUser,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}/app/team/${clerkUserId}`;
    router.push(newUrl);
  };

  return (
    <div
      className="h-[95px] border-b border-gray-300 p-4 w-full hover:bg-gray-100 cursor-pointer "
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between">
          <Image
            src={imageUrl || "https://avatar.iran.liara.run/public"}
            alt={`${name}`}
            className="rounded-full w-16 h-16 object-cover mr-4"
            width={64}
            height={64}
          />
          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {`${name}`}{" "}
              {isCurrentUser && (
                <span className="text-customDarkBlue text-sm">You</span>
              )}
            </h2>

            <p className="text-gray-800">{roleMap[role] || role}</p>
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
