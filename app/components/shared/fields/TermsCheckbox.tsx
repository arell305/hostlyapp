"use client";
import React from "react";
import CheckboxIcon from "./CheckboxIcon";
import useModal from "@/hooks/useModal";
import TermsModal from "@/components/modals/TermsModal";

interface TermsCheckboxProps {
  termsAccepted: boolean;
  onTermsAccepted: (accepted: boolean) => void;
}

const TermsCheckbox = ({
  termsAccepted,
  onTermsAccepted,
}: TermsCheckboxProps) => {
  const termsModal = useModal();

  return (
    <>
      <CheckboxIcon
        checked={termsAccepted}
        onToggle={() => onTermsAccepted(!termsAccepted)}
        label={
          <>
            I agree to the{" "}
            <button
              type="button"
              onClick={termsModal.toggleModal}
              className="underline text-grayText hover:text-white"
            >
              terms and conditions
            </button>
            .
          </>
        }
      />
      <TermsModal onClose={termsModal.closeModal} open={termsModal.isOpen} />
    </>
  );
};

export default TermsCheckbox;
