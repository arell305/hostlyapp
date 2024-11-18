// components/EditPromoCodeDialog.tsx
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
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";

interface EditSubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditPromoCodeDialog: React.FC<EditSubscriptionDialogProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const { user } = useUserRole();
  const currentPromoCode = user?.promoterPromoCode?.name;
  const currentPromoCodeId = user?.promoterPromoCode?.promoCodeId;

  const [promoCode, setPromoCode] = useState(currentPromoCode || "");

  const addPromoCode = useMutation(api.promoterPromoCode.addPromoterPromoCode);
  const updateUserWithPromoCode = useMutation(
    api.users.updateUserWithPromoCode
  );
  const updatePromoCode = useMutation(
    api.promoterPromoCode.updatePromoterPromoCode
  );

  useEffect(() => {
    setPromoCode(currentPromoCode || "");
    setError(null);
    setIsValid(true);
  }, [currentPromoCode, isOpen]);

  const validatePromoCode = (code: string) => {
    return !code.includes(" ");
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setPromoCode(newCode);
    setIsValid(validatePromoCode(newCode));
    if (!validatePromoCode(newCode)) {
      setError("Promo code cannot contain spaces");
    } else {
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!user || !organization || !user.clerkUserId) {
      console.error("User or organization not available");
      return;
    }
    if (!isValid) {
      setError("Please enter a valid promo code without spaces");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (currentPromoCode && currentPromoCodeId) {
        // Update existing promo code
        result = await updatePromoCode({
          promoCodeId: currentPromoCodeId,
          name: promoCode,
        });
      } else {
        // Add new promo code
        result = await addPromoCode({
          name: promoCode,
          clerkOrganizationId: organization.id,
          clerkPromoterUserId: user.clerkUserId,
        });
      }

      await updateUserWithPromoCode({
        clerkUserId: user.clerkUserId,
        promoCodeId: result.promoCodeId,
        promoCodeName: promoCode,
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Input
          value={promoCode}
          onChange={handlePromoCodeChange}
          placeholder="Enter promo code"
          className={`my-4 ${!isValid ? "border-red-500" : ""}`}
          disabled={isLoading}
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !isValid}>
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
