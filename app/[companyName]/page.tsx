"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../convex/_generated/api";
import EventPreview from "./app/components/calendar/EventPreview";
import { EventSchema } from "@/types/types";
import PreviewCard from "@/components/view-event/Preview";
import Image from "next/image";

const CompanyEvents = () => {
  const params = useParams();
  const companyName = params.companyName;

  const response = usePaginatedQuery(
    api.events.getEventsByOrganizationPublic,
    {
      organizationName: companyName as string,
    },
    {
      initialNumItems: 5,
    }
  );
  const imageResponse = useQuery(api.organizations.getOrganizationImagePublic, {
    organizationName: companyName as string,
  });

  return (
    <div className="bg-gray-100 min-h-[100vh]">
      <div className="pt-8  flex flex-col items-center justify-center mb-8">
        <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
          <Image
            src={imageResponse || ""}
            alt={`${companyName} company image`}
            width={150}
            height={150}
            className="object-cover"
          />
        </div>
        <h1 className="font-bold text-3xl md:text-4xl pt-1 font-playfair ">
          {companyName}
        </h1>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center [@media(min-width:1125px)]:justify-start gap-4 pb-10">
          {response.results.map((event: EventSchema) => (
            <PreviewCard key={event._id} eventData={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyEvents;
