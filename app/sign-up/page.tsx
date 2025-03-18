"use client";
import PaymentForm from "./PaymentForm";
import React from "react";
import { stripePromise } from "../../utils/stripe";
import { Elements } from "@stripe/react-stripe-js";

const SignUpPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default SignUpPage;
