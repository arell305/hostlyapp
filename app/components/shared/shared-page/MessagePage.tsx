"use client";

import React from "react";
import MessageCard from "@/components/shared/cards/MessageCard";
import StaticPageContainer from "../containers/StaticPageContainer";

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
    <StaticPageContainer className={containerClassName}>
      <MessageCard
        title={title}
        description={description}
        buttonLabel={buttonLabel}
        onButtonClick={onButtonClick}
        className={cardClassName}
      />
    </StaticPageContainer>
  );
};

export default MessagePage;
