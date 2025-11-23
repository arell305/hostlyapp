import { Calendar } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuEventProps<T> = {
  doc: T;
  onOpenEvent: (doc: T) => void;
  onClose: () => void;
};

export default function MenuEvent<T>({
  doc,
  onOpenEvent,
  onClose,
}: MenuEventProps<T>) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onOpenEvent(doc);
        onClose();
      }}
    >
      <Calendar size={18} />
      View Event
    </Button>
  );
}
