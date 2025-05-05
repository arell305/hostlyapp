import CustomCard from "@/components/shared/cards/CustomCard";
import React from "react";

interface MessageCardProps {
  message: string;
  icon?: React.ReactNode;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, icon }) => {
  return (
    <CustomCard className="p-4 mt-2 ">
      <div className="flex items-center space-x-2">
        {icon && <div className="text-xl">{icon}</div>}
        <p className="font-semibold text-lg">{message}</p>
      </div>
    </CustomCard>
  );
};

export default MessageCard;
