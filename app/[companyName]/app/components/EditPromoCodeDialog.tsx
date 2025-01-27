"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UserWithPromoCode } from "@/types/types";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [promoCode, setPromoCode] = useState<string | null | undefined>(
    user?.promoCode
  );

  const updateUserMetadata = useAction(api.clerk.updateUserMetadata);
  const addPromoCode = useMutation(
    api.promoterPromoCode.addOrUpdatePromoterPromoCode
  );

  console.log("promoCode", promoCode);

  console.log("user?.promoterPromoCodeId", user?.promoCode);
  const handleSave = async () => {
    if (!user || !user.clerkUserId) {
      setError("User not available. Please Try again");
      return;
    }
    if (!promoCode || !promoCode.trim()) {
      setError("Promo code cannot be empty");
      return;
    }

    if (promoCode.includes(" ")) {
      setError("Promo code cannot contain spaces");
      return;
    }

    if (promoCode === user.promoCode) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        addPromoCode({
          name: promoCode,
          clerkPromoterUserId: user.clerkUserId,
        }),
        updateUserMetadata({
          clerkUserId: user.clerkUserId,
          params: {
            promoCode,
          },
        }),
      ]);

      toast({
        title: "Promo Code updated",
        description: "Promo code has successfully been updated",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating promo code:", error);
      if (error instanceof Error) {
        let errorMessage = "An error occurred while adding the promo code";
        if (error.message.includes("already exists")) {
          errorMessage = "Promo Code already exists";
        }
        setError(errorMessage);
      } else {
        setError("An error has occurred. Please try again");
        toast({
          title: "Error",
          description: "Failed to updated promo code. Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            disabled={isLoading || !isValid}
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
};

export default EditPromoCodeDialog;
