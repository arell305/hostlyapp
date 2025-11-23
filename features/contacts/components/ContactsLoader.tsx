"use client";

import { useContacts } from "@/domain/contacts";
import { Id } from "convex/_generated/dataModel";
import ContactsSection from "./ContactsSection";

type ContactsLoaderProps = {
  userId?: Id<"users">;
  searchTerm: string;
};

const ContactsLoader = ({ userId, searchTerm }: ContactsLoaderProps) => {
  const contacts = useContacts(userId);

  if (!contacts) {
    return;
  }

  return <ContactsSection contacts={contacts} searchTerm={searchTerm} />;
};

export default ContactsLoader;
