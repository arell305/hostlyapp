import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { FaTimes } from "react-icons/fa";

interface LabeledAddressAutoCompleteProps {
  label: string;
  address: string;
  onSelect: (value: any) => void;
  value: any;
  error?: string | null;
}

const LabeledAddressAutoComplete: React.FC<LabeledAddressAutoCompleteProps> = ({
  label,
  address,
  onSelect,
  value,
  error,
}) => {
  return (
    <LabelWrapper className="relative ">
      <Label htmlFor="address" className="font-semibold">
        {label}
      </Label>
      <GooglePlacesAutocomplete
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        selectProps={{
          className: "ios-input-fix",
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
              // padding: "0",
              paddingLeft: "8px",
              paddingRight: "2.5rem",
              paddingTop: "4px",
              paddingBottom: "4px",
              minHeight: "auto",
              height: "auto",
              "&:hover": {
                border: `1px solid ${state.isFocused ? "#324E78" : "#1B1C20"}`, // <-- force hover to match normal
              },
            }),
            input: (provided) => ({
              ...provided,
              color: "#F9FAFA",
              // paddingLeft: "8px",

              boxSizing: "border-box",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#A2A5AD",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#F9FAFA",
              overflow: "hidden",
              whiteSpace: "nowrap", // <-- important
              textOverflow: "ellipsis",
            }),
            noOptionsMessage: (provided) => ({
              ...provided,
              backgroundColor: "#0F0F13", // match dropdown background
              color: "#9CA3AF", // gray-400 text color
              padding: "8px 12px",
            }),
            dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#0F0F13", // dark background for menu dropdown
              border: "none", // remove white border if any
              boxShadow: "none", // optional: remove default shadow
              zIndex: 9999,
            }),
            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused
                ? "#1f2937" // <-- background when hovering (example dark gray)
                : "#0F0F13", // <-- normal background
              color: "#F9FAFA", // <-- text color
              paddingLeft: "10px",
            }),
          },
        }}
      />

      <p
        className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
      >
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledAddressAutoComplete;
