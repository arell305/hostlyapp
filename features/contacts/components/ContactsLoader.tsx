"use client";

import SubscriptionSkeleton from "@shared/ui/skeleton/SubscriptionSkeleton";
import { useContacts } from "@/domain/contacts";
import { Id } from "convex/_generated/dataModel";
import ContactsContent from "./ContactsContent";

type ContactsLoaderProps = {
  userId?: Id<"users">;
};

const ContactsLoader = ({ userId }: ContactsLoaderProps) => {
  const contacts = useContacts(userId);

  if (!contacts) {
    return <SubscriptionSkeleton />;
  }

  return <ContactsContent contacts={contacts} />;
};

export default ContactsLoader;
