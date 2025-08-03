"use client";

import React from "react";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { EventSchema } from "@/types/schemas-types";
import DetailsView from "@/[slug]/app/components/view/DetailsView";

interface EventDetailsSectionProps {
  eventData: EventSchema;
}

const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({
  eventData,
}) => {
  return (
    <SectionContainer className="flex flex-col w-full gap-x-10 pb-0">
      <DetailsView eventData={eventData} />
    </SectionContainer>
  );
};

export default EventDetailsSection;
