"use client";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useUser } from "@clerk/nextjs";
import CompanyEventsContent from "./app/components/CompanyEventsContent";
import { useCallback, useEffect, useRef, useState } from "react";
import FullLoading from "./app/components/loading/FullLoading";
import ErrorComponent from "./app/components/errors/ErrorComponent";

const CompanyEvents = () => {
  const { name, photo, publicOrganizationContextError, organizationId } =
    useContextPublicOrganization();
  const { user } = useUser();
  const router = useRouter();

  const handleNavigateHome = () => {
    router.push("/");
  };

  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
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

  if (publicOrganizationContextError) {
    return <ErrorComponent message={publicOrganizationContextError} />;
  }

  if (
    !organizationId ||
    user === undefined ||
    displayCompanyPhoto === undefined ||
    response === undefined
  ) {
    return <FullLoading />;
  }

  return (
    <CompanyEventsContent
      user={user}
      displayCompanyPhoto={displayCompanyPhoto}
      handleNavigateHome={handleNavigateHome}
      organizationId={organizationId}
      name={name}
      isLoadingEvents={response === undefined}
      events={response.results}
      isLoadingMore={isLoadingMore}
      hasMore={!!response.loadMore}
      observerRef={observerRef}
    />
  );
};

export default CompanyEvents;
