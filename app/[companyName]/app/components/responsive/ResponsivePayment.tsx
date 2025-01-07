import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditPaymentDrawer from "../drawer/EditPaymentDrawer";
import EditPaymentModal from "../modals/EditPaymentModal";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onEditPayment: () => void;
  onChange: (event: any) => void;
};

type ResponsivePaymentProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsivePayment: React.FC<ResponsivePaymentProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditPaymentModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditPaymentDrawer {...commonProps} />;
};

export default ResponsivePayment;
