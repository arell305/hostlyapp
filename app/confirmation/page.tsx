"use client";
import React from "react";
import { useRouter } from "next/navigation";
import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import MessageCard from "@/components/shared/cards/MessageCard";

function Confirmation() {
  const router = useRouter();

  return (
    <StaticPageContainer>
      <MessageCard
        title="Congratulations!"
        description="Your order was successful, and we're excited to have you onboard! You'll receive an email shortly with everything you need to get started with our app."
        buttonLabel="Return Home"
        onButtonClick={() => router.push("/")}
      />
    </StaticPageContainer>
  );
}

export default Confirmation;
