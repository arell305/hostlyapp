"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";
import FormContainer from "@/shared/ui/containers/FormContainer";
import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@/shared/ui/fields/LabeledTextAreaField";
import { PresetButtons } from "@/shared/ui/fields/PresetButtons";
import StaticField from "@/shared/ui/fields/StaticField";
import VariablesInserter from "@/shared/ui/fields/VariablesInserter";
import {
  formatDisplayDateTime,
  formatToDateTimeLocalPST,
  getCurrentTime,
} from "@/shared/utils/luxon";
import {
  getFilteredVariables,
  getVariableFilter,
} from "@/shared/utils/uiHelpers";
import { Clock, MessageCircle, Users } from "lucide-react";
import { useRef } from "react";

const CampaignDetailsEdit = () => {
  const {
    formData,
    updateFormData,
    sendType,
    handleSendTypeChange,
    bodyError,
  } = useCampaignForm();
  const { campaign } = useCampaignScope();
  const { name, scheduleTime } = formData;
  const min = formatToDateTimeLocalPST(getCurrentTime());

  const isUnsent = campaign.status !== "Sent";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVariableInsert = (newValue: string, cursorPosition: number) => {
    updateFormData({ smsBody: newValue });
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const variableFilter = getVariableFilter({
    eventId: campaign.eventId,
    hasGuestList: campaign.hasGuestList ?? true,
  });

  return (
    <FormContainer>
      {/* Campaign Name */}
      <LabeledInputField
        name="name"
        label="Name*"
        value={name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Enter campaign name"
      />

      {/* Send Type + Schedule */}
      {isUnsent && (
        <div className="space-y-5">
          <PresetButtons
            label="Send Type"
            value={sendType}
            onValueChange={handleSendTypeChange}
            presets={[
              { value: "now", label: "Now" },
              { value: "later", label: "Later" },
            ]}
          />

          {sendType === "later" && (
            <LabeledDateTimeField
              name="sendTime"
              label="Send Time*"
              value={scheduleTime ?? null}
              onChange={(val) =>
                updateFormData({ scheduleTime: val ?? undefined })
              }
              min={min}
            />
          )}
        </div>
      )}

      {/* Variables Inserter + Message Body */}
      {isUnsent && (
        <div className="space-y-5 pt-4">
          <VariablesInserter
            variables={getFilteredVariables(variableFilter)}
            textareaValue={formData.smsBody}
            onInsert={handleVariableInsert}
            textareaRef={textareaRef}
          />

          <LabeledTextAreaField
            ref={textareaRef}
            label="Body*"
            name="body"
            value={formData.smsBody}
            onFocus={() => {
              textareaRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            onChange={(e) => updateFormData({ smsBody: e.target.value })}
            placeholder="Enter message or generate with AI"
            error={bodyError}
            rows={6}
          />
        </div>
      )}

      {/* Sent / Read-only view */}
      {!isUnsent && (
        <div className="space-y-5">
          <StaticField
            label="Audience"
            value={campaign.audienceType}
            icon={<Users className="text-xl" />}
          />
          {campaign.sentAt && (
            <StaticField
              label="Sent at"
              value={formatDisplayDateTime(campaign.sentAt)}
              icon={<Clock className="text-xl" />}
            />
          )}
          <StaticField
            label="Body"
            value={campaign.smsBody}
            icon={<MessageCircle className="text-xl" />}
          />
        </div>
      )}
    </FormContainer>
  );
};

export default CampaignDetailsEdit;
