"use client";
import SuspenseBoundary from "@/components/layout/SuspenseBoundary";
import PaymentForm from "./PaymentForm";
import React from "react";
import { stripePromise } from "../../utils/stripe";
import { Elements } from "@stripe/react-stripe-js";

const SignUpPage = () => {
  return (
    // <div className="bg-gradient-to-b from-customDarkBlue to-customPrimaryBlue min-h-[calc(100dvh)] flex justify-center items-center overflow-hidden">
    // <div className="">
    //   <SuspenseBoundary>
    //     <PaymentForm />
    //   </SuspenseBoundary>
    // </div>
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default SignUpPage;
