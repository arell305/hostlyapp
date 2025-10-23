"use client";

import SectionContainer from "@shared/ui/containers/SectionContainer";
import DetailsView from "@/features/customerEvents/components/view/DetailsView";
import { useEventContext } from "@/contexts/EventContext";

const EventDetailsSection: React.FC = () => {
  const { event: eventData } = useEventContext();
  return (
    <SectionContainer className="flex flex-col w-full gap-x-10 pb-0">
      <DetailsView eventData={eventData} />
    </SectionContainer>
  );
};

export default EventDetailsSection;
