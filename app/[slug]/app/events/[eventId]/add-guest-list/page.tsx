"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useAddGuestList } from "../../hooks/useAddGuestList";
import { parseGuestListInput } from "../../../../../../utils/format";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";

const AddGuestListPage: React.FC = () => {
  const { eventId } = useParams();
  const [guestInput, setGuestInput] = useState<string>("");
  const { addGuestList, isLoading, error, setError } = useAddGuestList();
  const router = useRouter();

  const handleSubmit = async () => {
    if (guestInput.trim() === "") {
      return;
    }

    const { guests, invalidPhones } = parseGuestListInput(guestInput);

    if (invalidPhones.length > 0) {
      setError(`Invalid phone number(s): ${invalidPhones.join(", ")}`);
      return;
    }

    await addGuestList(eventId as Id<"events">, guests);
  };

  return (
    <main>
      <h1 className="">Add Guest List</h1>
      <p className="text-gray-600 mb-4">
        Enter each guest on a new line. Optionally include a phone number after
        a comma.
        <br /> Example: <code>Jane Doe, +15556667777</code>
      </p>
      <LabeledTextAreaField
        label="Guest Names and Phone Numbers"
        value={guestInput}
        onChange={(e) => setGuestInput(e.target.value)}
        placeholder="Enter guest names (optionally with phone numbers)..."
        rows={10}
        error={error || undefined}
        name="guestListInput"
      />
      <FormActions
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Add Guests"
        loadingText="Adding"
      />
    </main>
  );
};

export default AddGuestListPage;
