import React from "react";
import { Button } from "@/components/ui/button";
import CustomCard from "@/components/shared/cards/CustomCard";

interface MessageCardProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
}

const MessageCard: React.FC<MessageCardProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  className = "",
}) => {
  return (
    <CustomCard className={`p-4 ${className} w-[600px]`}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-grayText mt-2">{description}</p>
      {buttonLabel && onButtonClick && (
        <div className="mt-8 flex justify-center">
          <Button onClick={onButtonClick}>{buttonLabel}</Button>
        </div>
      )}
    </CustomCard>
  );
};

export default MessageCard;
