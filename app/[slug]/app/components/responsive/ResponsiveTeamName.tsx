import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditTeamNameDrawer from "../drawer/EditTeamNameDrawer";
import EditTeamNameModal from "../modals/EditTeamNameModal";
import { DESKTOP_WIDTH } from "@/types/constants";

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

const ResponsiveTeamName: React.FC<CommonProps> = (commonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
