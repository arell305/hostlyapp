import React, { useState } from "react";

interface PhotoUploadProps {
  onUpload: (file: File) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUpload }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result as string);
      onUpload(file);
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="border-dashed border-4 border-gray-400 w-64 h-96 flex justify-center items-center relative">
      {isLoading ? (
        <div>Loading...</div>
      ) : image ? (
        <img
          src={image}
          alt="Uploaded"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-500">Upload Photo</span>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default PhotoUpload;
