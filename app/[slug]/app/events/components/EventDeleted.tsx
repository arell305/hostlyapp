import React from "react";
import { Button } from "@/components/ui/button";

interface EventDeletedProps {
  message?: string;
  onBack: () => void;
  buttonText?: string;
}

const EventDeleted: React.FC<EventDeletedProps> = ({
  message = "This event has been deleted.",
  onBack,
  buttonText = "Home",
}) => {
  return (
    <div className="mt-10 flex flex-col items-center md:items-start text-center md:ml-10">
      <p>{message}</p>
      <Button className="w-[100px] mt-2" onClick={onBack}>
        {buttonText}
      </Button>
    </div>
  );
};

export default EventDeleted;
