import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserRole, roleMap } from "../../../../../utils/enum";
import { GoPencil } from "react-icons/go";
import { UserWithPromoCode } from "@/types/types";

interface UserIdContentProps {
  userData: UserWithPromoCode;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  has: any;
  isCurrentUser: boolean;
  onReactivateUser: () => void;
  errorResumeUser: string | null;
  loadingReactivate: boolean;
}
const UserIdContent: React.FC<UserIdContentProps> = ({
  userData,
  onBack,
  onDelete,
  onEdit,
  has,
  isCurrentUser,
  onReactivateUser,
  errorResumeUser,
  loadingReactivate,
}) => {
  const isHostlyPage = userData.role === UserRole.Hostly_Moderator;
  const isAdmin = has({ role: UserRole.Admin });
  const isHostlyAdmin =
    has({ role: UserRole.Hostly_Admin }) ||
    has({ role: UserRole.Hostly_Moderator });
  const canEditUsers =
    has({ role: UserRole.Manager }) || (isAdmin && !isCurrentUser);
  const canDeleteAdminMods = isHostlyPage && isHostlyAdmin;
  return (
    <section className="container mx-auto  max-w-3xl ">
      <div className="flex justify-between mt-4">
        <Button variant="navGhost" onClick={onBack}>
          Back
        </Button>
        {canEditUsers ||
          (canDeleteAdminMods && userData.isActive && (
            <Button variant="navGhost" onClick={onDelete}>
              Delete
            </Button>
          ))}
        {canEditUsers ||
          (canDeleteAdminMods && !userData.isActive && (
            <>
              <Button
                disabled={loadingReactivate}
                variant="navGhost"
                onClick={onReactivateUser}
              >
                {loadingReactivate ? "Reactivating..." : "Reactivate"}
              </Button>
              <p
                className={`pl-4 text-sm mt-1 ${errorResumeUser ? "text-red-500" : "text-transparent"}`}
              >
                {errorResumeUser || "Placeholder to maintain height"}
              </p>{" "}
            </>
          ))}
      </div>
      <div className="flex items-center flex-col mb-4">
        {userData.imageUrl && (
          <Image
            src={userData.imageUrl}
            alt="Profile Image"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        )}

        <h2 className="mt-2 text-2xl font-semibold font-playfair">
          {userData.name}
        </h2>
      </div>
      <div className="px-4  flex justify-between border-b  py-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email: </h3>
          <p className="text-lg font-semibold">{userData.email}</p>
        </div>
      </div>
      <div className="px-4  flex justify-between border-b  py-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Role: </h3>
          <p className="text-lg font-semibold">
            {" "}
            {userData.role ? roleMap[userData.role] : "Not Set"}
          </p>
        </div>
        {canEditUsers && (
          <div className="flex items-center cursor-pointer">
            <GoPencil className="text-2xl" onClick={onEdit} />
          </div>
        )}
      </div>
      {userData.role === UserRole.Promoter && (
        <div className="px-4  flex justify-between border-b  py-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Promo Code: </h3>
            <p className="text-lg font-semibold">
              {" "}
              {userData.promoCode ?? "Not Set"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserIdContent;
