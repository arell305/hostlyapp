import Loading from "@/[slug]/app/components/loading/Loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";
import IconButton from "../buttonContainers/IconButton";
import { X } from "lucide-react";
interface ImageUploadFieldProps {
  label: string;
  id: string;
  imageUrl?: string | null;
  isUploading: boolean;
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  note?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  id,
  imageUrl,
  isUploading,
  error,
  onChange,
  onRemove,
  note = "Recommended size 1:1, up to 10MB.",
}) => {
  return (
    <div>
      <Label className="font-bold font-playfair text-xl mb-2" htmlFor={id}>
        {label}
      </Label>
      <p className="text-sm text-grayText">{note}</p>
      <div className="flex justify-center">
        <div className="relative w-64 h-64 mt-6">
          {imageUrl ? (
            <>
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <IconButton
                icon={<X size={20} />}
                onClick={onRemove}
                className="absolute -top-2 -right-2 border rounded-full p-1 shadow-lg z-10 "
                type="button"
              />
            </>
          ) : (
            <div className="relative w-full h-full group">
              <Input
                id={id}
                type="file"
                accept="image/*"
                onChange={onChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full border-2 border-dashed  rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-cardBackgroundHover">
                {isUploading ? (
                  <Loading />
                ) : (
                  <RiImageAddFill className="text-4xl text-grayText" />
                )}
              </div>
              <p
                className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
              >
                {error || "Placeholder to maintain height"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
