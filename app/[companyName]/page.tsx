"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import _ from "lodash";
import Image from "next/image";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./app/components/calendar/EventPreview";
import { useOrganization, useUser } from "@clerk/nextjs";

const CompanyEvents = () => {
  const params = useParams();
  const { organization } = useOrganization();
  const companyName = params.companyName;
  const router = useRouter();

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
      <div className="max-w-4xl mx-auto">
        {organization && (
          <p
            className="pl-4 pt-4 font-semibold hover:underline hover:cursor-pointer text-customDarkBlue"
            onClick={() => router.push(`/${organization.name}/app`)}
          >
            Home
          </p>
        )}
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
            {_.capitalize(companyName as string)}
          </h1>
        </div>
        <div className="  px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center  gap-4 pb-10">
            {response.results.map((event: EventSchema) => (
              <EventPreview key={event._id} eventData={event} isApp={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyEvents;
