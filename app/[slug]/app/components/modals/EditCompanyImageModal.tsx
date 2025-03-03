import React, { ChangeEvent, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

interface EditCompanyImageModalProps {
  onClose: () => void;
  isOpen: boolean;
  photoPreview?: string | null;
  error: string | null;
  isLoading: boolean;
  onSavePhoto: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenChange: (open: boolean) => void;
}

const EditCompanyImageModal: React.FC<EditCompanyImageModalProps> = ({
  onClose,
  isOpen,
  photoPreview,
  error,
  isLoading,
  onSavePhoto,
  handleFileChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-[400px] rounded">
        <DialogHeader>
          <DialogTitle className="flex">Edit Company Photo</DialogTitle>
        </DialogHeader>

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
        </div>

        <p
          className={`text-sm mt-1 ${
            error ? "text-red-500" : "text-transparent"
          }`}
        >
          {error || "Placeholder to maintain height"}
        </p>

        <DialogFooter>
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={onSavePhoto}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyImageModal;
