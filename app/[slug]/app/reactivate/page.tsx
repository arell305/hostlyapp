"use client";
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import ReactivateForm from "./ReactivateForm";
import { stripePromise } from "../../../../utils/stripe";
import { RedirectToSignIn, useClerk } from "@clerk/nextjs";
import FullLoading from "../components/loading/FullLoading";

const ReactivatePage = () => {
  const { user } = useClerk();

  if (user === undefined) {
    return <FullLoading />;
  }

  if (user === null) {
    return <RedirectToSignIn />;
  }

  return (
    <Elements stripe={stripePromise}>
      <ReactivateForm user={user} />
    </Elements>
  );
};

export default ReactivatePage;
