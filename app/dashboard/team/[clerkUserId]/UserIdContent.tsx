import { Button } from "@/components/ui/button";
import { UserSchema } from "@/types/schemas-types";
import Image from "next/image";
import { UserRole, roleMap } from "../../../../utils/enum";
import { FaEdit } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";
import { GoPencil } from "react-icons/go";

interface UserIdContentProps {
  currentClerkUserId: string;
  userData: UserSchema;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  has: any;
}
const UserIdContent: React.FC<UserIdContentProps> = ({
  currentClerkUserId,
  userData,
  onBack,
  onDelete,
  onEdit,
  has,
}) => {
  const isAdmin = has({ role: UserRole.Admin });
  const canEditUsers =
    (has({ role: UserRole.Manager }) || isAdmin) &&
    currentClerkUserId !== userData.clerkUserId;

  return (
    <section className="container mx-auto  max-w-3xl ">
      <div className="flex justify-between mt-4">
        <Button variant="navGhost" onClick={onBack}>
          Back
        </Button>
        {canEditUsers && (
          <Button variant="navGhost" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
      <div className="flex items-center flex-col mb-4">
        <Image
          src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVpvY3NtSG5PZE5PN2kyRVdpaUM5VENqMVAifQ"
          alt="Example Image"
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
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
              {userData.promoterPromoCode?.name ?? "Not Set"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserIdContent;
