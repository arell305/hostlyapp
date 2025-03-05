"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import _ from "lodash";
import Image from "next/image";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./app/components/calendar/EventPreview";
import { useOrganization } from "@clerk/nextjs";
import FullLoading from "./app/components/loading/FullLoading";
import { ResponseStatus } from "../../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { useEffect, useRef, useCallback, useState } from "react";
import ErrorComponent from "./app/components/errors/ErrorComponent";

const CompanyEvents = () => {
  const { slug } = useParams();
  const { organization } = useOrganization();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";
  const router = useRouter();

  const response = usePaginatedQuery(
    api.events.getEventsByOrganizationPublic,
    { slug: cleanSlug },
    { initialNumItems: 5 }
  );

  const companyResponse = useQuery(
    api.organizations.getOrganizationImagePublic,
    { slug: cleanSlug }
  );

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    companyResponse?.data?.photo
      ? { storageId: companyResponse.data.photo }
      : "skip" // ✅ Correct way to skip the query without conditionally calling the hook
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  console.log("companyR", companyResponse);

  if (!companyResponse || !response) {
    return <FullLoading />;
  }

  if (companyResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={ErrorMessages.COMPANY_NOT_FOUND} />;
  }

  // const observerRef = useRef<HTMLDivElement | null>(null);

  // const handleObserver = useCallback(
  //   (entries: IntersectionObserverEntry[]) => {
  //     const target = entries[0];
  //     if (target.isIntersecting && response.loadMore) {
  //       setIsLoadingMore(true);
  //       response.loadMore(5);
  //     }
  //   },
  //   [response]
  // );

  // useEffect(() => {
  //   if (!observerRef.current) return;

  //   const observer = new IntersectionObserver(handleObserver, {
  //     root: null,
  //     rootMargin: "100px",
  //     threshold: 1.0,
  //   });

  //   observer.observe(observerRef.current);

  //   return () => observer.disconnect();
  // }, [handleObserver]);

  // useEffect(() => {
  //   setIsLoadingMore(false);
  // }, [response.results]);

  return (
    <div className="bg-gray-100 min-h-[100vh]">
      <div className="max-w-4xl mx-auto">
        {organization && (
          <p
            className="pl-4 pt-4 font-semibold hover:underline hover:cursor-pointer text-customDarkBlue"
            onClick={() => router.push(`/${organization.slug}/app`)}
          >
            Home
          </p>
        )}

        <div className="pt-8 flex flex-col items-center justify-center mb-8">
          <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
            <Image
              src={displayCompanyPhoto || ""}
              alt={`Company image`}
              width={150}
              height={150}
              className="object-cover"
            />
          </div>
          <h1 className="font-bold text-3xl md:text-4xl pt-1 font-playfair">
            {_.capitalize(companyResponse.data?.name)}
          </h1>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          {response.results.length === 0 ? (
            <p className="text-center text-gray-500">No events found.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 pb-10">
              {response.results.map((event: EventSchema) => (
                <EventPreview key={event._id} eventData={event} isApp={false} />
              ))}
            </div>
          )}

          {/* <div ref={observerRef} className="h-10 w-full"></div> */}

          {isLoadingMore && (
            <div className="flex justify-center pb-10">
              <p className="text-gray-500">Loading more events...</p>
            </div>
          )}

          {!response.loadMore && response.results.length > 0 && (
            <div className="flex justify-center pb-10">
              <p className="text-gray-500">All events loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyEvents;
