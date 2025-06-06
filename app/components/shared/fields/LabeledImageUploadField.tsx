import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";
import { BsFillXCircleFill } from "react-icons/bs";
import FieldErrorMessage from "../error/FieldErrorMessage";

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
    <div>
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
            className={`focus:border-white w-[300px] aspect-[4/5] flex justify-center items-center cursor-pointer relative rounded-lg hover:bg-cardBackgroundHover ${
              imageUrl ? "" : "border-2 border-dashed "
            }`}
          >
            {isLoading ? (
              <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
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
              className="text-grayText text-3xl rounded-full p-1 cursor-pointer z-10 -ml-3 -mt-4"
            />
          )}
        </div>
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledImageUploadField;
