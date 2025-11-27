import { Doc } from "@/convex/_generated/dataModel";
import TemplateBadgesRow from "@/features/templates/components/TemplateBadgesRow";
import { cn } from "@/shared/lib/utils";
import CustomCard from "@/shared/ui/cards/CustomCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitive/card";

interface CampaignTemplateCardProps {
  onSelect: (template: Doc<"smsTemplates">) => void;
  template: Doc<"smsTemplates">;
}

const CampaignTemplateCard: React.FC<CampaignTemplateCardProps> = ({
  onSelect,
  template,
}) => {
  return (
    <CustomCard
      onClick={() => onSelect(template)}
      className={cn("cursor-pointer hover:shadow-glow-white")}
    >
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.body}
        </CardDescription>
        <TemplateBadgesRow template={template} />
      </CardHeader>
    </CustomCard>
  );
};

export default CampaignTemplateCard;
