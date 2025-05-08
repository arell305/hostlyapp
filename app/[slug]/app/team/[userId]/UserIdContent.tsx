import { Button } from "@/components/ui/button";
import { UserWithPromoCode } from "@/types/types";
import { UserRole } from "@/types/enums";
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
  handleBack: () => void;
}

const UserIdContent: React.FC<UserIdContentProps> = ({
  userData,
  canEditUsers,
  handleBack,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(userData.role ?? "");
  const { updateUserById, error, isLoading, setError } = useUpdateUser();

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
        {userData.role === UserRole.Admin ? (
          <StaticField label="Role" value="Admin" />
        ) : (
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
        )}

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
