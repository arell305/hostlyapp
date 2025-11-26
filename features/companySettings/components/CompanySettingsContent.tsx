"use client";

import { useEffect, useState } from "react";
import { validatePromoDiscount } from "@shared/utils/frontend-validation";
import { useUpdateOrganizationName } from "@/domain/organizations/";
import { useUpdateOrganizationMetadata } from "@/domain/organizations/";
import { useUploadOrganizationPhoto } from "@/domain/organizations/";
import CustomCard from "@/shared/ui/cards/CustomCard";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, X } from "lucide-react";
import EditableImage from "@/shared/ui/editable/EditableImage";
import EditableInputField from "@/shared/ui/editable/EditableInputField";
import EditableCurrencyField from "@/shared/ui/editable/EditableCurrencyField";
import EditableContainer from "@/shared/ui/containers/EditableContainer";
import EditableImageContainer from "@/shared/ui/containers/EditableImageContainer";
import PageContainer from "@/shared/ui/containers/PageContainer";
import { Doc } from "convex/_generated/dataModel";

interface CompanySettingsContentProps {
  organization: Doc<"organizations">;
  displayCompanyPhoto: string | null | undefined;
  canEditSettings: boolean;
}

const CompanySettingsContent: React.FC<CompanySettingsContentProps> = ({
  organization,
  displayCompanyPhoto,
  canEditSettings,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  const [originalName] = useState(organization?.name || "");
  const [originalPromo] = useState(
    organization?.promoDiscount?.toString() || ""
  );

  const [isEditing, setIsEditing] = useState(false);

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
    setCompanyName(organization?.name || "");
    setPromoDiscount(organization?.promoDiscount?.toString() || "");
  }, [organization]);

  const hasNameChanged = companyName.trim() !== originalName.trim();
  const hasPromoChanged = promoDiscount !== originalPromo;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const success = await uploadOrganizationPhoto(file, organization._id);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleSaveCompanyName = async () => {
    if (!hasNameChanged || !companyName.trim()) {
      return;
    }
    const response = await updateOrgName(organization._id, companyName.trim());
    if (response.success) {
      setIsEditing(false);
      window.location.href = `/${response.slug}/app/company-settings`;
    }
  };

  const handleSavePromoDiscount = async () => {
    if (!hasPromoChanged) {
      return;
    }
    const { promoDiscountValue } = validatePromoDiscount(promoDiscount, true);
    if (!promoDiscountValue) {
      return;
    }

    const success = await updateOrg(organization._id, {
      promoDiscount: promoDiscountValue,
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleToggleEditing = () => {
    if (isEditing) {
      setCompanyName(originalName);
      setPromoDiscount(originalPromo);
    }
    setIsEditing((prev) => !prev);
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Company Settings"
        actions={
          <IconButton
            icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
            onClick={handleToggleEditing}
            title={isEditing ? "Cancel" : "Edit"}
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
          <EditableInputField
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onSave={handleSaveCompanyName}
            isEditing={isEditing}
            isSaving={isNameSaving}
            name="companyName"
            error={nameError}
            hasChanges={hasNameChanged}
          />

          <EditableCurrencyField
            label="Promo Discount Amount"
            value={promoDiscount ? parseFloat(promoDiscount) : null}
            onChange={(value) => setPromoDiscount(value?.toString() || "")}
            onSave={handleSavePromoDiscount}
            isEditing={isEditing}
            isSaving={isPromoSaving}
            name="promoDiscount"
            error={promoError}
            hasChanges={hasPromoChanged}
          />
        </EditableContainer>
      </CustomCard>
    </PageContainer>
  );
};

export default CompanySettingsContent;
