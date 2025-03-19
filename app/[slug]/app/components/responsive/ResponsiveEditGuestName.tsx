import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditGuestNameDrawer from "../drawer/EditGuestNameDrawer";
import EditGuestNameModal from "../modals/EditGuestNameModal";
import { DESKTOP_WIDTH } from "@/types/constants";

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

const ResponsiveEditGuestName: React.FC<CommonProps> = (commonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
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
