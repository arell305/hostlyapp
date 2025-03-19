import useMediaQuery from "@/hooks/useMediaQuery";
import ConfirmModal, {
  ConfirmModalProps,
} from "@/[slug]/app/components/ConfirmModal";
import BaseDrawer, { BaseDrawerProps } from "../drawer/BaseDrawer";
import { DESKTOP_WIDTH } from "@/types/constants";

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
