import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import EditTeamNameDrawer from "@/shared/ui/drawer/EditTeamNameDrawer";
import EditTeamNameModal from "@/shared/ui/modals/EditTeamNameModal";
import { DESKTOP_WIDTH } from "@shared/types/constants";

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

  return (
    <EditTeamNameDrawer
      {...commonProps}
      onClose={() => commonProps.onOpenChange(false)}
    />
  );
};

export default ResponsiveTeamName;
