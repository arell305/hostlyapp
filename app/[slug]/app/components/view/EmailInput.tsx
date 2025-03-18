import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  emailError: string | null;
  setEmailError: (error: string | null) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({
  email,
  setEmail,
  emailError,
  setEmailError,
}) => {
  return (
    <div className="mt-4">
      <Label>Email Address</Label>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
        }}
        required
      />
      <p
        className={`text-sm mt-1 ${emailError ? "text-red-500" : "text-transparent"}`}
      >
        {emailError || "Placeholder to maintain height"}
      </p>
    </div>
  );
};

export default EmailInput;
