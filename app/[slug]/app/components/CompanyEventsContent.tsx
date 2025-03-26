import type { UserResource } from "@clerk/types";
import Image from "next/image";
import _ from "lodash";
import { EventSchema } from "@/types/schemas-types";
import MessageCard from "./ui/MessageCard";
import EventPreview from "./calendar/EventPreview";
import { Id } from "../../../../convex/_generated/dataModel";
import EventInfoSkeleton from "./loading/EventInfoSkeleton";
import HomeNav from "./nav/HomeNav";

interface CompanyEventsContentProps {
  user: UserResource | null;
  displayCompanyPhoto: string | null | undefined;
  handleNavigateHome: () => void;
  organizationId: Id<"organizations">;
  name: string;
  events: EventSchema[];
  isLoadingMore: boolean;
  observerRef: React.RefObject<HTMLDivElement>;
  isLoadingEvents: boolean;
  status: string;
}

const CompanyEventsContent: React.FC<CompanyEventsContentProps> = ({
  user,
  displayCompanyPhoto,
  handleNavigateHome,
  name,
  events,
  isLoadingMore,
  observerRef,
  isLoadingEvents,
  status,
}) => {
  return (
    <main className="bg-gray-100 min-h-screen flex justify-center overflow-hidden">
      <div className="max-w-4xl w-full mx-auto  flex justify-center flex-col">
        <HomeNav user={user} handleNavigateHome={handleNavigateHome} />
        <div className="flex flex-col pt-10 pb-20 items-center w-full ">
          {displayCompanyPhoto && (
            <div className="mb-3 relative group w-[150px] h-[150px] flex justify-center items-center">
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
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {isLoadingEvents && <EventInfoSkeleton />}
            {events.length === 0 ? (
              <MessageCard message="No events found." />
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 md:gap-y-12 justify-items-center">
                {events.map((event: EventSchema) => (
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

            {status === "Exhausted" && (
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
