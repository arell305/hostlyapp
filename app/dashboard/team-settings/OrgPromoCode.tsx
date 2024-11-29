"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check } from "lucide-react";
import { useOrganizationConvex } from "@/hooks/useOrganizationConvex";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const OrgPromoCode = () => {
  const { isLoading, organizationFromDB, clerkOrganizationId } =
    useOrganizationConvex();
  const [isEditing, setIsEditing] = useState(false);
  const [tempDiscount, setTempDiscount] = useState("");
  const [error, setError] = useState("");
  const updatePromoDiscount = useMutation(
    api.organizations.updateOrganizationPromoDiscount
  );

  useEffect(() => {
    if (organizationFromDB?.promoDiscount) {
      setTempDiscount(organizationFromDB.promoDiscount.toString());
    }
  }, [organizationFromDB]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const validateInput = (value: string): boolean => {
    return /^\d+$/.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempDiscount(value);
    setError(""); // Clear error on input change
  };

  const handleSave = async () => {
    // Validation on submit
    if (!tempDiscount) {
      setError("Please enter a discount amount.");
      return;
    }

    if (!validateInput(tempDiscount)) {
      setError("Please enter a valid positive whole number.");
      return;
    }

    if (clerkOrganizationId) {
      try {
        await updatePromoDiscount({
          clerkOrganizationId,
          promoDiscount: parseInt(tempDiscount),
        });
        setIsEditing(false);
        setError("");
      } catch (error) {
        console.error("Failed to update promo discount:", error);
        setError("Failed to update promo discount. Please try again.");
      }
    } else {
      setError("Organization ID not found. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Promo Code
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                value={tempDiscount}
                onChange={handleInputChange}
                placeholder="Enter discount"
                className="w-24"
              />
              <Button size="icon" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        ) : (
          <p className="text-2xl font-bold">
            {organizationFromDB?.promoDiscount
              ? `$${organizationFromDB.promoDiscount} OFF`
              : "No promo discount set"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrgPromoCode;
