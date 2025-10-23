import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import EditPromoDiscountModal from "@/shared/ui/modals/EditPromoDiscountModal";
import EditPromoDiscountDrawer from "@/shared/ui/drawer/EditPromoDiscountDrawer";
import { DESKTOP_WIDTH } from "@shared/types/constants";

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
