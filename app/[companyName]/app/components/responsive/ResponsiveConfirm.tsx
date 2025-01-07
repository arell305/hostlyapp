import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import ConfirmModal, {
  ConfirmModalProps,
} from "@/[companyName]/app/components/ConfirmModal";
import BaseDrawer, { BaseDrawerProps } from "../drawer/BaseDrawer";

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
  isDesktop?: boolean;
  modalProps?: Omit<ConfirmModalProps, keyof CommonProps | "message">;
  drawerProps?: Omit<BaseDrawerProps, keyof CommonProps | "description">;
};

const ResponsiveConfirm: React.FC<ResponsiveConfirmProps> = ({
  isDesktop: isDesktopProp,
  modalProps,
  drawerProps,
  content,
  confirmVariant = "default",
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

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

  return null; // Or some fallback UI
};

export default ResponsiveConfirm;
