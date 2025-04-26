// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { UserWithPromoCode } from "@/types/types";
// import { ClerkPermissions, UserRole, roleMap } from "@/types/enums";
// import InfoRow from "../../components/UserInfoRow";
// import { Protect } from "@clerk/nextjs";

// interface UserIdContentProps {
//   userData: UserWithPromoCode;
//   onBack: () => void;
//   onDelete: () => void;
//   onEdit: () => void;
//   has: any;
//   isCurrentUser: boolean;
//   onReactivateUser: () => void;
//   errorResumeUser: string | null;
//   loadingReactivate: boolean;
//   errorDeleteUser: string | null;
//   loadingDeleteUser: boolean;
// }

// const UserIdContent: React.FC<UserIdContentProps> = ({
//   userData,
//   onBack,
//   onDelete,
//   onEdit,
//   has,
//   isCurrentUser,
//   onReactivateUser,
//   errorResumeUser,
//   loadingReactivate,
//   errorDeleteUser,
//   loadingDeleteUser,
// }) => {
//   const isHostlyPage = userData.role === UserRole.Hostly_Moderator;
//   const isAdmin = has({ role: UserRole.Admin });
//   const isHostlyAdmin =
//     has({ role: UserRole.Hostly_Admin }) ||
//     has({ role: UserRole.Hostly_Moderator });
//   const canEditUsers =
//     has({ permission: ClerkPermissions.EDIT_USER }) && !isCurrentUser;

//   const canDeleteAdminMods = isHostlyPage && isHostlyAdmin;
//   return (
//     <main className="container mx-auto  max-w-2xl ">
//       <div className="">
//         <Button variant="navGhost" size="nav" className="pl-4" onClick={onBack}>
//           Back
//         </Button>
//       </div>
//       <div className="flex items-center flex-col mb-4">
//         {userData.imageUrl && (
//           <Image
//             src={userData.imageUrl}
//             alt="Profile Image"
//             width={100}
//             height={100}
//             className="rounded-full object-cover aspect-square w-[100px] h-[100px]"
//           />
//         )}

//         <h2 className="mt-2 text-2xl font-semibold font-playfair">
//           {userData.name}
//         </h2>
//       </div>
//       <InfoRow label="Email" value={userData.email} />
//       <InfoRow
//         label="Role"
//         value={userData.role ? roleMap[userData.role] : "Not Set"}
//         canEdit={canEditUsers}
//         onEdit={onEdit}
//         isClickable={canEditUsers}
//       />
//       {userData.role === UserRole.Promoter && (
//         <InfoRow label="Promo Code" value={userData.promoCode ?? "Not Set"} />
//       )}
//       <Protect role={ClerkPermissions.EDIT_USER}>
//         {userData.isActive ? (
//           <div className="my-6 pl-4">
//             <Button variant="navDestructive" size="nav" onClick={onDelete}>
//               {loadingDeleteUser ? "Deleteing..." : "Delete User"}
//             </Button>
//             <p
//               className={`pl-4 text-sm mt-1 ${errorDeleteUser ? "text-red-500" : "text-transparent"}`}
//             >
//               {errorDeleteUser || "Placeholder to maintain height"}
//             </p>
//           </div>
//         ) : (
//           <div>
//             <Button
//               disabled={loadingReactivate}
//               variant="navGhost"
//               size="nav"
//               onClick={onReactivateUser}
//             >
//               {loadingReactivate ? "Reactivating..." : "Reactivate"}
//             </Button>
//             <p
//               className={`pl-4 text-sm mt-1 ${errorResumeUser ? "text-red-500" : "text-transparent"}`}
//             >
//               {errorResumeUser || "Placeholder to maintain height"}
//             </p>
//           </div>
//         )}
//       </Protect>
//     </main>
//   );
// };

// export default UserIdContent;

