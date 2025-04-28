import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { FaTimes } from "react-icons/fa";

interface LabeledAddressAutoCompleteProps {
  label: string;
  address: string;
  onSelect: (value: any) => void;
  onClear: () => void;
  value: any;
  error?: string | null;
}

const LabeledAddressAutoComplete: React.FC<LabeledAddressAutoCompleteProps> = ({
  label,
  address,
  onSelect,
  onClear,
  value,
  error,
}) => {
  return (
    <LabelWrapper className="relative max-w-[500px]">
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

              maxWidth: "500px",
              borderRadius: "6px",
              padding: "0",
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
              paddingLeft: "0",
              marginLeft: "0",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#9CA3AF",
              paddingLeft: "0",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#F9FAFA",
              overflow: "hidden",
              whiteSpace: "nowrap", // <-- important
              textOverflow: "ellipsis",
            }),
            dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
              position: "absolute",
            }),
            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused
                ? "" // <-- background when hovering (example dark gray)
                : "#0F0F13", // <-- normal background
              color: "#F9FAFA", // <-- text color
              paddingLeft: "10px",
            }),
          },
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-[45%] transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
        >
          <FaTimes size={16} />
        </button>
      )}
      <p
        className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
      >
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledAddressAutoComplete;
