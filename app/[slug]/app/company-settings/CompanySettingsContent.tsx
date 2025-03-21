import { useEffect, useState } from "react";
import { GoPencil } from "react-icons/go";
import ResponsiveTeamName from "../components/responsive/ResponsiveTeamName";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus } from "../../../../utils/enum";
import ResponsivePromoDiscount from "../components/responsive/ResponsivePromoDiscount";
import Image from "next/image";
import { Id } from "../../../../convex/_generated/dataModel";
import { validatePromoDiscount } from "../../../../utils/frontend-validation";
import { compressAndUploadImage } from "../../../../utils/image";
import Loading from "../components/loading/Loading";
import { RiImageAddFill } from "react-icons/ri";
import { OrganizationSchema } from "@/types/types";

interface CompanySettingsContentProps {
  organization: OrganizationSchema;
  displayCompanyPhoto: string | null | undefined;
  canEditSettings: boolean;
}

const CompanySettingsContent: React.FC<CompanySettingsContentProps> = ({
  organization,
  displayCompanyPhoto,
  canEditSettings,
}) => {
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState<string | null | undefined>(
    organization?.name
  );
  const [showTeamNameModal, setShowTeamNameModal] = useState<boolean>(false);
  const [isTeamNameLoading, setTeamNameLoading] = useState<boolean>(false);
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const updateOrganizationName = useAction(api.clerk.updateOrganizationName);

  // promo discount settings
  const [promoDiscount, setPromoDiscount] = useState<string>(
    organization?.promoDiscount.toString() || ""
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
  const [isCompanyImageLoading, setIsCompanyImageLoading] =
    useState<boolean>(false);
  const [companyImageError, setCompanyImageError] = useState<string | null>(
    null
  );
  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    organization?.photo || null
  );
  const [isPhotoLoading, setIsPhotoLoading] = useState<boolean>(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const updateClerkOrganizationPhoto = useAction(
    api.clerk.updateClerkOrganizationPhoto
  );

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setIsPhotoLoading(true);
    setPhotoUploadError(null);

    try {
      const response = await compressAndUploadImage(file, generateUploadUrl);

      if (response.ok) {
        const { storageId } = await response.json();

        const updateResponse = await updateClerkOrganizationPhoto({
          clerkOrganizationId: organization?.clerkOrganizationId,
          photo: storageId as Id<"_storage">,
        });

        if (updateResponse.status === ResponseStatus.SUCCESS) {
          toast({
            title: "Success",
            description: "Company Photo Updated.",
          });
        } else {
          setPhotoUploadError("Photo update failed");
        }
      } else {
        setPhotoUploadError("Photo upload failed");
      }
    } catch (error) {
      setPhotoUploadError("Photo upload failed");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleCompanyImageModalOpenChange = (open: boolean) => {
    if (open) {
      setShowCompanyImageModal(true);
    } else {
      setPhotoStorageId(organization?.photo || null);
      setPhotoUploadError(null);
      setShowCompanyImageModal(false);
    }
  };

  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );

  useEffect(() => {
    setCompanyName(organization?.name);
    setPromoDiscount(organization?.promoDiscount.toString() || "");
    setPhotoStorageId(organization?.photo || null);
  }, [organization]);

  const handleUpdateTeamName = async () => {
    if (companyName === organization?.name) {
      return setShowTeamNameModal(false);
    }
    if (!companyName || companyName.trim() === "") {
      setTeamNameError("Name cannot be empty.");
      return;
    }

    setTeamNameLoading(true);
    try {
      const response = await updateOrganizationName({
        clerkOrganizationId: organization.clerkOrganizationId,
        name: companyName,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Team name set.",
        });
        setShowTeamNameModal(false);
        window.location.href = `/${response.data.slug}/app/company-settings`;
      } else {
        console.error("Failed to update team name", response.error);
        setTeamNameError(response.error);
      }
    } catch (error) {
      console.error("Failed to update team name", error);
      setTeamNameError("Failed to update team name");
    } finally {
      setTeamNameLoading(false);
    }
  };

  const handleSavePromoDiscount = async () => {
    setPromoDiscountError(null);

    const { promoDiscountValue, promoDiscountValueError } =
      validatePromoDiscount(promoDiscount, true);

    if (promoDiscountValue === organization?.promoDiscount) {
      return setShowPromoDiscountModal(false);
    }

    if (promoDiscountValueError) {
      setPromoDiscountError(promoDiscountValueError);
      return;
    }

    if (!promoDiscountValue) {
      setPromoDiscountError(promoDiscountValueError);
      return;
    }

    try {
      setPromoDiscountLoading(true);

      const response = await updateOrganizationMetadata({
        clerkOrganizationId: organization.clerkOrganizationId,
        params: {
          promoDiscount: promoDiscountValue,
        },
      });

      if (response.status === ResponseStatus.SUCCESS) {
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
      setPromoDiscount(organization?.promoDiscount as unknown as string);
      setPromoDiscountError(null);
      setShowPromoDiscountModal(false);
    }
  };

  return (
    <div className="justify-center max-w-3xl rounded-lg mx-auto mt-1.5">
      <h1 className="pt-4 md:pt-0 pl-4 text-3xl md:text-4xl font-bold">
        Company Settings
      </h1>
      <div className="flex flex-col items-center gap-2 mb-6 mt-4">
        <div className="relative inline-block">
          {displayCompanyPhoto ? (
            <div className="relative group">
              <Image
                src={displayCompanyPhoto}
                alt="Company Avatar"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
              {canEditSettings && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {isPhotoLoading ? (
                    <Loading />
                  ) : (
                    <RiImageAddFill className="text-4xl text-white" />
                  )}
                </label>
              )}
            </div>
          ) : (
            <div className="relative w-[100px] h-[100px] group">
              <label className="block w-full h-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-100">
                  {isPhotoLoading ? (
                    <Loading />
                  ) : (
                    <RiImageAddFill className="text-4xl text-gray-500" />
                  )}
                </div>
              </label>
            </div>
          )}
        </div>
        {photoUploadError && (
          <p className="text-red-500 text-sm">{photoUploadError}</p>
        )}
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
          <p className="text-lg font-semibold">{promoDiscount || "Not Set"}</p>
        </div>
        {canEditSettings && (
          <div className="flex items-center">
            <GoPencil className="text-2xl" />
          </div>
        )}
      </div>

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

export default CompanySettingsContent;
