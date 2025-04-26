import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";
import { BsFillXCircleFill } from "react-icons/bs";

interface LabeledImageUploadFieldProps {
  label: string;
  id: string;
  imageUrl?: string | null;
  isLoading: boolean;
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const LabeledImageUploadField: React.FC<LabeledImageUploadFieldProps> = ({
  label,
  id,
  imageUrl,
  isLoading,
  error,
  onChange,
  onRemove,
}) => {
  return (
    <LabelWrapper className="relative">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>

      {/* Hidden file input */}
      <Input
        type="file"
        id={id}
        onChange={onChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex">
        <Label
          htmlFor={id}
          className={`focus:border-customDarkBlue w-[200px] h-[200px] flex justify-center items-center cursor-pointer relative mt-2 rounded-lg hover:bg-gray-100 ${
            imageUrl ? "" : "border-2 border-dashed border-gray-300"
          }`}
        >
          {isLoading ? (
            <div className="text-gray-500 absolute inset-0 flex items-center justify-center bg-white opacity-75">
              Loading...
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              width={200}
              height={200}
            />
          ) : (
            <RiImageAddFill className="text-4xl text-gray-500" />
          )}
        </Label>

        {imageUrl && (
          <BsFillXCircleFill
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-500 text-3xl rounded-full p-1 cursor-pointer z-10 -ml-3 -mt-2"
          />
        )}
      </div>

      <p
        className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
      >
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledImageUploadField;
