"use client";

import React from "react";
import MessageCard from "@/components/shared/cards/MessageCard";

interface MessagePageProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  cardClassName?: string;
  containerClassName?: string;
}

const MessagePage: React.FC<MessagePageProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  cardClassName = "",
  containerClassName = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center min-h-screen px-2 -translate-y-[100px] ${containerClassName}`}
    >
      <MessageCard
        title={title}
        description={description}
        buttonLabel={buttonLabel}
        onButtonClick={onButtonClick}
        className={`max-w-[700px] w-full ${cardClassName}`}
      />
    </div>
  );
};

export default MessagePage;
