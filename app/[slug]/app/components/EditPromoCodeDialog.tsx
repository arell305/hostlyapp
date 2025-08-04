"use client";

import React, { useEffect, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { DESKTOP_WIDTH } from "@/types/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormContainer from "@/components/shared/containers/FormContainer";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import { UserWithPromoCode } from "@/types/types";
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
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [promoCode, setPromoCode] = useState<string | null | undefined>(
    user?.promoCode
  );
  const [error, setError] = useState<string | null>(null);
  const { addPromoCode, isLoading } = useAddOrUpdatePromoterPromoCode();

  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isDesktop]);

  const resetState = () => {
    setPromoCode(user?.promoCode ?? null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    setIsOpen(false);
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
      handleClose();
      return;
    }

    const success = await addPromoCode(promoCode);
    if (success) {
      handleClose();
    }
  };

  const isDisabled = isLoading || !promoCode || !promoCode.trim();

  const formContent = (
    <FormContainer>
      <Input
        value={promoCode || ""}
        onChange={(e) => {
          setPromoCode(e.target.value);
          setError(null);
        }}
        placeholder="Enter promo code"
        disabled={isLoading}
      />
      <p
        className={`text-sm mt-1 ${
          error ? "text-red-500" : "text-transparent"
        }`}
      >
        {error || "Placeholder to maintain height"}
      </p>

      <FormActions
        onCancel={handleClose}
        onSubmit={handleSave}
        isLoading={isLoading}
        submitText="Save"
        error={error}
        isSubmitDisabled={isDisabled}
      />
    </FormContainer>
  );

  const title = user?.promoCodeId ? "Edit Promo Code" : "Add Promo Code";
  const description = user?.promoCodeId
    ? "Edit your current promo code below."
    : "Enter a new promo code below.";

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {formContent}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[100svh] flex flex-col overscroll-contain">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
        {formContent}
      </DrawerContent>
    </Drawer>
  );
};

export default EditPromoCodeDialog;
