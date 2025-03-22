import type { UserResource } from "@clerk/types";
import { usePaginatedQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import _ from "lodash";
import { EventSchema } from "@/types/schemas-types";
import MessageCard from "./app/components/ui/MessageCard";
import EventPreview from "./app/components/calendar/EventPreview";
import HomeNav from "./app/components/nav/HomeNav";

interface CompanyEventsContentProps {
  user: UserResource | null;
  displayCompanyPhoto: string | null | undefined;
  handleNavigateHome: () => void;
  organizationId: Id<"organizations">;
  name: string;
}

const CompanyEventsContent: React.FC<CompanyEventsContentProps> = ({
  user,
  displayCompanyPhoto,
  handleNavigateHome,
  organizationId,
  name,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const response = usePaginatedQuery(
    api.events.getEventsByOrganizationPublic,
    organizationId ? { organizationId } : "skip",
    { initialNumItems: 5 }
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

  return (
    <main className="bg-gray-100 min-h-screen flex justify-center overflow-hidden">
      <div className="max-w-4xl flex flex-col">
        <HomeNav
          user={user}
          handleNavigateHome={handleNavigateHome}
          buttonText="Home"
        />
        <div className="flex flex-col pt-4 pb-20 items-center w-full max-w-4xl">
          {displayCompanyPhoto && (
            <div className="mb-3 relative group w-[150px] h-[150px] justify-center items-center">
              <Image
                src={displayCompanyPhoto}
                alt="Company Avatar"
                fill
                sizes="150px"
                className="rounded-md object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl text-center pb-8"> {_.capitalize(name)}</h1>
          <div className="px-4 sm:px-6 lg:px-8">
            {response.results.length === 0 ? (
              <MessageCard message="No events found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 md:gap-y-12 mx-.5">
                {response.results.map((event: EventSchema) => (
                  <EventPreview
                    key={event._id}
                    eventData={event}
                    isApp={false}
                  />
                ))}
              </div>
            )}

            <div ref={observerRef} className="h-10 w-full"></div>

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
    </main>
  );
};

export default CompanyEventsContent;
