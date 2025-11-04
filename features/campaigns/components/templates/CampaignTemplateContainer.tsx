import { Doc, Id } from "@/convex/_generated/dataModel";
import CardContainer from "@/shared/ui/containers/CardContainer";
import CampaignTemplateCard from "./CampaignTemplateCard";
import EmptyList from "@/shared/ui/list/EmptyList";
import { useCampaignForm } from "../../contexts/CampaignFormContext";

interface CampaignTemplateContainerProps {
  smsTemplates: Doc<"smsTemplates">[];
}
const CampaignTemplateContainer: React.FC<CampaignTemplateContainerProps> = ({
  smsTemplates,
}) => {
  const { updateFormData, nextStep } = useCampaignForm();

  const handleTemplateSelect = (templateId: Id<"smsTemplates">) => {
    updateFormData({ templateId });
    nextStep();
  };

  if (smsTemplates.length === 0) {
    return (
      <EmptyList
        className="mt-4"
        items={smsTemplates}
        message="No templates found."
      />
    );
  }
  return (
    <CardContainer className="mt-4">
      {smsTemplates.map((template) => (
        <CampaignTemplateCard
          key={template._id}
          template={template}
          onSelect={handleTemplateSelect}
        />
      ))}
    </CardContainer>
  );
};

export default CampaignTemplateContainer;
