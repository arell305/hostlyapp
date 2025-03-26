import React from "react";

interface MessageCardProps {
  message: string;
  icon?: React.ReactNode;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, icon }) => {
  return (
    <div className="mx-auto flex flex-col rounded border border-altGray w-[400px] p-3 shadow bg-white">
      <div className="flex items-center space-x-2">
        {icon && <div className="text-xl">{icon}</div>}
        <p className="font-semibold text-lg">{message}</p>
      </div>
    </div>
  );
};

export default MessageCard;
