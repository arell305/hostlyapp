import React, { useState } from "react";
import { UserResource, OrganizationResource } from "@clerk/types";
import { EventData, EventFormData, GuestListInfo, TicketInfo } from "@/types";
import TopRowNav from "./TopRowNav";
import ConfirmModal from "@/dashboard/components/ConfirmModal";
import TabsNav from "./TabsNav";
import { ActiveTab } from "../../../../utils/enum";
import EventForm from "@/dashboard/components/EventForm";

interface EventIdContentProps {
  data: {
    event: EventData;
    ticketInfo?: TicketInfo | null;
    guestListInfo?: GuestListInfo | null;
  };
  isAppAdmin: boolean;
  organization: OrganizationResource;
  user: UserResource;
}

const EventIdContent: React.FC<EventIdContentProps> = ({
  data,
  isAppAdmin,
  organization,
  user,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.VIEW);

  const handleCancelEdit = () => {
    if (isEditing) {
      setShowConfirmCancelEdit(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveEvent = async () => {};

  return (
    <section className="container mx-auto p-4 md:border-2 max-w-3xl md:p-6 rounded-lg">
      <TopRowNav
        eventData={data.event}
        isAdminOrg={isAppAdmin}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
      />
      {isEditing ? (
        <EventForm
          initialEventData={data.event}
          initialTicketData={data.ticketInfo}
          initialGuestListData={data.guestListInfo}
          onSubmit={handleSaveEvent}
          isEdit={isEditing}
          // deleteTicketInfo={handleDeleteTicketInfo}
          onCancelEdit={handleCancelEdit}
          // deleteGuestListInfo={handleDeleteGuestListInfo}
        />
      ) : (
        <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* cancel edit confirm */}
      <ConfirmModal
        isOpen={showConfirmCancelEdit}
        onClose={() => setShowConfirmCancelEdit(false)}
        onConfirm={() => {
          setShowConfirmCancelEdit(false);
          setIsEditing(false);
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel? Any unsaved changes will be discarded."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Editing"
      />
    </section>
  );
};

export default EventIdContent;
