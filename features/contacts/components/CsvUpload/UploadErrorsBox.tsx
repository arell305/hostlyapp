"use client";

type UploadErrorsBoxProps = {
  errors: string[];
};

export function UploadErrorsBox({ errors }: UploadErrorsBoxProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border p-3 text-sm text-red-500">
      {errors.slice(0, 5).map((errorMessage, errorIndex) => (
        <div key={errorIndex}>{errorMessage}</div>
      ))}
      {errors.length > 5 && <div>+{errors.length - 5} more</div>}
    </div>
  );
}
