import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import ConfirmModal, {
  ConfirmModalProps,
} from "@/shared/ui/modals/ConfirmModal";
import BaseDrawer, { BaseDrawerProps } from "@/shared/ui/drawer/BaseDrawer";
import { DESKTOP_WIDTH } from "@shared/types/constants";

type CommonProps = {
  isOpen: boolean;
  title: string;
  confirmText: string;
  cancelText: string;
  content: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  error: string | null;
  isLoading: boolean;
};

type ResponsiveConfirmProps = CommonProps & {
  modalProps?: Omit<ConfirmModalProps, keyof CommonProps | "message">;
  drawerProps?: Omit<BaseDrawerProps, keyof CommonProps | "description">;
};

const ResponsiveConfirm: React.FC<ResponsiveConfirmProps> = ({
  modalProps,
  drawerProps,
  content,
  confirmVariant = "default",
  ...commonProps
}) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  if (isDesktop && modalProps) {
    return (
      <ConfirmModal
        {...commonProps}
        {...modalProps}
        message={content}
        confirmVariant={confirmVariant}
      />
    );
  }

  if (!isDesktop && drawerProps) {
    return (
      <BaseDrawer
        {...commonProps}
        {...drawerProps}
        description={content}
        confirmVariant={confirmVariant}
      />
    );
  }

  return null;
};

export default ResponsiveConfirm;
