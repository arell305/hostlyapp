"use client";

import { FC, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus, SubscriptionTier } from "../../../../utils/enum";
import EventForm from "../components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import {
  EventFormInput,
  GuestListFormInput,
  TicketFormInput,
} from "@/types/types";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";
import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import { FrontendErrorMessages } from "@/types/enums";

const AddEventPage: FC = () => {
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const router = useRouter();

  const { toast } = useToast();
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);

  const subscriptionResponse = useQuery(
    api.customers.getCustomerSubscriptionTierBySlug,
    {
      slug: cleanSlug,
    }
  );

  const { isStripeEnabled, isLoading, connectedAccountError } =
    useIsStripeEnabled({
      slug: cleanSlug,
    });
  const addEvent = useAction(api.events.addEvent);

  const canAddGuestListOption =
    subscriptionResponse?.data?.customerSubscription.subscriptionTier ===
      SubscriptionTier.ELITE ||
    subscriptionResponse?.data?.customerSubscription.subscriptionTier ===
      SubscriptionTier.PLUS;

  const handleSubmit = async (
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guestListData: GuestListFormInput | null
  ) => {
    try {
      const addEventResponse = await addEvent({
        slug: cleanSlug,
        ...eventData,
        ticketData,
        guestListData,
      });

      if (addEventResponse.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Event Created",
          description: "The event has been successfully created",
        });
        const urlEventId: string = addEventResponse.data.eventId as string;
        router.push(`events/${urlEventId}`);
      } else {
        console.error(addEventResponse.error);
        setSaveEventError(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error(error);
      setSaveEventError("Failed to create an event: Internal Error");
      return;
    }
  };

  const handleCancel = () => {
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    router.back();
  };

  if (!subscriptionResponse || isLoading) {
    return <FullLoading />;
  }

  if (subscriptionResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={subscriptionResponse.error} />;
  }

  if (connectedAccountError) {
    return <ErrorComponent message={connectedAccountError} />;
  }

  return (
    <div className="justify-center max-w-3xl mx-auto mt-1.5 mb-20">
      <div className="flex justify-between items-baseline pt-4 md:pt-0 px-4">
        <h1 className="font-bold text-3xl">Add Event</h1>
        <p
          className="font-semibold hover:underline hover:cursor-pointer text-customDarkBlue"
          onClick={handleCancel}
        >
          Cancel
        </p>
      </div>
      <EventForm
        isStripeEnabled={isStripeEnabled}
        onSubmit={handleSubmit}
        isEdit={false}
        canAddGuestListOption={canAddGuestListOption}
        onCancelEdit={handleCancel}
        saveEventError={saveEventError}
      />
      <ResponsiveConfirm
        isOpen={showCancelConfirmModal}
        title="Confirm Cancellation"
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        content="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmVariant="destructive"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowCancelConfirmModal(false),
          onConfirm: handleConfirmCancel,
        }}
        drawerProps={{
          onSubmit: handleConfirmCancel,
          onOpenChange: (open) => setShowCancelConfirmModal(open),
        }}
      />
    </div>
  );
};

export default AddEventPage;
