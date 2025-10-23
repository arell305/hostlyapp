"use client";

interface FieldErrorMessageProps {
  error?: string | null;
}

const FieldErrorMessage: React.FC<FieldErrorMessageProps> = ({ error }) => {
  return (
    <p className={`text-sm ${error ? "text-red-500" : "text-transparent"}`}>
      {error || "Placeholder to maintain height"}
    </p>
  );
};

export default FieldErrorMessage;
