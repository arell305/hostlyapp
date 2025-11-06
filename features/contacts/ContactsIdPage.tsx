"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import ContactsLoader from "@/features/contacts/components/ContactsLoader";
import ResponsiveAddContact from "@/features/contacts/components/ResponsiveAddContact";
import { useUserScope } from "@/shared/hooks/contexts";
import { ActionButton } from "@/shared/ui/buttonContainers/ActionButton";
import { UploadIcon } from "lucide-react";
import ResponsiveUploadContact from "./components/CsvUpload/ResponsiveUploadContact";

const ContactsIdPage = () => {
  const { userId } = useUserScope();
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [isUploadingContactsModal, setIsUploadingContactsModal] =
    useState<boolean>(false);

  const handleOpenAddContact = () => {
    setIsAddingContact(true);
  };

  const handleUploadContacts = () => {
    setIsUploadingContactsModal(true);
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Contacts"
        actions={
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={handleUploadContacts}
              label="Upload"
              icon={<UploadIcon size={20} />}
              variant="secondaryAction"
            />
            <AddButton onClick={handleOpenAddContact} label="Contact" />
          </div>
        }
      />

      <ContactsLoader userId={userId} />

      <ResponsiveAddContact
        isOpen={isAddingContact}
        onOpenChange={setIsAddingContact}
        userId={userId}
      />
      <ResponsiveUploadContact
        isOpen={isUploadingContactsModal}
        onOpenChange={setIsUploadingContactsModal}
        userId={userId}
      />
    </PageContainer>
  );
};

export default ContactsIdPage;
