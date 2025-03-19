import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditPromoDiscountModal from "../modals/EditPromoDiscountModal";
import EditPromoDiscountDrawer from "../drawer/EditPromoDiscountDrawer";
import { DESKTOP_WIDTH } from "@/types/constants";

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

const ResponsivePromoDiscount: React.FC<CommonProps> = (commonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
