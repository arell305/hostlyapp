import Loading from "@/[slug]/app/components/loading/Loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";

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
      <div className="relative w-64 h-64 mt-2">
        {imageUrl ? (
          <>
            <div className="w-full h-full rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt="Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow-lg z-10 hover:bg-gray-200"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-grayText"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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
            <div className="w-full h-full border-2 border-dashed  rounded-md flex items-center justify-center transition-colors duration-200 group-hover:bg-cardBackgroundHover">
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
  );
};

export default ImageUploadField;
