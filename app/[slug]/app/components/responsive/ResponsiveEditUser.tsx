import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";

import { UserRole } from "../../../../../utils/enum";
import EditingUserModal from "../modals/EditingUserModal";
import EditUserDrawer from "../drawer/EditUserDrawer";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  error: string | null;
  isLoading: boolean;
  onSaveRole: () => void;
};

type ResponsiveEditUserProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsiveEditUser: React.FC<ResponsiveEditUserProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditingUserModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditUserDrawer {...commonProps} />;
};

export default ResponsiveEditUser;
