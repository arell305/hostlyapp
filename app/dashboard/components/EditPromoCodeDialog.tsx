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
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

interface EditPromoCodeDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onPromoCodeUpdate: (newPromoCode: string) => void;
  currentPromoCode: string;
}

const EditPromoCodeDialog: React.FC<EditPromoCodeDialogProps> = ({
  isOpen,
  setIsOpen,
  onPromoCodeUpdate,
  currentPromoCode,
}) => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const { user } = useUserRole();

  const currentPromoCodeId = user?.promoterPromoCode?.promoCodeId;

  const [promoCode, setPromoCode] = useState(currentPromoCode || "");

  const updateUserMetadata = useAction(api.clerk.updateUserMetadata);
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

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setPromoCode(newCode);
  };

  const handleSave = async () => {
    if (!user || !organization || !user.clerkUserId) {
      setError("User or organization not available");
      return;
    }
    if (!promoCode.trim()) {
      setError("Promo code cannot be empty");
      return;
    }

    if (promoCode.includes(" ")) {
      setError("Promo code cannot contain spaces");
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
      // update user with the promocode
      await Promise.all([
        updateUserWithPromoCode({
          clerkUserId: user.clerkUserId,
          promoCodeId: result.promoCodeId,
          promoCodeName: promoCode,
        }),
        updateUserMetadata({
          clerkUserId: user.clerkUserId,
          params: {
            promoCode,
          },
        }),
      ]);

      // Call the new prop function to update the state in DashboardNavbar
      onPromoCodeUpdate(promoCode);

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

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[10px]">
        <DialogHeader>
          <DialogTitle>
            {currentPromoCode ? "Edit Promo Code" : "Add Promo Code"}
          </DialogTitle>
          <DialogDescription>
            {currentPromoCode
              ? "Edit your current promo code below."
              : "Enter a new promo code below."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <input
          value={promoCode}
          onChange={handlePromoCodeChange}
          placeholder="Enter promo code"
          className={`w-full border-b-2 bg-transparent py-1 text-gray-800 focus:outline-none 
          ${error ? "border-red-500" : "border-gray-300"} 
          focus:border-customDarkBlue`} // className={` focus:border-blue-500 ${!isValid ? "border-red-500" : "border-gray-300"} outline-none my-4`}
          disabled={isLoading}
        />
        <div className="flex justify-center space-x-10">
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
