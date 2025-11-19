"use client";

import { PlusCircle, UploadIcon } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";
import { ContactPickerButton } from "./ContactPickerButton";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";

type Props = {
  onUpload: () => void;
  onClose: () => void;
  onManual: () => void;
};

export default function ContactActionMenuContent({
  onUpload,
  onClose,
  onManual,
}: Props) {
  return (
    <MenuContainer>
      <Button
        variant="menu"
        size="menu"
        onClick={() => {
          onUpload();
          onClose();
        }}
      >
        <UploadIcon size={18} />
        Upload
      </Button>

      <ContactPickerButton />
      <Button
        variant="menu"
        size="menu"
        onClick={() => {
          onManual();
          onClose();
        }}
      >
        <PlusCircle size={18} />
        Manual
      </Button>
    </MenuContainer>
  );
}
