import React, { ChangeEvent } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditCompanyImageModal from "../modals/EditCompanyImageModal";
import EditCompanyImageDrawer from "../drawer/EditCompanyImageDrawer";

type CommonProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  photoPreview?: string | null;
  error: string | null;
  isLoading: boolean;
  onSavePhoto: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  photoUploadError: string | null;
};

type ResponsiveCompanyImageProps = CommonProps & {
  isDesktop?: boolean;
};

const ResponsiveCompanyImage: React.FC<ResponsiveCompanyImageProps> = ({
  isDesktop: isDesktopProp,
  ...commonProps
}) => {
  const isDesktop = isDesktopProp ?? useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <EditCompanyImageModal
        {...commonProps}
        onClose={() => commonProps.onOpenChange(false)}
      />
    );
  }

  return <EditCompanyImageDrawer {...commonProps} />;
};

export default ResponsiveCompanyImage;
