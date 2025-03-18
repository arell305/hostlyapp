"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import _ from "lodash";
import Image from "next/image";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./app/components/calendar/EventPreview";
import FullLoading from "./app/components/loading/FullLoading";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorComponent from "./app/components/errors/ErrorComponent";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";

const CompanyEvents = () => {
  const { name, photo, publicOrganizationContextError, organizationId, user } =
    useContextPublicOrganization();

  const router = useRouter();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const response = usePaginatedQuery(
    api.events.getEventsByOrganizationPublic,
    organizationId ? { organizationId } : "skip",
    { initialNumItems: 5 }
  );

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photo ? { storageId: photo } : "skip"
  );

  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && response.loadMore) {
        setIsLoadingMore(true);
        response.loadMore(5);
      }
    },
    [response]
  );

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 1.0,
    });

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    setIsLoadingMore(false);
  }, [response.results]);

  if (!organizationId) {
    return <FullLoading />;
  }

  if (publicOrganizationContextError) {
    return <ErrorComponent message={publicOrganizationContextError} />;
  }

  return (
    <main className="bg-gray-100 min-h-screen flex justify-center">
      <div className="flex flex-col  pt-10">
        {/* <Image
          src={displayCompanyPhoto || ""}
          alt={`Company image`}
          width={150}
          height={150}
          className="object-cover"
        /> */}

        <h1 className="text-4xl text-center pb-8"> {_.capitalize(name)}</h1>
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
        </div>
      </div>
    </main>
  );

  // return (
  //   <div className="bg-gray-100 ">
  //     <div className="max-w-4xl mx-auto">
  //       {user && (
  //         <p
  //           className="pl-4 pt-4 font-semibold hover:underline hover:cursor-pointer text-customDarkBlue"
  //           onClick={() => router.push(`/`)}
  //         >
  //           Home
  //         </p>
  //       )}

  //       <div className="pt-8 flex flex-col items-center mb-8">
  //         <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
  //           <Image
  //             src={displayCompanyPhoto || ""}
  //             alt={`Company image`}
  //             width={150}
  //             height={150}
  //             className="object-cover"
  //           />
  //         </div>
  //         <h1 className="font-bold text-3xl md:text-4xl pt-1 font-playfair">
  //           {_.capitalize(name)}
  //         </h1>
  //       </div>

  //       <div className="px-4 sm:px-6 lg:px-8">
  //         {response.results.length === 0 ? (
  //           <p className="text-center text-gray-500">No events found.</p>
  //         ) : (
  //           <div className="flex flex-wrap justify-center gap-4 pb-10">
  //             {response.results.map((event: EventSchema) => (
  //               <EventPreview key={event._id} eventData={event} isApp={false} />
  //             ))}
  //           </div>
  //         )}

  //         <div ref={observerRef} className="h-10 w-full"></div>

  //         {isLoadingMore && (
  //           <div className="flex justify-center pb-10">
  //             <p className="text-gray-500">Loading more events...</p>
  //           </div>
  //         )}

  //         {!response.loadMore && response.results.length > 0 && (
  //           <div className="flex justify-center pb-10">
  //             <p className="text-gray-500">All events loaded.</p>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default CompanyEvents;
