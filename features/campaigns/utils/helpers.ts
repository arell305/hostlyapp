import { CampaignStatus, TemplateMode } from "@/shared/types/types";

export const getTemplateTitle = (
  templateMode: TemplateMode,
  templateName?: string | null
) => {
  const existingTitle = templateName
    ? `Template: ${templateName}`
    : "Selected Template";
  switch (templateMode) {
    case "list":
      return "Select Template";
    case "existing":
      return existingTitle;
    case "custom":
      return "Custom Template";
    default:
      return "Select Template";
  }
};
