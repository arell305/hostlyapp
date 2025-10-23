"use client";

import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import FieldErrorMessage from "@shared/ui/error/FieldErrorMessage";

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
