import React, { ChangeEvent } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditCompanyImageModal from "../modals/EditCompanyImageModal";
import EditCompanyImageDrawer from "../drawer/EditCompanyImageDrawer";
import { DESKTOP_WIDTH } from "@/types/constants";

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

const ResponsiveCompanyImage: React.FC<CommonProps> = (commonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
