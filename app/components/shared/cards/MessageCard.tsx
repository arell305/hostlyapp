import React from "react";
import { Button } from "@/components/ui/button";
import CustomCard from "@/components/shared/cards/CustomCard";
import { useRouter } from "next/navigation";

interface MessageCardProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
  showButton?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  className = "",
  showButton = true,
}) => {
  const router = useRouter();
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push("/");
    }
  };
  return (
    <CustomCard className={`p-4 ${className} w-full mx-2 md:mx-0  `}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-grayText mt-2">{description}</p>
      {showButton && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleButtonClick}>{buttonLabel}</Button>
        </div>
      )}
    </CustomCard>
  );
};

export default MessageCard;
