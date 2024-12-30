"use client";

import {
  useClerk,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { RiArrowRightSLine } from "react-icons/ri";
import TeamNameModal from "../components/modals/EditTeamNameModal";
import { TeamSettingsModalType } from "@/types/enums";
import { GoPencil } from "react-icons/go";
import ResponsiveTeamName from "../components/responsive/ResponsiveTeamName";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus } from "../../../utils/enum";
import ResponsivePromoAmount from "../components/responsive/ResponsivePromoDiscount";
import ResponsivePromoDiscount from "../components/responsive/ResponsivePromoDiscount";
import Image from "next/image";

const TeamSettings = () => {
  const { organization, user, loaded } = useClerk();
  const { isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });

  // team name settings
  const [teamName, setTeamName] = useState<string | null | undefined>(
    organization?.name
  );
  const [showTeamNameModal, setShowTeamNameModal] = useState<boolean>(false);
  const [isTeamNameLoading, setTeamNameLoading] = useState<boolean>(false);
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const existingOrganizations = useQuery(api.organizations.getAllOrganizations);
  const createOrganization = useAction(api.clerk.createOrganization);
  const updateOrganization = useAction(api.clerk.updateOrganization);

  // promo discount settings
  const [promoDiscount, setPromoDiscount] = useState<string>(
    (organization?.publicMetadata?.promoDiscount as string) || ""
  );
  const [showPromoDiscountModal, setShowPromoDiscountModal] =
    useState<boolean>(false);
  const [isPromoDiscountLoading, setPromoDiscountLoading] =
    useState<boolean>(false);
  const [promoDiscountError, setPromoDiscountError] = useState<string | null>(
    null
  );
  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  const { toast } = useToast();

  useEffect(() => {
    setTeamName(organization?.name);
    setPromoDiscount(organization?.publicMetadata?.promoDiscount as string);
  }, [organization]);

  const handleUpdateTeamName = async () => {
    if (teamName === organization?.name) {
      return setShowTeamNameModal(false);
    }
    if (!teamName || teamName.trim() === "") {
      setTeamNameError("Name cannot be empty.");
      return;
    }
    if (!user) {
      setTeamNameError("Error Loading User. Please try again.");
      console.log("user undefined");
      return;
    }

    if (!isLoaded) {
      setTeamNameError("Error Loading Team. Please try again.");
      return;
    }

    if (organization?.name === teamName) {
      return setShowTeamNameModal(false);
    }
    const isDuplicate = existingOrganizations?.data?.organizations?.some(
      (org) => org.name.toLowerCase() === teamName.toLowerCase()
    );
    if (isDuplicate) {
      setTeamNameError(
        "This organization name already exists. Please choose another."
      );
      return;
    }

    try {
      setTeamNameLoading(true);
      // create organization if it doesn't exist
      if (!organization) {
        const response = await createOrganization({
          name: teamName,
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
        });
        if (response.status === ResponseStatus.SUCCESS) {
          await setActive({ organization: response.data.clerkOrgId });
          toast({
            title: "Success",
            description: "Team name set.",
          });
          setShowTeamNameModal(false);
        } else {
          console.error("Failed to update team name", response.error);
          toast({
            title: "Error",
            description: "Failed to Update Team Name.",
            variant: "destructive",
          });
        }
      } else {
        const response = await updateOrganization({
          clerkOrganizationId: organization.id,
          name: teamName,
        });
        if (response.status === ResponseStatus.SUCCESS) {
          await setActive({ organization: response.data.clerkOrgId });
          toast({
            title: "Success",
            description: "Team name set.",
          });
          setShowTeamNameModal(false);
        } else {
          console.error("Failed to update team name", response.error);
          toast({
            title: "Error",
            description: "Failed to Update Team Name.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to update team name", error);
      toast({
        title: "Error",
        description: "Failed to Update Team Name.",
        variant: "destructive",
      });
    } finally {
      setTeamNameLoading(false);
    }
  };

  const handleSavePromoDiscount = async () => {
    if (
      promoDiscount === (organization?.publicMetadata?.promoDiscount as string)
    ) {
      return setShowPromoDiscountModal(false);
    }
    if (promoDiscount === "") {
      setPromoDiscountError("Promo Discount Amount can't be empty.");
      return;
    }
    const discountValue: number = parseFloat(promoDiscount);

    // Validation logic
    if (isNaN(discountValue)) {
      setPromoDiscountError("Please enter a valid number.");
      return;
    }

    if (!isFinite(discountValue)) {
      setPromoDiscountError("Please enter a finite number.");
      return;
    }

    if (discountValue < 0) {
      setPromoDiscountError("Please enter a positive number.");
      return;
    }

    // Check for more than two decimal places
    const decimalCheck = /^\d+(\.\d{1,2})?$/; // Regex to allow up to 2 decimal places
    if (!decimalCheck.test(promoDiscount)) {
      setPromoDiscountError(
        "Please enter a number with up to two decimal places."
      );
      return;
    }

    if (!organization || !isLoaded) {
      setPromoDiscountError("Team is undefined. Please try again.");
      return;
    }

    try {
      setPromoDiscountLoading(true);
      setPromoDiscountError(null);

      const response = await updateOrganizationMetadata({
        clerkOrganizationId: organization.id,
        params: {
          promoDiscount: discountValue,
        },
      });

      if (response.status === ResponseStatus.SUCCESS) {
        setActive({ organization: organization.id });
        toast({
          title: "Success",
          description: "Promo discount amount set.",
        });
        setShowPromoDiscountModal(false);
      } else {
        console.error(
          "Failed to update promo discount amount.",
          response.error
        );
        setPromoDiscountError(
          "Error updating promo discount amount. Please try again"
        );
      }
    } catch (error) {
      console.error("Failed to update promo discount amount.", error);
      setPromoDiscountError(
        "Error updating promo discount amount. Please try again"
      );
    } finally {
      setPromoDiscountLoading(false);
    }
  };

  const handleTeamNameModalOpenChange = (open: boolean) => {
    if (open) {
      setShowTeamNameModal(true);
    } else {
      setTeamName(organization?.name);
      setTeamNameError(null);
      setShowTeamNameModal(false);
    }
  };

  const handlePromoDiscountModalOpenChange = (open: boolean) => {
    if (open) {
      setShowPromoDiscountModal(true);
    } else {
      setPromoDiscount(organization?.publicMetadata?.promoDiscount as string);
      setPromoDiscountError(null);
      setShowPromoDiscountModal(false);
    }
  };

  if (!loaded || !isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="justify-center max-w-3xl rounded-lg mx-auto mt-1.5 ">
      <h1 className="pt-4 md:pt-0 pl-4 text-3xl md:text-4xl font-bold ">
        Team Settings
      </h1>
      <div className="relative flex items-center justify-center mb-2 mt-4">
        <Image
          src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVpvY3NtSG5PZE5PN2kyRVdpaUM5VENqMVAifQ"
          alt="Team Avatar"
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
        <button
          onClick={() => console.log("Edit Image")}
          className="absolute right-[330px] bottom-[80px] bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <GoPencil className="text-2xl text-gray-600" />
        </button>
      </div>

      <div
        onClick={() => setShowTeamNameModal(true)}
        className="px-4 flex justify-between border-b cursor-pointer hover:bg-gray-100 py-3"
      >
        <div className="">
          <h3 className="text-sm font-medium text-gray-500">Team Name: </h3>
          <p className="text-lg font-semibold">
            {organization?.name || "Not Set"}
          </p>
        </div>

        <div className="flex items-center">
          <GoPencil className="text-2xl" />
        </div>
      </div>
      <ResponsiveTeamName
        isOpen={showTeamNameModal}
        onOpenChange={handleTeamNameModalOpenChange}
        error={teamNameError}
        isLoading={isTeamNameLoading}
        onUpdateTeamName={handleUpdateTeamName}
        setTeamNameError={setTeamNameError}
        setTeamName={setTeamName}
        teamName={teamName || ""}
      />

      {organization && (
        <div
          onClick={() => setShowPromoDiscountModal(true)}
          className="px-4 flex justify-between border-b cursor-pointer hover:bg-gray-100 py-3"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Promo Discount Amount:{" "}
            </h3>
            <p className="text-lg font-semibold">
              {(organization?.publicMetadata?.promoDiscount as string) ||
                "Not Set"}
            </p>
          </div>

          <div className="flex items-center">
            <GoPencil className="text-2xl" />
          </div>
        </div>
      )}
      <ResponsivePromoDiscount
        isOpen={showPromoDiscountModal}
        onOpenChange={handlePromoDiscountModalOpenChange}
        promoDiscount={promoDiscount}
        onUpdatePromoDiscount={handleSavePromoDiscount}
        error={promoDiscountError}
        isLoading={isPromoDiscountLoading}
        setPromoDiscount={setPromoDiscount}
        setPromoDiscountError={setPromoDiscountError}
      />
    </div>
  );
};

export default TeamSettings;
