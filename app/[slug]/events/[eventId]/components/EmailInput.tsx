"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import FieldErrorMessage from "@/components/shared/error/FieldErrorMessage";

const EmailInput: React.FC = () => {
  const { email, setEmail, emailError, setEmailError } = useEventCheckout();

  return (
    <div className="mt-4">
      <Label>Email Address</Label>
      <Input
        error={emailError || undefined}
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
        }}
        required
      />
      <FieldErrorMessage error={emailError} />
    </div>
  );
};

export default EmailInput;
