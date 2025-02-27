import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditPromoDiscountModal from "../modals/EditPromoDiscountModal";
import EditPromoDiscountDrawer from "../drawer/EditPromoDiscountDrawer";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdatePromoDiscount: () => void;
  setPromoDiscountError: (error: string | null) => void;
  setPromoDiscount: (name: string) => void;
  promoDiscount: string;
};

type ResponsivePromoDiscountProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsivePromoDiscount: React.FC<ResponsivePromoDiscountProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditPromoDiscountModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditPromoDiscountDrawer {...commonProps} />;
};

export default ResponsivePromoDiscount;
