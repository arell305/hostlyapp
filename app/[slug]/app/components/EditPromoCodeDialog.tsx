"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserWithPromoCode } from "@/types/types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { DESKTOP_WIDTH } from "@/types/constants";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAddOrUpdatePromoterPromoCode } from "@/hooks/useAddorUpdatePromoterPromoCode";

interface EditPromoCodeDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: UserWithPromoCode | null | undefined;
}

const EditPromoCodeDialog: React.FC<EditPromoCodeDialogProps> = ({
  isOpen,
  setIsOpen,
  user,
}) => {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState<string | null | undefined>(
    user?.promoCode
  );
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const { addPromoCode, isLoading, error, setError } =
    useAddOrUpdatePromoterPromoCode();

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!promoCode || !promoCode.trim()) {
      setError("Promo code cannot be empty");
      return;
    }

    if (promoCode.includes(" ")) {
      setError("Promo code cannot contain spaces");
      return;
    }

    if (promoCode === user?.promoCode) {
      setIsOpen(false);
      return;
    }

    const success = await addPromoCode(promoCode);
    if (success) {
      handleClose();
    }
  };
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="rounded-[10px]">
          <DialogHeader>
            <DialogTitle>
              {user?.promoCodeId ? "Edit Promo Code" : "Add Promo Code"}
            </DialogTitle>
            <DialogDescription>
              {user?.promoCodeId
                ? "Edit your current promo code below."
                : "Enter a new promo code below."}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={promoCode || ""}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setError(null);
            }}
            placeholder="Enter promo code"
            disabled={isLoading}
            error={error || undefined}
          />
          <p
            className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
          >
            {error || "Placeholder to maintain height"}
          </p>{" "}
          <div className="flex justify-center space-x-10 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="font-semibold  w-[140px]"
            >
              Cancel
            </Button>
            <Button
              className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="rounded-t-[10px]">
        <DrawerHeader>
          <DrawerTitle>
            {user?.promoCodeId ? "Edit Promo Code" : "Add Promo Code"}
          </DrawerTitle>
          <DrawerDescription>
            {user?.promoCodeId
              ? "Edit your current promo code below."
              : "Enter a new promo code below."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <Input
            value={promoCode || ""}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setError(null);
            }}
            placeholder="Enter promo code"
            disabled={isLoading}
            error={error || undefined}
          />
          <p
            className={`text-sm mt-1 ${
              error ? "text-red-500" : "text-transparent"
            }`}
          >
            {error || "Placeholder to maintain height"}
          </p>
          <div className="flex justify-center space-x-10 mt-4 pb-4">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="font-semibold w-[140px]"
            >
              Cancel
            </Button>
            <Button
              className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditPromoCodeDialog;
