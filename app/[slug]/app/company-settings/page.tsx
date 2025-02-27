"use client";

import { useAuth, useClerk, useOrganizationList } from "@clerk/nextjs";
import { ChangeEvent, useEffect, useState } from "react";
import { GoPencil } from "react-icons/go";
import ResponsiveTeamName from "../components/responsive/ResponsiveTeamName";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus, UserRole } from "../../../../utils/enum";
import ResponsivePromoDiscount from "../components/responsive/ResponsivePromoDiscount";
import Image from "next/image";
import ResponsiveCompanyImage from "../components/responsive/ResponsiveCompanyImage";
import { useParams, useRouter } from "next/navigation";

const CompanySettings = () => {
  const { organization, user, loaded } = useClerk();
  const { toast } = useToast();
  const router = useRouter();
  const { isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const { orgRole, isLoaded: isAuthLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const { companyName: companyNameParams } = useParams();
  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";
  const organizationData = useQuery(
    api.organizations.getOrganizationByNameQuery,
    cleanCompanyName ? { name: cleanCompanyName } : "skip"
  );

  const [companyName, setCompanyName] = useState<string | null | undefined>(
    organizationData?.data?.organization.name
  );
  const [showTeamNameModal, setShowTeamNameModal] = useState<boolean>(false);
  const [isTeamNameLoading, setTeamNameLoading] = useState<boolean>(false);
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const existingOrganizations = useQuery(api.organizations.getAllOrganizations);
  const updateOrganization = useAction(api.clerk.updateOrganization);

  // promo discount settings
  const [promoDiscount, setPromoDiscount] = useState<string>(
    organizationData?.data?.organization.promoDiscount.toString() || ""
  );
  const [showPromoDiscountModal, setShowPromoDiscountModal] =
    useState<boolean>(false);
  const [isPromoDiscountLoading, setPromoDiscountLoading] =
    useState<boolean>(false);
  const [promoDiscountError, setPromoDiscountError] = useState<string | null>(
    null
  );

  // company image
  const [showCompanyImageModal, setShowCompanyImageModal] =
    useState<boolean>(false);
  const [companyImage, setCompanyImage] = useState<string>(
    organization?.imageUrl || ""
  );
  const [isCompanyImageLoading, setIsCompanyImageLoading] =
    useState<boolean>(false);
  const [companyImageError, setCompanyImageError] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    organization?.imageUrl || null
  );
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveCompanyPhoto = async () => {
    if (organization?.imageUrl === previewUrl) {
      return;
    }

    if (!organization || !isLoaded) {
      setCompanyImageError("Error loading company");
      return;
    }

    if (!selectedFile) {
      setCompanyImageError("No file selected");
      return;
    }

    setIsCompanyImageLoading(true);
    try {
      await organization.setLogo({ file: selectedFile });
      setShowCompanyImageModal(false);
      toast({
        title: "Success",
        description: "Company Photo Set.",
      });
    } catch (error) {
      setCompanyImageError("Error saving image");
      console.error(error);
    } finally {
      setIsCompanyImageLoading(false);
    }
  };

  const handleCompanyImageModalOpenChange = (open: boolean) => {
    if (open) {
      setShowCompanyImageModal(true);
    } else {
      setPreviewUrl(organization?.imageUrl || null);
      setCompanyImageError(null);
      setShowCompanyImageModal(false);
    }
  };

  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  useEffect(() => {
    setCompanyName(organizationData?.data?.organization.name);
    setPromoDiscount(
      organizationData?.data?.organization.promoDiscount.toString() || ""
    );
  }, [organizationData]);

  const handleUpdateTeamName = async () => {
    if (companyName === organization?.name) {
      return setShowTeamNameModal(false);
    }
    if (!companyName || companyName.trim() === "") {
      setTeamNameError("Name cannot be empty.");
      return;
    }
    if (!user) {
      setTeamNameError("Error Loading User. Please try again.");
      console.log("user undefined");
      return;
    }

    if (!isLoaded || !organization) {
      setTeamNameError("Error Loading Team. Please try again.");
      return;
    }

    if (organization?.name === companyName) {
      return setShowTeamNameModal(false);
    }
    const isDuplicate = existingOrganizations?.data?.organizations?.some(
      (org) => org.name.toLowerCase() === companyName.toLowerCase()
    );
    if (isDuplicate) {
      setTeamNameError(
        "This organization name already exists. Please choose another."
      );
      return;
    }

    setTeamNameLoading(true);
    try {
      const response = await updateOrganization({
        clerkOrganizationId: organization.id,
        name: companyName,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        await setActive({ organization: response.data.clerkOrgId });
        router.push(`/${companyName}/app/company-settings`);
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
        // setActive({ organization: organization.id });
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
      setCompanyName(organization?.name);
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

  const canEditSettings =
    orgRole === UserRole.Admin || orgRole === UserRole.Manager;

  const teamPhoto =
    organizationData?.data?.organization.imageUrl ||
    "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycVpvY3NtSG5PZE5PN2kyRVdpaUM5VENqMVAifQ";

  useEffect(() => {
    setIsLoading(false);
  }, [loaded, isLoaded, isAuthLoaded]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="justify-center max-w-3xl rounded-lg mx-auto mt-1.5 ">
      <h1 className="pt-4 md:pt-0 pl-4 text-3xl md:text-4xl font-bold ">
        Company Settings
      </h1>
      <div className="flex justify-center mb-2 mt-4">
        <div className="relative inline-block">
          <Image
            src={teamPhoto}
            alt="Company Avatar"
            width={100}
            height={100}
            className="rounded-md object-cover"
          />
          {canEditSettings && (
            <button
              onClick={() => setShowCompanyImageModal(true)}
              className="absolute top-0 -right-3 -mt-2  bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <GoPencil className="text-lg " />
            </button>
          )}
        </div>
      </div>

      <div
        onClick={() => canEditSettings && setShowTeamNameModal(true)}
        className={`px-4 flex justify-between border-b py-3 ${
          canEditSettings
            ? "cursor-pointer hover:bg-gray-100 hover:rounded-md"
            : ""
        }`}
      >
        <div className="">
          <h3 className="text-sm font-medium text-gray-500">Company Name: </h3>
          <p className="text-lg font-semibold">{companyName || "Not Set"}</p>
        </div>
        {canEditSettings && (
          <div className="flex items-center">
            <GoPencil className="text-2xl" />
          </div>
        )}
      </div>
      <ResponsiveTeamName
        isOpen={showTeamNameModal}
        onOpenChange={handleTeamNameModalOpenChange}
        error={teamNameError}
        isLoading={isTeamNameLoading}
        onUpdateTeamName={handleUpdateTeamName}
        setTeamNameError={setTeamNameError}
        setTeamName={setCompanyName}
        teamName={companyName || ""}
      />

      {organization && (
        <div
          onClick={() => canEditSettings && setShowPromoDiscountModal(true)}
          className={`px-4 flex justify-between border-b py-3 ${
            canEditSettings
              ? "cursor-pointer hover:bg-gray-100 hover:rounded-md"
              : ""
          }`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Promo Discount Amount:{" "}
            </h3>
            <p className="text-lg font-semibold">
              {promoDiscount || "Not Set"}
            </p>
          </div>
          {canEditSettings && (
            <div className="flex items-center">
              <GoPencil className="text-2xl" />
            </div>
          )}
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
      <ResponsiveCompanyImage
        isOpen={showCompanyImageModal}
        onOpenChange={handleCompanyImageModalOpenChange}
        photoPreview={previewUrl}
        companyPhoto={selectedFile}
        setCompanyPhoto={setSelectedFile}
        error={companyImageError}
        isLoading={isCompanyImageLoading}
        onSavePhoto={handleSaveCompanyPhoto}
        handleFileChange={handleFileChange}
      />
    </div>
  );
};

export default CompanySettings;
