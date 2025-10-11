"use client";
import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import { useContacts } from "@/hooks/convex/contacts";
import React from "react";
import { Id } from "convex/_generated/dataModel";
import ContactsContent from "./ContactsContent";

type ContactsQueryProps = {
  userId?: Id<"users">;
};

const ContactsQuery = ({ userId }: ContactsQueryProps) => {
  const contacts = useContacts(userId);

  if (!contacts) {
    return <SubscriptionSkeleton />;
  }

  return <ContactsContent contacts={contacts} />;
};

export default ContactsQuery;
