"use client";

import { useContacts } from "@/domain/contacts";
import { Id } from "convex/_generated/dataModel";
import ContactsSection from "./ContactsSection";
import ContactsSkeleton from "@/shared/ui/skeleton/ContactsSkeleton";

type ContactsLoaderProps = {
  userId?: Id<"users">;
};

const ContactsLoader = ({ userId }: ContactsLoaderProps) => {
  const contacts = useContacts(userId);

  if (!contacts) {
    return <ContactsSkeleton />;
  }

  return <ContactsSection contacts={contacts} />;
};

export default ContactsLoader;
