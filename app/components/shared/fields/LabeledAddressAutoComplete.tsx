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
    <LabelWrapper className="relative max-w-[540px]">
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
              border: "0px",
              borderBottom: `2px solid ${state.isFocused ? "#324E78" : "#D1D5DB"}`,
              backgroundColor: "transparent",
              boxShadow: "none",
              "&:hover": {
                borderBottomColor: state.isFocused ? "#324E78" : "#D1D5DB",
                borderRadius: "0",
              },
              maxWidth: "500px",
              borderRadius: "0",
              padding: "0",
              paddingRight: "10px",
              minHeight: "auto",
              height: "auto",
            }),
            input: (provided) => ({
              ...provided,
              color: "#374151",
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
              color: "#374151",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }),
            dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
              position: "absolute",
            }),
            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            option: (provided) => ({ ...provided, paddingLeft: "10px" }),
          },
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 md:right-4 -bottom-4 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
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
