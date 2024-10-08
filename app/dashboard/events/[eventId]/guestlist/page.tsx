"use client";
import { FC } from "react";
import { useParams } from "next/navigation";

const GuestListPage: FC = () => {
  const params = useParams();
  const eventId = params.eventId;
  return (
    <div>
      <h1>Guest List for Event {eventId}</h1>
      {/* Add your guest list content here */}
    </div>
  );
};

export default GuestListPage;
