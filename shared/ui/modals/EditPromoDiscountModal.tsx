import { Button } from "@/shared/ui/primitive/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitive/dialog";
import { Input } from "@/shared/ui/primitive/input";

interface EditPromoDiscountModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdatePromoDiscount: () => void;
  setPromoDiscountError: (error: string | null) => void;
  setPromoDiscount: (name: string) => void;
  promoDiscount: string;
  onClose: () => void;
}

const EditPromoDiscountModal: React.FC<EditPromoDiscountModalProps> = ({
  isOpen,
  onOpenChange,
  error,
  isLoading,
  onUpdatePromoDiscount,
  setPromoDiscountError,
  setPromoDiscount,
  promoDiscount,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Promo Code Discount Amount</DialogTitle>
          <DialogDescription>
            Enter the amount of the promo code discount.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter promo code amount"
          value={promoDiscount}
          onChange={(e) => {
            setPromoDiscount(e.target.value);
            setPromoDiscountError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
        <p
          className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>{" "}
        <div className="flex justify-center space-x-10 mt-4">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold  w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={onUpdatePromoDiscount}
            isLoading={isLoading}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromoDiscountModal;
