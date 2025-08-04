"use client";

import { useEffect, useState } from "react";
import { validatePromoDiscount } from "../../../../utils/frontend-validation";
import { OrganizationSchema } from "@/types/types";
import { useUpdateOrganizationName } from "./hooks/useUpdateOrganizationName";
import { useUpdateOrganizationMetadata } from "./hooks/useUpdateOrganizationMetadata";
import { useUploadOrganizationPhoto } from "./hooks/useUploadOrganizationPhoto";
import CustomCard from "@/components/shared/cards/CustomCard";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Pencil, X } from "lucide-react";
import EditableImage from "@/components/shared/editable/EditableImage";
import EditableInputField from "@/components/shared/editable/EditableInputField";
import EditableContainer from "@/components/shared/containers/EditableContainer";
import EditableImageContainer from "@/components/shared/containers/EditableImageContainer";
import EditableCurrencyField from "@/components/shared/editable/EditableCurrencyField";

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
  const [companyName, setCompanyName] = useState<string | null | undefined>(
    organization?.name
  );
  const [promoDiscount, setPromoDiscount] = useState<string>(
    organization?.promoDiscount.toString() || ""
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {
    updateOrgName,
    isLoading: isNameSaving,
    error: nameError,
  } = useUpdateOrganizationName();
  const {
    updateOrg,
    isLoading: isPromoSaving,
    error: promoError,
  } = useUpdateOrganizationMetadata();
  const {
    uploadOrganizationPhoto,
    isLoading: isPhotoLoading,
    error: photoError,
  } = useUploadOrganizationPhoto();

  useEffect(() => {
    setCompanyName(organization?.name);
    setPromoDiscount(organization?.promoDiscount.toString() || "");
  }, [organization]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = await uploadOrganizationPhoto(file, organization._id);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleSaveCompanyName = async () => {
    if (!companyName || companyName.trim() === "") return;
    const response = await updateOrgName(organization._id, companyName);
    if (response.success === true) {
      setIsEditing(false);
      window.location.href = `/${response.slug}/app/company-settings`;
    }
  };

  const handleSavePromoDiscount = async () => {
    const { promoDiscountValue } = validatePromoDiscount(promoDiscount, true);
    if (!promoDiscountValue) return;

    const success = await updateOrg(organization._id, {
      promoDiscount: promoDiscountValue,
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleToggleEditing = () => {
    if (isEditing) {
      // Reset unsaved changes
      setCompanyName(organization?.name);
      setPromoDiscount(organization?.promoDiscount.toString() || "");
    }
    setIsEditing((prev) => !prev);
  };

  const isCompanyNameDisabled = !companyName || companyName.trim() === "";
  const isPromoDiscountDisabled = !promoDiscount || promoDiscount.trim() === "";

  return (
    <section>
      <SectionHeaderWithAction
        title="Company Settings"
        actions={
          <IconButton
            icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
            onClick={handleToggleEditing}
            title={isEditing ? "Cancel Edit" : "Edit"}
          />
        }
      />
      <CustomCard>
        <EditableImageContainer>
          <EditableImage
            companyName={companyName}
            displayImage={displayCompanyPhoto}
            isEditing={isEditing}
            canEdit={canEditSettings}
            isLoading={isPhotoLoading}
            onChange={handlePhotoChange}
            error={photoError}
          />
        </EditableImageContainer>

        <EditableContainer>
          {isEditing && (
            <EditableInputField
              label="Company Name"
              value={companyName || ""}
              onChange={(e) => setCompanyName(e.target.value)}
              onSave={handleSaveCompanyName}
              isEditing={isEditing}
              isSaving={isNameSaving}
              name="companyName"
              error={nameError}
              disabled={isCompanyNameDisabled}
            />
          )}

          <EditableCurrencyField
            label="Promo Discount Amount"
            value={promoDiscount ? parseFloat(promoDiscount) : null}
            onChange={(value) =>
              setPromoDiscount(value ? value.toString() : "")
            }
            onSave={handleSavePromoDiscount}
            isEditing={isEditing}
            isSaving={isPromoSaving}
            name="promoDiscount"
            error={promoError}
            className={isEditing ? "" : "border-t "}
            disabled={isPromoDiscountDisabled}
          />
        </EditableContainer>
      </CustomCard>
    </section>
  );
};

export default CompanySettingsContent;
