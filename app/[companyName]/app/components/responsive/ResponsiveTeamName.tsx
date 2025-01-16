import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditTeamNameDrawer from "../drawer/EditTeamNameDrawer";
import EditTeamNameModal from "../modals/EditTeamNameModal";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdateTeamName: () => void;
  setTeamNameError: (error: string | null) => void;
  setTeamName: (name: string) => void;
  teamName: string;
};

type ResponsiveTeamNameProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsiveTeamName: React.FC<ResponsiveTeamNameProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditTeamNameModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditTeamNameDrawer {...commonProps} />;
};

export default ResponsiveTeamName;
