"use client";

import { useState } from "react";
import { useAddGuestList } from "../../hooks/useAddGuestList";
import { parseGuestListInput } from "../../../../../../utils/format";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";
import { EventSchema } from "@/types/schemas-types";
import AddGuestTopRow from "./AddGuestTopRow";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface AddGuestListContentProps {
  eventData: EventSchema;
  handleGoBack: () => void;
  handleNavigateHome: () => void;
}

const AddGuestListPage: React.FC<AddGuestListContentProps> = ({
  eventData,
  handleGoBack,
  handleNavigateHome,
}) => {
  const [guestInput, setGuestInput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addGuestList, isLoading, error, setError } = useAddGuestList();

  const handleSubmit = async () => {
    setSuccessMessage(null);
    setError(null);

    if (guestInput.trim() === "") return;

    const { guests, invalidPhones } = parseGuestListInput(guestInput);

    if (invalidPhones.length > 0) {
      setError(`Invalid phone number(s): ${invalidPhones.join(", ")}`);
      return;
    }

    const result = await addGuestList(eventData._id, guests);
    if (result) {
      setGuestInput("");
      setSuccessMessage(`Names added successfully.`);
    }
  };

  return (
    <SectionContainer>
      <AddGuestTopRow
        eventData={eventData}
        handleGoHome={handleNavigateHome}
        handleGoBack={handleGoBack}
      />
      <h2 className="text-2xl ">Add Guest List</h2>
      <div className="mb-6">
        <p>
          Enter each guest on a new line. Optionally, include a phone number.
        </p>
        <p className="text-grayText">Example: Jane Doe 5556667777</p>
      </div>
      <LabeledTextAreaField
        label="Guest Names and Phone Numbers"
        value={guestInput}
        onChange={(e) => setGuestInput(e.target.value)}
        placeholder="Enter guest names (optionally with phone numbers)..."
        rows={10}
        error={error || undefined}
        name="guestListInput"
      />
      {successMessage && (
        <p className="text-green-500 text-sm mt-2">{successMessage}</p>
      )}
      <FormActions
        onCancel={handleGoBack}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Add Guests"
        loadingText="Adding"
      />
    </SectionContainer>
  );
};

export default AddGuestListPage;
