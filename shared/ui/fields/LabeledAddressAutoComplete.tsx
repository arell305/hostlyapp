"use client";

import { useRef, useEffect } from "react";
import { Label } from "@shared/ui/primitive/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { X } from "lucide-react";

interface LabeledAddressAutoCompleteProps {
  label: string;
  address: string;
  onSelect: (value: any) => void;
  value: any;
  error?: string | null;
  clearInput: () => void;
}

const AutoResizingTextArea: React.FC<{
  value: string;
  onClear: () => void;
}> = ({ value, onClear }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        readOnly
        rows={1}
        className="w-full resize-none bg-transparent text-white border border-[#1B1C20] rounded-md px-2 pr-8 py-2 font-normal leading-snug"
        style={{
          overflow: "hidden",
          lineHeight: "1.4",
          fontFamily: "inherit",
        }}
      />
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear address"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
      >
        <X size={18} />
      </button>
    </div>
  );
};

const LabeledAddressAutoComplete: React.FC<LabeledAddressAutoCompleteProps> = ({
  label,
  address,
  onSelect,
  value,
  error,
  clearInput,
}) => {
  return (
    <div>
      <LabelWrapper className="relative">
        <Label htmlFor="address" className="font-semibold">
          {label}
        </Label>

        {address ? (
          <AutoResizingTextArea value={address} onClear={clearInput} />
        ) : (
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            selectProps={{
              classNamePrefix: "address",
              onChange: onSelect,
              defaultInputValue: address,
              placeholder: "Enter an address",
              styles: {
                container: (provided) => ({ ...provided }),
                control: (provided, state) => ({
                  ...provided,
                  border: `1px solid ${state.isFocused ? "#324E78" : "#1B1C20"}`,
                  backgroundColor: "transparent",
                  borderRadius: "6px",
                  paddingLeft: "2px",
                  paddingRight: "2.5rem",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  minHeight: "auto",
                  height: "auto",
                  "&:hover": {
                    border: `1px solid ${state.isFocused ? "#324E78" : "#1B1C20"}`,
                  },
                }),
                input: (provided) => {
                  return {
                    ...provided,
                    color: "#F9FAFA",
                    boxSizing: "border-box",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  };
                },
                placeholder: (provided) => {
                  return {
                    ...provided,
                    color: "#A2A5AD",
                  };
                },
                singleValue: (provided) => ({
                  ...provided,
                  color: "#F9FAFA",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }),
                noOptionsMessage: (provided) => ({
                  ...provided,
                  backgroundColor: "#0F0F13",
                  color: "#9CA3AF",
                  padding: "8px 12px",
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  display: "none",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#0F0F13",
                  border: "none",
                  boxShadow: "none",
                  zIndex: 9999,
                }),
                menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#1f2937" : "#0F0F13",
                  color: "#F9FAFA",
                  paddingLeft: "10px",
                }),
              },
            }}
          />
        )}
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledAddressAutoComplete;
