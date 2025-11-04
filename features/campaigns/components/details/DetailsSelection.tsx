import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import { isIOS } from "@/shared/utils/helpers";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import { formatToDateTimeLocalPST, getCurrentTime } from "@/shared/utils/luxon";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";

const DetailsSelection = () => {
  const isIOSDevice = isIOS();
  const { formData, updateFormData } = useCampaignForm();
  const { sendAt } = formData;
  const min = formatToDateTimeLocalPST(getCurrentTime());

  return (
    <>
      <LabeledInputField
        name="name"
        label="Name*"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Enter campaign name"
      />
      <LabeledDateTimeField
        name="sendTime"
        label="Send Time*"
        value={sendAt ?? null}
        onChange={(val) => {
          updateFormData({ sendAt: val ?? undefined });
        }}
        isIOS={isIOSDevice}
        min={min}
      />
    </>
  );
};

export default DetailsSelection;
