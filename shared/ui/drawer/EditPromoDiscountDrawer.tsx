import BaseDrawer from "./BaseDrawer";
import { Input } from "@/shared/ui/primitive/input";

interface EditPromoDiscountDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdatePromoDiscount: () => void;
  setPromoDiscountError: (error: string | null) => void;
  setPromoDiscount: (name: string) => void;
  promoDiscount: string;
}

const EditPromoDiscountDrawer: React.FC<EditPromoDiscountDrawerProps> = ({
  isOpen,
  onOpenChange,
  promoDiscount,
  onUpdatePromoDiscount,
  error,
  isLoading,
  setPromoDiscount,
  setPromoDiscountError,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Promo Discount Amount"
      description={`Edit the discount for promoter's promo code`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={onUpdatePromoDiscount}
      error={error}
      isLoading={isLoading}
    >
      <div className="space-y-4 px-4">
        <Input
          type="text"
          placeholder="Enter Promo Discount Discount"
          value={promoDiscount}
          onChange={(e) => {
            setPromoDiscount(e.target.value);
            setPromoDiscountError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
      </div>
    </BaseDrawer>
  );
};

export default EditPromoDiscountDrawer;