import { Button } from "@/components/ui/button";
import { UserWithPromoCode } from "@/types/types";
import { UserRole } from "@/types/enums";
import { useRouter } from "next/navigation";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useState } from "react";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import CustomCard from "@/components/shared/cards/CustomCard";
import NavButtonsContainer from "@/components/shared/containers/NavButtonsContainer";
import StaticField from "@/components/shared/fields/StaticField";
import EditableSelectField from "@/components/shared/editable/EditableSelectField";
import EditToggleButton from "@/components/shared/buttonContainers/EditToggleButton";
import ButtonEndContainer from "@/components/shared/buttonContainers/ButtonEndContainer";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import ProfileHeader from "@/components/shared/headings/ProfileHeader";

interface UserIdContentProps {
  userData: UserWithPromoCode;
  canEditUsers: boolean;
}

const UserIdContent: React.FC<UserIdContentProps> = ({
  userData,
  canEditUsers,
}) => {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(userData.role ?? "");
  const { updateUserById, error, isLoading, setError } = useUpdateUser();

  const handleBack = () => {
    router.back();
  };

  const handleShowDeleteConfirmation = () => {
    setError(null);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setError(null);
  };

  const handleDeleteUser = async () => {
    const success = await updateUserById(userData._id, {
      isActive: false,
    });
    if (success) {
      handleCloseDeleteConfirmation();
    }
  };

  const handleReactivateUser = async () => {
    await updateUserById(userData._id, {
      isActive: true,
    });
  };

  const handleSaveRole = async () => {
    await updateUserById(userData._id, {
      role: selectedRole as UserRole,
    });
  };

  return (
    <section>
      <CustomCard>
        <NavButtonsContainer>
          <Button
            variant="navGhost"
            size="nav"
            className="text-whiteText"
            onClick={handleBack}
          >
            Back
          </Button>
          {canEditUsers && (
            <EditToggleButton
              isEditing={isEditing}
              onToggle={() => setIsEditing((prev) => !prev)}
            />
          )}
        </NavButtonsContainer>
        <ProfileHeader imageUrl={userData.imageUrl} name={userData.name} />
        <StaticField label="Email" value={userData.email} />
        <EditableSelectField
          label="Role"
          name="role"
          value={userData.role ?? ""}
          options={[
            { label: "Moderator", value: UserRole.Moderator },
            { label: "Manager", value: UserRole.Manager },
            { label: "Promoter", value: UserRole.Promoter },
          ]}
          onChange={(value) => setSelectedRole(value)}
          onSave={handleSaveRole}
          isEditing={isEditing}
          isSaving={isLoading}
          error={error}
        />

        {userData.role === UserRole.Promoter && (
          <StaticField
            label="Promo Code"
            value={userData.promoCode ?? "Not Set"}
          />
        )}

        <ResponsiveConfirm
          isOpen={showDeleteConfirmation}
          title="Confirm User Deletion"
          confirmText="Delete User"
          cancelText="Cancel"
          content="Are you sure you want to delete this user? This action cannot be undone."
          confirmVariant="destructive"
          error={error}
          isLoading={isLoading}
          modalProps={{
            onClose: () => handleCloseDeleteConfirmation(),
            onConfirm: () => handleDeleteUser(),
          }}
          drawerProps={{
            onSubmit: handleDeleteUser,
            onOpenChange: () => handleCloseDeleteConfirmation(),
          }}
        />
      </CustomCard>
      {canEditUsers && (
        <ButtonEndContainer>
          {userData.isActive ? (
            <Button
              onClick={handleShowDeleteConfirmation}
              className="text-whiteText hover:text-whiteText/80 underline w-auto text-base"
              variant="navGhost"
            >
              Delete User
            </Button>
          ) : (
            <SingleSubmitButton
              isLoading={isLoading}
              error={error}
              onClick={handleReactivateUser}
              label="Reactivate"
            />
          )}
        </ButtonEndContainer>
      )}
    </section>
  );
};

export default UserIdContent;
