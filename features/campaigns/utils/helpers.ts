import { Doc } from "@/convex/_generated/dataModel";
import { TemplateMode } from "@/shared/types/types";

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

export const getSenderPrefix = (
  lastMessage: Doc<"smsMessages">,
  initials: string
) => {
  if (lastMessage.direction === "outbound") {
    return lastMessage.authorType === "ai" ? "AI: " : "You: ";
  }
  if (lastMessage.authorType === "ai") {
    return "AI: ";
  }
  return initials;
};
