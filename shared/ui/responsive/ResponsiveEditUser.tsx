import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import EditingUserModal from "@/shared/ui/modals/EditingUserModal";
import EditUserDrawer from "@/shared/ui/drawer/EditUserDrawer";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import { UserRole } from "@shared/types/enums";

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

const ResponsiveEditUser: React.FC<CommonProps> = (commonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
