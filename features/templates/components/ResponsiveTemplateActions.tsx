"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import TemplateActionMenuContent from "./TemplateActionMenuContent";

type Props = {
  template: Doc<"smsTemplates">;
  onEdit: (template: Doc<"smsTemplates">) => void;
  onDelete: (id: Id<"smsTemplates">) => void;
};

export default function ResponsiveTemplateActions({
  template,
  onEdit,
  onDelete,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <TemplateActionMenuContent
      template={template}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={handleClose}
    />
  );

  const trigger = (
    <IconButton
      icon={<EllipsisVertical />}
      onClick={() => setOpen(true)}
      variant="ghost"
    />
  );

  const title = "Template actions";
  const description = "Edit or delete this template";

  if (isDesktop) {
    return (
      <DesktopActionMenu
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        children={menu}
      />
    );
  }

  return (
    <MobileActionDrawer
      isOpen={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={trigger}
      children={menu}
    />
  );
}
