import { ChangeEvent, useRef } from "react";
import BaseDrawer from "./BaseDrawer";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

interface EditCompanyImageDrawerProps {
  isOpen: boolean;
  photoPreview?: string | null;
  error: string | null;
  isLoading: boolean;
  onSavePhoto: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenChange: (open: boolean) => void;
  photoUploadError: string | null;
}

const EditCompanyImageDrawer: React.FC<EditCompanyImageDrawerProps> = ({
  onOpenChange,
  isOpen,
  photoPreview,
  error,
  isLoading,
  onSavePhoto,
  handleFileChange,
  photoUploadError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Company Photo"
      description={`Upload a company photo. Recommended 1:1 and up to 10MB.`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={onSavePhoto}
      error={error}
      isLoading={isLoading}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-48 h-48 rounded-md overflow-hidden ">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Company Photo"
              className="w-full h-full object-cover"
              width={192}
              height={192}
            />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center transition-colors duration-200 "></div>
          )}
        </div>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          variant="outline"
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Photo
        </Button>
        <p
          className={`pl-4 text-sm mt-1 ${photoUploadError ? "text-red-500" : "text-transparent"}`}
        >
          {photoUploadError || "Placeholder to maintain height"}
        </p>{" "}
      </div>
    </BaseDrawer>
  );
};

export default EditCompanyImageDrawer;
