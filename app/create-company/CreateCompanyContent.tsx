"use client";
import { useState } from "react";
import { useOrganization, UserButton, useUser } from "@clerk/nextjs";
import { IoBusinessOutline } from "react-icons/io5";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import _ from "lodash";
import { Id } from "../../convex/_generated/dataModel";
import { useCompressAndUploadImage } from "./hooks/useCompressAndUploadImage";
import { useCreateClerkOrganization } from "./hooks/useCreateClerkOrganization";
import type { SignedInSessionResource } from "@clerk/types";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import LabelWrapper from "@/components/shared/fields/LabelWrapper";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import ImageUploadField from "@/components/shared/fields/ImageUploadField";
import { validateCompanyForm } from "../../utils/form-validation/validateCreateCompany";

type ErrorState = {
  companyName: string | null;
  promoDiscount: string | null;
};

type CreateCompanyContentProps = {
  setActive: (active: { session: string; organization: string }) => void;
  session: SignedInSessionResource;
  navigateToApp: (slug: string) => void;
};

const CreateCompanyContent = ({
  setActive,
  session,
  navigateToApp,
}: CreateCompanyContentProps) => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [companyName, setCompanyName] = useState<string>("");
  const [promoDiscountAmount, setPromoDiscountAmount] = useState<string>("");

  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    null
  );

  const displayCompanyPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });
  const {
    createClerkOrganization,
    isLoading,
    error: clerkOrganizationError,
  } = useCreateClerkOrganization();
  const {
    compressAndUploadImage,
    isUploading: isPhotoUploading,
    error: photoUploadError,
  } = useCompressAndUploadImage();

  const [errors, setErrors] = useState<ErrorState>({
    companyName: null,
    promoDiscount: null,
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await compressAndUploadImage(file);
    if (result) {
      setPhotoStorageId(result as Id<"_storage">);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoStorageId(null);
  };

  const handleSubmit = async () => {
    const {
      errors: formErrors,
      isValid,
      promoDiscountValue,
    } = validateCompanyForm({
      companyName,
      promoDiscountAmount,
    });

    setErrors(formErrors);

    if (!isValid) return;

    const response = await createClerkOrganization({
      companyName,
      photo: photoStorageId,
      promoDiscount: promoDiscountValue,
    });

    if (response) {
      const newOrganizationId = response.clerkOrganizationId;
      setActive({
        session: session.id,
        organization: newOrganizationId,
      });
      setTimeout(() => {
        navigateToApp(response.slug);
      }, 300);
    }
  };
  return (
    <main className="">
      <nav className={"px-4 w-full flex justify-end  z-10 top-0 fixed h-12  "}>
        <UserButton />
      </nav>
      <div className="px-4 flex flex-col mt-16 md:mt-10 max-w-2xl mx-auto">
        <div className="flex gap-3 mb-6 justify-center md:justify-start">
          <IoBusinessOutline className="text-4xl" />
          <h1>New Company</h1>
        </div>
        <LabelWrapper>
          <LabeledInputField
            name="companyName"
            label="Name*"
            placeholder="Enter Company Name"
            value={companyName}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, companyName: null }));
              setCompanyName(e.target.value);
            }}
            error={errors.companyName || undefined}
          />
          <LabeledInputField
            name="promoDiscountAmount"
            label="Promo Discount ($)"
            type="number"
            placeholder="Enter Promo Discount Amount"
            value={promoDiscountAmount}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, promoDiscount: null }));
              setPromoDiscountAmount(e.target.value);
            }}
            error={errors.promoDiscount || undefined}
          />
          <ImageUploadField
            label="Company Photo"
            id="companyPhoto"
            imageUrl={displayCompanyPhoto}
            isUploading={isPhotoUploading}
            error={photoUploadError}
            onChange={handlePhotoChange}
            onRemove={handleRemovePhoto}
          />
          <SingleSubmitButton
            isLoading={isLoading}
            error={clerkOrganizationError}
            onClick={handleSubmit}
            disabled={companyName === ""}
            label="Create"
          />
        </LabelWrapper>
      </div>
    </main>
  );
};

export default CreateCompanyContent;
