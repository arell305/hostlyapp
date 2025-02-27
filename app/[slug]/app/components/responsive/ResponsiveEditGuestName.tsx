import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditGuestNameDrawer from "../drawer/EditGuestNameDrawer";
import EditGuestNameModal from "../modals/EditGuestNameModal";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  setEditName: (open: string) => void;
  setEditNameError: (error: string | null) => void;
  error: string | null;
  isLoading: boolean;
  onSaveGuestName: () => Promise<void>;
};

type ResponsiveEditGuestProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsiveEditGuestName: React.FC<ResponsiveEditGuestProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditGuestNameModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditGuestNameDrawer {...commonProps} />;
};

export default ResponsiveEditGuestName;
