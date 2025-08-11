"use client";
import React from "react";
import { RedirectToSignIn, useClerk } from "@clerk/nextjs";
import FullLoading from "../components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const ReactivatePage = () => {
  const { user } = useClerk();

  if (user === undefined) {
    return <FullLoading />;
  }

  if (user === null) {
    return <RedirectToSignIn />;
  }

  return (
    <MessagePage
      title="Reactivate Subscription"
      description="Please email support to reactivate your subscription."
    />
  );
};

export default ReactivatePage;
