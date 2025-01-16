"use client";
import { UserRole, roleMap } from "../../../../utils/enum";
import { RiArrowRightSLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface MemberCardProps {
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl: string;
  clerkUserId: string;
  isCurrentUser: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  firstName,
  lastName,
  role,
  imageUrl,
  clerkUserId,
  isCurrentUser,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = () => {
    const companyName = pathname.split("/")[1];
    const newUrl = `/${companyName}/app/team/${clerkUserId}`;
    router.push(newUrl);
  };

  return (
    <div
      className="h-[95px] border-b border-gray-300 p-4 w-full hover:bg-gray-100 cursor-pointer hover:rounded-md"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between">
          <img
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {`${firstName} ${lastName}`}{" "}
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
